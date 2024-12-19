import { Module } from "@nestjs/common";
import { PublicController } from "~/modules/public/public.controller";
import { UserModule } from "~/modules/user/user.module";
import { RoomsModule } from "~/modules/rooms";
import { TokenModule } from "~/modules/token/token.module";
import { ClientModule } from "~/modules/client/client.module";

@Module({
  imports: [UserModule, RoomsModule, TokenModule, ClientModule],
  controllers: [PublicController]
})
export class PublicModule {}
