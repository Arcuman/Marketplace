import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseProductDto } from './create-product.dto';

export class UpdateProductDto extends BaseProductDto {
  @Expose()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo: any;
}
