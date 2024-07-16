import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ProjectSchema } from 'src/project/schema/project.schema';
import { MailerService } from './mail.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET_KEY'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRE')
          }
        }
      }

    }), MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Project', schema:ProjectSchema},
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy,MailerService]
  , exports: [JwtStrategy, PassportModule]
})
export class UserModule { }
