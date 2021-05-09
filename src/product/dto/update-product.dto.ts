import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({
    example: 'Nivea',
    description: 'Brand',
    maxLength: 40,
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(40, { message: 'Не больше 40' })
  name: string;

  @ApiProperty({
    example: 'Lorem daasdas фывыфвыфв',
    description: 'Описание',
    maxLength: 255,
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(255, { message: 'Не больше 255' })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'Цена',
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
  cost: number;

  @ApiProperty({
    example: 1,
    description: 'Цена',
    minimum: 0,
  })
  @Transform((value) => {
    if (+value.value) {
      return +value.value;
    }
    return -1;
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Min(1)
  quantity: number;
}
