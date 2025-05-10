import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('No token found in localStorage');
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Get all projects
  getProjects(): Observable<any> {
    console.log('Making GET request to:', this.apiUrl);
    const headers = this.getHeaders();
    console.log('Request headers:', headers);
    
    return this.http.get<any>(this.apiUrl, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get project by ID
  getProjectById(projectId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/${projectId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Create a new project
  createProject(projectData: any): Observable<any> {
    const headers = this.getHeaders();
    console.log('Creating project with data:', projectData);
    return this.http.post<any>(this.apiUrl, projectData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Update a project
  updateProject(projectId: number, projectData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/${projectId}`, projectData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a project
  deleteProject(projectId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${projectId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getprojectbycompanyid(companyId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/company/${companyId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateProjectRaisedAmount(projectId: number, amount: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch<any>(`${this.apiUrl}/${projectId}/raise`, { amount }, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
