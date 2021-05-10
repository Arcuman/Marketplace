import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ApiProperty({ example: '+375447689764', description: 'Телефон' })
  @IsString({ message: 'Должно быть строкой' })
  @IsPhoneNumber('BY')
  readonly phone: string;

  @ApiProperty({
    example: 'Беларусь',
    description: 'Страна доставки',
    maxLength: 100,
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(100, { message: 'Не больше 100' })
  country: string;

  @ApiProperty({
    example: 'Минск',
    description: 'Город доставки',
    maxLength: 100,
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(100, { message: 'Не больше 100' })
  city: string;

  @ApiProperty({
    example: 'Белорусская 21',
    description: 'Адрес доставки',
    maxLength: 100,
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(100, { message: 'Не больше 100' })
  address: string;

  @ApiProperty({
    example: [
      {
        productId: 1,
        quantity: 10,
      },
      {
        productId: 2,
        quantity: 3,
      },
    ],
    description: 'Продукты для доставки',
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  orderItems: OrderItemDto[];
}
