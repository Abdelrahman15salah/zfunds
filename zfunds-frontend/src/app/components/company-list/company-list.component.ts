import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { ProjectService } from '../../services/project.service';
import { PlanService } from '../../services/plan.service';
import { RouterModule, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.css']
})
export class CompanyListComponent implements OnInit {
  companies: any[] = [];
  allProjects: any[] = [];
  plans: any[] = [];
  currentUserId: number = 0;
  selectedCompanyId: number | null = null;
  showProjects: boolean = false;
  showAddForm: boolean = false;
  showPaymentForm: boolean = false;
  projectForm!: FormGroup;
  message: { text: string; type: 'success' | 'error' } | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  paid: boolean = false;
  selectedPlan: any = null;
  fees: number = 0;
  paymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  };

  projectStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'funding', label: 'Funding' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' }
  ];

  constructor(
    private companyService: CompanyService,
    private projectService: ProjectService,
    private planService: PlanService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeUser();
    this.initializeForm();
    this.loadCompanies();
    this.loadPlans();
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

  private loadPlans(): void {
    this.planService.getPlans().subscribe({
      next: (data) => {
        console.log('Loaded plans:', data);
        this.plans = data;
      },
      error: (error) => {
        this.handleError(error, 'Error loading plans');
      }
    });
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
      phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      plan_id: ['', Validators.required],
      project_status: ['draft', Validators.required]
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

  get totalAmount(): number {
    if (!this.selectedPlan) return 0;
    const planPrice = Number(this.selectedPlan.plan_price) || 0;
    const feesAmount = Number(this.fees) || 0;
    return planPrice + feesAmount;
  }

  onGoalAmountChange(): void {
    const goalAmount = Number(this.projectForm.get('goal_amount')?.value) || 0;
    this.fees = goalAmount * 0.015; // 1.5% of goal amount
  }

  onPlanSelect(): void {
    const planId = this.projectForm.get('plan_id')?.value;
    console.log('Selected plan ID:', planId);
    console.log('Available plans:', this.plans);
    
    if (planId) {
      this.selectedPlan = this.plans.find(p => p.plan_id === Number(planId));
      console.log('Found selected plan:', this.selectedPlan);
    } else {
      this.selectedPlan = null;
    }
  }

  showPaymentDialog(): void {
    if (this.projectForm.invalid) {
      this.showFormErrors();
      return;
    }
    
    // Ensure we have a valid plan selected
    const planId = this.projectForm.get('plan_id')?.value;
    console.log('Payment dialog - Plan ID:', planId);
    console.log('Available plans:', this.plans);
    
    if (!planId) {
      this.showMessage('Please select a plan first', 'error');
      return;
    }
    
    this.selectedPlan = this.plans.find(p => p.plan_id === Number(planId));
    console.log('Found selected plan for payment:', this.selectedPlan);
    
    if (!this.selectedPlan) {
      this.showMessage('Selected plan not found', 'error');
      return;
    }
    
    this.showPaymentForm = true;
  }

  processPayment(): void {
    if (!this.selectedPlan) {
      this.showMessage('No plan selected', 'error');
      return;
    }

    // Here you would typically integrate with a payment gateway
    console.log('Processing payment:', {
      planId: this.selectedPlan.plan_id,
      planPrice: this.selectedPlan.plan_price,
      fees: this.fees,
      totalAmount: this.totalAmount,
      paymentDetails: this.paymentDetails
    });

    // Simulate successful payment
    this.paid = true;
    this.showPaymentForm = false;
    this.showMessage('Payment confirmed! You can now create your project.', 'success');
  }

  cancelPayment(): void {
    this.showPaymentForm = false;
    this.paymentDetails = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    };
  }

  createProject(): void {
    if (this.projectForm.invalid || !this.paid) {
      this.showFormErrors();
      return;
    }

    this.isSubmitting = true;
    const projectData = {
      ...this.projectForm.value,
      company_id: this.selectedCompanyId
    };

    // Store phone number in JSON file
    const phoneData = {
      project_title: projectData.project_title,
      phone_number: projectData.phone_number
    };
console.log(projectData);

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
        this.paid = false;
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
