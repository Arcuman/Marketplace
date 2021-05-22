import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  BadRequestException as BadRequestExceptionNest,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiBody,
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
import { OrderItem } from './order-item.model';
import { OrderStatus } from './enums/order-status.enum';
import {
  UpdateOrderItemStatusDto,
  UpdateOrderStatusDto,
} from './dto/update-order.dto';
import { TransactionStatus } from './enums/transaction-status.enum';

@ApiTags('Заказы')
@ApiInternalServerErrorResponse()
@ApiSecurity('bearer')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  private logger: Logger = new Logger('Order');

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

  @ApiOperation({ summary: 'Изменить статус компонента заказа' })
  @ApiResponse({ status: 200, type: OrderItem })
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: UpdateOrderItemStatusDto,
  })
  @Put('/item/:orderItemId')
  async updateOrderItemStatus(
    @Body() { orderItemStatus }: UpdateOrderItemStatusDto,
    @Param('orderItemId') orderItemId: number,
    @Req() req: RequestUser,
  ) {
    const orderItem = await this.orderService.findOrderItemByPk(orderItemId);
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (!orderItem) {
      throw new NotFoundException('Продукт заказа не найдет');
    }
    if (orderItem.order.transactionStatus !== TransactionStatus.Success) {
      throw new BadRequestExceptionNest('Заказ не оплачен');
    }
    if (
      orderItem.orderStatus === OrderStatus.Complete ||
      orderItem.orderStatus === OrderStatus.Failed ||
      orderItemStatus === OrderStatus.Pending
    ) {
      if (ability.can(Action.Manage, orderItem)) {
        return this.orderService.updateOrderItemStatus(
          orderItem,
          orderItemStatus,
        );
      }
      throw new ForbiddenException(
        'Вы не можете сменить статус с Complete Failed и установить статус Pending',
      );
    }
    if (
      orderItemStatus === OrderStatus.Complete ||
      orderItemStatus === OrderStatus.Failed
    ) {
      if (ability.can(Action.Update, orderItem.order)) {
        return this.orderService.updateOrderItemStatus(
          orderItem,
          orderItemStatus,
        );
      }
      throw new ForbiddenException('Вы не можете установить этот статус');
    }
    if (ability.can(Action.Update, orderItem.product)) {
      return this.orderService.updateOrderItemStatus(
        orderItem,
        orderItemStatus,
      );
    }
    throw new ForbiddenException('Вы не можете установить этот статус');
  }

  @ApiOperation({ summary: 'Изменить статус заказа' })
  @ApiResponse({ status: 200, type: Order })
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: UpdateOrderStatusDto,
  })
  @Put(':orderId')
  async updateOrderStatus(
    @Body() { orderStatus }: UpdateOrderStatusDto,
    @Param('orderId') orderId: number,
    @Req() req: RequestUser,
  ) {
    const order = await this.orderService.findOrderByPk(orderId);
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (!order) {
      throw new NotFoundException('Заказ не найдет');
    }
    if (ability.can(Action.Manage, order)) {
      return this.orderService.updateOrderStatus(order, orderStatus);
    }
    throw new ForbiddenException('Вы не можете установить этот статус');
  }
}
