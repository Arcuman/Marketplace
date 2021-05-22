import { ApiProperty, PartialType } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { IsEnum } from 'class-validator';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class UpdateOrderItemStatusDto {
  @ApiProperty({ name: 'orderItemStatus', enum: OrderStatus })
  @IsEnum(OrderStatus, { message: 'Неправильный статус заказа' })
  orderItemStatus: OrderStatus;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ name: 'orderStatus', enum: TransactionStatus })
  @IsEnum(TransactionStatus, { message: 'Неправильный статус заказа' })
  orderStatus: TransactionStatus;
}
