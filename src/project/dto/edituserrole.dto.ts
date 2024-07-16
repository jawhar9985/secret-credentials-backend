import { IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "src/common/enum/role.enum";

export class EditUserRoleDto {
    @IsNotEmpty()
    @IsEnum(Role)
    readonly role:Role
}