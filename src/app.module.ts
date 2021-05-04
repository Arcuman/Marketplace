import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
