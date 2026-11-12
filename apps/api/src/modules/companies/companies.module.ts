import { Module } from '@nestjs/common';
import { CompanyRepository } from './application/ports/company.repository.js';
import { InventoryLink } from './application/ports/inventory-link.js';
import {
  CreateCompany,
  GetCompany,
  GetCompanyProfile,
  ListCompanies,
  ProvisionCompanyAdmin,
  SetCompanyImage,
  UpdateCompany,
  UpdateCompanyConfig,
} from './application/use-cases/company-use-cases.js';
import { DrizzleCompanyRepository } from './infrastructure/drizzle-company.repository.js';
import { HttpInventoryLink } from './infrastructure/http-inventory-link.js';
import { CompaniesController } from './presentation/companies.controller.js';

@Module({
  controllers: [CompaniesController],
  providers: [
    ListCompanies,
    GetCompany,
    CreateCompany,
    UpdateCompany,
    UpdateCompanyConfig,
    SetCompanyImage,
    ProvisionCompanyAdmin,
    GetCompanyProfile,
    { provide: CompanyRepository, useClass: DrizzleCompanyRepository },
    { provide: InventoryLink, useClass: HttpInventoryLink },
  ],
  exports: [GetCompanyProfile, CompanyRepository],
})
export class CompaniesModule {}
