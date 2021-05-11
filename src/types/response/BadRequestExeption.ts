import { ApiProperty } from '@nestjs/swagger';

export class BadRequestExeption {
  @ApiProperty({ example: 400, description: 'Описание ошибки' })
  statusCode: number;

  @ApiProperty({
    example: ['price - должно быть числом'],
    description: 'Сообщение ошибки',
  })
  message: string | string[];
}
