import { forwardRef, Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsGateway } from './bids.gateway';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { Auction } from '../auction/auction.model';
import { Bid } from './bids.model';

@Module({
  providers: [BidsGateway, BidsService],
  imports: [
    forwardRef(() => UsersModule),
    AuthModule,
    SequelizeModule.forFeature([Auction, User, Bid]),
  ],
})
export class BidsModule {}
