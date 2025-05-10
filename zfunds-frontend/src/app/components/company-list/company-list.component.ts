import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { ProjectService } from '../../services/project.service';
import { RouterModule, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit {
  companies: any[] = [];
  allProjects: any[] = [];
  currentUserId: number = 0;
  selectedCompanyId: number | null = null;
  showProjects: boolean = false;
  showAddForm: boolean = false;
  projectForm!: FormGroup;
  message: { text: string; type: 'success' | 'error' } | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private companyService: CompanyService,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeUser();
    this.initializeForm();
    this.loadCompanies();
  }

  private initializeUser(): void {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        this.showMessage('Please login to access this feature', 'error');
        return;
      }
      const decoded: any = jwtDecode(token);
      this.currentUserId = decoded.id;
    } catch (error) {
      this.showMessage('Error initializing user session', 'error');
      console.error('Token decode error:', error);
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      project_title: ['', [Validators.required, Validators.minLength(3)]],
      project_category: ['', [Validators.required, Validators.minLength(2)]],
      project_description: ['', Validators.maxLength(500)],
      goal_amount: ['', [Validators.required, Validators.min(1)]],
      start_date: ['', [Validators.required, this.futureDateValidator()]],
      end_date: ['', [Validators.required, this.futureDateValidator()]],
      company_id: [{ value: '', disabled: true }, Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  private futureDateValidator() {
    return (control: any) => {
      const date = new Date(control.value);
      const today = new Date();
      if (date < today) {
        return { pastDate: true };
      }
      return null;
    };
  }

  private dateRangeValidator(group: FormGroup) {
    const startDate = new Date(group.get('start_date')?.value);
    const endDate = new Date(group.get('end_date')?.value);
    if (startDate && endDate && startDate > endDate) {
      return { dateRange: true };
    }
    return null;
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.companyService.getAllCompanies().pipe(
      catchError(error => {
        this.handleError(error, 'Error loading companies');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.companies = data
          .filter((company: any) => company.user_id === this.currentUserId)
          .map((company: any) => ({ ...company, projects: [] }));
        this.loadProjects();
      }
    });
  }

  loadProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().pipe(
      catchError(error => {
        this.handleError(error, 'Error loading projects');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.allProjects = data;
        this.companies.forEach(company => {
          company.projects = this.getProjectsByCompany(company.company_id);
        });
      }
    });
  }

  toggleProjects(companyId: number): void {
    if (this.selectedCompanyId === companyId) {
      this.showProjects = !this.showProjects;
    } else {
      this.selectedCompanyId = companyId;
      this.showProjects = true;
    }
    this.showAddForm = false;
    
    this.isLoading = true;
    this.projectService.getprojectbycompanyid(companyId).pipe(
      catchError(error => {
        this.handleError(error, 'Error loading company projects');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (projects) => {
        const company = this.companies.find(c => c.company_id === companyId);
        if (company) {
          company.projects = projects;
        }
        this.showMessage('Projects loaded successfully', 'success');
      }
    });
  }

  toggleAddForm(companyId: number): void {
    console.log('Toggling add form for company:', companyId);
    console.log('Current selectedCompanyId:', this.selectedCompanyId);
    
    if (this.selectedCompanyId === companyId) {
      this.showAddForm = !this.showAddForm;
    } else {
      this.selectedCompanyId = companyId;
      this.showAddForm = true;
    }
    
    this.showProjects = false;
    this.projectForm.reset();
    this.projectForm.patchValue({ company_id: companyId });
    
    console.log('After toggle - showAddForm:', this.showAddForm);
    console.log('After toggle - selectedCompanyId:', this.selectedCompanyId);
  }

  createProject(): void {
    if (this.projectForm.invalid) {
      this.showFormErrors();
      return;
    }

    this.isSubmitting = true;
    const projectData = {
      ...this.projectForm.value,
      company_id: this.selectedCompanyId
    };

    this.projectService.createProject(projectData).pipe(
      catchError(error => {
        this.handleError(error, 'Error creating project');
        return throwError(() => error);
      }),
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (newProject) => {
        const company = this.companies.find(c => c.company_id === this.selectedCompanyId);
        if (company) {
          company.projects = [...(company.projects || []), newProject];
        }
        this.projectForm.reset();
        this.showAddForm = false;
        this.showMessage('Project created successfully', 'success');
      }
    });
  }

  private showFormErrors(): void {
    const formErrors = [];
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      if (control?.errors) {
        if (control.errors['required']) {
          formErrors.push(`${key} is required`);
        }
        if (control.errors['minlength']) {
          formErrors.push(`${key} must be at least ${control.errors['minlength'].requiredLength} characters`);
        }
        if (control.errors['min']) {
          formErrors.push(`${key} must be greater than 0`);
        }
        if (control.errors['pastDate']) {
          formErrors.push(`${key} must be a future date`);
        }
      }
    });

    if (this.projectForm.errors?.['dateRange']) {
      formErrors.push('End date must be after start date');
    }

    this.showMessage(formErrors.join(', '), 'error');
  }

  private handleError(error: any, defaultMessage: string): void {
    console.error('Error:', error);
    let errorMessage = defaultMessage;

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    this.showMessage(errorMessage, 'error');
  }

  getProjectsByCompany(companyId: number): any[] {
    return this.allProjects.filter(project => project.company_id === companyId);
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message = { text, type };
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  navigateToAddCompany(): void {
    this.router.navigate(['/add-company']);
  }
}
