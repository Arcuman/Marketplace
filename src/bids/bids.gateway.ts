import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets/decorators';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { OnGatewayInit } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsGuard } from '../auth/guards/ws.guard';

@WebSocketGateway()
export class BidsGateway implements OnGatewayInit {
  constructor(private readonly bidsService: BidsService) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('newBid')
  async handleMessage(
    client: Socket,
    data: { bidInfo: CreateBidDto; room: string },
  ) {
    const userId = (client as any).userId;
    const bid = await this.bidsService.create(data.bidInfo, userId);
    const bidWithUser = await this.bidsService.findOne(bid.id);
    this.wss.to(data.room).emit('newBid', bidWithUser);
  }

  @SubscribeMessage('joinedRoom')
  handleRoomJoin(client: Socket, { room }: any) {
    this.logger.log(`Client join auction room: ${room}`);
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leftRoom')
  handleRoomLeave(client: Socket, { room }: any) {
    this.logger.log(`Client leave auction room: ${room}`);
    client.leave(room);
    client.emit('leftRoom', room);
  }
}
