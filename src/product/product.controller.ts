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
import { ProductService } from './product.service';
import {
  CreateProductDto,
  CreateProductDtoResp,
} from './dto/create-product.dto';
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
import { Product } from './product.model';
import { Role } from '../roles/enums/role.enum';
import { Roles } from '../roles/decorators/roles.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
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
import { classToPlain, plainToClass } from 'class-transformer';
import { BadRequestExeption } from '../types/response/BadRequestExeption';
import { User } from '../users/users.model';

@ApiTags('Продукты')
@ApiInternalServerErrorResponse()
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly orderService: ProductService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiOperation({ summary: 'Добавить новый товар' })
  @ApiSecurity('bearer')
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiResponse({ status: 400, type: BadRequestExeption })
  @ApiResponse({ status: 201, type: CreateProductDtoResp })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Add new product',
    type: CreateProductDto,
  })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Product))
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @UploadedFile() photo,
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: number; roles: Role[] };
    const product = await this.productService.create(
      createProductDto,
      photo,
      user.userId,
    );
    return plainToClass(CreateProductDtoResp, product);
  }

  @ApiOperation({ summary: 'Получить все продукты' })
  @Get()
  @ApiResponse({ status: 200, type: [Product] })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Product))
  @ApiQuery({ name: 'limit', type: 'Number', required: false })
  @ApiQuery({ name: 'offset', type: 'Number', required: false })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const products = await this.productService.findAll(offset, limit);
    return products.map((product) =>
      plainToClass(CreateProductDtoResp, product),
    );
  }

  @ApiOperation({ summary: 'Получить информацию о конкретном продукте' })
  @ApiResponse({ status: 200, type: Product })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Product))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    if (!product) {
      throw new NotFoundException('Такого продукта не существует');
    }
    return plainToClass(CreateProductDtoResp, product);
  }

  @ApiOperation({ summary: 'Обновить картинку продукта' })
  @ApiResponse({ status: 201, type: Product })
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiSecurity('bearer')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Add new news',
    type: UpdateProductImageDto,
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateImage(
    @Param('id') id: number,
    @UploadedFile() image,
    @Req() req: RequestUser,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException();
    }
    if (req.user && ability.can(Action.Update, product)) {
      const {
        numberOfAffectedRows,
        updatedProduct,
      } = await this.productService.updateImage(+id, image);
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return updatedProduct;
    }
    throw new ForbiddenException('Нет доступа к этому продукту');
  }

  @ApiOperation({ summary: 'Обновить продукт с картинкой' })
  @ApiResponse({ status: 201, type: Product })
  @ApiResponse({ status: 401, type: UnAthorizationResponse })
  @ApiResponse({ status: 403 })
  @ApiSecurity('bearer')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateProductDto,
  })
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async fullUpdate(
    @Param('id') id: number,
    @UploadedFile() image,
    @Req() req: RequestUser,
    @Body() createNewsDto: UpdateProductDto,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException();
    }
    if (req.user && ability.can(Action.Update, product)) {
      const {
        numberOfAffectedRows,
        updatedProduct,
      } = await this.productService.fullUpdate(+id, createNewsDto, image);
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return updatedProduct;
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
    const product = await this.productService.findOne(id);
    if (req.user && ability.can(Action.Update, product)) {
      const deleted = await this.productService.delete(id);
      if (deleted === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return 'Successfully deleted';
    }
    throw new ForbiddenException('Нет доступа к этому продукту');
  }

  @ApiOperation({ summary: 'Получить заказы товара' })
  @ApiResponse({ status: 200, type: Product })
  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  @Get('/:id/orders')
  async getOrders(@Param('id') productId: number, @Req() req: RequestUser) {
    console.log(productId);
    const ability = this.caslAbilityFactory.createForUser(req.user);
    const product = await this.productService.findWithOrderDetail(productId);
    if (!product) {
      throw new NotFoundException('Такого продукта не существует');
    }
    console.log(ability);
    console.log(req.user);
    if (req.user && ability.can(Action.Read, product)) {
      return product;
    }
    throw new ForbiddenException('Нет доступа к инофрмации об этом товаре');
  }
}
