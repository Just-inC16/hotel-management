import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface RuntimeConfig {
  apiBaseUrl?: string;
}

/**
 * Resolves the backend API base URL at runtime from `config.json` (a static
 * asset that can be swapped per deployment without rebuilding the bundle),
 * falling back to the build-time `environment.apiBaseUrl` when it is absent
 * or unreachable (e.g. local dev, where no config.json override is needed).
 */
@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  private readonly http = inject(HttpClient);

  private baseUrl = environment.apiBaseUrl;

  get apiBaseUrl(): string {
    return this.baseUrl;
  }

  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<RuntimeConfig>('config.json').pipe(
        map((config) => {
          if (config?.apiBaseUrl) {
            this.baseUrl = config.apiBaseUrl;
          }
        }),
        catchError(() => of(undefined)),
      ),
    );
  }
}
