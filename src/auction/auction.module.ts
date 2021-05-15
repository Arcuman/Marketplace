import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { FilesService } from '../files/files.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { SequelizeModule } from '@nestjs/sequelize';
import { Auction } from './auction.model';
import { User } from '../users/users.model';
import { Bid } from '../bids/bids.model';

@Module({
  controllers: [AuctionController],
  providers: [AuctionService, FilesService, CaslAbilityFactory],
  imports: [SequelizeModule.forFeature([Auction, User, Bid])],
  exports: [AuctionService],
})
export class AuctionModule {}
