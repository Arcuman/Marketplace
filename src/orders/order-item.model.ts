import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../product/product.model';
import { Order } from './order.model';
import { OrderStatus } from './enums/order-status.enum';

interface OrderItemCreationAttrs {
  price: number;
  quantity: number;
  orderStatus: OrderStatus;
  productId: number;
  orderId: number;
}

@Table({ tableName: 'order_items' })
export class OrderItem extends Model<OrderItem, OrderItemCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 20, description: 'Цена', type: 'Number' })
  @Column({ type: DataType.DECIMAL, allowNull: false })
  price: number;

  @ApiProperty({ example: 20, description: 'Цена', type: 'Number' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @ApiProperty({
    example: OrderStatus.Pending,
    description: 'Статус заказа',
    enum: OrderStatus,
  })
  @Column({ type: DataType.STRING, allowNull: false })
  orderStatus: OrderStatus;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор предмета',
  })
  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false })
  productId: number;

  @BelongsTo(() => Product)
  product: Product;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор предмета',
  })
  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER, allowNull: false })
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;
}
