import { ApplicationConfig }                              from '@angular/core';
import { provideRouter, withComponentInputBinding }       from '@angular/router';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { routes }          from './app.routes';
import { jwtInterceptor }  from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),

    // Register the JWT interceptor as a functional interceptor
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};