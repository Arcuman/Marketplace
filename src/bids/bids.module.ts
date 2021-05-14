import { Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { BidsGateway } from './bids.gateway';

@Module({
  providers: [BidsGateway, BidsService],
})
export class BidsModule {}
