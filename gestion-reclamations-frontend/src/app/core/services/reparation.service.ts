// src/app/core/services/reparation.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reparation } from '../models/reparation.model';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ReparationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(filters?: any): Observable<Reparation[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.append(key, filters[key]);
        }
      });
    }

    return this.http.get<ApiResponse>(`${this.apiUrl}/reparations`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data as Reparation[];
          }
          throw new Error(response.error || 'Erreur lors de la récupération des reparations');
        })
      );

  }

  getById(id: number): Observable<Reparation> {
    return this.getAll().pipe(
      map((reparations) => {
        const reparation = reparations.find((r) => r.id === +id);
        if (!reparation) {
          throw new Error('Réparation non trouvée');
        }
        return reparation;
      })
    );
  }

  create(reparation: any): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reparations`, reparation)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Erreur lors de la création');
        })
      );
  }

  update(id: number, reparation: any): Observable<any> {
    return throwError(() => new Error('Mise à jour réparation non disponible dans le backend actuel.'));
  }

  delete(id: number): Observable<any> {
    return throwError(() => new Error('Suppression réparation non disponible dans le backend actuel.'));
  }

  getByReclamation(reclamationId: number): Observable<Reparation[]> {
    return this.getAll({ reclamation_id: reclamationId });
  }
}
