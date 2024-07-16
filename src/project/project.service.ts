import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { CreateProjectDto } from './dto/createproject.dto';
import { Project } from './schema/project.schema';
import { AddProjectUserDto, OwnerEmailDto, UserEmailDto } from './dto/adding.dto';
import { Keys } from 'src/keys/schema/keys.schema';
import { AddEnvironmentDto } from './dto/addenv.dto';
import { EditUserRoleDto } from './dto/edituserrole.dto';
import { AddValuesDto } from './dto/addvalues.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ProjectService {
    private readonly secretKey: string;
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        @InjectModel(Project.name)
        private projectModel: Model<Project>,
        @InjectModel(Keys.name)
        private keysModel: Model<Keys>,
        private readonly configService: ConfigService
    ) {
        this.secretKey = this.configService.get<string>('ENCRYPTION_SECRET_KEY');
     }

    async createProject(createProjectDto: CreateProjectDto, ownerId: string) {
        const keys = await this.keysModel.create({ keys: createProjectDto.keys })
        if (!keys) {
            return ({ message: "failure to create keys" })
        }

        console.log(keys.keys)
        if (!createProjectDto.environment) {
            createProjectDto.environment = [];
        }
        createProjectDto.environment = createProjectDto.environment.map(env => ({
            ...env,
            keyValue: keys.keys.map(key => ({ key, value: '' }))
        }));
        console.log(createProjectDto.environment)

        return this.projectModel.create(
            {
                name: createProjectDto.name,
                keys: keys._id,
                owner: ownerId,
                environments: createProjectDto.environment

            })
    }

    async editOwner(projectId: string, ownerEmailDto: OwnerEmailDto) {
        const user = await this.userModel.findOne({ email: ownerEmailDto.email })
        if (!user) {
            return ({ message: "User with this email does not exist" })
        }
        return this.projectModel.findByIdAndUpdate(projectId, { owner: user._id }, { new: true })
    }
    /*
        async editKeys(projectId: string, keysId: String) {
            const project = await this.projectModel.findById(projectId)
            if (!project) {
                return ({ message: "Project with the specified ID not found" })
            }
            const keys = await this.keysModel.findById(keysId)
            if (!keys) {
                return ({ message: "Keys with the specific ID not found" })
            }
            const newKeys = keys.keys
            const projects = await this.projectModel.find({ keys:keysId })
            console.log(projects)
            if (projects) {
                const newEnvKeysValues = newKeys.map(key => ({ key, value: "" }))
                for (let project of projects) {
                    if (project.environments && project.environments.length > 0) {
                        for (let env of project.environments) {
                            const projectMAJ = await this.projectModel.findOneAndUpdate(
                                { keys: keysId, "environments._id": env._id },
                                { $set: { "environments.$.keyValue": newEnvKeysValues } }
    
                            );
                        }
                    }
                }
            }
    
    
            return this.projectModel.findByIdAndUpdate(projectId, { keys: keys._id }, { new: true })
        }
            */

        async getOneProject(projectId: string, userId: string) {
            const user = await this.userModel.findById(userId);
            if (!user) {
              return { message: 'User not found' };
            }
        
            const project = await this.projectModel.findById(projectId);
            if (!project) {
              return ({message:"Project with the specified ID not found"});
            }
        
            if (user.isSuperAdmin || project.owner.toString() === userId || project.users.some(u => u.user.toString() === userId)) {
              return this.projectModel.findById(projectId);
            } else {
              return { message: 'You are not the owner or a user of this project' };
            }
          }

    async getAllProjects() {
        return this.projectModel.find()
    }



    async addEnv(projectId: string, addEnvironmentDto: AddEnvironmentDto) {
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            return { message: "Project with the specified ID not found" };
        }
    
        const keys = await this.keysModel.findById(project.keys);
        if (!keys) {
            return { message: "Keys not found" };
        }
    
        const insertedKeysValues = addEnvironmentDto.keyValue;
        console.log(insertedKeysValues)
        const insertedKeys = insertedKeysValues.map(key => key.key).sort();
        console.log(insertedKeys)
        const existingKeys = keys.keys.map(key => key).sort();
        console.log(existingKeys)
        
        // Check if all inserted keys exist in the existing keys
        if (!insertedKeys.every(key => existingKeys.includes(key))) {
            return { message: "One or more inserted keys don't match existing keys" };
        }
    
        const newKeysValues = existingKeys.map(eK => {
            const matchedKeyValue = insertedKeysValues.find(item => item.key === eK);
            return { key: eK, value: matchedKeyValue ? matchedKeyValue.value : "" };
        });
        addEnvironmentDto.keyValue = newKeysValues;
        return this.projectModel.findByIdAndUpdate(
            projectId,
            { $push: { environments: addEnvironmentDto } },
            { new: true }
        );
    }
    

    async addProjectUser(projectId: string, addProjectUserDto: AddProjectUserDto) {
        const user = await this.userModel.findOne({ email: addProjectUserDto.email })
        if (!user) {
            return ({ message: "User with this email does not exist" })
        }
        const userInProject = await this.projectModel.findOne({ _id: projectId, "users.user": user.id });
        if (userInProject) {
            return { message: "User already exists in this project" };
        }

        const userToAdd = { user: user._id, role: addProjectUserDto.role }
        return this.projectModel.findByIdAndUpdate(projectId, { $push: { users: userToAdd } }, { new: true })
    }

    async removeProjectUser(projectId: string, userObjId: string) {
        const project = await this.projectModel.findById(projectId)
        if (!project){
            return ({message:"Project with the specified ID not found"})
        }
        const userInProject = await this.projectModel.findOne({_id: projectId,'users._id': userObjId})
        if (!userInProject) {
            return ({ message: "Object User does not exist in this project" })
        }
        
        return this.projectModel.findByIdAndUpdate(
            projectId,
            { $pull: { users: { _id: userObjId } } },
            { new: true }
        )

    }


    async addEnvUser(envId: string, userEmailDto: UserEmailDto) {
        const envInProject = await this.projectModel.findOne({"environments._id":envId})
        if (!envInProject){
            return ({message:"Project/Environment does no exist"})
        }
        const user = await this.userModel.findOne({ email: userEmailDto.email });
        if (!user) {
            return { message: "User with this email not found" };
        }
        const userInEnv = await this.projectModel.findOne({
            'environments.users': user._id,
            'environments._id': envId
        });
        if (userInEnv) {
            return { message: "User already exists in this environment" };
        }

        return this.projectModel.findOneAndUpdate(
            { 'environments._id': envId },
            { $push: { 'environments.$.users': user._id } },
            { new: true }
        );
    }

    async removeEnvUser(envId: string, userId: string) {
        const envInProject = await this.projectModel.findOne({"environments._id":envId})
        if (!envInProject){
            return ({message:"Project/Environment does no exist"})
        }
        const user = await this.userModel.findById(userId)
        if (!user) {
            return ({ message: "User does not exist" })
        }

        const userInEnv = await this.projectModel.findOne({
            'environments.users': userId,
            'environments._id': envId
        });
        if (!userInEnv) {
            return { message: "User does not exist in this environment" };
        }
        return this.projectModel.findOneAndUpdate(
            { 'environments._id': envId, 'environments.users': userId },
            { $pull: { 'environments.$.users': userId } },
            { new: true }
        )
    }

    async editProjectUserRole(projectId: string, userId: string, role: string) { 
        const project = await this.projectModel.findOne({ _id: projectId, "users._id": userId});
        if (!project) {
          return { message: "User/Project not found" };
        }
    
        return this.projectModel.findOneAndUpdate(
          { _id: projectId, "users._id": userId },
          { $set: { "users.$.role": role } },
          { new: true }
        );
      }
    async addEnvValues(envId: string, addValuesDto: AddValuesDto) {
        const project = await this.projectModel.findOne({ "environments._id": envId });
        if (!project) {
            return { message: "Project/Environment not found" };
        }
    
        const environment = project.environments.find(env => env._id.toString() === envId);
        if (!environment) {
            return { message: "Environment not found" };
        }
    
        const environmentKeys = environment.keyValue.map(kv => kv.key);
        const updateKeyValue = [];
        for (const kv of addValuesDto.keysValues) {
            if (!environmentKeys.includes(kv.key)) {
                return { message: `There's at least one key not found in environment keys` };
            }
        }
    
        for (const envKey of environmentKeys) {
            const matchingKeyValue = addValuesDto.keysValues.find(kv => kv.key === envKey);
            if (matchingKeyValue) {
                matchingKeyValue.value = this.encryptToBase64(matchingKeyValue.value)
                console.log(matchingKeyValue)
                updateKeyValue.push(matchingKeyValue);
            } else {
                updateKeyValue.push({ key: envKey, value: '' });
            }
        }
    
        if (updateKeyValue.length === 0) {
            return { message: "No matching keys found to update" };
        }
    
        return this.projectModel.findOneAndUpdate(
            { "environments._id": envId },
            { $set: { "environments.$.keyValue": updateKeyValue } },
            { new: true }
        );
    }
    async getMyProjects(userId: string){
        const user = await this.userModel.findById(userId);
        if (!user) {
          return ({message:"User with the specified ID not found"})
        }
    
        if (user.isSuperAdmin) {
          return this.projectModel.find();
        } else {
          return this.projectModel.find({
            $or: [
              { owner: userId },
              { 'users.user': userId }
            ]
          });
        }
      }



    async editValue(envId: string, keyValueId: string, newValue: string) {
          const project = await this.projectModel.findOne({ "environments._id": envId });
          if (!project) {
            return { message: "Project/Environment not found" };
          }
      
          const environment = project.environments.find(env => env._id.toString() === envId);
          if (!environment) {
            return { message: "Environment not found" };
          }
      
          const keyValue = environment.keyValue.find(kv => kv._id.toString() === keyValueId);
          if (!keyValue) {
            return { message: "Key-Value pair not found" };
          }
          if (newValue===""){
            keyValue.value = newValue
          }
          else{
      
          keyValue.value = this.encryptToBase64(newValue);}
      
          return this.projectModel.findOneAndUpdate(
            { "environments._id": envId, "environments.keyValue._id": keyValueId },
            { $set: { "environments.$[env].keyValue.$[kv].value": keyValue.value } },
            {
              arrayFilters: [{ "env._id": envId }, { "kv._id": keyValueId }],
              new: true,
            }
          );
    
      }
    encryptToBase64(data: string): string {
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.secretKey, 'hex'), iv);
          let encrypted = cipher.update(data, 'utf8', 'base64');
          encrypted += cipher.final('base64');
          return iv.toString('base64') + ':' + encrypted;
    }
    
    decryptFromBase64(data: string): string {
          const [ivBase64, encryptedData] = data.split(':');
          const iv = Buffer.from(ivBase64, 'base64');
          const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.secretKey, 'hex'), iv);
          let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
          decrypted += decipher.final('utf8');
          return decrypted;
        }

      async getEnvironmentFileContent(envId: string){
        const project = await this.projectModel.findOne({ "environments._id": envId });
        if (!project) {
          return ({message:"Project/Environment not found"})
        }
    
        const environment = project.environments.find(env => env._id.toString() === envId);
        if (!environment || !environment.keyValue) {
          return ({message:'Environment has no valid key-values'})
        }
    
        const keyValuePairs = environment.keyValue
          .filter(kv => kv.key && kv.value)
          .map(kv => `${kv.key}=${this.decryptFromBase64(kv.value)}`)
          .join('\n');
    
        return ({result:keyValuePairs})
      }
      }


    
    
    




