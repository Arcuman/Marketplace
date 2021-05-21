import {
  Body,
  Controller,
  Req,
  Get,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiInternalServerErrorResponse,
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
import { Order } from '../orders/order.model';
import { OrderService } from '../orders/order.service';
import { BadRequestExeption } from '../types/response/BadRequestExeption';
import { PoliciesGuard } from '../casl/guards/policies-guard.guard';
import { CheckPolicies } from '../casl/decorators/check-policies-key';
import {
  Action,
  AppAbility,
  CaslAbilityFactory,
} from '../casl/casl-ability.factory';
import { RequestUser } from '../types/request-user';

@ApiInternalServerErrorResponse()
@ApiTags('Пользователи')
@ApiSecurity('bearer')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private productService: ProductService,
    private orderService: OrderService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: 'Получить информацию профиля' })
  @ApiResponse({ status: 200, type: User })
  @Get('profile')
  async getOne(@Req() req: RequestUser) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const user = await this.usersService.getUserById(req.user.userId);
    if (req.user && ability.can(Action.Read, user)) {
      return user;
    }
    throw new ForbiddenException('Нет доступа к этому профилю');
  }

  @ApiOperation({ summary: 'Выдать роль' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, type: BadRequestExeption })
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
  getProducts(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.productService.findProductsByUserId(user.userId);
  }

  @ApiOperation({ summary: 'Получить все покупки пользователя' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Get('orders')
  getUserOrders(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.orderService.findOrderByUserId(user.userId);
  }
}
