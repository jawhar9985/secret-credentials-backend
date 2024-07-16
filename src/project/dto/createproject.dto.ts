import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsEmpty, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';

class KeyValueDto {
  
  @IsEmpty()
  key: string;

  @IsEmpty()
  value: string;
}

class UserNRoleDto {
  @IsNotEmpty()
  user: string; 

  @IsNotEmpty()
  role: string;  
}

class EnvironmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmpty()
  users: UserNRoleDto[];

  @IsEmpty()
  keyValue: KeyValueDto[];
}


export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Transform(({ value }) => value.map((key: string) => key.toUpperCase()), { toClassOnly: true })
  @IsString({ each: true })
  @Matches(/^[A-Za-z]/, { each: true, message: 'Each key must start with a letter A-Z or a-z' })
  keys: string[];

  @IsEmpty()
  users: UserNRoleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvironmentDto)
  environment: EnvironmentDto[];
}
