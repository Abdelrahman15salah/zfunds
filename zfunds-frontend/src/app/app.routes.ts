import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './services/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CompanyListComponent } from './components/company-list/company-list.component';
import { CompanyFormComponent } from './components/company-form/company-form.component';
import { PlanComponent } from './components/plan/plan.component';
import { ProjectComponent } from './components/project/project.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'companies', component: CompanyListComponent },
    { path: 'add-company', component: CompanyFormComponent },
    { path : 'plans', component: PlanComponent},
    { path : 'projects', component: ProjectComponent},
    {path : 'profile', component: ProfileComponent},
];
