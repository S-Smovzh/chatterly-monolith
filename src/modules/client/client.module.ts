import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { ClientService } from "./client.service";
import { TokenModule } from "~/modules/token/token.module";
import { ClientSessionSchema, ContactFormSchema, ModelsNamesEnum } from "@ssmovzh/chatterly-common-utils";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ModelsNamesEnum.CONTACT_FORMS,
        schema: ContactFormSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: ModelsNamesEnum.CLIENT_SESSIONS,
        schema: ClientSessionSchema
      }
    ]),
    TokenModule
  ],
  providers: [ClientService],
  exports: [ClientService]
})
export class ClientModule {}
