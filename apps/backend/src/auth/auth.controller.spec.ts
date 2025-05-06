import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: { generateToken: jest.Mock };

  beforeEach(async () => {
    mockAuthService = {
      generateToken: jest.fn(() => ({ token: 'fake-jwt-token' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a token from generateToken', () => {
    const result = controller.generateToken();
    expect(result).toEqual({ token: 'fake-jwt-token' });
    expect(mockAuthService.generateToken).toHaveBeenCalled();
  });
});
