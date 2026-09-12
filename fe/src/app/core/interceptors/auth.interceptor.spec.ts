import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiConfigService } from '../services/api-config.service';
import { TOKEN_STORAGE_KEY, authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let apiConfig: ApiConfigService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    apiConfig = TestBed.inject(ApiConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('attaches the bearer token to requests aimed at the API base URL', () => {
    spyOnProperty(apiConfig, 'apiBaseUrl', 'get').and.returnValue('http://localhost:8085');
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

    http.get('http://localhost:8085/customer/api/v1/customers/1').subscribe();

    const req = httpMock.expectOne('http://localhost:8085/customer/api/v1/customers/1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });

  it('does not attach a header when there is no stored token', () => {
    spyOnProperty(apiConfig, 'apiBaseUrl', 'get').and.returnValue('http://localhost:8085');

    http.get('http://localhost:8085/customer/api/v1/customers/1').subscribe();

    const req = httpMock.expectOne('http://localhost:8085/customer/api/v1/customers/1');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not attach a token to requests outside the API base URL (e.g. config.json)', () => {
    spyOnProperty(apiConfig, 'apiBaseUrl', 'get').and.returnValue('http://localhost:8085');
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

    http.get('config.json').subscribe();

    const req = httpMock.expectOne('config.json');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('does not attach a token when the api base URL has not resolved yet', () => {
    spyOnProperty(apiConfig, 'apiBaseUrl', 'get').and.returnValue('');
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123');

    http.get('config.json').subscribe();

    const req = httpMock.expectOne('config.json');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
