// src/app/core/services/utilisateur.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/utilisateur.model';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/utilisateurs`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erreur lors de la récupération des utilisateurs');
        }
        return response.data.map((u) => this.mapUser(u));
      })
    );
  }

  getById(id: number): Observable<Utilisateur> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/utilisateurs/${id}`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Utilisateur non trouvé');
        }
        return this.mapUser(response.data);
      })
    );
  }

  create(utilisateur: any): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/utilisateurs`, utilisateur).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors de la création');
        }
        return response.data || response.message;
      })
    );
  }

  update(id: number, utilisateur: any): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/utilisateurs/${id}`, utilisateur).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors de la mise à jour');
        }
        return response.data || response.message;
      })
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/utilisateurs/${id}`).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.error || 'Erreur lors de la suppression');
        }
        return response.data || response.message;
      })
    );
  }

  getTechniciens(): Observable<Utilisateur[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/utilisateurs/techniciens`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erreur lors de la récupération des techniciens');
        }
        return response.data.map((u) => ({
          id: u.id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone ?? '',
          role: 'technicien',
          role_libelle: 'Technicien',
          actif: true
        } as Utilisateur));
      })
    );
  }

  getRoles(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/utilisateurs/roles`).pipe(
      map((response) => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erreur lors de la récupération des rôles');
        }
        return response.data;
      })
    );
  }

  private mapUser(u: any): Utilisateur {
    return {
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone ?? '',
      role: u.role_code,
      role_libelle: u.role_libelle ?? u.role_code,
      actif: !!u.actif,
      created_at: u.created_at,
      updated_at: u.updated_at
    } as Utilisateur;
  }
}
