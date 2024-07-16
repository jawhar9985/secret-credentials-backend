import { Type } from "class-transformer";
import { IsMongoId, IsString } from "class-validator";
import { IsObjectId } from "class-validator-mongo-object-id";

export class ObjectIdDto {
  
  @IsMongoId()
  readonly userId: string;
}
