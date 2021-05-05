import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return { email: user.email, id: user.id, roles: user.roles };
    }
    return null;
  }

  login(user: User) {
    const payload = {
      username: user.email,
      sub: user.id,
      roles: user.roles.map((role) => role.value),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.usersService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        'Пользователь с таким email существует',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.usersService.createUser({
      ...userDto,
      password: hashPassword,
    });
    const payload = {
      username: user.email,
      sub: user.id,
      roles: user.roles.map((role) => role.value),
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
