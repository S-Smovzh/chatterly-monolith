import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { MessageSchema, ModelsNamesEnum, RightsSchema, UserSchema } from "@ssmovzh/chatterly-common-utils";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";
import { RoomsModule } from "~/modules/rooms";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelsNamesEnum.MESSAGES, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.USERS, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.RIGHTS, schema: RightsSchema }]),
    RoomsModule
  ],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesGateway, MessagesService]
})
export class MessageModule {}
