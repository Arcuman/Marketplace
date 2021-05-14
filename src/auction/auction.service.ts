import { Injectable } from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { Auction } from './auction.model';
import { InjectModel } from '@nestjs/sequelize';
import { FilesService, FileType } from '../files/files.service';
import { User } from '../users/users.model';

@Injectable()
export class AuctionService {
  constructor(
    private fileService: FilesService,
    @InjectModel(Auction) private auctionRepository: typeof Auction,
  ) {}

  async create(
    createAuctionDto: CreateAuctionDto,
    image: string,
    userId: number,
  ): Promise<Auction> {
    const imagePath = this.fileService.createFile(FileType.IMAGE, image);
    return await this.auctionRepository.create({
      ...createAuctionDto,
      photo: imagePath,
      userId,
      bidStart: new Date(Date.now()),
    });
  }

  async findAll(offset = 0, limit = 10) {
    return await this.auctionRepository.findAll({
      limit: Number(limit),
      offset: Number(offset),
      include: [User],
    });
  }

  async findOne(id: number) {
    return await this.auctionRepository.findByPk(id, {
      include: [User],
    });
  }

  async delete(id: number) {
    return await this.auctionRepository.destroy({ where: { id } });
  }

  async update(id: number, updateAuctionDto: UpdateAuctionDto) {
    const [
      numberOfAffectedRows,
      [updatedAuction],
    ] = await this.auctionRepository.update(
      { ...updateAuctionDto },
      { where: { id }, returning: true },
    );
    return { numberOfAffectedRows, updatedAuction };
  }

  async updateImage(id: number, image: any) {
    const imagePath = this.fileService.createFile(FileType.IMAGE, image);
    const [
      numberOfAffectedRows,
      [updatedAuction],
    ] = await this.auctionRepository.update(
      { photo: imagePath },
      { where: { id }, returning: true },
    );
    return { numberOfAffectedRows, updatedAuction };
  }

  async findAuctionsByUserId(userId: number, limit = 10, offset = 0) {
    return await this.auctionRepository.findAll({
      limit: Number(limit),
      offset: Number(offset),
      where: { userId },
    });
  }
}
