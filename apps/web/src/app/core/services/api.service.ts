import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Material, PaginatedResult } from '../models/material.model';
import { HardwarePricingItem } from '../models/hardware-pricing.model';
import { PortfolioItem } from '../models/portfolio.model';
import {
  DoorConfiguration,
  PriceBreakdown,
} from '../models/configurator.model';
import { CreateQuoteRequest, Quote, QuoteStatus } from '../models/quote.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getMaterials(page = 1, limit = 50): Observable<PaginatedResult<Material>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResult<Material>>(
      `${this.base}/materials`,
      { params },
    );
  }

  getMaterialBySlug(slug: string): Observable<Material> {
    return this.http.get<Material>(`${this.base}/materials/${slug}`);
  }

  getPortfolio(
    page = 1,
    limit = 12,
  ): Observable<PaginatedResult<PortfolioItem>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResult<PortfolioItem>>(
      `${this.base}/portfolio`,
      { params },
    );
  }

  getPortfolioItem(slug: string): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${this.base}/portfolio/${slug}`);
  }

  calculatePrice(
    configuration: DoorConfiguration,
  ): Observable<PriceBreakdown> {
    return this.http.post<PriceBreakdown>(
      `${this.base}/quotes/calculate`,
      { configuration },
    );
  }

  submitQuote(request: CreateQuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(`${this.base}/quotes`, request);
  }

  login(email: string, password: string): Observable<{ accessToken: string; adminName: string }> {
    return this.http.post<{ accessToken: string; adminName: string }>(
      `${this.base}/auth/login`,
      { email, password },
    );
  }

  getAdminMaterials(
    page = 1,
    limit = 20,
  ): Observable<PaginatedResult<Material>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResult<Material>>(
      `${this.base}/materials/admin/all`,
      { params },
    );
  }

  createMaterial(data: Partial<Material>): Observable<Material> {
    return this.http.post<Material>(`${this.base}/materials`, data);
  }

  updateMaterial(id: string, data: Partial<Material>): Observable<Material> {
    return this.http.put<Material>(`${this.base}/materials/${id}`, data);
  }

  deleteMaterial(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/materials/${id}`);
  }

  getAdminPortfolio(
    page = 1,
    limit = 20,
  ): Observable<PaginatedResult<PortfolioItem>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PaginatedResult<PortfolioItem>>(
      `${this.base}/portfolio/admin/all`,
      { params },
    );
  }

  createPortfolioItem(
    data: Partial<PortfolioItem>,
  ): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(`${this.base}/portfolio`, data);
  }

  updatePortfolioItem(
    id: string,
    data: Partial<PortfolioItem>,
  ): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(
      `${this.base}/portfolio/${id}`,
      data,
    );
  }

  getAdminQuotes(
    page = 1,
    limit = 20,
    status?: QuoteStatus,
  ): Observable<PaginatedResult<Quote>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResult<Quote>>(
      `${this.base}/quotes`,
      { params },
    );
  }

  updateQuoteStatus(
    id: string,
    status: QuoteStatus,
    adminNotes?: string,
  ): Observable<Quote> {
    return this.http.patch<Quote>(`${this.base}/quotes/${id}/status`, {
      status,
      adminNotes,
    });
  }

  getHardwarePricing(): Observable<HardwarePricingItem[]> {
    return this.http.get<HardwarePricingItem[]>(`${this.base}/hardware-pricing`);
  }

  updateHardwarePricing(
    id: string,
    payload: Partial<Pick<HardwarePricingItem, 'priceFixed' | 'pricePerM' | 'isActive'>>,
  ): Observable<HardwarePricingItem> {
    return this.http.put<HardwarePricingItem>(
      `${this.base}/hardware-pricing/${id}`,
      payload,
    );
  }
}
