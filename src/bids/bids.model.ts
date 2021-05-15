import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/users.model';
import { Auction } from '../auction/auction.model';

interface BidCreationAttrs {
  bid: number;
  auctionId: number;
  userId: number;
}

@Table({ tableName: 'bids' })
export class Bid extends Model<Bid, BidCreationAttrs> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 20, description: 'Ставка', type: 'Number' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  bid: number;

  @ApiProperty({
    example: '01-01-2021 19:23',
    description: 'Дата конца аукциона',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: new Date(Date.now()),
  })
  time: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ApiProperty({ example: User, description: 'Кто поставил', type: () => User })
  @BelongsTo(() => User)
  bidder: User;

  @ForeignKey(() => Auction)
  @Column({ type: DataType.INTEGER, allowNull: false })
  auctionId: number;

  @BelongsTo(() => Auction)
  auction: Auction;
}
