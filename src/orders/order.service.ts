import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../product/product.model';
import { Order } from './order.model';
import { OrderStatus } from './enums/order-status.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { Sequelize } from 'sequelize-typescript';
import { OrderItemDto } from './dto/order-item.dto';
import { OrderItem } from './order-item.model';
import { Transaction } from 'sequelize';
import { InsertOrderItemDto } from './dto/insert-order-item.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Product) private productRepository: typeof Product,
    @InjectModel(Order) private orderRepository: typeof Order,
    @InjectModel(OrderItem) private orderItemRepository: typeof OrderItem,
    private sequelize: Sequelize,
  ) {}

  private getProductFromDtoById(
    orderItems: OrderItemDto[],
    productId: number,
  ): OrderItemDto {
    const foundItems = orderItems.filter(
      (product) => product.productId === productId,
    );
    if (foundItems.length > 1) {
      throw new BadRequestException(
        'Некоретный ввод продуктов, произведите агрегацию',
      );
    }
    return foundItems[0];
  }

  private async validateOrderItemsFromDto(
    orderItems: OrderItemDto[],
  ): Promise<InsertOrderItemDto[]> {
    const orderItemsPromises = orderItems.map((product) => {
      return this.productRepository.findByPk(product.productId);
    });
    const products = await Promise.all([...orderItemsPromises]);
    return products.map((product) => {
      const quantity = this.getProductFromDtoById(orderItems, product.id)
        .quantity;
      const leftQuantity = product.quantity - quantity;
      if (leftQuantity < 0) {
        throw new BadRequestException([
          `Не хватает товаров для продукта ${product.name}`,
        ]);
      }
      return {
        quantity,
        leftQuantity,
        price: product.price,
        userId: product.userId,
        productId: product.id,
      };
    });
  }

  private async createOrderItems(
    orderItems: InsertOrderItemDto[],
    orderId: number,
    t: Transaction,
  ) {
    const itemsToInsert = orderItems.map((item) => {
      return {
        ...item,
        orderId,
        orderStatus: OrderStatus.Pending,
      };
    });
    const insertOrdersPromise = this.orderItemRepository.bulkCreate(
      itemsToInsert,
      {
        transaction: t,
      },
    );
    const updateProductQuantityPromise = itemsToInsert.map((item) =>
      this.productRepository.update(
        { quantity: item.leftQuantity },
        { where: { id: item.productId }, transaction: t },
      ),
    );
    await Promise.all([updateProductQuantityPromise, insertOrdersPromise]);
  }

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const orderItems = await this.validateOrderItemsFromDto(
      createOrderDto.orderItems,
    );
    const isSelfBuy = orderItems.some((product) => product.userId === userId);
    if (isSelfBuy) {
      throw new BadRequestException('Нельзя купить свой продукт');
    }
    const totalSum = orderItems.reduce(
      (sum, product) => (sum += product.quantity * product.price),
      0,
    );
    try {
      return await this.sequelize.transaction(async (t) => {
        const order = await this.orderRepository.create(
          {
            deliveryDate: null,
            orderDate: new Date(Date.now()),
            transactionStatus: TransactionStatus.Pending,
            totalSum,
            ...createOrderDto,
            userId,
          },
          { transaction: t },
        );
        await this.createOrderItems(orderItems, order.id, t);
        return order;
      });
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async findOrderByUserId(userId: number, limit = 10, offset = 0) {
    return await this.orderRepository.findAll({
      limit: Number(limit),
      offset: Number(offset),
      where: { userId },
    });
  }

  async findOrderByPk(orderId: number) {
    return await this.orderRepository.findByPk(orderId, {
      include: [OrderItem],
    });
  }
}
