import { HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Observable } from "rxjs";
import { v2 as cloudinary } from "cloudinary";
import { NewMessageDto } from "./dto/new-message.dto";
import {
  CloudinaryConfigInterface,
  GLOBAL_ERROR_CODES,
  GlobalErrorCodesEnum,
  LoggerService,
  Message,
  ModelsNamesEnum,
  Right,
  RightsEnum,
  User
} from "@ssmovzh/chatterly-common-utils";
import { ConfigService } from "@nestjs/config";
import { ExistingMessageDto } from "~/modules/messages/dto";
import { RoomsService } from "~/modules/rooms";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(ModelsNamesEnum.MESSAGES) private readonly messageModel: Model<Message>,
    @InjectModel(ModelsNamesEnum.USERS) private readonly userModel: Model<User>,
    @InjectModel(ModelsNamesEnum.RIGHTS) private readonly rightsModel: Model<Right>,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly roomsService: RoomsService
  ) {}

  async addMessage(messageDto: NewMessageDto): Promise<Message> {
    try {
      messageDto.user = new Types.ObjectId(messageDto.user);
      messageDto.roomId = new Types.ObjectId(messageDto.roomId);
      const { apiKey, apiSecret, cloudName } = this.configService.get<CloudinaryConfigInterface>("cloudinary");

      if (messageDto.attachment && !!messageDto.attachment.length) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true
        });

        const length = messageDto.attachment.length <= 5 ? messageDto.attachment.length : 5;

        for (let i = 0; i < length; i++) {
          const result = await cloudinary.uploader.upload(messageDto.attachment[i], {
            overwrite: true,
            invalidate: true,
            folder: `Chatterly/${messageDto.roomId}/messages/`,
            public_id: `attachment__${messageDto.user}__${messageDto.roomId}__${messageDto.timestamp}`
          });

          if (result) {
            messageDto.attachment[i] = result.secure_url;
          }
        }
      }

      const createdMessage = new this.messageModel(messageDto);
      await createdMessage.save();
      await this.roomsService.addMessageReferenceToRoom({
        roomId: messageDto.roomId.toString(),
        messageId: createdMessage._id.toString()
      });

      await this.roomsService.addRecentMessage({
        roomId: messageDto.roomId.toString()
      });

      return await this.messageModel
        .findOne({ _id: createdMessage._id })
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }

  async updateMessage(messageDto: ExistingMessageDto): Promise<HttpStatus | Error> {
    try {
      const message = await this.messageModel.findOne({ _id: new Types.ObjectId(messageDto._id) });

      if (message.user.toString() !== messageDto.user._id) {
        return HttpStatus.FORBIDDEN;
      }

      const updatedMessage = {
        _id: message._id,
        roomId: message.roomId,
        user: message.user,
        text: messageDto.text !== message.text ? messageDto.text : message.text,
        attachment: messageDto.attachment !== message.attachment ? messageDto.attachment : message.attachment,
        timestamp: message.timestamp
      };

      await this.messageModel.updateOne({ _id: message._id }, updatedMessage);
      return HttpStatus.CREATED;
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }

  async searchMessages(roomId: string, keyword: string): Promise<Message[]> {
    try {
      const regex = new RegExp(keyword, "i");

      return await this.messageModel
        .find({ roomId: new Types.ObjectId(roomId), text: regex })
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }

  async deleteMessage(rights: RightsEnum[], messageId: string, roomId: string, userId: string): Promise<any> {
    try {
      const canDeleteAll =
        rights.includes(RightsEnum.DELETE_MESSAGES) &&
        (await this._verifyRights(rights, new Types.ObjectId(userId), new Types.ObjectId(roomId)));

      const query = {
        _id: new Types.ObjectId(messageId),
        roomId: new Types.ObjectId(roomId),
        user: new Types.ObjectId(userId)
      };

      if (canDeleteAll) {
        delete query.user;
      }

      const { deletedCount } = await this.messageModel.deleteOne(query);

      if (deletedCount !== 0) {
        return this.roomsService.deleteMessageFromRoom({
          roomId,
          messageId
        });
      } else {
        return HttpStatus.BAD_REQUEST;
      }
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }

  async getRoomMessagesLimited(roomId: string, start: number = 0, end: number = 50): Promise<Message[]> {
    try {
      return await this.messageModel
        .find({ roomId: new Types.ObjectId(roomId) })
        .sort({ $natural: -1 })
        .skip(start)
        .limit(end)
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }

  async leaveRoom(userId: string, roomId: string): Promise<any> {
    try {
      return this.roomsService.deleteUserFromRoom({
        userId,
        roomId,
        type: "LEAVE_ROOM",
        rights: [],
        userIdToBeDeleted: null
      });
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }

  private async _verifyRights(rights: RightsEnum[], user: Types.ObjectId, roomId: Types.ObjectId): Promise<boolean | Observable<any>> {
    try {
      const exists = await this.rightsModel.exists({ user, roomId, rights });
      return !!exists._id;
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      new InternalServerErrorException({
        key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
        code: httpCode,
        message: msg
      });
    }
  }
}
