import { Injectable } from '@angular/core';
import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Handle the request
    request = this.addAuthHeader(request);

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        return throwError(() => error);
      })
    )
  }

  addAuthHeader(request: HttpRequest<any>) {
    // Get the Access Token
    const token = this.authService.getAccessToken();

    if(token) {
      // Append the Access Token to the request header
      return request.clone({
        setHeaders: {"x-access-token": token},
      })
    }

    return request;
  }
}
