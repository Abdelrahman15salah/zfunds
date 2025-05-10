import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any = {}; // Store user info

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Decode the JWT token to get user info
    const token = localStorage.getItem('userToken');
    if (token) {
      this.user = jwtDecode(token); // Decode the token
      console.log(this.user); // To check the decoded token in the console
    }
  }

  // Method to log out user
  logout() {
    localStorage.removeItem('userToken'); // remove token from localStorage
    this.router.navigate(['/login']); // redirect to login page
  }
}
