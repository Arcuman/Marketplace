import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsNotEmpty, Min } from 'class-validator';

@Exclude()
export class CreateBidDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Цена',
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Min(0, { message: 'Минимальное значение 0' })
  bid: number;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Цена',
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Min(0, { message: 'Минимальное значение 0' })
  auctionId: number;
}

@Exclude()
export class CreateAuctionDtoResp extends CreateBidDto {
  @Expose()
  @ApiProperty({ example: 1, type: 'Number' })
  id: number;

  @Expose()
  @ApiProperty({ example: 1, type: 'Date' })
  time: Date;
}
