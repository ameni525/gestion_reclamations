
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, format: string = 'dd/MM/yyyy'): string {
    if (!value || value === 'null' || value === 'undefined') return 'Non défini';

    const date = new Date(value);

    if (isNaN(date.getTime())) return value;

    switch (format) {
      case 'dd/MM/yyyy':
        return date.toLocaleDateString('fr-FR');
      case 'dd/MM/yyyy HH:mm':
        return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      case 'relative':
        return this.getRelativeTime(date);
      default:
        return date.toLocaleDateString('fr-FR');
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'à l\'instant';
    if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
    return date.toLocaleDateString('fr-FR');
  }
}
