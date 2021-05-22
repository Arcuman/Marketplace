import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Length,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { TransactionStatus } from './enums/transaction-status.enum';
import { OrderItem } from './order-item.model';

interface OrderCreationAttrs {
  totalSum: number;
  transactionStatus: TransactionStatus;
  country: string;
  city: string;
  address: string;
  orderDate: Date;
  deliveryDate: Date;
  phone: string;
  userId: number;
}

@Table({ tableName: 'orders' })
export class Order extends Model<Order, OrderCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Часы', description: 'Название' })
  @Length({ min: 0, max: 40 })
  @Column({ type: DataType.STRING, allowNull: false })
  totalSum: string;

  @ApiProperty({
    example: TransactionStatus.Pending,
    description: 'Статус транзакции',
    enum: TransactionStatus,
  })
  @Column({ type: DataType.STRING, allowNull: false })
  transactionStatus: TransactionStatus;

  @ApiProperty({
    example: 'Беларусь',
    description: 'Страна доставки',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  country: string;

  @ApiProperty({
    example: 'Минск',
    description: 'Город доставки',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  city: string;

  @ApiProperty({
    example: 'Улица',
    description: 'Улица доставки',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  address: string;

  @ApiProperty({ example: '+375447689764', description: 'Телефон покупателя' })
  @Column({ type: DataType.STRING, allowNull: false })
  phone: string;

  @ApiProperty({
    example: new Date(Date.now()),
    description: 'Дата заказа',
    type: Date,
  })
  @Column({ type: DataType.DATE, allowNull: false })
  orderDate: Date;

  @ApiProperty({
    example: new Date(Date.now()),
    description: 'Дата доставки',
    type: Date,
  })
  @Column({ type: DataType.DATE, allowNull: true })
  deliveryDate: Date;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор покупателя',
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];
}
