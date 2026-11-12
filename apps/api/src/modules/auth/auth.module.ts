import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AdminRepository } from './application/ports/admin.repository.js';
import { PasswordHasher } from './application/ports/password-hasher.js';
import { TokenService } from './application/ports/token.service.js';
import {
  ChangePassword,
  GetCurrentAdmin,
  Login,
  RefreshSession,
} from './application/use-cases/auth-use-cases.js';
import { DrizzleAdminRepository } from './infrastructure/drizzle-admin.repository.js';
import { JwtTokenService } from './infrastructure/jwt-token.service.js';
import { ScryptPasswordHasher } from './infrastructure/scrypt-password-hasher.js';
import { AuthController } from './presentation/auth.controller.js';
import { AuthCookies } from './presentation/auth-cookies.js';
import { JwtAuthGuard } from './presentation/jwt-auth.guard.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    Login,
    RefreshSession,
    GetCurrentAdmin,
    ChangePassword,
    AuthCookies,
    { provide: AdminRepository, useClass: DrizzleAdminRepository },
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: TokenService, useClass: JwtTokenService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
