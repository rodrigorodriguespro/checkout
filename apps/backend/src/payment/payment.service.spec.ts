import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getQueueToken } from '@nestjs/bull';
import { CreatePaymentDto } from './dto/create-payment.dto';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentQueue: { add: jest.Mock };

  beforeEach(async () => {
    paymentQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getQueueToken('payment'),
          useValue: paymentQueue,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment and add to queue', async () => {
      const dto: CreatePaymentDto = {
        name: 'Alice',
        amount: 200,
        method: 'pix',
      };
      paymentQueue.add.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('pending');
      expect(paymentQueue.add).toHaveBeenCalledWith(
        'process',
        { id: result.id },
        { delay: 5000 },
      );

      // Verifica se o pagamento foi armazenado internamente
      const stored = service.findById(result.id);
      expect(stored.name).toBe(dto.name);
      expect(stored.amount).toBe(dto.amount);
      expect(stored.method).toBe(dto.method);
      expect(stored.status).toBe('pending');
    });

    it('should throw error for invalid payload', async () => {
      await expect(service.create({} as any)).rejects.toThrow(
        'Invalid payload',
      );
    });
  });

  describe('findById', () => {
    it('should return payment if exists', async () => {
      const dto: CreatePaymentDto = {
        name: 'Bob',
        amount: 300,
        method: 'credito',
      };
      paymentQueue.add.mockResolvedValue(undefined);
      const { id } = await service.create(dto);

      const payment = service.findById(id);
      expect(payment.id).toBe(id);
    });

    it('should throw if payment not found', () => {
      expect(() => service.findById('not-exist')).toThrow('Payment not found');
    });
  });

  describe('updateStatus', () => {
    it('should update status if payment exists', async () => {
      const dto: CreatePaymentDto = {
        name: 'Carol',
        amount: 400,
        method: 'credito',
      };
      paymentQueue.add.mockResolvedValue(undefined);
      const { id } = await service.create(dto);

      service.updateStatus(id, 'approved');
      const payment = service.findById(id);
      expect(payment.status).toBe('approved');
    });

    it('should do nothing if payment does not exist', () => {
      expect(() => service.updateStatus('not-exist', 'failed')).not.toThrow();
    });
  });
});
