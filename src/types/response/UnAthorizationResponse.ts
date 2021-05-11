import { ApiProperty } from '@nestjs/swagger';

export class UnAthorizationResponse {
  @ApiProperty({ example: 401, description: 'Описание ошибки' })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized', description: 'Сообщение ошибки' })
  message: string;
}
