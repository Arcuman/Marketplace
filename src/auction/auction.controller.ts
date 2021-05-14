import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  Query,
  NotFoundException,
  Req,
  Delete,
  Put,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import {
  CreateAuctionDto,
  CreateAuctionDtoResp,
} from './dto/create-auction.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../roles/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Auction } from './auction.model';
import { Role } from '../roles/enums/role.enum';
import { Roles } from '../roles/decorators/roles.decorator';
import {
  UpdateAuctionDto,
  UpdateAuctionImageDto,
} from './dto/update-auction.dto';
import {
  Action,
  AppAbility,
  CaslAbilityFactory,
} from '../casl/casl-ability.factory';
import { PoliciesGuard } from '../casl/guards/policies-guard.guard';
import { CheckPolicies } from '../casl/decorators/check-policies-key';
import { Request } from 'express';
import { RequestUser } from '../types/request-user';
import { UnAthorizationResponse } from '../types/response/UnAthorizationResponse';
import { plainToClass } from 'class-transformer';
import { BadRequestExeption } from '../types/response/BadRequestExeption';

@ApiTags('Аукцион')
@ApiInternalServerErrorResponse()
@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiOperation({ summary: 'Добавить новый товар' })
  @ApiSecurity('bearer')
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @ApiResponse({ status: 201, type: CreateAuctionDtoResp })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Add new auction',
    type: CreateAuctionDto,
  })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Auction))
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @UploadedFile() photo,
    @Body() createAuctionDto: CreateAuctionDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: number; roles: Role[] };
    const auction = await this.auctionService.create(
      createAuctionDto,
      photo,
      user.userId,
    );
    return plainToClass(CreateAuctionDtoResp, auction);
  }

  @ApiOperation({ summary: 'Получить все продукты' })
  @Get()
  @ApiResponse({ status: 200, type: [Auction] })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Auction))
  @ApiQuery({ name: 'limit', type: 'Number', required: false })
  @ApiQuery({ name: 'offset', type: 'Number', required: false })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const auctions = await this.auctionService.findAll(offset, limit);
    return auctions;
  }

  @ApiOperation({ summary: 'Получить информацию о конкретном продукте' })
  @ApiResponse({ status: 200, type: Auction })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Auction))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const auction = await this.auctionService.findOne(+id);
    if (!auction) {
      throw new NotFoundException('Такого продукта не существует');
    }
    return auction;
  }

  @ApiOperation({ summary: 'Обновить информацию о продукте' })
  @ApiSecurity('bearer')
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @ApiResponse({ status: 200, type: Auction })
  @ApiBody({
    description: 'Обновить главную информацию',
    type: UpdateAuctionDto,
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Req() req: RequestUser,
    @Body() updateAuctionDto: UpdateAuctionDto,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const auction = await this.auctionService.findOne(id);
    if (!auction) {
      throw new NotFoundException();
    }
    if (req.user && ability.can(Action.Update, auction)) {
      console.log(updateAuctionDto);
      const {
        numberOfAffectedRows,
        updatedAuction,
      } = await this.auctionService.update(+id, updateAuctionDto);
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return updatedAuction;
    }
    throw new ForbiddenException('Нет доступа к этому продукту');
  }

  @ApiOperation({ summary: 'Обновить картинку продукта' })
  @ApiResponse({ status: 201, type: Auction })
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiSecurity('bearer')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Add new news',
    type: UpdateAuctionImageDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateImage(
    @Param('id') id: number,
    @UploadedFile() image,
    @Req() req: RequestUser,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const auction = await this.auctionService.findOne(id);
    if (!auction) {
      throw new NotFoundException();
    }
    if (req.user && ability.can(Action.Update, auction)) {
      const {
        numberOfAffectedRows,
        updatedAuction,
      } = await this.auctionService.updateImage(+id, image);
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return updatedAuction;
    }
    throw new ForbiddenException('Нет доступа к этому продукту');
  }

  @ApiOperation({ summary: 'Удалить товар' })
  @ApiSecurity('bearer')
  @ApiResponse({ status: 200 })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: RequestUser) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const auction = await this.auctionService.findOne(id);
    if (req.user && ability.can(Action.Update, auction)) {
      const deleted = await this.auctionService.delete(id);
      if (deleted === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return 'Successfully deleted';
    }
    throw new ForbiddenException('Нет доступа к этому продукту');
  }
}
