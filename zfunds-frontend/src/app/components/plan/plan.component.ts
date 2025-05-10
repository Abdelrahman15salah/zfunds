import { Component, OnInit } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { CompanyService } from '../../services/company.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
 import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {
  plans: any[] = [];
  companies: any[] = [];
  planData = { plan_description: '', plan_price: null };
  plan: any = null;
  isEditing: boolean = false;
  isAdmin: boolean = false;
  userRole: string = '';
  selectedPlanId: number | null = null;
  selectedPlanPrice: number = 0;
  selectedCompanyId: number | null = null;
  showPaymentForm: boolean = false;
  paymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  };

  constructor(
    private planService: PlanService,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Get user role from token
    const token = localStorage.getItem('userToken');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.userRole = decodedToken.user_role;
      this.isAdmin = decodedToken.user_role === 'admin';
    }
  }

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');
    if (planId) {
      this.isEditing = true;
      this.getPlanDetails(+planId);
    } else {
      this.isEditing = false;
      this.getPlans();
    }

    if (this.userRole === 'entrepreneur') {
      this.loadCompanies();
    }
  }

  loadCompanies() {
    this.companyService.getAllCompanies().subscribe({
      next: (res) => {
        this.companies = res;
      },
      error: (err) => console.error('Error fetching companies:', err)
    });
  }

  getPlans() {
    this.planService.getPlans().subscribe({
      next: (res) => {
        this.plans = res;
      },
      error: (err) => console.error('Error fetching plans:', err)
    });
  }

  getPlanDetails(planId: number) {
    this.planService.getPlanById(planId).subscribe({
      next: (res) => {
        this.plan = res;
        this.planData = { plan_description: res.plan_description, plan_price: res.plan_price };
      },
      error: (err) => console.error('Error fetching plan details:', err)
    });
  }

  submitForm() {
    if (!this.isAdmin) {
      console.error('Only admins can manage plans');
      return;
    }

    if (this.isEditing) {
      this.updatePlan();
    } else {
      this.createPlan();
    }
  }

  createPlan() {
    if (!this.isAdmin) return;

    this.planService.createPlan(this.planData).subscribe({
      next: (res) => {
        console.log('Plan created:', res);
        this.getPlans();
        this.planData = { plan_description: '', plan_price: null };
      },
      error: (err) => console.error('Error creating plan:', err)
    });
  }

  updatePlan() {
    if (!this.isAdmin) return;

    const planId = this.plan.plan_id;
    this.planService.updatePlan(planId, this.planData).subscribe({
      next: (res) => {
        console.log('Plan updated:', res);
        this.getPlans();
        this.router.navigate(['/plans']);
      },
      error: (err) => console.error('Error updating plan:', err)
    });
  }

  deletePlan(planId: number) {
    if (!this.isAdmin) return;

    if (confirm('Are you sure you want to delete this plan?')) {
      this.planService.deletePlan(planId).subscribe({
        next: (res) => {
          console.log('Plan deleted:', res);
          this.getPlans();
        },
        error: (err) => console.error('Error deleting plan:', err)
      });
    }
  }

  selectPlanForSubscription(planId: number, planPrice: number) {
    if (this.userRole !== 'entrepreneur') return;
    this.selectedPlanId = planId;
    this.selectedPlanPrice = planPrice;
  }

  proceedToPayment() {
    if (!this.selectedCompanyId) {
      alert('Please select a company first');
      return;
    }
    this.showPaymentForm = true;
  }

  processPayment() {
    // Here you would typically integrate with a payment gateway
    console.log('Processing payment:', {
      planId: this.selectedPlanId,
      companyId: this.selectedCompanyId,
      amount: this.selectedPlanPrice,
      paymentDetails: this.paymentDetails
    });

    // Update company's plan_id
    if (this.selectedCompanyId && this.selectedPlanId) {
      this.companyService.updateCompany(this.selectedCompanyId, { plan_id: this.selectedPlanId }).subscribe({
        next: (res) => {
          console.log('Company plan updated:', res);
          alert('Payment processed successfully and plan subscribed!');
          this.resetPaymentFlow();
          this.router.navigate(['/companies']);
        },
        error: (err) => {
          console.error('Error updating company plan:', err);
          alert('Error updating company plan. Please try again.');
        }
      });
    }
  }

  cancelSubscription() {
    this.resetPaymentFlow();
  }

  cancelPayment() {
    this.showPaymentForm = false;
  }

  getSelectedCompanyName(): string {
    if (!this.selectedCompanyId) return '';
    const company = this.companies.find(c => c.company_id === this.selectedCompanyId);
    return company ? company.company_name : '';
  }

  private resetPaymentFlow() {
    this.selectedPlanId = null;
    this.selectedPlanPrice = 0;
    this.selectedCompanyId = null;
    this.showPaymentForm = false;
    this.paymentDetails = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    };
  }
}
