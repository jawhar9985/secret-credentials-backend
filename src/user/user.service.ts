import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs'
import { LoginDto } from './dto/login.dto';
import { EditUserDto } from './dto/edituser.dto';
import { Project } from 'src/project/schema/project.schema';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/resetpassword.dto';
import { MailerService } from './mail.service';
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService,
        @InjectModel(Project.name)
        private projectModel: Model<Project>,
        private readonly mailerService: MailerService,
    ) { }
    /*
        async register(registerDto: RegisterDto) {
            const { name, email, password } = registerDto;
            const exists = await this.userModel.findOne({ email: email });
            if (exists) {
                return ({ message: "User with this email already exists" })
            }
            const hash = await bcrypt.hash(password, 10)
            return this.userModel.create({ name, email, password: hash })
    
        }
    */

    async login(loginDto: LoginDto): Promise<User | { message: string }> {
        const { email, password } = loginDto
        const user = await this.userModel.findOne({ email: email })
        console.log(user)
        if (!user) {
            return ({ message: "Wrong email or password" })
        }
        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) {
            return ({ message: "Wrong email or password" })
        }
        return user
    }



    generateToken(user: User) {
        return this.jwtService.sign({ id: user._id })
    }

    getAllUsers() {
        return this.userModel.find()
    }

    findUser(userId: string): Promise<User> {
        return this.userModel.findById(userId)
    }

    async editUser(userId: string, editUserDto: EditUserDto) {
        const user = await this.userModel.findById(userId)
        if (!user) {
            return ({ message: "User not found" })
        }

        if (editUserDto.hasOwnProperty('password')) {
            const { password } = editUserDto
            const hash = await bcrypt.hash(password, 10)
            editUserDto.password = hash
        }
        return this.userModel.findByIdAndUpdate(userId,
            editUserDto,
            {
                new: true,
                runValidators: true,
            }

        )
    }



    async deleteUser(userId: string) {
        const userExists = await this.userModel.findById(userId);
        if (!userExists) {
            return { message: "User not found" };
        }
        const userIsOwner = await this.projectModel.findOne({ owner: userId });
        if (userIsOwner) {
            return { message: "User is owner of a project. Change the project owner first" };
        }
        const removeUserFromProject = await this.projectModel.updateMany(
            { 'users.user': userId },
            { $pull: { users: { user: userId } } }
        );
        const removeUserFromEnv = await this.projectModel.updateMany(
            { 'environments.users': userId },
            { $pull: { 'environments.$.users': userId } }
        );

        return this.userModel.findByIdAndDelete(userId);
    }

    async addUser(registerDto: RegisterDto) {
        const { name, email, password, isSuperAdmin } = registerDto
        const exists = await this.userModel.findOne({ email: email })
        if (exists) {
            return ({ message: "User with this Email already exists" })
        }
        const hashPassword = await bcrypt.hash(password, 10)
        return this.userModel.create({ name, email, password: hashPassword, isSuperAdmin })
    }


    async requestPasswordReset(email: string) {
        const user = await this.userModel.findOne({ email: email });
        if (!user) {
            return ({ message: "User with this email not found" })
        }

        const token = this.generateToken(user)
        const resetLink = `localhost:3000/user/reset-password?token=${token}`;
        return this.mailerService.sendMail(user.email, 'Password Reset Request', `Click this link to reset your password: ${resetLink}`);

    }

    async resetPassword(token: string, newPassword: string) {
        const decoded = this.jwtService.verify(token);
        if (!decoded) {
            return ({ message: "Invalid or expired token" })
        }
        const user = await this.userModel.findById(decoded.id);
        if (!user) {
            return ({ message: "User not found" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        if (!hashedPassword) {
            return ({ message: "Password hash has been failed" })
        }
        user.password = hashedPassword;

        return this.userModel.findByIdAndUpdate(user._id, { password: hashedPassword })

    }
}
