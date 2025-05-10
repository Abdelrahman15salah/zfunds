import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // Get user profile
  getUserProfile(userId: number, token: string): Observable<any> {
    // const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}/profile`, { headers });
  }

  // Update user profile
  updateUserProfile(userId: number, user_name: string, user_email: string, user_role: string, password: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { user_name, user_email, user_role, password };
    return this.http.put<any>(`${this.baseUrl}/profile`, body, { headers });
  }

  // Delete user profile
  deleteUser(userId: number, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.baseUrl}/${userId}`, { headers });
  }
}
