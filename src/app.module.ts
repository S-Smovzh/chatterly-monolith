import { Module } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PublicModule } from "~/modules/public/public.module";
import { defaultImports } from "~/modules/common/config";
import { AuthModule } from "~/modules/auth/auth.module";
import { ConnectionNamesEnum, HealthCheckModule, LoggerModule, MongoConfigInterface } from "@ssmovzh/chatterly-common-utils";
import { MulterModule } from "@nestjs/platform-express";
import { UserModule } from "~/modules/user/user.module";
import { ClientModule } from "~/modules/client/client.module";
import { TokenModule } from "~/modules/token/token.module";
import { RoomsModule } from "~/modules/rooms";
import { MessageModule } from "~/modules/messages";
import { EmailModule } from "~/modules/email";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "node:path";
import { I18nJsonLoader, I18nModule } from "nestjs-i18n";

@Module({
  imports: [
    ...defaultImports,
    MulterModule.register({
      dest: "./uploads"
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 120,
          limit: 500,
          ignoreUserAgents: [new RegExp("googlebot", "gi"), new RegExp("bingbot", "gi")]
        }
      ]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoConfig = configService.get<MongoConfigInterface>("mongoConfig");
        return {
          uri: `mongodb+srv://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.clusterUrl}/${ConnectionNamesEnum.CHATTERLY}?retryWrites=true&w=majority&appName=Cluster0`
        };
      },
      inject: [ConfigService]
    }),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: join(__dirname, "/i18n/"),
        watch: true
      },
      loader: I18nJsonLoader
    }),
    LoggerModule,
    AuthModule,
    PublicModule,
    HealthCheckModule,
    AuthModule,
    UserModule,
    ClientModule,
    TokenModule,
    RoomsModule,
    MessageModule,
    EmailModule
  ],
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
