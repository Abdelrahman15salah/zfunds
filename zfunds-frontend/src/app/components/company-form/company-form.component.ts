import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { RouterModule, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css']
})
export class CompanyFormComponent implements OnInit {
  companyData = {
    company_name: '',
    tax_number: '',
    commercial_register: '',
    industry: '',
    user_id: null,
    plan_id: null
  };

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('userToken');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.companyData.user_id = decoded.user_id;
    }
  }

  submitForm() {
    this.companyService.createCompany(this.companyData).subscribe({
      next: (res) => {
        console.log('Company created:', res);
        this.companyData = { company_name: '', tax_number: '', commercial_register: '', industry: '', user_id: this.companyData.user_id, plan_id: null };
        this.router.navigate(['/companies']); // Navigate back to company list after successful creation
      },
      error: (err) => console.error('Error creating company:', err)
    });
  }

  navigateBack(): void {
    this.router.navigate(['/companies']);
  }
}
