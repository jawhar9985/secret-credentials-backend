import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsString, Matches, ValidateNested } from "class-validator";


class KeyValueDto {
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
    @Matches(/^[A-Za-z]/, { message: 'Key must start with a letter A-Z or a-z' })
    key: string;
  
    @IsString()
    value: string;
  }
  
  export class AddValuesDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => KeyValueDto)
    keysValues: KeyValueDto[];
  }