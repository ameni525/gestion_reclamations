import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,LoaderComponent],
  template: `
    <router-outlet></router-outlet>
    <app-loader></app-loader>
  `
})
export class AppComponent {
  title = 'SOFIMA Gestion Réclamations';
}
