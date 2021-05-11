import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from './pipes/validation.pipe';
import sequelize from 'sequelize';
import { Role } from './roles/roles.model';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Optical Salon')
    .setDescription('Documentation REST API')
    .setVersion('1.0.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .addServer('https://a9f2f181fe2d.ngrok.io/api/')
    .addServer('http://localhost:5000/api/')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
}
bootstrap();
