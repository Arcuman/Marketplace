import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinDate,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class UpdateAuctionDto {
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
  @Min(0, { message: 'Минимальное значение 0' })
  price: number;

  @Expose()
  @ApiProperty({
    example: new Date(Date.now()),
    description: 'Дата закрытия аукциона',
  })
  @Transform((value) => {
    if (new Date(value.value)) {
      return new Date(value.value);
    }
    return -1;
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsDate({ message: 'Должно быть датой' })
  @MinDate(new Date(Date.now()), { message: 'Некорретная дата: > чем текущая' })
  bidEnd: Date;

  @Expose()
  @ApiProperty({
    example: new Date(Date.now()),
    description: 'Дата закрытия аукциона',
  })
  @Transform((value) => {
    if (new Date(value.value)) {
      return new Date(value.value);
    }
    return -1;
  })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsDate({ message: 'Должно быть датой' })
  @MinDate(new Date(Date.now()), { message: 'Некорретная дата: > чем текущая' })
  bidStart: Date;
}

export class UpdateAuctionImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;
}
