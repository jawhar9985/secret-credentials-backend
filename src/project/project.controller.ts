import { Body, Controller, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/createproject.dto';
import { Request, Response } from 'express';
import { EditProjectUserRoleDto, EditValueDto, EnvObjectIdDto, ProjectObjectIdDto, RemoveUserObjectIdDto, UserObjectIdDto, } from './dto/objectid.dto';
import { AddProjectUserDto, OwnerEmailDto, UserEmailDto } from './dto/adding.dto';
import { AddEnvironmentDto } from './dto/addenv.dto';
import { EditUserRoleDto } from './dto/edituserrole.dto';
import { AuthGuard } from '@nestjs/passport';
import { AddValuesDto } from './dto/addvalues.dto';
import { ProjectUserRoleGuard } from 'src/common/guards/projectuserrole.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/util/guards/roles.decorator';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { ProjectOwnerRoleGuard } from 'src/common/guards/projectowner.guard';
import { EditAddValueDto } from './dto/editvalue.dto';
import { User } from 'src/user/schema/user.schema';
import { ApiTags } from '@nestjs/swagger';

@Controller('project')
@ApiTags('project')
@UseGuards(AuthGuard())
export class ProjectController {
    constructor(
        private projectService: ProjectService
    ) { }

    @Get('getoneproject/:projectId')
    async getOneProject(@Param() projectId: ProjectObjectIdDto, @Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as User;
            const result = await this.projectService.getOneProject(projectId.projectId, user.id);

            if ('message' in result) {
                return res.status(HttpStatus.FORBIDDEN).json({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: result.message
                });
            }

            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "No project found with the specified ID"
                });
            }

            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            });
        }
    }
    @Get('')
    @UseGuards(SuperAdminGuard)
    async getAllProjects(@Res() res: Response) {
        try {
            const result = await this.projectService.getAllProjects()
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "No project found"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }
    }

    @Get('myprojects')
    async getMyProjects(@Req() req: Request) {
        try {
            const user = req.user;
            const projects = await this.projectService.getMyProjects(user.id);

            if ('message' in projects) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: projects.message
                };
            }

            return {
                statusCode: HttpStatus.OK,
                data: projects
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'An error occurred',
                error: error?.message?.toString()
            };
        }
    }


    @Post('')
    async createProject(
        @Body() createProjectDto: CreateProjectDto, 
        @Res() res: Response, 
        @Req() request: Request) {
        try {
            const ownerId = request.user.id
            const result = await this.projectService.createProject(createProjectDto, ownerId)
            if (!result) {
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: "Failed to create Project"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })

        }
    }

    @Put('editowner/:projectId')
    @UseGuards(SuperAdminGuard)
    async editOWner(@Param() projectId: ProjectObjectIdDto, @Res() res: Response, @Body() ownerEmailDto: OwnerEmailDto) {
        try {
            const result = await this.projectService.editOwner(projectId.projectId, ownerEmailDto)
            if ('message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: "Owner added successfully",
                data: result
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }
    }
    /*
    @Put('addkeys/:projectId/:keysId')
    async addKeys(
        @Param() projectId: ProjectObjectIdDto,
        @Param() keysId: KeysObjectIdDto,
        @Res() res: Response
    ) {
        try {
            const result = await this.projectService.editKeys(projectId.projectId, keysId.keysId);

            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                });
            }

            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Project with the specified ID not found'
                });
            }

            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            });

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            });
        }
    } */

    @Put('addenv/:projectId')
    @UseGuards(ProjectOwnerRoleGuard)
    async addEnv(@Param() projectId: ProjectObjectIdDto, @Body() environmentDto: AddEnvironmentDto, @Res() res: Response) {
        try {
            const result = await this.projectService.addEnv(projectId.projectId, environmentDto)
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: "Failure to add Env to the project"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                date: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })

        }
    }

    @Put('addprojectuser/:projectId')
    @UseGuards(ProjectOwnerRoleGuard)
    async addProjectUser(@Param() projectId: ProjectObjectIdDto, @Body() addProjectUserDto: AddProjectUserDto, @Res() res: Response) {
        try {
            const result = await this.projectService.addProjectUser(projectId.projectId, addProjectUserDto)
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Project not found"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }
    }

    @Put('removeprojectuser/:projectId/:userObjId')
    @UseGuards(ProjectOwnerRoleGuard)
    async removeProjectUser(
        @Param() removeUserObjectIdDto: RemoveUserObjectIdDto,
        @Res() res: Response
    ) {
        try {
            const result = await this.projectService.removeProjectUser(removeUserObjectIdDto.projectId, removeUserObjectIdDto.userObjId)
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Failure to remove user from project"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }


    }

    @Put('addenvuser/:envId')
    @UseGuards(ProjectOwnerRoleGuard)
    async addEnvUser(@Param() envId: EnvObjectIdDto, @Body() userEmailDto: UserEmailDto, @Res() res: Response) {
        try {
            const result = await this.projectService.addEnvUser(envId.envId, userEmailDto)
            if (result && 'message' in result) {
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Project/ Environment to edit not found"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }
    }

    @Put('removeenvuser/:envId/:userId')
    @UseGuards(ProjectOwnerRoleGuard)
    async removeEnvUser(
        @Param() envId: EnvObjectIdDto,
        @Param() userId: UserObjectIdDto,
        @Res() res: Response) {
        try {
            const result = await this.projectService.removeEnvUser(envId.envId, userId.userId)
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Project/Env to update not found"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }

    }

    @Put('editprojectuserrole/:projectId/:userId')
    @UseGuards(ProjectOwnerRoleGuard)
    async editProjectUserRole(
        @Param()editProjectUserRoleDto: EditProjectUserRoleDto,
        @Body() editUserRoleDto: EditUserRoleDto,
        @Res() res: Response,

    ) {
        try {
            const result = await this.projectService.editProjectUserRole(editProjectUserRoleDto.projectId,editProjectUserRoleDto.userId,editUserRoleDto.role)
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Project to update not found"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }

    }

    @Put('addenvvalues/:envId')
    @UseGuards(ProjectUserRoleGuard)
    @Roles(Role.ADMIN)
    async addEnvValues(
        @Param() envId: EnvObjectIdDto,
        @Body() addValuesDto: AddValuesDto,
        @Res() res: Response
    ) {
        try {
            const result = await this.projectService.addEnvValues(envId.envId, addValuesDto)
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Failure to add Values"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })

        }
    }

    @Get('stream-file/:envId')
    @UseGuards(ProjectUserRoleGuard)
    @Roles(Role.ADMIN, Role.GUEST)
    async streamFile(
        @Param('envId') envId: string,
        @Res() res: Response
    ) {
        try {
            const fileContent = await this.projectService.getEnvironmentFileContent(envId);
            if (fileContent && 'message' in fileContent) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: fileContent.message
                })
            }

            res.setHeader('Content-Disposition', 'attachment; filename=.env');
            res.setHeader('Content-Type', 'text/plain');
            res.status(HttpStatus.OK).send(fileContent.result);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            });
        }
    }

    @Put('editonevalue/:envId/:keyValueId')
    @UseGuards(ProjectUserRoleGuard)
    @Roles(Role.ADMIN)
    async editValue(
        @Param() editValueDto: EditValueDto,
        @Body() editAddValueDto: EditAddValueDto,
        @Res() res: Response

    ) {
        try {
            const result = await this.projectService.editValue(editValueDto.envId, editValueDto.keyValueId, editAddValueDto.value)
            if ('message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Failure to update value"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: result
            })

        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })

        }

    }








}
