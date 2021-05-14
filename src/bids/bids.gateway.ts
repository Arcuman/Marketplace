import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets/decorators';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@WebSocketGateway()
export class BidsGateway {
  constructor(private readonly bidsService: BidsService) {}

  @SubscribeMessage('createBid')
  create(@MessageBody() createBidDto: CreateBidDto) {
    return this.bidsService.create(createBidDto);
  }

  @SubscribeMessage('findAllBids')
  findAll() {
    return this.bidsService.findAll();
  }

  @SubscribeMessage('findOneBid')
  findOne(@MessageBody() id: number) {
    return this.bidsService.findOne(id);
  }

  @SubscribeMessage('updateBid')
  update(@MessageBody() updateBidDto: UpdateBidDto) {
    return this.bidsService.update(updateBidDto.id, updateBidDto);
  }

  @SubscribeMessage('removeBid')
  remove(@MessageBody() id: number) {
    return this.bidsService.remove(id);
  }
}
