import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;
}
