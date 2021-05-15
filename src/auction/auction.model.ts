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
import { Bid } from '../bids/bids.model';

interface AuctionCreationAttrs {
  name: string;
  description: string;
  price: number;
  photo: any;
  bidEnd: Date;
  bidStart: Date;
  userId: number;
}

@Table({ tableName: 'auctions' })
export class Auction extends Model<Auction, AuctionCreationAttrs> {
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

  @ApiProperty({
    example: 'images/sdsda.jpg',
    description: 'Путь к картинке',
  })
  @Column({ type: DataType.STRING, allowNull: false })
  photo: string;

  @ApiProperty({
    example: '01-01-2021 19:23',
    description: 'Дата начала аукциона',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: new Date(Date.now()),
  })
  bidStart: Date;

  @ApiProperty({
    example: '01-01-2021 19:23',
    description: 'Дата конца аукциона',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: new Date(Date.now()),
  })
  bidEnd: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ApiProperty({ example: User, description: 'Продавец', type: () => User })
  @BelongsTo(() => User)
  seller: User;

  @ApiProperty({ description: 'Ставки', type: () => [Bid] })
  @HasMany(() => Bid)
  bids: Bid[];
}
