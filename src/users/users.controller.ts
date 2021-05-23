import {
  Body,
  Controller,
  Req,
  Get,
  Post,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  Put,
  Param,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBody,
  ApiConsumes,
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
import { Action, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { RequestUser } from '../types/request-user';
import { UnAthorizationResponse } from '../types/response/UnAthorizationResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user-dto';
import { plainToClass } from 'class-transformer';
import { AuctionService } from '../auction/auction.service';

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
    private auctionsService: AuctionService,
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
      console.log(user);
      return user;
    }
    throw new ForbiddenException('Нет доступа к этому профилю');
  }

  @ApiOperation({ summary: 'Выдать роль' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @Roles(Role.ADMIN)
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

  @ApiOperation({ summary: 'Получить все заказы пользователя' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Get('orders')
  getUserOrders(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.orderService.findOrderByUserId(user.userId);
  }

  @ApiOperation({ summary: 'Получить все выставленные на аукцион товары' })
  @ApiResponse({ status: 200, type: [Order] })
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Get('auctions')
  getUserAuctions(@Req() req: Request) {
    const user = req.user as { userId: number };
    return this.auctionsService.findAllByUserId(user.userId);
  }

  @ApiOperation({ summary: 'Обновить профиль с картинкой' })
  @ApiResponse({ status: 201, type: UpdateUserDto })
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiResponse({ status: 403 })
  @ApiSecurity('bearer')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserDto,
  })
  @UseGuards(JwtAuthGuard)
  @Put('/profile/')
  async fullUpdate(
    @UploadedFile() image,
    @Req() req: RequestUser,
    @Body() createUserDto: UpdateUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const user = await this.usersService.getUserById(req.user.userId);
    if (!user) {
      throw new NotFoundException();
    }
    if (req.user && ability.can(Action.Update, user)) {
      const {
        numberOfAffectedRows,
        updatedUser,
      } = await this.usersService.fullUpdate(
        req.user.userId,
        createUserDto,
        image,
      );
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException('Такого пользователя не существует');
      }
      return plainToClass(UpdateUserDto, updatedUser);
    }
    throw new ForbiddenException('Нет доступа к этому профилю');
  }
}
