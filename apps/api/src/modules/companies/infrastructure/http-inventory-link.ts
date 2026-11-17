import { Inject, Injectable } from '@nestjs/common';
import { ENV, type Env } from '../../../config/env.js';
import {
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
  ValidationError,
} from '../../../shared/domain/errors.js';
import { InventoryLink, type ProvisionedAdmin } from '../application/ports/inventory-link.js';

const REQUEST_TIMEOUT_MS = 10_000;

interface InventoryError {
  message?: string;
  details?: unknown;
}

@Injectable()
export class HttpInventoryLink extends InventoryLink {
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  async createAdmin(
    companyId: number,
    input: { email: string; name: string; password: string },
  ): Promise<ProvisionedAdmin> {
    const url = `${this.env.INVENTORY_URL.replace(/\/+$/, '')}/api/internal/companies/${companyId}/admins`;
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-service-key': this.env.INVENTORY_INTERNAL_KEY,
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new ServiceUnavailableError('The inventory app is unreachable');
    }

    if (response.ok) {
      const user = (await response.json()) as ProvisionedAdmin;
      return { id: user.id, email: user.email, name: user.name };
    }

    const error = (await response.json().catch(() => ({}))) as InventoryError;
    const message = error.message ?? 'The inventory app rejected the request';
    switch (response.status) {
      case 400:
        throw new ValidationError(message, error.details);
      case 404:
        throw new NotFoundError('Company in inventory', companyId);
      case 409:
        throw new ConflictError(message);
      default:
        throw new ServiceUnavailableError(`The inventory app answered ${response.status}`);
    }
  }
}
