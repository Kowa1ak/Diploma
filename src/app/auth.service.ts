import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    const payload = { username, password };
    console.log('AuthService.login payload ->', payload);
    return this.http
      .post('/authenticate', payload, { responseType: 'text' })
      .pipe(
        tap((token: string) => {
          console.log('AuthService.login token ->', token);
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem('username', username);
        })
      );
  }

  // Возвращает имя текущего пользователя
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  register(username: string, email: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('username', username)
      .set('email', email)
      .set('password', password);
    return this.http.post('/api/reg/register', null, { params });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
