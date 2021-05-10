import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Идентификатор продукта',
    minimum: 1,
  })
  @Transform((value) => {
    if (+value.value) {
      return +value.value;
    }
    return -1;
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Min(1)
  productId: number;

  @ApiProperty({
    example: 5,
    description: 'Кол-во',
    minimum: 0,
  })
  @Transform((value) => {
    if (+value.value) {
      return +value.value;
    }
    return -1;
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Min(0)
  quantity: number;
}
