import { Module } from '@nestjs/common';
import { KeysController } from './keys.controller';
import { KeysService } from './keys.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeysSchema } from './schema/keys.schema';
import { ProjectSchema } from 'src/project/schema/project.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: 'Keys', schema:KeysSchema},
      {name: 'Project', schema:ProjectSchema}
    ]),UserModule
  ],
  controllers: [KeysController],
  providers: [KeysService]
})
export class KeysModule {}
