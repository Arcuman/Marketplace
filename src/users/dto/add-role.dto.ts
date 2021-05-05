import { IsNumber, IsString } from 'class-validator';
import { Role } from '../../roles/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AddRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Роль' })
  @IsString({ message: 'Должно быть строкой' })
  readonly value: Role;

  @ApiProperty({ example: '1', description: 'User ID' })
  @IsNumber({}, { message: 'Должно быть числом' })
  readonly userId: number;
}
