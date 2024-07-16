import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/common/enum/role.enum";
import { User } from "src/user/schema/user.schema";



export class UserNRoleDto {

    @IsMongoId({ each: true })
    user: User;
  
    @IsString()
    role: Role;
  }
  