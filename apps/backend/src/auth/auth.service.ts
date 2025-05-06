import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(this: AuthService) {
    const payload = { userId: '123', role: 'user' };
    return { token: this.jwtService.sign(payload) };
  }
}
