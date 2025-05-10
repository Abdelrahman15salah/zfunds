import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:3000/api/companies'; // Change if needed

  constructor(private http: HttpClient) {}

  getAllCompanies(): Observable<any> {
    const token = localStorage.getItem('userToken');

    // Set token in headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiUrl, { headers });
    // return this.http.get(this.apiUrl);
  }

  createCompany(data: any): Observable<any> {
    const token = localStorage.getItem('userToken');

    // Set token in headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.apiUrl, data , { headers });
  }

  getCompanyById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateCompany(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('userToken');

    // Set token in headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}`, data , { headers });
  }

  deleteCompany(id: number): Observable<any> {
    const token = localStorage.getItem('userToken');

    // Set token in headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${id}` , { headers });
  }

  getCompaniesByUserId(userId: number): Observable<any> {
    const token = localStorage.getItem('userToken');

    // Set token in headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/user/${userId}`, { headers });
  }

  getCompaniesByPlanId(planId: number): Observable<any> {
    const token = localStorage.getItem('userToken');

    // Set token in headers
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/plan/${planId}`, { headers });
  }
}
