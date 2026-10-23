import { HttpInterceptorFn, httpResource, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap, throwError } from 'rxjs';

export const apiLoggingInterceptor: HttpInterceptorFn =
  (req, next) => {

    const isEmployeeApi = req.url === environment.apiUrl || req.url.startsWith(`${environment.apiUrl}/`);

    //Disable console API diagnostics in production
    if (environment.production || !isEmployeeApi) {
      return next(req);
    }

    const startTime = performance.now();

    return next(req).pipe(
      // Handle successful Http response
      tap(event => {
        const elapsedMs = Math.round(performance.now() - startTime);

        if (event instanceof HttpResponse) {
          const correlationId = event.headers.get('X-Correlation-ID');
          console.info('API request successed', {
            method: req.method,
            status: event.status,
            elapsedMs,
            correlationId
          });
        }
      }),

      // Observe HTTP failures without hiding them.
      catchError((error: unknown) => {
        if (error instanceof HttpResponse) {
          const correlationId = error.headers.get('X-Correlation-ID');

          console.warn('API request failed', {
            method: req.method,
            status: error.status,
            correlationId
          });
        }
        // Keep the original error for EmployeeList.
        return throwError(() => error);
      })
    );
  };
