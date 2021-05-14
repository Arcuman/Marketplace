import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Min,
  IsDate,
  MinDate,
} from 'class-validator';

@Exclude()
export class CreateAuctionDto {
  @Expose()
  @ApiProperty({
    example: 'Nivea',
    description: 'Brand',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(40, { message: 'Не больше 40' })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Lorem daasdas фывыфвыфв',
    description: 'Описание',
  })
  @IsString({ message: 'Должно быть строкой' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MaxLength(255, { message: 'Не больше 255' })
  description: string;

  @Expose()
  @ApiProperty({
    example: 1,
    description: 'Цена',
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
  @ApiProperty({ type: 'string', format: 'binary' })
  photo: any;
}

@Exclude()
export class CreateAuctionDtoResp extends CreateAuctionDto {
  @Expose()
  @ApiProperty({ example: 1, type: 'Number' })
  id: number;

  @Expose()
  @ApiProperty({ example: 1, type: 'Date' })
  bidStart: Date;
}
