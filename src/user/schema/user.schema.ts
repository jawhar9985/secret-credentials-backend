import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/common/enum/role.enum";

@Schema({
    timestamps:true
})

export class User extends Document{
    @Prop()
    name:string
    @Prop()
    email:string
    @Prop()
    password:string
    @Prop({ default: false })
    isSuperAdmin:boolean
    
}

export const UserSchema = SchemaFactory.createForClass(User)