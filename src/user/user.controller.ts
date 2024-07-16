import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edituser.dto';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ObjectIdDto } from './dto/objectid.dto';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/resetpassword.dto';
import { STATUS_CODES } from 'http';

@Controller('user')
@ApiTags('user')
export class UserController {
    constructor(private userService: UserService) { }
    /*
        @Post('register')
        async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
            try {
                const result = await this.userService.register(registerDto);
                if (result && 'message' in result) {
                    return res.status(HttpStatus.CONFLICT).json({
                        statusCode: HttpStatus.CONFLICT,
                        message: result.message,
                    });
                }
                return res.status(HttpStatus.CREATED).json({
                    statusCode:HttpStatus.CREATED,
                    data:result
                });
            } catch (error) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error?.message?.toString()
                }
                );
            }
        }
    */
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        try {
            const result = await this.userService.login(loginDto);
            if ('message' in result) {
                return res.status(HttpStatus.UNAUTHORIZED).json(
                    {
                        statusCode: HttpStatus.UNAUTHORIZED,
                        message: result.message
                    }
                );
            }
            const token = this.userService.generateToken(result)
            return res.status(HttpStatus.OK).json(
                {
                    statusCode: HttpStatus.OK,
                    token: token
                }
            )
        } catch (error) {
            console.log(error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            });
        }
    }


    @Get('')
    @UseGuards(AuthGuard(), SuperAdminGuard)
    async getAllUsers(@Res() res: Response) {
        try {
            const users = await this.userService.getAllUsers();
            if (!users) {
                return res.send(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: "Users not found"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: users
            })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })

        }

    }

    @Get(':userId')
    @UseGuards(AuthGuard(), SuperAdminGuard)
    async findUser(@Param() userId: ObjectIdDto, @Res() res: Response) {
        try {
            const user = await this.userService.findUser(userId.userId)
            if (user) {
                return res.status(HttpStatus.OK).json({
                    statusCode: HttpStatus.OK,
                    data: user
                })
            }
            return res.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                message: "User not found."
            })
        } catch (e) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: e?.message?.toString()
            })
        }
    }


    @Put(':userId')
    @UseGuards(AuthGuard(), SuperAdminGuard)
    async editUser(@Body() editUserDto: EditUserDto, @Param() userId: ObjectIdDto, @Res() res: Response) {
        try {
            const result = await this.userService.editUser(userId.userId, editUserDto)
            if ('message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
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



    @Delete(':userId')
    @UseGuards(AuthGuard(), SuperAdminGuard)
    async deleteUser(@Param() userId: ObjectIdDto, @Res() res: Response) {
        try {
            const result = await this.userService.deleteUser(userId.userId);
            if (result && 'message' in result) {
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: result.message
                })
            }
            if (!result) {
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: "Failure to delete user"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: "User Deleted Successfully",
                data: result
            })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }
    }

    @Post('add')
    @UseGuards(AuthGuard())
    async addUser(@Body() registerDto: RegisterDto, @Res() res: Response) {
        try {
            const result = await this.userService.addUser(registerDto)
            if ('message' in result) {
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode: HttpStatus.CONFLICT,
                    message: result.message
                })
            }
        const token = this.userService.generateToken(result)
        // je vais le changer après configurer la partie frontend
        const resetLink = `localhost:3000/user/reset-password?token=${token}`;
        await this.userService.requestPasswordReset(result.email);
            
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message:"User has been created successfully, reset password link has been sent",
                data: result
            })
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                erorr: error?.message?.toString()
            })

        }
    }

    @Post('request-password-reset')
    async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto, @Res() res: Response) {
        try {
            const result = await this.userService.requestPasswordReset(requestPasswordResetDto.email);
            if (result && 'message' in result) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: result.message
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                message: "Mail has been sent successfully"
            })


        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            })
        }

    }

    @Post('reset-password')
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
        try {
            if (!token) {
                throw new BadRequestException('Token is required');
            }
            await this.userService.resetPassword(token, resetPasswordDto.newPassword);
            return res.status(HttpStatus.OK).json({
                message: 'Password has been reset successfully'
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error?.message?.toString()
            });
        }
    }

}
