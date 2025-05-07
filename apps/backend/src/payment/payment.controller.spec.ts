import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

describe('PaymentController', () => {
  let controller: PaymentController;

  const mockPaymentService = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentService, useValue: mockPaymentService },
        // Mock global guard para evitar dependências reais
        {
          provide: APP_GUARD,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      const dto: CreatePaymentDto = {
        name: 'John Doe',
        amount: 100,
        method: 'debito',
      };
      const result = { id: '123', status: 'pending' };
      mockPaymentService.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(mockPaymentService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should call service.findById and return result', () => {
      const payment = {
        id: '123',
        name: 'John Doe',
        amount: 100,
        method: 'credit_card',
        status: 'pending',
      };
      mockPaymentService.findById.mockReturnValue(payment);

      expect(controller.findOne('123')).toEqual(payment);
      expect(mockPaymentService.findById).toHaveBeenCalledWith('123');
    });
  });
});
