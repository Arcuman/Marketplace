import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, Min } from 'class-validator';
import { User } from '../../users/users.model';

@Exclude()
export class BaseProductDto {
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
  @Min(1, { message: 'Минимальное значени 1' })
  quantity: number;
}

@Exclude()
export class CreateProductDto extends BaseProductDto {
  @Expose()
  @ApiProperty({ type: 'string', format: 'binary' })
  photo: any;
}

@Exclude()
export class CreateProductDtoResp extends CreateProductDto {
  @Expose()
  @ApiProperty({ example: 1, type: 'Number' })
  id: number;

  @Expose()
  @ApiProperty({ example: 1, type: User })
  seller: User;
}
