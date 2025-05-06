import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PaymentService } from './payment.service';

@Processor('payment')
export class PaymentProcessor {
  constructor(private readonly paymentService: PaymentService) {}

  @Process('process')
  handlePayment(job: Job<{ id: string }>) {
    const status = Math.random() > 0.5 ? 'approved' : 'failed';
    this.paymentService.updateStatus(job.data.id, status);
  }
}
