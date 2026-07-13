import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 401:
            // Ne pas rediriger immédiatement vers login pour les requêtes de login
            if (!req.url.includes('/auth/login')) {
              errorMessage = 'Session expirée. Veuillez vous reconnecter.';
              authService.logout();
              router.navigate(['/auth/login']);
            } else {
              errorMessage = 'Email ou mot de passe incorrect';
            }
            break;
          case 403:
            errorMessage = 'Accès non autorisé';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 500:
            errorMessage = 'Erreur serveur';
            break;
          default:
            errorMessage = error.error?.message || error.error?.error || 'Erreur inconnue';
        }
      }

      const silentError = req.headers.get('X-Silent-Error') === 'true';

      if (silentError) {
        return throwError(() => error);
      }

      
      // Ne pas afficher d'alerte globale quand la requête gère ses erreurs localement
      if (!silentError && !(error.status === 401 && req.url.includes('/auth/login'))) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
          confirmButtonColor: '#dc3545'
        });
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
