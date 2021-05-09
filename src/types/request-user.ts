import { Request } from 'express';
import { Role } from '../roles/enums/role.enum';
export interface RequestUser extends Request {
  user: { userId: number; roles: Role[] };
}
