import { IsMongoId, IsString } from "class-validator";

export class ProjectObjectIdDto {
  
  @IsMongoId()
  readonly projectId: string;
}

export class KeysObjectIdDto {
  
    @IsMongoId()
    readonly keysId: string;
  }
  
  export class EnvObjectIdDto {
  
    @IsMongoId()
    readonly envId: string;
  }

  export class UserObjectIdDto {
  
    @IsMongoId()
    readonly userId: string;
  }

  export class EditProjectUserRoleDto {
  
    @IsMongoId()
    readonly userId: string;
    @IsMongoId()
    readonly projectId: string;
  }

  export class RemoveUserObjectIdDto {
  
    @IsMongoId()
    readonly userObjId: string;
    @IsMongoId()
    readonly projectId: string;
  }

  export class EditValueDto {
  
    @IsMongoId()
    readonly envId: string;
    @IsMongoId()
    readonly keyValueId: string;
  }




