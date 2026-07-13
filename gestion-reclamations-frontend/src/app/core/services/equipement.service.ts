import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipement } from '../models/equipement.model';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class EquipementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Equipement[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/equipements`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data as Equipement[];
          }
          throw new Error(response.error || 'Erreur lors de la récupération des équipements');
        })
      );
  }

  getById(id: number): Observable<Equipement> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/equipements/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data as Equipement;
          }
          throw new Error(response.error || 'Équipement non trouvé');
        })
      );
  }

  create(equipement: any): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/equipements`, equipement)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.error || 'Erreur lors de la création');
        })
      );
  }

  update(id: number, equipement: any): Observable<any> {
    return this.http.put<ApiResponse>(`${this.apiUrl}/equipements/${id}`, equipement)
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
    return this.http.delete<ApiResponse>(`${this.apiUrl}/equipements/${id}`)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message || 'Suppression réussie';
          }
          throw new Error(response.error || 'Erreur lors de la suppression');
        })
      );
  }



  getAteliers(): Observable<string[]> {
    return this.getAll().pipe(
      map(equipements => {
        const ateliers = new Set<string>();
        equipements.forEach(e => {
          if (e.atelier) {
            ateliers.add(e.atelier);
          }
        });
        return Array.from(ateliers).sort();
      })
    );
  }

  getCategories(): Observable<string[]> {
    return this.getAll().pipe(
      map(equipements => {
        const categories = new Set<string>();
        equipements.forEach(e => {
          if (e.categorie) {
            categories.add(e.categorie);
          }
        });
        return Array.from(categories).sort();
      })
    );
  }

  getLignesProduction(): Observable<string[]> {
    return this.getAll().pipe(
      map(equipements => {
        const lignes = new Set<string>();
        equipements.forEach(e => {
          if (e.ligne_production) {
            lignes.add(e.ligne_production);
          }
        });
        return Array.from(lignes).sort();
      })
    );
  }
}
