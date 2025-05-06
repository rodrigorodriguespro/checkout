import { Injectable } from '@nestjs/common';
import { BullOptionsFactory, BullModuleOptions } from '@nestjs/bull';

@Injectable()
export class BullConfigService implements BullOptionsFactory {
  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    };
  }
}
