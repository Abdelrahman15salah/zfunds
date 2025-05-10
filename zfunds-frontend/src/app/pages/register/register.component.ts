import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user_name = '';
  user_email = '';
  password = '';
  user_role = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    this.authService.register(this.user_name, this.user_email, this.password, this.user_role).subscribe({
      next: (res) => {
        console.log('Registration success', res);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
      }
    });
  }
}
