import { Module } from '@nestjs/common';
import { CatalogController } from './presentation/catalog.controller.js';

@Module({ controllers: [CatalogController] })
export class CatalogModule {}
