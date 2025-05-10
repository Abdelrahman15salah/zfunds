import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from './auth-response.model'; // Import the interface
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  getToken(): string {
    return localStorage.getItem('token') || ''; // Get the token from local storage
  }
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private hasToken(): boolean {
    return !!localStorage.getItem('userToken');
  }

  setLoggedIn(status: boolean) {
    this.isLoggedInSubject.next(status);
  }

  logout() {
    localStorage.removeItem('userToken');
    this.setLoggedIn(false);
  }

  getUserId(): number {
    const token = this.getToken();
    if (!token) return 0;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id;
    } catch (e) {
      return 0;
    }
  }
  
  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_role;
    } catch (e) {
      return '';
    }
  }

  constructor(private http: HttpClient) {}

  login(user_email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, {
      user_email,
      password
    });
  }

  register(user_name: string, user_email: string, password: string, user_role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/`, {
      user_name,
      user_email,
      password,
      user_role
    });
  }
}
