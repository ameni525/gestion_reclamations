import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-page">
      <section class="hero">
        <div>
          <h2>Tableau de Bord Statistiques</h2>
          <p>Vision claire des réclamations, priorités et évolution mensuelle.</p>
        </div>
        <div class="hero-actions">
          <div class="hero-date">Mise à jour: {{ lastUpdate }}</div>
          <button class="btn-export" (click)="downloadStatsPng()">
            <i class="bi bi-image me-2"></i>Télécharger PNG
          </button>
        </div>
      </section>

      <section class="kpi-grid">
        <article class="kpi-card kpi-total">
          <div class="kpi-label">Total réclamations</div>
          <div class="kpi-value">{{ summary.total }}</div>
        </article>
        <article class="kpi-card kpi-open">
          <div class="kpi-label">Ouvertes</div>
          <div class="kpi-value">{{ summary.open }}</div>
        </article>
        <article class="kpi-card kpi-done">
          <div class="kpi-label">Traitées</div>
          <div class="kpi-value">{{ summary.traitee }}</div>
        </article>
        <article class="kpi-card kpi-urgent">
          <div class="kpi-label">Urgentes</div>
          <div class="kpi-value">{{ summary.urgente }}</div>
        </article>
      </section>

      <section class="charts-grid">
        <div class="chart-card">
          <div class="chart-head">
            <h5>Réclamations par statut</h5>
            <small>Répartition actuelle</small>
          </div>
          <canvas id="statutChart"></canvas>
        </div>

        <div class="chart-card">
          <div class="chart-head">
            <h5>Réclamations par priorité</h5>
            <small>Niveau de criticité</small>
          </div>
          <canvas id="prioriteChart"></canvas>
        </div>

        <div class="chart-card chart-card-wide">
          <div class="chart-head">
            <h5>Évolution mensuelle</h5>
            <small>{{ evolutionSubTitle }}</small>
          </div>
          <canvas id="evolutionChart"></canvas>
        </div>

        <div class="chart-card chart-card-wide">
          <div class="chart-head">
            <h5>Réclamations par atelier</h5>
            <small>Zones les plus sollicitées</small>
          </div>
          <canvas id="atelierChart"></canvas>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .stats-page {
      --bg1: #f5f9ff;
      --bg2: #e8f3ff;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --primary: #0d6efd;
      --accent: #00a86b;
      padding: 1.25rem;
      background: linear-gradient(135deg, var(--bg1), var(--bg2));
      border-radius: 16px;
      color: var(--text);
    }

    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      background: linear-gradient(90deg, #0b5ed7, #198754);
      color: #fff;
    }

    .hero h2 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
    }

    .hero p {
      margin: 0.35rem 0 0;
      opacity: 0.9;
      font-size: 0.95rem;
    }

    .hero-date {
      font-size: 0.9rem;
      opacity: 0.9;
      white-space: nowrap;
    }

    .hero-actions {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      align-items: flex-end;
    }

    .btn-export {
      border: 1px solid rgba(255,255,255,0.6);
      background: rgba(255,255,255,0.12);
      color: #fff;
      border-radius: 8px;
      padding: 0.38rem 0.72rem;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }

    .btn-export:hover {
      background: rgba(255,255,255,0.2);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.85rem;
      margin-bottom: 1rem;
    }

    .kpi-card {
      background: var(--card);
      border-radius: 12px;
      padding: 0.9rem 1rem;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
      border-left: 5px solid transparent;
    }

    .kpi-total { border-left-color: #0d6efd; }
    .kpi-open { border-left-color: #fd7e14; }
    .kpi-done { border-left-color: #198754; }
    .kpi-urgent { border-left-color: #dc3545; }

    .kpi-label {
      color: var(--muted);
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    .kpi-value {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .chart-card {
      background: var(--card);
      border-radius: 12px;
      padding: 0.9rem 1rem;
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
      min-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .chart-card-wide {
      grid-column: span 2;
      min-height: 340px;
    }

    .chart-head {
      margin-bottom: 0.7rem;
    }

    .chart-head h5 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
    }

    .chart-head small {
      color: #64748b;
    }

    canvas {
      width: 100% !important;
      height: 250px !important;
    }

    .chart-card-wide canvas {
      height: 280px !important;
    }

    @media (max-width: 992px) {
      .kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .charts-grid {
        grid-template-columns: 1fr;
      }
      .chart-card-wide {
        grid-column: span 1;
      }
    }

    @media (max-width: 576px) {
      .hero {
        flex-direction: column;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatsComponent implements OnInit, OnDestroy {
  private reclamationService = inject(ReclamationService);
  private charts: Chart[] = [];

  summary = {
    total: 0,
    open: 0,
    traitee: 0,
    urgente: 0
  };

  lastUpdate = '';
  evolutionSubTitle = 'Tendance des 12 derniers mois';

  ngOnInit() {
    Chart.register(...registerables);
    this.lastUpdate = new Date().toLocaleString('fr-FR');
    this.loadStats();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  loadStats() {
    this.reclamationService.getStats().subscribe({
      next: (data) => {
        this.buildSummary(data);
        this.createCharts(data);
      }
    });
  }

  private buildSummary(stats: any) {
    const statutMap = this.toCountMap(stats.par_statut || [], 'statut');
    const prioriteMap = this.toCountMap(stats.par_priorite || [], 'priorite');

    this.summary.total = Number(stats.total || 0);
    this.summary.open = Number(statutMap['en_attente'] || 0) + Number(statutMap['en_cours'] || 0);
    this.summary.traitee = Number(statutMap['traitee'] || 0);
    this.summary.urgente = Number(prioriteMap['urgente'] || 0);

    const evolution = stats.evolution_mensuelle || [];
    if (evolution.length >= 2) {
      const last = Number(evolution[evolution.length - 1].count || 0);
      const prev = Number(evolution[evolution.length - 2].count || 0);
      const delta = last - prev;
      if (delta > 0) {
        this.evolutionSubTitle = `Hausse de ${delta} vs mois précédent`;
      } else if (delta < 0) {
        this.evolutionSubTitle = `Baisse de ${Math.abs(delta)} vs mois précédent`;
      } else {
        this.evolutionSubTitle = 'Stable vs mois précédent';
      }
    }
  }

  private createCharts(stats: any) {
    this.destroyCharts();

    const statutData = stats.par_statut || [];
    const prioriteData = stats.par_priorite || [];
    const evolutionData = stats.evolution_mensuelle || [];
    const atelierData = stats.par_atelier || [];

    const statutCtx = document.getElementById('statutChart') as HTMLCanvasElement;
    if (statutCtx) {
      const chart = new Chart(statutCtx, {
        type: 'doughnut',
        data: {
          labels: statutData.map((s: any) => this.getStatutLabel(s.statut)),
          datasets: [{
            data: statutData.map((s: any) => Number(s.count || 0)),
            backgroundColor: ['#f59e0b', '#38bdf8', '#22c55e', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          cutout: '62%'
        }
      });
      this.charts.push(chart);
    }

    const prioriteCtx = document.getElementById('prioriteChart') as HTMLCanvasElement;
    if (prioriteCtx) {
      const chart = new Chart(prioriteCtx, {
        type: 'bar',
        data: {
          labels: prioriteData.map((p: any) => this.getPrioriteLabel(p.priorite)),
          datasets: [{
            label: 'Nombre',
            data: prioriteData.map((p: any) => Number(p.count || 0)),
            backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#ef4444'],
            borderRadius: 8
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }
      });
      this.charts.push(chart);
    }

    const evolutionCtx = document.getElementById('evolutionChart') as HTMLCanvasElement;
    if (evolutionCtx) {
      const gradient = evolutionCtx.getContext('2d')?.createLinearGradient(0, 0, 0, 280);
      if (gradient) {
        gradient.addColorStop(0, 'rgba(13, 110, 253, 0.35)');
        gradient.addColorStop(1, 'rgba(13, 110, 253, 0.02)');
      }

      const chart = new Chart(evolutionCtx, {
        type: 'line',
        data: {
          labels: evolutionData.map((e: any) => this.getMonthLabel(Number(e.mois), Number(e.annee))),
          datasets: [{
            label: 'Réclamations',
            data: evolutionData.map((e: any) => Number(e.count || 0)),
            borderColor: '#0d6efd',
            backgroundColor: gradient || 'rgba(13, 110, 253, 0.2)',
            fill: true,
            tension: 0.42,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#0d6efd',
            pointBorderWidth: 2
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: 'rgba(148, 163, 184, 0.25)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
      this.charts.push(chart);
    }

    const atelierCtx = document.getElementById('atelierChart') as HTMLCanvasElement;
    if (atelierCtx) {
      const chart = new Chart(atelierCtx, {
        type: 'bar',
        data: {
          labels: atelierData.map((a: any) => a.atelier || 'Non défini'),
          datasets: [{
            label: 'Réclamations',
            data: atelierData.map((a: any) => Number(a.count || 0)),
            backgroundColor: '#198754',
            borderRadius: 8
          }]
        },
        options: {
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { precision: 0 }
            },
            y: {
              grid: { display: false }
            }
          }
        }
      });
      this.charts.push(chart);
    }
  }

  private destroyCharts() {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }

  private toCountMap(items: any[], key: string): Record<string, number> {
    return items.reduce((acc: Record<string, number>, item: any) => {
      acc[item[key]] = Number(item.count || 0);
      return acc;
    }, {});
  }

  private getMonthLabel(month: number, year: number): string {
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[(month || 1) - 1]} ${year}`;
  }

  private getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      en_attente: 'En attente',
      en_cours: 'En cours',
      traitee: 'Traitée',
      annulee: 'Annulée'
    };
    return labels[statut] || statut;
  }

  private getPrioriteLabel(priorite: string): string {
    const labels: Record<string, string> = {
      basse: 'Basse',
      moyenne: 'Moyenne',
      haute: 'Haute',
      urgente: 'Urgente'
    };
    return labels[priorite] || priorite;
  }

  downloadStatsPng() {
    const statCanvas = document.getElementById('statutChart') as HTMLCanvasElement | null;
    const prioCanvas = document.getElementById('prioriteChart') as HTMLCanvasElement | null;
    const evoCanvas = document.getElementById('evolutionChart') as HTMLCanvasElement | null;
    const atelierCanvas = document.getElementById('atelierChart') as HTMLCanvasElement | null;

    if (!statCanvas || !prioCanvas || !evoCanvas || !atelierCanvas) {
      Swal.fire('Erreur', 'Graphiques indisponibles pour l’export.', 'error');
      return;
    }

    const width = 1600;
    const height = 1200;
    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const ctx = out.getContext('2d');
    if (!ctx) {
      Swal.fire('Erreur', 'Impossible de générer l’image.', 'error');
      return;
    }

    const drawCard = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#dbeafe';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    };

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f5f9ff');
    gradient.addColorStop(1, '#e8f3ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0b5ed7';
    ctx.fillRect(40, 24, width - 80, 110);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('Tableau de Bord Statistiques', 70, 70);
    ctx.font = '24px Arial';
    ctx.fillText(`Mise a jour: ${this.lastUpdate}`, 70, 110);

    const kpiY = 160;
    const kpiW = (width - 40 * 2 - 20 * 3) / 4;
    const kpiH = 110;
    const kpis = [
      { title: 'Total reclamations', value: String(this.summary.total), color: '#0d6efd' },
      { title: 'Ouvertes', value: String(this.summary.open), color: '#fd7e14' },
      { title: 'Traitees', value: String(this.summary.traitee), color: '#198754' },
      { title: 'Urgentes', value: String(this.summary.urgente), color: '#dc3545' }
    ];
    kpis.forEach((kpi, i) => {
      const x = 40 + i * (kpiW + 20);
      drawCard(x, kpiY, kpiW, kpiH);
      ctx.fillStyle = kpi.color;
      ctx.fillRect(x, kpiY, 8, kpiH);
      ctx.fillStyle = '#64748b';
      ctx.font = '22px Arial';
      ctx.fillText(kpi.title, x + 20, kpiY + 40);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px Arial';
      ctx.fillText(kpi.value, x + 20, kpiY + 88);
    });

    const topChartsY = 300;
    const chartW = (width - 40 * 2 - 20) / 2;
    const chartH = 340;
    drawCard(40, topChartsY, chartW, chartH);
    drawCard(60 + chartW, topChartsY, chartW, chartH);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Reclamations par statut', 60, topChartsY + 34);
    ctx.fillText('Reclamations par priorite', 80 + chartW, topChartsY + 34);
    ctx.drawImage(statCanvas, 60, topChartsY + 50, chartW - 40, chartH - 70);
    ctx.drawImage(prioCanvas, 80 + chartW, topChartsY + 50, chartW - 40, chartH - 70);

    const bottomY = 670;
    const bottomH = 490;
    drawCard(40, bottomY, chartW, bottomH);
    drawCard(60 + chartW, bottomY, chartW, bottomH);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Evolution mensuelle', 60, bottomY + 34);
    ctx.fillText('Reclamations par atelier', 80 + chartW, bottomY + 34);
    ctx.drawImage(evoCanvas, 60, bottomY + 50, chartW - 40, bottomH - 70);
    ctx.drawImage(atelierCanvas, 80 + chartW, bottomY + 50, chartW - 40, bottomH - 70);

    const link = document.createElement('a');
    link.href = out.toDataURL('image/png');
    link.download = `statistiques_${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    Swal.fire('Succès', 'Image PNG téléchargée.', 'success');
  }
}
