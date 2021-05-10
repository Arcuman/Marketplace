import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from '../roles/roles.model';
import { UserRoles } from '../roles/user-roles.model';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../roles/roles.module';
import { ProductModule } from '../product/product.module';
import { Order } from '../orders/order.model';
import { Product } from '../product/product.model';
import { OrderModule } from '../orders/order.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    SequelizeModule.forFeature([User, Role, UserRoles, Product, Order]),
    RolesModule,
    forwardRef(() => AuthModule),
    ProductModule,
    OrderModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
