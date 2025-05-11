import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { InvestmentService } from '../../services/investment.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-project',
  imports: [ReactiveFormsModule, RouterModule, FormsModule, CommonModule],
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  projectForm!: FormGroup;
  projects: any[] = [];
  filteredProjects: any[] = [];
  searchTerm: string = '';
  searchTerm2: string = '';
  userRole: string = '';
  isInvestor: boolean = false;
  isAdmin: boolean = false;
  showInvestmentForm: boolean = false;
  selectedProject: any = null;
  investmentAmount: number = 0;
  user_id: number = 0;
  paymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  };
  // paid : boolean = false;

  constructor(
    private fb: FormBuilder, 
    private projectService: ProjectService,
    private investmentService: InvestmentService
  ) {
    // Get user role from token
    const token = localStorage.getItem('userToken');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userRole = decodedToken.user_role;
      this.isInvestor = decodedToken.user_role === 'investor';
      this.isAdmin = decodedToken.user_role === 'admin';
      this.user_id = decodedToken.id;
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.getProjects();
  }

  initForm() {
    this.projectForm = this.fb.group({
      project_title: ['', Validators.required],
      project_category: ['', Validators.required],
      project_description: ['', Validators.required],
      goal_amount: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      company_id: ['', Validators.required],
    });
  }

  getProjects() {
    console.log('Fetching projects...');
    this.projectService.getProjects().subscribe({
      next: (data) => {
        console.log('API Response:', data);
        if (Array.isArray(data)) {
      this.projects = data;
          this.filteredProjects = data;
          console.log('Projects loaded:', this.projects);
        } else {
          console.error('Invalid data format received:', data);
        }
      },
      error: (error) => {
        console.error('Error fetching projects:', error);
      }
    });
  }

  searchProjects() {
    const nameSearch = this.searchTerm.toLowerCase().trim();
    const categorySearch = this.searchTerm2.toLowerCase().trim();

    if (!nameSearch && !categorySearch) {
      this.filteredProjects = this.projects;
      return;
    }

    this.filteredProjects = this.projects.filter(project => {
      const nameMatch = !nameSearch || project.project_title.toLowerCase().includes(nameSearch);
      const categoryMatch = !categorySearch || project.project_category.toLowerCase().includes(categorySearch);
      return nameMatch && categoryMatch;
    });
  }

  createProject() {
    if (this.projectForm.invalid) return;
    console.log('Creating project with data:', this.projectForm.value);
    // if(this.paid){
      this.projectService.createProject(this.projectForm.value).subscribe({
        next: res => {
          console.log('Project created successfully:', res);
        this.projects.push(res);
        this.filteredProjects = [...this.projects];
        this.projectForm.reset();
      },
      error: err => {
        console.error('Error creating project:', err);
      }
    });
  }
  // }else{
  //   alert('Please pay to create a project');
  // }}

  deleteProject(id: number) {
    if (!this.isAdmin) {
      console.error('Unauthorized: Only admins can delete projects');
      return;
    }

    if (confirm('Are you sure you want to delete this project?')) {
      console.log('Deleting project with ID:', id);
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          console.log('Project deleted successfully');
          this.projects = this.projects.filter(p => p.project_id !== id);
          this.filteredProjects = this.filteredProjects.filter(p => p.project_id !== id);
        },
        error: err => {
          console.error('Error deleting project:', err);
          alert('Error deleting project. Please try again.');
        }
      });
    }
  }

  showInvestmentDialog(project: any) {
    this.selectedProject = project;
    this.showInvestmentForm = true;
    this.investmentAmount = 0;
    this.paymentDetails = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    };
  }

  processInvestment() {
    if (!this.selectedProject || !this.investmentAmount) {
      console.error('Invalid investment attempt');
      return;
    }

    // Create investment data
    const investmentData = {
      investment_amount: this.investmentAmount,
      company_id: this.selectedProject.company_id,
      user_id: this.user_id,
      project_id: this.selectedProject.project_id
    };
    console.log(investmentData);

    // Create the investment
    this.investmentService.createInvestment(investmentData).subscribe({
      next: (response) => {
        console.log('Investment created successfully:', response);
        
        // Update project's raised amount
        this.projectService.updateProjectRaisedAmount(
          this.selectedProject.project_id, 
          this.investmentAmount
        ).subscribe({
          next: (updateResponse) => {
            console.log('Project raised amount updated:', updateResponse);
            
            // Update the project in the local array
            const index = this.projects.findIndex(p => p.project_id === this.selectedProject.project_id);
            if (index !== -1) {
              this.projects[index].raised_amount = Number(this.projects[index].raised_amount || 0) + Number(this.investmentAmount);
              this.filteredProjects = [...this.projects];
            }

            // Show success message and reset form
            alert('Investment processed successfully!');
            this.resetInvestmentForm();
          },
          error: (error) => {
            console.error('Error updating project raised amount:', error);
            alert('Error updating project. Please contact support.');
          }
        });
      },
      error: (error) => {
        console.error('Error creating investment:', error);
        alert('Error processing investment. Please try again.');
      }
    });
  }

  cancelInvestment() {
    this.resetInvestmentForm();
  }

  private resetInvestmentForm() {
    this.showInvestmentForm = false;
    this.selectedProject = null;
    this.investmentAmount = 0;
    this.paymentDetails = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    };
  }
}
