import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reclamation } from '../models/reclamation.model';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ReclamationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(filters?: any): Observable<Reclamation[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.append(key, filters[key]);
        }
      });
    }

    return this.http.get<ApiResponse>(`${this.apiUrl}/reclamations`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data as Reclamation[];
          }
          throw new Error(response.error || 'Erreur lors de la récupération des réclamations');
        })
      );
  }

  getById(id: number): Observable<Reclamation> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/reclamations/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data as Reclamation;
          }
          throw new Error(response.error || 'Réclamation non trouvée');
        })
      );
  }

  create(reclamation: any): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reclamations`, reclamation)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Erreur lors de la création');
        })
      );
  }

  update(id: number, reclamation: any): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/reclamations/${id}`, reclamation)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data || response.message;
          }
          throw new Error(response.error || 'Erreur lors de la mise à jour');
        })
      );
  }

  delete(id: number): Observable<any> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/reclamations/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message || 'Suppression réussie';
          }
          throw new Error(response.error || 'Erreur lors de la suppression');
        })
      );
  }

  getStats(): Observable<any> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/stats/reclamations`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Erreur lors de la récupération des statistiques');
        })
      );
  }

  getRecentes(limit: number = 10): Observable<Reclamation[]> {
    return this.getAll().pipe(
      map(reclamations => {
        return reclamations
          .sort((a, b) => new Date(b.date_reclamation).getTime() - new Date(a.date_reclamation).getTime())
          .slice(0, limit);
      })
    );
  }
}
