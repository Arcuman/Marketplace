import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.model';
import { InjectModel } from '@nestjs/sequelize';
import { FilesService, FileType } from '../files/files.service';
import { User } from '../users/users.model';

@Injectable()
export class ProductService {
  constructor(
    private fileService: FilesService,
    @InjectModel(Product) private productRepository: typeof Product,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    image: string,
    userId: number,
  ): Promise<Product> {
    const imagePath = this.fileService.createFile(FileType.IMAGE, image);
    return await this.productRepository.create({
      ...createProductDto,
      photo: imagePath,
      userId,
    });
  }

  async findAll(offset = 0, limit = 10) {
    return await this.productRepository.findAll({
      limit: Number(limit),
      offset: Number(offset),
    });
  }

  async findOne(id: number) {
    return await this.productRepository.findByPk(id, {
      include: [User],
    });
  }

  async delete(id: number) {
    return await this.productRepository.destroy({ where: { id } });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const [
      numberOfAffectedRows,
      [updatedProduct],
    ] = await this.productRepository.update(
      { ...updateProductDto },
      { where: { id }, returning: true },
    );
    return { numberOfAffectedRows, updatedProduct };
  }

  async updateImage(id: number, image: any) {
    const imagePath = this.fileService.createFile(FileType.IMAGE, image);
    const [
      numberOfAffectedRows,
      [updatedProduct],
    ] = await this.productRepository.update(
      { photo: imagePath },
      { where: { id }, returning: true },
    );
    return { numberOfAffectedRows, updatedProduct };
  }

  async findProductsByUserId(userId: number, limit = 10, offset = 0) {
    return await this.productRepository.findAll({
      limit: Number(limit),
      offset: Number(offset),
      where: { userId },
    });
  }
}
