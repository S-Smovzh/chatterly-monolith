import { IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { VALIDATION_ERROR_CODES, VALIDATION_RULES, ValidationErrorCodesEnum } from "@ssmovzh/chatterly-common-utils";
import { ValidationRulesEnum } from "@ssmovzh/chatterly-common-utils";
import { IsStrongPassword } from "~/modules/common/decorators/is-strong-password.decorator";
import { VerificationBaseDto } from "~/modules/public/dto/verification-base.dto";
import { NotMatch } from "~/modules/common";

export class ChangePasswordDto extends VerificationBaseDto {
  @ApiProperty({
    description: "The old password of the user.",
    minLength: +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MIN_LENGTH).value,
    maxLength: +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MAX_LENGTH).value
  })
  @IsNotEmpty({ message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.INVALID_PASSWORD).msg })
  @IsString({ message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.INVALID_PASSWORD).msg })
  @Length(
    +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MIN_LENGTH).value,
    +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MAX_LENGTH).value,
    { message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.INVALID_PASSWORD_LENGTH).msg }
  )
  @IsStrongPassword({ message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.WEAK_PASSWORD).msg })
  oldPassword: string;

  @ApiProperty({
    description: "The new password of the user.",
    minLength: +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MIN_LENGTH).value,
    maxLength: +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MAX_LENGTH).value
  })
  @IsNotEmpty({ message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.INVALID_PASSWORD).msg })
  @IsString({ message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.INVALID_PASSWORD).msg })
  @Length(
    +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MIN_LENGTH).value,
    +VALIDATION_RULES.get(ValidationRulesEnum.PASSWORD_MAX_LENGTH).value,
    { message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.INVALID_PASSWORD_LENGTH).msg }
  )
  @IsStrongPassword({ message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.WEAK_PASSWORD).msg })
  @NotMatch("oldPassword", {
    message: VALIDATION_ERROR_CODES.get(ValidationErrorCodesEnum.PASSWORD_MATCHES_WITH_THE_PREVIOUS).msg
  })
  newPassword: string;
}
