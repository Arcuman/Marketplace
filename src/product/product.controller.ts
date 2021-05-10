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
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiBody,
  ApiConsumes,
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

@ApiTags('Продукты')
@ApiSecurity('bearer')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @ApiResponse({ status: 200, type: Product })
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
  create(
    @UploadedFile() photo,
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: number; roles: Role[] };
    return this.productService.create(createProductDto, photo, user.userId);
  }

  @Get()
  @ApiResponse({ status: 200, type: [Product] })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Product))
  @ApiQuery({ name: 'limit', type: 'Number', required: false })
  @ApiQuery({ name: 'offset', type: 'Number', required: false })
  findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.productService.findAll(offset, limit);
  }

  @ApiResponse({ status: 200, type: Product })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Product))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    if (!product) {
      throw new NotFoundException('Такого продукта не существует');
    }
    return product;
  }

  @ApiResponse({ status: 200, type: Product })
  @ApiBody({
    description: 'Обновить главную информацию',
    type: UpdateProductDto,
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Req() req: RequestUser,
    @Body() updateProductDto: UpdateProductDto,
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
      } = await this.productService.update(+id, updateProductDto);
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException('Такой новости не существует');
      }
      return updatedProduct;
    }
    throw new ForbiddenException('Нет доступа к этому продукту');
  }

  @ApiResponse({ status: 201, type: Product })
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
}
