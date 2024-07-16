import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema({
    timestamps:true
})
export class Keys {
    @Prop()
    keys:string[]
}

export const KeysSchema = SchemaFactory.createForClass(Keys)