import { CanActivate, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../users/users.service';
import { jwtConstants } from '../constants';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private userService: UsersService, private jwt: JwtService) {}

  async canActivate(
    context: any,
  ): Promise<
    boolean | any | Promise<boolean | any> | Observable<boolean | any>
  > {
    const bearerToken = context.args[1].token;
    try {
      const decoded = this.jwt.verify(bearerToken, {
        secret: jwtConstants.secret,
      }) as any;

      const user = await this.userService.getUserByEmail(decoded.username);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const client = context.switchToWs().getClient<Socket>();
      client.userId = user?.id;
      return Boolean(user);
    } catch (err) {
      console.log(err);
      throw new WsException(err.message);
    }
  }
}
