import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Public } from '../../../shared/presentation/decorators.js';
import { GetCompanyProfile } from '../../companies/application/use-cases/company-use-cases.js';
import { ServiceKeyGuard } from './service-key.guard.js';

/** Read-only company profiles for the inventory app (see inventory's CompanyDirectory). */
@Controller('service/companies')
@Public()
@UseGuards(ServiceKeyGuard)
export class ServiceCompaniesController {
  constructor(private readonly profiles: GetCompanyProfile) {}

  @Get('by-slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.profiles.bySlug(slug);
  }

  @Get('by-id/:id')
  byId(@Param('id', ParseIntPipe) id: number) {
    return this.profiles.byId(id);
  }
}
