import { Body, Controller, Get, HttpStatus, Param, Post, Put, Res, UseGuards } from '@nestjs/common';
import { KeysService } from './keys.service';
import { CreateKeysDto } from './dto/createkeys.dto';
import { Response } from 'express';
import { KeyObjectIdDto } from './dto/objectid.dto';
import { AuthGuard } from '@nestjs/passport';
import { SuperAdminGuard } from 'src/common/guards/superadmin.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/util/guards/roles.decorator';
import { ProjectUserRoleGuard } from 'src/common/guards/projectuserrole.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('keys')
@ApiTags('keys')
@UseGuards(AuthGuard())
export class KeysController {
    constructor(
        private keysService: KeysService,
    ) { }

    @Post()
    @UseGuards(SuperAdminGuard)
    async createKeys(
        @Body() createKeysDto: CreateKeysDto, 
        @Res() res: Response) {

        try {
            const result = await this.keysService.createKeys(createKeysDto)
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

    @Get(':keysId')
    @UseGuards(ProjectUserRoleGuard)
    @Roles(Role.ADMIN,Role.GUEST)
    async getOneKey(
        @Param() keysId: KeyObjectIdDto,
        @Res() res: Response
    ){
        try {
        const result = await this.keysService.getOneKey(keysId.keysId)
        if (!result){
            return res.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                message:"Key with the specified ID not found"
            })
        }
        return res.status(HttpStatus.OK).json({
            statusCode:HttpStatus.OK,
            data:result
        })
        
            
    } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode:HttpStatus.INTERNAL_SERVER_ERROR,
                error:error?.message?.toString()
            })
    }
    }


    @Put(':keysId')
    @UseGuards(ProjectUserRoleGuard)
    @Roles(Role.ADMIN)
    async editKeys(
        @Param() keysId: KeyObjectIdDto, 
        @Body() editKeysDto: CreateKeysDto,
        @Res() res:Response) {
        try {
            const result = await this.keysService.editKeys(keysId.keysId, editKeysDto)
            if (result && 'message' in result){
                return res.status(HttpStatus.NOT_FOUND).json({
                    statusCode:HttpStatus.NOT_FOUND,
                    message: "Keys with the specific _id found"
                })
            }
            if (!result){
                return res.status(HttpStatus.CONFLICT).json({
                    statusCode:HttpStatus.CONFLICT,
                    message:"Failure to update keys"
                })
            }
            return res.status(HttpStatus.OK).json({
                statusCode:HttpStatus.OK,
                data:result
            })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error:error?.message?.toString()
            })
        }
    }

}
