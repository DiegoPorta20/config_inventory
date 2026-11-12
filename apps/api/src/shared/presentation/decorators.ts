import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedAdmin } from '../domain/auth.js';

export const IS_PUBLIC_KEY = 'isPublic';

/** Skips the super admin session guard (login, service routes with their own key). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAdmin => {
    const request = context.switchToHttp().getRequest<Request & { admin: AuthenticatedAdmin }>();
    return request.admin;
  },
);
