import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { MessageSchema, ModelsNamesEnum, NotificationsSchema, RightsSchema, RoomSchema, UserSchema } from "@ssmovzh/chatterly-common-utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelsNamesEnum.ROOMS, schema: RoomSchema }]),
    MongooseModule.forFeature([
      {
        name: ModelsNamesEnum.MESSAGES,
        schema: MessageSchema
      }
    ]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.RIGHTS, schema: RightsSchema }]),
    MongooseModule.forFeature([
      {
        name: ModelsNamesEnum.NOTIFICATIONS,
        schema: NotificationsSchema
      }
    ]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.USERS, schema: UserSchema }])
  ],
  providers: [RoomsService],
  exports: [RoomsService]
})
export class RoomsModule {}
