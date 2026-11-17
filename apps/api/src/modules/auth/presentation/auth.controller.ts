import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthenticatedAdmin } from '../../../shared/domain/auth.js';
import { CurrentAdmin, Public } from '../../../shared/presentation/decorators.js';
import { ZodValidationPipe } from '../../../shared/presentation/zod-validation.pipe.js';
import {
  ChangePassword,
  GetCurrentAdmin,
  Login,
  RefreshSession,
} from '../application/use-cases/auth-use-cases.js';
import { AuthCookies } from './auth-cookies.js';
import {
  changePasswordSchema,
  loginSchema,
  type ChangePasswordBody,
  type LoginBody,
} from './auth.schemas.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: Login,
    private readonly refreshSession: RefreshSession,
    private readonly currentAdmin: GetCurrentAdmin,
    private readonly changePassword: ChangePassword,
    private readonly cookies: AuthCookies,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async signIn(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { admin, tokens } = await this.login.execute(body);
    this.cookies.set(response, tokens);
    return admin;
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const { admin, tokens } = await this.refreshSession.execute(
      this.cookies.refreshTokenFrom(request),
    );
    this.cookies.set(response, tokens);
    return admin;
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  signOut(@Res({ passthrough: true }) response: Response): void {
    this.cookies.clear(response);
  }

  @Get('me')
  me(@CurrentAdmin() admin: AuthenticatedAdmin) {
    return this.currentAdmin.execute(admin.id);
  }

  @Post('change-password')
  @HttpCode(204)
  async updatePassword(
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordBody,
  ): Promise<void> {
    await this.changePassword.execute(admin.id, body);
  }
}
