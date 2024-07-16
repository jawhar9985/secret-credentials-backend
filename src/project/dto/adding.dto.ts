import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/common/enum/role.enum";



export class OwnerEmailDto{
    @IsNotEmpty()
    @IsEmail()
    readonly email: string
}

export class UserEmailDto{
    @IsNotEmpty()
    @IsEmail()
    readonly email: string
}

export class AddProjectUserDto {
    @IsNotEmpty()
    @IsEmail()
    email:string

    @IsNotEmpty()
    @IsEnum(Role)
    role:Role
}