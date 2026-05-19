import { Logger } from '@nestjs/common';
import { createApp } from './app.factory';

async function bootstrap(): Promise<void> {
  const PORT = process.env.PORT || 3000;
  const logger = new Logger('POC-AWS-SDR');

  const app = await createApp();
  await app.listen(PORT, '0.0.0.0');
  logger.log(`Application is running on PORT: ${PORT}`);
}

void bootstrap();
