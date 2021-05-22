import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './product.model';
import { User } from '../users/users.model';
import { FilesService } from '../files/files.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { OrderItem } from '../orders/order-item.model';
import { OrderModule } from '../orders/order.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService, FilesService, CaslAbilityFactory],
  imports: [
    SequelizeModule.forFeature([Product, User, OrderItem]),
    OrderModule,
  ],
  exports: [ProductService],
})
export class ProductModule {}
