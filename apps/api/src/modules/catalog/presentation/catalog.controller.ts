import { Controller, Get } from '@nestjs/common';
import { MODULES } from '../domain/catalog.js';

@Controller('catalog')
export class CatalogController {
  @Get()
  get() {
    return { modules: MODULES };
  }
}
