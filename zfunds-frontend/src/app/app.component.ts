import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    RouterModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'zfunds-frontend';
}
