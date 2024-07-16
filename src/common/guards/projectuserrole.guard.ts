import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { Project } from 'src/project/schema/project.schema';

@Injectable()
export class ProjectUserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const projectId = request.params.projectId;
    const envId = request.params.envId;
    const keysId = request.params.keysId;
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    let project;
    
    if (projectId) {
      project = await this.projectModel.findById(projectId);
    } else if (envId) {
      project = await this.projectModel.findOne({ "environments._id": envId });
    } else if (keysId) {
      project = await this.projectModel.findOne({ "keys._id": keysId });
    }

    if (!project) {
      return false;
    }

    const userInProject = project.users.some(
      (projectUser) => 
        projectUser.user.toString() === user._id.toString() && 
        requiredRoles.includes(projectUser.role)
    );
    if (user.isSuperAdmin){
      return true
    }

    if (project.owner && project.owner.toString() === user.id.toString()) {
      return true;
    }

    return userInProject;
  }
}
