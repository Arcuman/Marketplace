import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Order } from './order.model';
import {
  Action,
  AppAbility,
  CaslAbilityFactory,
} from '../casl/casl-ability.factory';
import { PoliciesGuard } from '../casl/guards/policies-guard.guard';
import { CheckPolicies } from '../casl/decorators/check-policies-key';
import { RequestUser } from '../types/request-user';
import { UnAthorizationResponse } from '../types/response/UnAthorizationResponse';
import { BadRequestExeption } from '../types/response/BadRequestExeption';

@ApiTags('Заказы')
@ApiInternalServerErrorResponse()
@ApiSecurity('bearer')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiOperation({ summary: 'Сделать заказ' })
  @ApiResponse({ status: 200, type: Order })
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Order))
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: RequestUser) {
    return this.orderService.create(createOrderDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Получить все товары в заказе' })
  @ApiResponse({ status: 200, type: Order })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Order))
  @UseGuards(JwtAuthGuard)
  @Get(':orderId')
  async findOrderItemsByOrderId(
    @Param('orderId') orderId: number,
    @Req() req: RequestUser,
  ) {
    console.log(req.user);
    const order = await this.orderService.findOrderByPk(orderId);
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (!order) {
      throw new NotFoundException('Заказ не найдет');
    }
    if (req.user && ability.can(Action.Read, order)) {
      return order;
    }
    throw new ForbiddenException('Нет доступа к информации этого заказа');
  }
}
