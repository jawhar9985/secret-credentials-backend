import { IsMongoId } from "class-validator";


export class KeyObjectIdDto{
    @IsMongoId()
    readonly keysId:string
}