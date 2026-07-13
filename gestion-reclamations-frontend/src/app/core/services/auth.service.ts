import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/utilisateur.model';

// Interface pour la réponse de l'api
interface ApiResponse {
  success: boolean;
  data?: {
    token?: string;
    user?: any;
  };
  message?: string;
  error?: string;
}

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  login(email: string, password: string): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success && response.data && response.data.token && response.data.user) {
            this.storeToken(response.data.token);

            const user: Utilisateur = {
              id: response.data.user.id,
              nom: response.data.user.nom,
              prenom: response.data.user.prenom,
              email: response.data.user.email,
              telephone: response.data.user.telephone || '',
              role: response.data.user.role,
              role_libelle: response.data.user.role_libelle || response.data.user.role,
              actif: true
            };

            this.storeUser(user);
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('sofima_token');
    localStorage.removeItem('sofima_user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Utilisateur | null {
    const userJson = localStorage.getItem('sofima_user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('sofima_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isTechnicien(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'technicien';
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  changePassword(payload: ChangePasswordPayload): Observable<ApiResponse> {
    const headers = new HttpHeaders({
      'X-Silent-Error': 'true'//pour éviter l’alerte globale automatique
    });
    return this.http.post<ApiResponse>(`${this.apiUrl}/auth/change-password`, payload, { headers });
  }

  updateCurrentUserLocal(partial: Partial<Utilisateur>): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...partial };
    this.storeUser(updatedUser);
    this.currentUserSubject.next(updatedUser);
  }

  private storeToken(token: string): void {
    localStorage.setItem('sofima_token', token);
  }

  private storeUser(user: Utilisateur): void {
    localStorage.setItem('sofima_user', JSON.stringify(user));
  }

  private getStoredUser(): Utilisateur | null {
    const userJson = localStorage.getItem('sofima_user');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
