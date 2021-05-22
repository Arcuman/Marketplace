import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsPhoneNumber } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BaseUserDTO {
  @Expose()
  @ApiProperty({ example: 'user@mail.ru', description: 'Почта' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;

  @Expose()
  @ApiProperty({ example: 'Антон', description: 'Имя' })
  @IsString({ message: 'Должно быть строкой' })
  readonly name: string;

  @Expose()
  @ApiProperty({ example: '+375447689764', description: 'Телефон' })
  @IsString({ message: 'Должно быть строкой' })
  @IsPhoneNumber('BY', { message: 'Введите корректный номер' })
  readonly phone: string;
}

export class CreateUserDto extends BaseUserDTO {
  @ApiProperty({ example: '12345', description: 'пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(4, 16, { message: 'Не меньше 4 и не больше 16' })
  readonly password: string;
}
