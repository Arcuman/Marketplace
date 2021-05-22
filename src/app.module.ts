import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/users.model';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { Role } from './roles/roles.model';
import { UserRoles } from './roles/user-roles.model';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Sequelize } from 'sequelize-typescript';
import { ProductModule } from './product/product.module';
import { Product } from './product/product.model';
import { CaslModule } from './casl/casl.module';
import { OrderModule } from './orders/order.module';
import { Order } from './orders/order.model';
import { OrderItem } from './orders/order-item.model';
import { Role as RoleEnum } from './roles/enums/role.enum';
import { AuctionModule } from './auction/auction.module';
import { BidsModule } from './bids/bids.module';
import { Auction } from './auction/auction.model';
import { Bid } from './bids/bids.model';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
    }),
    SequelizeModule.forRoot({
      logging: false,
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRESS_PASSWORD,
      database: process.env.POSTGRES_DB,
      dialectOptions: {
        ssl: { rejectUnauthorized: false },
      },
      models: [User, Role, UserRoles, Product, Order, OrderItem, Auction, Bid],
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    ProductModule,
    CaslModule,
    OrderModule,
    AuctionModule,
    BidsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private sequelize: Sequelize) {
    this.sequelize.sync({ alter: true }).then(() =>
      Role.count().then((count) => {
        if (count === 0) {
          Role.bulkCreate([
            { value: RoleEnum.ADMIN, description: RoleEnum.ADMIN },
            { value: RoleEnum.USER, description: RoleEnum.USER },
          ]);
        }
      }),
    );
  }
}
