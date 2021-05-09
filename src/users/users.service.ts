import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './users.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { AddRoleDto } from './dto/add-role.dto';
import { Sequelize } from 'sequelize-typescript';
import { Role as RoleModel } from '../roles/roles.model';
import { Role } from '../roles/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
    private sequelize: Sequelize,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      return await this.sequelize.transaction(async (t) => {
        const user = await this.userRepository.create(dto, { transaction: t });
        const role = await this.roleService.getRoleByValue(Role.USER, t);
        await user.$set('roles', [role.id], { transaction: t });
        user.roles = [role];
        return user;
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async getAllUsers() {
    return await this.userRepository.findAll({
      include: { all: true },
      attributes: { exclude: ['password'] },
    });
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      include: [
        {
          model: RoleModel,
        },
      ],
    });
  }

  async addRole(dto: AddRoleDto) {
    const user = await this.userRepository.findByPk(dto.userId);
    const role = await this.roleService.getRoleByValue(dto.value);
    if (role && user) {
      await user.$add('role', role.id);
      return dto;
    }
    throw new HttpException(
      'Пользователь или роль не найдены',
      HttpStatus.NOT_FOUND,
    );
  }
}
