import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

const TOKEN_KEY = 'zbur_admin_token';
const NAME_KEY = 'zbur_admin_name';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _token = signal<string | null>(this.loadToken());
  private readonly _adminName = signal<string | null>(this.loadName());

  readonly isLoggedIn = computed(() => !!this._token());
  readonly adminName = computed(() => this._adminName());
  readonly token = computed(() => this._token());

  private loadToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(NAME_KEY);
  }

  login(email: string, password: string): Observable<{ accessToken: string; adminName: string }> {
    return this.api.login(email, password).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(TOKEN_KEY, res.accessToken);
          localStorage.setItem(NAME_KEY, res.adminName);
        }
        this._token.set(res.accessToken);
        this._adminName.set(res.adminName);
      }),
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(NAME_KEY);
    }
    this._token.set(null);
    this._adminName.set(null);
    this.router.navigate(['/admin/login']);
  }
}
