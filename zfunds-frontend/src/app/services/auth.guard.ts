import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // Check if the token exists in localStorage
    if (localStorage.getItem('userToken')) {
      return true; // Allow access to the route
    }
    this.router.navigate(['/login']); // Redirect to login page if no token
    return false;
  }
}
