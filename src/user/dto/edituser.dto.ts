import { IsEmail, IsEnum, IsOptional, MinLength } from "class-validator"
import { Role } from "src/common/enum/role.enum"


export class EditUserDto {
    @IsOptional()
    readonly name:string

    @IsOptional()
    @IsEmail()
    readonly email: string

    @IsOptional()
    @MinLength(3)
    password: string

    @IsOptional()
    readonly isSuperAdmin: boolean

    
}