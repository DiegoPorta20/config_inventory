import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ZodValidationPipe } from '../../../shared/presentation/zod-validation.pipe.js';
import {
  CreateCompany,
  GetCompany,
  ListCompanies,
  ProvisionCompanyAdmin,
  SetCompanyImage,
  UpdateCompany,
  UpdateCompanyConfig,
} from '../application/use-cases/company-use-cases.js';
import {
  companyConfigSchema,
  createCompanySchema,
  provisionAdminSchema,
  setImageSchema,
  updateCompanySchema,
  type CompanyConfigBody,
  type CreateCompanyBody,
  type ProvisionAdminBody,
  type SetImageBody,
  type UpdateCompanyBody,
} from './companies.schemas.js';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly listCompanies: ListCompanies,
    private readonly getCompany: GetCompany,
    private readonly createCompany: CreateCompany,
    private readonly updateCompany: UpdateCompany,
    private readonly updateConfig: UpdateCompanyConfig,
    private readonly setImage: SetCompanyImage,
    private readonly provisionAdmin: ProvisionCompanyAdmin,
  ) {}

  @Get()
  list() {
    return this.listCompanies.execute();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.getCompany.execute(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createCompanySchema)) body: CreateCompanyBody) {
    return this.createCompany.execute(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateCompanySchema)) body: UpdateCompanyBody,
  ) {
    return this.updateCompany.execute(id, body);
  }

  @Put(':id/config')
  replaceConfig(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(companyConfigSchema)) body: CompanyConfigBody,
  ) {
    return this.updateConfig.execute(id, body);
  }

  @Put(':id/logo')
  setLogo(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(setImageSchema)) body: SetImageBody,
  ) {
    return this.setImage.execute(id, 'logo', body.dataUrl);
  }

  @Put(':id/favicon')
  setFavicon(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(setImageSchema)) body: SetImageBody,
  ) {
    return this.setImage.execute(id, 'favicon', body.dataUrl);
  }

  @Post(':id/admins')
  createAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(provisionAdminSchema)) body: ProvisionAdminBody,
  ) {
    return this.provisionAdmin.execute(id, body);
  }
}
