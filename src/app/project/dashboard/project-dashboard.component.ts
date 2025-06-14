import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  Project,
  GenerationRun,
  GenerationStatus,
  TestCaseReviewStatus,
} from '../shared/project.models';
import { Chart, registerables } from 'chart.js';
import { TestFilterService } from '../shared/test-filter.service';
import { HttpClient } from '@angular/common/http';

// Регистрируем все компоненты Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDashboardComponent implements AfterViewInit {
  @Input() project!: Project;

  @Output() startGeneration = new EventEmitter<void>();
  @Output() manageInputs = new EventEmitter<void>();
  @Output() viewTestCases = new EventEmitter<void>();

  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  statusChart: any;

  // Mock data for demonstration
  generationRuns: GenerationRun[] = [
    {
      id: 'run-001',
      timestamp: new Date('2025-06-05T11:30:00'),
      status: GenerationStatus.Completed,
      duration: '3m 45s',
      testCasesCount: 1,
      configuration: '', // добавлено
    },
    {
      id: 'run-002',
      timestamp: new Date('2025-06-05T11:42:00'),
      status: GenerationStatus.Completed,
      duration: '4m 20s',
      testCasesCount: 1,
      configuration: '', // добавлено
    },
    {
      id: 'run-003',
      timestamp: new Date('2025-06-05T11:45:00'),
      status: GenerationStatus.Failed,
      duration: '2m 10s',
      testCasesCount: 0,
      configuration: '', // добавлено
    },
  ];

  // Мок-данные для тест-кейсов
  testCaseStatusData = {
    New: 1,
    Reviewed: 1,
    NeedsRevision: 1,
  };

  // Getter для подсчета общего количества тест-кейсов
  get totalTestCases(): number {
    return this.generationRuns.reduce(
      (total, run) =>
        total +
        (run.status === GenerationStatus.Completed ? run.testCasesCount : 0),
      0
    );
  }

  getTestCaseCountByStatus(status: string): number {
    return (
      this.testCaseStatusData[status as keyof typeof this.testCaseStatusData] ||
      0
    );
  }

  constructor(
    private router: Router,
    private filterService: TestFilterService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.initStatusChart();
  }

  initStatusChart() {
    if (this.statusChartRef) {
      const ctx = this.statusChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.statusChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['New', 'Reviewed', 'Needs Revision'],
            datasets: [
              {
                label: 'Test Cases',
                data: [
                  this.testCaseStatusData.New,
                  this.testCaseStatusData.Reviewed,
                  this.testCaseStatusData.NeedsRevision,
                ],
                backgroundColor: [
                  '#2196F3', // Синий
                  '#4CAF50', // Зеленый
                  '#FFC107', // Желтый
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    }
  }

  // При клике переходим на вкладку Generate
  onStartNewGeneration(): void {
    this.router.navigate(['/project', this.project.id], {
      queryParams: { tab: 'generate' },
    });
  }

  // При клике переходим на вкладку Generate (управление Inputs)
  onManageInputs(): void {
    this.router.navigate(['/project', this.project.id], {
      queryParams: { tab: 'settings' },
    });
  }

  onViewAllTestCases(): void {
    this.router.navigate(['/project', this.project.id], {
      queryParams: { tab: 'test-cases' },
    });
  }

  viewGenerationResults(runId: string): void {
    // Устанавливаем фильтр через сервис
    this.filterService.setGenerationRunFilter(runId);

    // Решаем проблему с повторной навигацией
    const currentUrl = this.router.url;
    const targetUrl = '/project';

    // Если мы уже на странице проекта
    if (currentUrl.includes(targetUrl)) {
      // Сначала переходим на другой URL, затем обратно с параметрами
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/project'], {
          queryParams: { tab: 'test-cases', generationRun: runId },
        });
      });
    } else {
      // Обычная навигация, если мы на другой странице
      this.router.navigate(['/project'], {
        queryParams: { tab: 'test-cases', generationRun: runId },
      });
    }
  }

  loadGenerationHistory(): void {
    this.http
      .get<any[]>(`/api/generation-scopes/by-project/${this.project.id}`)
      .subscribe({
        next: (data: any[]) => {
          this.generationRuns = data.map((item: any) => ({
            id: item.id,
            timestamp: new Date(item.createdAt || item.timestamp),
            status: item.status,
            duration: item.duration || '',
            testCasesCount: item.testCasesCount || 0,
            configuration: item.configuration || '', // обязательно
          }));
          this.cdr.markForCheck();
        },
        error: (err: any) => console.error('Failed to load history', err),
      });
  }
}
