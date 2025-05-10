import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CompanyService } from '../../services/company.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userId!: number;
  userRole!: string;
  token: string = '';
  decodedToken: any;
  isLoading = false;
  successMessage: string = '';
  errorMessage: string = '';
  user_id: number = 0;
  companies: any[] = [];
  projects: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private profileService: ProfileService, 
    private authService: AuthService,
    private router: Router,
    private companyService: CompanyService,
    private projectService: ProjectService
  ) {
    this.token = localStorage.getItem('userToken') || '';

    if (!this.token) {
      this.showError('Session expired. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    this.userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
    this.decodedToken = jwtDecode(this.token);
    this.user_id = this.decodedToken.id;
    this.userRole = this.decodedToken.user_role;
    console.log(this.decodedToken);
    console.log(this.userRole);
    
    // Load companies and projects if user is entrepreneur
    if (this.userRole === 'entrepreneur') {
      this.loadEntrepreneurData();
    }
    console.log(this.userRole);
    
  }

  initForm() {
    this.profileForm = this.fb.group({
      user_name: ['', Validators.required],
      user_email: ['', [Validators.required, Validators.email]],
      user_role: ['', Validators.required],
      password: ['', Validators.minLength(4)],
    });
  }

  loadUserData() {
    this.isLoading = true;
    this.profileService.getUserProfile(this.userId, this.token).subscribe({
      next: (user) => {
        this.profileForm.patchValue(user);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError('Error loading profile data');
        this.isLoading = false;
      }
    });
  }

  loadEntrepreneurData() {
    // Load companies
    this.companyService.getCompaniesByUserId(this.user_id).subscribe({
      next: (companies) => {
        this.companies = companies;
        // Load projects for each company
        companies.forEach((company: { company_id: number }) => {
          this.projectService.getprojectbycompanyid(company.company_id).subscribe({
            next: (projects) => {
              this.projects = [...this.projects, ...projects];
            },
            error: (err) => {
              console.error('Error loading projects for company:', err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading companies:', err);
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    const { user_name, user_email, user_role, password } = this.profileForm.value;
    
    this.profileService.updateUserProfile(this.userId, user_name, user_email, user_role, password, this.token).subscribe({
      next: (updatedUser) => {
        this.showSuccess('Profile updated successfully');
        this.loadUserData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.showError('Error updating profile');
        this.isLoading = false;
      }
    });
  }

  deleteProfile() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.isLoading = true;
      this.profileService.deleteUser(this.user_id, this.token).subscribe({
        next: () => {
          this.showSuccess('Account deleted successfully');
          localStorage.removeItem('userToken');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          this.showError('Error deleting account');
          this.isLoading = false;
        }
      });
    }
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
