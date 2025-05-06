import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BullModule } from '@nestjs/bull';
import { PaymentProcessor } from './payment.processor';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'payment' }), AuthModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentProcessor],
})
export class PaymentModule {}
