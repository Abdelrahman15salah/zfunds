import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Assuming AuthService handles user authentication
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-navbar',
  imports: [ CommonModule,RouterModule,FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = ''; // e.g., 'admin', 'user', or '' if not logged in
  user: any = {};
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      const token = localStorage.getItem('userToken');
      if (token) {
        this.user = jwtDecode(token);
        this.userRole = this.user.user_role;
        this.isAdmin = this.user.is_admin;
      } else {
        this.userRole = '';
        this.isAdmin = false;
      }
    });
  }
  

  // Log out the user
  logout() {
    localStorage.removeItem('userToken');
    this.isLoggedIn = false;
    this.userRole = '';
    this.router.navigate(['/login']); // Redirect to login page
  }
}
