import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = 'http://localhost:3000/api/plans'; // Update with your API URL

  constructor(private http: HttpClient) {}

  // Get all plans
  getPlans(): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrl, { headers });
  }

  // Get a single plan by ID
  getPlanById(planId: number): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${planId}`, { headers });
  }

  // Create a new plan
  createPlan(planData: any): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, planData, { headers });
  }

  // Update a plan
  updatePlan(planId: number, planData: any): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${planId}`, planData, { headers });
  }

  // Delete a plan
  deletePlan(planId: number): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${planId}`, { headers });
  }
}
