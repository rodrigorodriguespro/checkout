import { Injectable } from '@nestjs/common';
import {
  SharedBullConfigurationFactory,
  BullRootModuleOptions,
} from '@nestjs/bull';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullRootModuleOptions {
    return {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    };
  }
}
