import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info: Error) {
    console.log({ user });
    console.log({ err });
    if (err || !user) {
      throw err || new UnauthorizedException('Необходимо войти');
    }
    return user;
  }
}
