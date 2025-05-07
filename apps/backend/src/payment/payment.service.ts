import { Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  CreatePaymentSchema,
} from './dto/create-payment.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { randomUUID } from 'crypto';

type PaymentStatus = 'pending' | 'approved' | 'failed';

export interface Payment {
  id: string;
  name: string;
  amount: number;
  method: string;
  status: PaymentStatus;
}

@Injectable()
export class PaymentService {
  private payments = new Map<string, Payment>();

  constructor(@InjectQueue('payment') private paymentQueue: Queue) {}

  async create(dto: CreatePaymentDto) {
    const parsed = CreatePaymentSchema.safeParse(dto);
    if (!parsed.success) {
      throw new Error('Invalid payload');
    }

    const id = randomUUID();
    const payment: Payment = { ...dto, id, status: 'pending' };
    this.payments.set(id, payment);

    await this.paymentQueue.add('process', { id }, { delay: 6000 });

    return { id, status: payment.status };
  }

  findById(id: string) {
    const payment = this.payments.get(id);
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  updateStatus(id: string, status: PaymentStatus) {
    const payment = this.payments.get(id);
    if (payment) {
      payment.status = status;
      this.payments.set(id, payment);
    }
  }
}
