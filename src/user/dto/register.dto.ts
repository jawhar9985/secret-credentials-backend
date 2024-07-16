import { IsBoolean, IsEmail, IsEmpty, IsEnum, IsNotEmpty, MinLength } from "class-validator"


export class RegisterDto {
    @IsNotEmpty()
    readonly name:string

    @IsNotEmpty()
    @IsEmail()
    readonly email: string

    @IsNotEmpty()
    @MinLength(3)
    readonly password: string

    @IsBoolean()
    readonly isSuperAdmin:boolean = false;
}