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
import { Product } from '../product/product.model';
import { Auction } from '../auction/auction.model';
import { Order } from '../orders/order.model';
import { Role } from '../roles/enums/role.enum';
import { UpdateProductDto } from '../product/dto/update-product.dto';
import { FilesService, FileType } from '../files/files.service';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
    private fileService: FilesService,
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
      attributes: ['password'],
      include: [
        {
          model: RoleModel,
        },
      ],
    });
  }

  async getUserById(id: number) {
    return await this.userRepository.findByPk(id, {
      attributes: ['id', 'email', 'name', 'phone', 'photo'],
      include: [
        {
          model: Product,
        },
        {
          model: Auction,
        },
        {
          model: Order,
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

  async fullUpdate(id: number, updateUserDto: UpdateUserDto, image: any) {
    delete updateUserDto.photo;
    if (image) {
      updateUserDto.photo = this.fileService.createFile(FileType.IMAGE, image);
    }
    const [
      numberOfAffectedRows,
      [updatedUser],
    ] = await this.userRepository.update(
      { ...updateUserDto },
      { where: { id }, returning: true },
    );
    return { numberOfAffectedRows, updatedUser };
  }
}
