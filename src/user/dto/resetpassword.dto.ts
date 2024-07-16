import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RequestPasswordResetDto {
    
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;
  }
  
  export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    newPassword: string;
  }