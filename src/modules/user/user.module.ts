import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { TokenModule } from "../token/token.module";
import { UserService } from "./user.service";
import { ChangePrimaryDataSchema, ForgotPasswordSchema, ModelsNamesEnum, UserSchema, VaultSchema } from "@ssmovzh/chatterly-common-utils";
import { RoomsModule } from "~/modules/rooms";
import { EmailModule } from "~/modules/email";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelsNamesEnum.USERS, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.VAULTS, schema: VaultSchema }]),
    MongooseModule.forFeature([
      {
        name: ModelsNamesEnum.FORGOT_PASSWORDS,
        schema: ForgotPasswordSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: ModelsNamesEnum.CHANGE_PRIMARY_DATA,
        schema: ChangePrimaryDataSchema
      }
    ]),
    TokenModule,
    RoomsModule,
    EmailModule
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
