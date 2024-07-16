import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeysSchema } from 'src/keys/schema/keys.schema';
import { UserSchema } from 'src/user/schema/user.schema';
import { ProjectSchema } from './schema/project.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:"Keys",schema:KeysSchema},
      {name:"User",schema:UserSchema},
      {name:"Project",schema:ProjectSchema}
    ]),
    UserModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService]
})
export class ProjectModule {}
