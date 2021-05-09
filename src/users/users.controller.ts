import { Body, Controller, Req, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './users.model';
import { Roles } from '../roles/decorators/roles.decorator';
import { Role } from '../roles/enums/role.enum';
import { RolesGuard } from '../roles/guards/roles.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { Request } from 'express';
@ApiTags('Пользователи')
@ApiSecurity('bearer')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private productService: ProductService,
  ) {}

  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Выдать роль' })
  @ApiResponse({ status: 200 })
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Post('/role')
  addRole(@Body() dto: AddRoleDto) {
    return this.usersService.addRole(dto);
  }

  @ApiOperation({ summary: 'Получить все продукты пользователя' })
  @ApiResponse({ status: 200, type: [Product] })
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Get('products')
  getConsultation(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.productService.findProductsByUserId(user.userId);
  }
}
