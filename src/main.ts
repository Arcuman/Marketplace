import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from './pipes/validation.pipe';
import { join } from 'path';

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors();
    const config = new DocumentBuilder()
      .setTitle('Optical Salon')
      .setDescription('Documentation REST API')
      .setVersion('1.0.0')
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
      })
      .addServer('https://afternoon-waters-64991.herokuapp.com/api/')
      .addServer('http://localhost:5000/api/')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);
    app.useStaticAssets(join(__dirname, '..', 'static'));
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.listen(PORT, () =>
      console.log(`Server started on port = ${PORT}`),
    );
  } catch (e) {
    console.log(e);
  }
}
bootstrap();
