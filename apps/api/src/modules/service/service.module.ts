import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module.js';
import { ServiceCompaniesController } from './presentation/service-companies.controller.js';
import { ServiceKeyGuard } from './presentation/service-key.guard.js';

@Module({
  imports: [CompaniesModule],
  controllers: [ServiceCompaniesController],
  providers: [ServiceKeyGuard],
})
export class ServiceModule {}
