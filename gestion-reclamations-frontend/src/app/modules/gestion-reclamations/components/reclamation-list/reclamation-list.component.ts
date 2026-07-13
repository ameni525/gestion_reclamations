import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Reclamation } from '../../../../core/models/reclamation.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reclamation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="reclamation-list">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">
            <i class="bi bi-clipboard-check me-2 text-primary"></i>
            Gestion des Réclamations
          </h2>
          <p class="text-muted mb-0">Liste et suivi des réclamations clients</p>
        </div>
        <button class="btn btn-primary" routerLink="/reclamations/nouvelle">
          <i class="bi bi-plus-circle me-2"></i>Nouvelle Réclamation
        </button>
      </div>

      <!-- Filtres -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Statut</label>
              <select class="form-select" [(ngModel)]="filters.statut" (change)="applyFilters()">
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="en_cours">En cours</option>
                <option value="traitee">Traitée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Priorité</label>
              <select class="form-select" [(ngModel)]="filters.priorite" (change)="applyFilters()">
                <option value="">Toutes les priorités</option>
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Recherche</label>
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Numéro, description..."
                       [(ngModel)]="filters.search" (input)="applyFilters()">
                <button class="btn btn-outline-secondary" type="button" (click)="clearFilters()">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-outline-secondary w-100" (click)="refresh()">
                <i class="bi bi-arrow-clockwise"></i> Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Total affiché</div>
              <div class="h4 mb-0">{{ filteredReclamations.length }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Urgentes</div>
              <div class="h4 mb-0 text-danger">{{ getCountByPriorite('urgente') }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">En attente</div>
              <div class="h4 mb-0 text-warning">{{ getCountByStatut('en_attente') }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small">Traitées</div>
              <div class="h4 mb-0 text-success">{{ getCountByStatut('traitee') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des réclamations -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>N° Réclamation</th>
                  <th>Équipement</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reclamation of filteredReclamations">
                  <td class="fw-bold">
                    <span class="badge bg-light text-dark">{{ reclamation.numero }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-tools me-2 text-muted"></i>
                      <span>{{ reclamation.equipement_nom }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 200px;">
                      {{ reclamation.description }}
                    </div>
                  </td>
                  <td>{{ reclamation.date_reclamation | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <span [class]="'badge bg-' + getStatutColor(reclamation.statut)">
                      {{ getStatutLabel(reclamation.statut) }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + getPrioriteColor(reclamation.priorite)">
                      {{ getPrioriteLabel(reclamation.priorite) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary"
                              [routerLink]="['/reclamations', reclamation.id]">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning"
                              [routerLink]="['/reclamations/edit', reclamation.id]"
                              *ngIf="isAdmin">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger"
                              (click)="deleteReclamation(reclamation)"
                              *ngIf="isAdmin">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredReclamations.length === 0">
                  <td colspan="7" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                    Aucune réclamation trouvée
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div class="text-muted">
            {{ filteredReclamations.length }} réclamation(s) trouvée(s)
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary"
                    [disabled]="filteredReclamations.length === 0"
                    (click)="printList()">
              <i class="bi bi-printer"></i> Imprimer
            </button>
            <button class="btn btn-sm btn-outline-secondary"
                    [disabled]="filteredReclamations.length === 0"
                    (click)="openExportMenu()">
              <i class="bi bi-download"></i> Exporter
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .badge {
      font-size: 0.8em;
      padding: 0.4em 0.8em;
    }
  `]
})
export class ReclamationListComponent implements OnInit {
  private reclamationService = inject(ReclamationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];

  filters = {
    statut: '',
    priorite: '',
    search: ''
  };

  isAdmin = this.authService.isAdmin();

  ngOnInit() {
    this.loadReclamations();
  }

  loadReclamations() {
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.filteredReclamations = [...data];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réclamations:', error);
      }
    });
  }

  applyFilters() {
    this.filteredReclamations = this.reclamations.filter(reclamation => {
      const matchesStatut = !this.filters.statut || reclamation.statut === this.filters.statut;
      const matchesPriorite = !this.filters.priorite || reclamation.priorite === this.filters.priorite;
      const matchesSearch = !this.filters.search ||
        reclamation.numero.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        reclamation.description.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        (reclamation.equipement_nom && reclamation.equipement_nom.toLowerCase().includes(this.filters.search.toLowerCase()));

      return matchesStatut && matchesPriorite && matchesSearch;
    });
  }

  clearFilters() {
    this.filters = { statut: '', priorite: '', search: '' };
    this.filteredReclamations = [...this.reclamations];
  }

  refresh() {
    this.loadReclamations();
  }

  deleteReclamation(reclamation: Reclamation) {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer la réclamation ${reclamation.numero} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reclamationService.delete(reclamation.id).subscribe({
          next: () => {
            Swal.fire(
              'Supprimé!',
              'La réclamation a été supprimée.',
              'success'
            );
            this.loadReclamations();
          },
          error: (error) => {
            Swal.fire(
              'Erreur!',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
          }
        });
      }
    });
  }

  printList() {
    if (this.filteredReclamations.length === 0) return;

    const rows = this.filteredReclamations.map((reclamation) => `
      <tr>
        <td>${this.escapeHtml(reclamation.numero || '')}</td>
        <td>${this.escapeHtml(reclamation.equipement_nom || '-')}</td>
        <td>${this.escapeHtml(reclamation.description || '-')}</td>
        <td>${this.escapeHtml(this.formatDate(reclamation.date_reclamation))}</td>
        <td>${this.escapeHtml(this.getStatutLabel(reclamation.statut || ''))}</td>
        <td>${this.escapeHtml(this.getPrioriteLabel(reclamation.priorite || ''))}</td>
      </tr>
    `).join('');

    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) {
      Swal.fire('Impossible', 'Le navigateur a bloqué la fenêtre d\'impression.', 'warning');
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Liste des réclamations</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { margin-bottom: 4px; }
            p { color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .meta { margin-top: 14px; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>SOFIMA - Réclamations</h1>
          <p>État filtré de la liste</p>
          <table>
            <thead>
              <tr>
                <th>N° Réclamation</th>
                <th>Équipement</th>
                <th>Description</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Priorité</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="meta">
            Généré le ${new Date().toLocaleString('fr-FR')} - ${this.filteredReclamations.length} ligne(s)
          </div>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  exportPdf() {
    if (this.filteredReclamations.length === 0) return;

    const lines = this.buildPdfLines();
    this.downloadSimplePdf(lines, `reclamations_${new Date().toISOString().slice(0, 10)}.pdf`);
    Swal.fire('Export terminé', 'Le fichier PDF a été téléchargé.', 'success');
  }

  exportExcel() {
    if (this.filteredReclamations.length === 0) return;

    const escapeXml = (value: string) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const headers = ['Numero', 'Equipement', 'Description', 'Date', 'Statut', 'Priorite'];
    const rows = this.filteredReclamations.map((reclamation) => ([
      reclamation.numero || '',
      reclamation.equipement_nom || '',
      reclamation.description || '',
      this.formatDate(reclamation.date_reclamation),
      this.getStatutLabel(reclamation.statut || ''),
      this.getPrioriteLabel(reclamation.priorite || '')
    ]));

    const headerXml = `<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}</Row>`;
    const rowsXml = rows.map((row) =>
      `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(String(cell))}</Data></Cell>`).join('')}</Row>`
    ).join('');

    const workbookXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Reclamations">
  <Table>
   ${headerXml}
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `reclamations_${now}.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  openExportMenu() {
    Swal.fire({
      title: 'Exporter la liste',
      text: 'Choisissez le format d’export',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'PDF',
      denyButtonText: 'Excel',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#0d6efd',
      denyButtonColor: '#198754'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exportPdf();
      } else if (result.isDenied) {
        this.exportExcel();
      }
    });
  }

  private buildPdfLines(): string[] {
    const lines: string[] = [];
    lines.push('SOFIMA - EXPORT RECLAMATIONS');
    lines.push(`Genere le ${new Date().toLocaleString('fr-FR')}`);
    lines.push(`Nombre de lignes: ${this.filteredReclamations.length}`);
    lines.push('');
    lines.push(this.padRight('Numero', 18) + this.padRight('Equipement', 24) + this.padRight('Date', 14) + this.padRight('Statut', 14) + 'Priorite');
    lines.push('-'.repeat(78));

    this.filteredReclamations.forEach((reclamation) => {
      lines.push(
        this.padRight(this.truncateText(reclamation.numero || '-', 17), 18) +
        this.padRight(this.truncateText(reclamation.equipement_nom || '-', 23), 24) +
        this.padRight(this.formatDate(reclamation.date_reclamation), 14) +
        this.padRight(this.truncateText(this.getStatutLabel(reclamation.statut || ''), 13), 14) +
        this.truncateText(this.getPrioriteLabel(reclamation.priorite || ''), 12)
      );

      const description = this.truncateText((reclamation.description || '-').replace(/\s+/g, ' ').trim(), 72);
      lines.push('  Description: ' + description);
      lines.push('');
    });

    return lines;
  }

  private downloadSimplePdf(lines: string[], filename: string) {
    const pageWidth = 595;
    const pageHeight = 842;
    const marginLeft = 40;
    const marginTop = 40;
    const lineHeight = 14;
    const maxLinesPerPage = Math.floor((pageHeight - marginTop * 2) / lineHeight);

    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += maxLinesPerPage) {
      pages.push(lines.slice(i, i + maxLinesPerPage));
    }

    const objects: string[] = [];

    const addObject = (content: string): number => {
      objects.push(content);
      return objects.length;
    };

    const fontObjectId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    const contentObjectIds: number[] = [];
    const pageObjectIds: number[] = [];

    pages.forEach((pageLines) => {
      const escapedLines = pageLines.map((line) =>
        this.toAscii(line).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
      );

      const contentStream = [
        'BT',
        '/F1 10 Tf',
        `${lineHeight} TL`,
        `1 0 0 1 ${marginLeft} ${pageHeight - marginTop} Tm`,
        ...escapedLines.map((line) => `(${line}) Tj T*`),
        'ET'
      ].join('\n');

      const contentObjectId = addObject(
        `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
      );
      contentObjectIds.push(contentObjectId);

      const pageObjectId = addObject(
        `<< /Type /Page /Parent 0 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`
      );
      pageObjectIds.push(pageObjectId);
    });

    const pagesObjectId = addObject(
      `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`
    );

    pageObjectIds.forEach((pageId, index) => {
      objects[pageId - 1] = objects[pageId - 1].replace('/Parent 0 0 R', `/Parent ${pagesObjectId} 0 R`);
    });

    const catalogObjectId = addObject(`<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`);

    const pdfParts: string[] = ['%PDF-1.4'];
    const offsets: number[] = [0];

    objects.forEach((obj, index) => {
      offsets.push(pdfParts.join('\n').length + 1);
      pdfParts.push(`${index + 1} 0 obj\n${obj}\nendobj`);
    });

    const xrefPosition = pdfParts.join('\n').length + 1;
    pdfParts.push(`xref\n0 ${objects.length + 1}`);
    pdfParts.push('0000000000 65535 f ');
    for (let i = 1; i <= objects.length; i++) {
      pdfParts.push(`${String(offsets[i]).padStart(10, '0')} 00000 n `);
    }
    pdfParts.push(
      `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`
    );

    const blob = new Blob([pdfParts.join('\n')], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private toAscii(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '');
  }

  private truncateText(value: string, max: number): string {
    return value.length > max ? value.slice(0, max - 1) + '…' : value;
  }

  private padRight(value: string, width: number): string {
    return value.length >= width ? value : value + ' '.repeat(width - value.length);
  }

  private formatDate(value: string | Date | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getCountByStatut(statut: string): number {
    return this.filteredReclamations.filter((reclamation) => reclamation.statut === statut).length;
  }

  getCountByPriorite(priorite: string): number {
    return this.filteredReclamations.filter((reclamation) => reclamation.priorite === priorite).length;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'traitee': 'Traitée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const colors: Record<string, string> = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'traitee': 'success',
      'annulee': 'danger'
    };
    return colors[statut] || 'secondary';
  }

  getPrioriteLabel(priorite: string): string {
    const labels: Record<string, string> = {
      'basse': 'Basse',
      'moyenne': 'Moyenne',
      'haute': 'Haute',
      'urgente': 'Urgente'
    };
    return labels[priorite] || priorite;
  }

  getPrioriteColor(priorite: string): string {
    const colors: Record<string, string> = {
      'basse': 'secondary',
      'moyenne': 'primary',
      'haute': 'warning',
      'urgente': 'danger'
    };
    return colors[priorite] || 'secondary';
  }
}
