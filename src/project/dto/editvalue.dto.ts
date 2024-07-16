import { IsNotEmpty, IsString } from "class-validator";



export class EditAddValueDto {
    @IsString()
    value:string
}