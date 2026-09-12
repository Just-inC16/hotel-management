import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  let service: ApiConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('defaults to the build-time environment apiBaseUrl before loading', () => {
    expect(service.apiBaseUrl).toBe(environment.apiBaseUrl);
  });

  it('overrides apiBaseUrl with the value from config.json when present', async () => {
    const loadPromise = service.load();
    httpMock.expectOne('config.json').flush({ apiBaseUrl: 'https://api.example.com' });
    await loadPromise;

    expect(service.apiBaseUrl).toBe('https://api.example.com');
  });

  it('keeps the environment default when config.json has no apiBaseUrl', async () => {
    const loadPromise = service.load();
    httpMock.expectOne('config.json').flush({});
    await loadPromise;

    expect(service.apiBaseUrl).toBe(environment.apiBaseUrl);
  });

  it('keeps the environment default when config.json fails to load', async () => {
    const loadPromise = service.load();
    httpMock.expectOne('config.json').flush('not found', { status: 404, statusText: 'Not Found' });
    await loadPromise;

    expect(service.apiBaseUrl).toBe(environment.apiBaseUrl);
  });
});
