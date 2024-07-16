import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty } from "class-validator";
import { IsArrayStartsWithAZ } from "src/common/validator/is-array-starts-with-az.decorator";
import { IsUniqueArray } from "src/common/validator/is-unique-array.decorator";



export class CreateKeysDto {
    @IsNotEmpty()
    @ArrayNotEmpty()
    @IsArray()
    @IsArrayStartsWithAZ()
    @IsUniqueArray()
    @Transform(({ value }) => value.map((key: string) => key.toUpperCase()), { toClassOnly: true })
    readonly keys: string[];
}