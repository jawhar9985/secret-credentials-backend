import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Keys } from 'src/keys/schema/keys.schema';
import { User } from 'src/user/schema/user.schema';
import { ObjectId } from 'mongodb';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: ObjectId, ref: 'User'})
  owner: User;

  @Prop({ type: ObjectId, ref: 'Keys'})
  keys: Keys;

  @Prop({
    type: [
      {
        user: { type: ObjectId, ref: 'User' },
        role: { type: String, required: true }
      }
    ],
    _id: true
  })
  users: { user: User; role: string }[];

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        users: [{ type: ObjectId, ref: 'User' }],
        _id: false,
        keyValue: {
          type: [
            {
              key: { type: String},
              value: { type: String}
            }
          ],
          required: true
        }
      }
    ], _id:true
  })
  environments: {
    _id: any;
    name: string;
    users: User[];
    keyValue: {
        _id: any; key: string; value: string 
}[];
  }[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
