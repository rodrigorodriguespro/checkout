import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: unknown;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return false;
    }
    try {
      const payload = this.jwtService.verify(token) as unknown;
      req.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
