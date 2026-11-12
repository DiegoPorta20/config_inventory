import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: { path: string; message: string }[] | Record<string, unknown>;
}

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Tu sesión expiró. Inicia sesión nuevamente.',
  NOT_FOUND: 'No se encontró el registro solicitado.',
  CONFLICT: 'Ya existe un registro con esos datos.',
  VALIDATION_ERROR: 'Revisa los campos marcados.',
  SERVICE_UNAVAILABLE: 'No se pudo comunicar con la aplicación de inventario.',
  INVALID_CURRENT_PASSWORD: 'La contraseña actual es incorrecta.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
};

export function apiError(error: unknown): ApiErrorBody | null {
  if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
    return error.error as ApiErrorBody;
  }
  return null;
}

export function errorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof HttpErrorResponse && error.status === 413) {
    return 'El archivo es demasiado grande.';
  }
  const body = apiError(error);
  if (body) {
    const first = Array.isArray(body.details) ? body.details[0]?.message : undefined;
    if (body.code === 'VALIDATION_ERROR' && first) return first;
    if (body.code === 'CONFLICT' && body.message) return translateConflict(body.message);
    return MESSAGES[body.code] ?? body.message ?? fallback;
  }
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'No hay conexión con el servidor.';
  }
  return fallback;
}

function translateConflict(message: string): string {
  if (message.includes('slug')) return 'Ya existe una empresa con ese identificador.';
  if (message.includes('email')) return 'Ya existe un usuario con ese correo en la empresa.';
  return MESSAGES['CONFLICT'] ?? message;
}
