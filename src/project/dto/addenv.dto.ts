import { ArrayNotEmpty, ArrayUnique, IsArray, IsEmpty, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserNRoleDto } from './usernrole.dto';

class KeyValueDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @Matches(/^[A-Za-z]/, { message: 'Key must start with a letter A-Z or a-z' })
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

export class AddEnvironmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmpty()
  users: UserNRoleDto[];

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => KeyValueDto)
  keyValue: KeyValueDto[];
}
