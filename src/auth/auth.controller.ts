import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginRequestDto } from './dto/login-request.dto';
import { BadRequestExeption } from '../types/response/BadRequestExeption';

@ApiTags('Авторизация')
@ApiInternalServerErrorResponse()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Авторизация' })
  @ApiResponse({ status: 200, description: 'Возвращает токен' })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() userDto: LoginRequestDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @ApiResponse({ status: 200, description: 'Возвращает токен' })
  @Post('/registration')
  registration(@Body() userDto: CreateUserDto) {
    return this.authService.registration(userDto);
  }
}
