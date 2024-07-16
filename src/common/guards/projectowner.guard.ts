import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';

@Injectable()
export class ProjectOwnerRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const projectId = request.params.projectId;
    const keysId = request.params.keysId;
    const envId = request.params.envId;
    let project;
    if (projectId) {
      project = await this.projectModel.findById(projectId);
    } else if (envId) {
      project = await this.projectModel.findOne({ "environments._id": envId });
    }
    else if (keysId){
      project = await this.projectModel.findOne({keys:keysId})
    }
    console.log(project)


    if (!project) {
      return false;
    }
    if (project.owner && project.owner.toString() === user.id.toString()) {
        return true;
      }

  }
}
