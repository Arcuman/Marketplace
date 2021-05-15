import { Injectable } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { Bid } from './bids.model';
import { User } from '../users/users.model';

@Injectable()
export class BidsService {
  create(createBidDto: CreateBidDto, userId: number) {
    console.log(createBidDto);
    return Bid.create({ ...createBidDto, userId }, { include: [User] });
  }

  findAll() {
    return `This action returns all bids`;
  }

  findOne(id: number) {
    return Bid.findByPk(id, { include: [User] });
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
