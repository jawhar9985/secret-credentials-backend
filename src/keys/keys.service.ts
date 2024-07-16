import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Keys } from './schema/keys.schema';
import { Model, Types } from 'mongoose';
import { CreateKeysDto } from './dto/createkeys.dto';
import { Project } from 'src/project/schema/project.schema';

@Injectable()
export class KeysService {
  constructor(
    @InjectModel(Keys.name)
    private keysModel: Model<Keys>,
    @InjectModel(Project.name)
    private projectModel: Model<Project>
  ) { }

  createKeys(createKeysDto: CreateKeysDto) {
    return this.keysModel.create({ keys: createKeysDto.keys })

  }

  getOneKey(keyId:string){
    return this.keysModel.findById(keyId)
  }

  async editKeys(keysId: string, editKeysDto: CreateKeysDto) {
    const keys = await this.keysModel.findById(keysId)
    if (!keys) {
      return ({ message: "Keys with the specified ID not found" })
    }
    const newKeys = keys.keys
    const projects = await this.projectModel.find({ keys: new Types.ObjectId(keysId) })
    console.log(projects)
    if (projects) {
      const newEnvKeysValues = newKeys.map(key => ({ key, value: "" }))
      for (let project of projects) {
        if (project.environments && project.environments.length > 0) {
          for (let env of project.environments) {
              const projectMAJ = await this.projectModel.findOneAndUpdate(
                  { keys: new Types.ObjectId(keysId), "environments._id": env._id },
                  { $set: { "environments.$.keyValue": newEnvKeysValues } }
                
                 );
                 console.log(projectMAJ)
          }
        }
      }
    }

    return this.keysModel.findByIdAndUpdate(keysId, { keys: editKeysDto.keys })
  }
}

