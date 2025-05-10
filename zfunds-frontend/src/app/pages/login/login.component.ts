import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user_email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.user_email, this.password).subscribe({
      next: (res) => {
        console.log('Login success', res);
        // Save JWT token
        localStorage.setItem('userToken', res.token);
        
        // Decode token to get user info
        const decodedToken: any = jwtDecode(res.token);
        localStorage.setItem('userRole', decodedToken.user_role);
        
        this.authService.setLoggedIn(true);
        
        // Navigate based on user role
        if (decodedToken.user_role === 'investor') {
          this.router.navigate(['/projects']);
        } else if (decodedToken.user_role === 'entrepreneur') {
          this.router.navigate(['/companies']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
  }
}