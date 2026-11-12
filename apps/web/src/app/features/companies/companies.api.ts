import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  CatalogModule,
  Company,
  CompanyConfig,
  CompanyStatus,
  CompanySummary,
  ProvisionedAdmin,
} from '../../core/models';

@Injectable({ providedIn: 'root' })
export class CompaniesApi {
  private readonly http = inject(HttpClient);

  list(): Observable<CompanySummary[]> {
    return this.http.get<CompanySummary[]>('/api/companies');
  }

  get(id: number): Observable<Company> {
    return this.http.get<Company>(`/api/companies/${id}`);
  }

  create(body: { slug: string; name: string }): Observable<Company> {
    return this.http.post<Company>('/api/companies', body);
  }

  update(id: number, body: { name?: string; status?: CompanyStatus }): Observable<Company> {
    return this.http.patch<Company>(`/api/companies/${id}`, body);
  }

  saveConfig(id: number, config: CompanyConfig): Observable<Company> {
    return this.http.put<Company>(`/api/companies/${id}/config`, config);
  }

  setLogo(id: number, dataUrl: string | null): Observable<Company> {
    return this.http.put<Company>(`/api/companies/${id}/logo`, { dataUrl });
  }

  setFavicon(id: number, dataUrl: string | null): Observable<Company> {
    return this.http.put<Company>(`/api/companies/${id}/favicon`, { dataUrl });
  }

  createAdmin(
    id: number,
    body: { email: string; name: string; password: string },
  ): Observable<ProvisionedAdmin> {
    return this.http.post<ProvisionedAdmin>(`/api/companies/${id}/admins`, body);
  }

  catalog(): Observable<{ modules: CatalogModule[] }> {
    return this.http.get<{ modules: CatalogModule[] }>('/api/catalog');
  }
}
