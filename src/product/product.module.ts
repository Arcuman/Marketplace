import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from './product.model';
import { User } from '../users/users.model';
import { FilesService } from '../files/files.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

@Module({
  controllers: [ProductController],
  providers: [ProductService, FilesService, CaslAbilityFactory],
  imports: [SequelizeModule.forFeature([Product, User])],
  exports: [ProductService],
})
export class ProductModule {}
