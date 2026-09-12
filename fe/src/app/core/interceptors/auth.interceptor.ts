import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfigService } from '../services/api-config.service';

export const TOKEN_STORAGE_KEY = 'hotelapp.token';

/**
 * Attaches the signed-in user's bearer token to requests aimed at the
 * backend API base URL only — never to same-origin assets like `config.json`
 * or (in tests) `data.json`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiConfig = inject(ApiConfigService);
  const baseUrl = apiConfig.apiBaseUrl;
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token && baseUrl && req.url.startsWith(baseUrl)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
