import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = `${environment.apiUrl}/investments`;

  constructor(private http: HttpClient) { }

  // Create a new investment
  createInvestment(investmentData: any): Observable<any> {
    return this.http.post(this.apiUrl, investmentData);
  }

  // Get all investments
  getInvestments(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Get investment by ID
  getInvestmentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Get investments by user ID
  getInvestmentsByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  // Get investments by company ID
  getInvestmentsByCompanyId(companyId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/company/${companyId}`);
  }

  // Update project raised amount after investment
  updateProjectRaisedAmount(projectId: number, amount: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/projects/${projectId}/raised-amount`, { amount });
  }
} 