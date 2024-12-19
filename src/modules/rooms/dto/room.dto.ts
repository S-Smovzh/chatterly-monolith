import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { Types } from "mongoose";

export class RoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  photo?: string;

  @IsNotEmpty()
  @IsBoolean()
  isUser: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isPrivate: boolean;

  @IsArray()
  usersID?: string[] = [];

  @IsArray()
  messagesID?: string[] = [];

  @IsNotEmpty()
  @IsNumber()
  membersCount?: number;

  @IsNotEmpty()
  @IsString()
  createdAt?: string;
}
