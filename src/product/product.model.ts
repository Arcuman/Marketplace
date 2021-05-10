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
import { OrderItem } from '../orders/order-item.model';

interface ProductCreationAttrs {
  name: string;
  description: string;
  price: number;
  quantity: number;
  photo: any;
  userId: number;
}

@Table({ tableName: 'products' })
export class Product extends Model<Product, ProductCreationAttrs> {
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
  name: string;

  @ApiProperty({ example: 'Отличные часы', description: 'Описание' })
  @Length({ min: 0, max: 40 })
  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @ApiProperty({ example: 20, description: 'Цена', type: 'Number' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  price: number;

  @ApiProperty({ example: 20, description: 'Цена', type: 'Number' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @ApiProperty({
    example: 'images/sdsda.jpg',
    description: 'Путь к картинке',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  photo: string;

  @ApiProperty({
    example: 2,
    description: 'Идентификатор продавца',
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User)
  seller: User;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];
}
