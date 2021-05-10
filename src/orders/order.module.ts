import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../product/product.model';
import { User } from '../users/users.model';
import { Order } from './order.model';
import { OrderItem } from './order-item.model';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { ProductService } from '../product/product.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, CaslAbilityFactory],
  imports: [SequelizeModule.forFeature([Product, User, Order, OrderItem])],
  exports: [OrderService],
})
export class OrderModule {}
