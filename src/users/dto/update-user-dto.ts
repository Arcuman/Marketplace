import { BaseUserDTO } from './create-user.dto';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UpdateUserDto extends BaseUserDTO {
  @Expose()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo: any;
}
