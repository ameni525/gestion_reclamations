import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="auth-card">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0056b3 0%, #1a1a2e 100%);
      padding: 20px;
    }

    .auth-container {
      width: 100%;
      max-width: 400px;
    }

    .auth-card {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
  `]
})
export class AuthLayoutComponent {}
