import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../shared/notification/notification.service';
import { Router } from '@angular/router';
import { TestFilterService } from '../shared/test-filter.service';
import {
  Project,
  GenerationRun,
  GenerationStatus,
} from '../shared/project.models';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-project-generate',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ConfirmDialogComponent],
  templateUrl: './project-generate.component.html',
  styleUrls: ['./project-generate.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectGenerateComponent implements OnInit, OnChanges {
  @Input() project!: Project;

  // Конфигурация генерации
  analyzeCode: boolean = true;
  useGit: boolean = false; // Новый переключатель для использования Git
  generationStrategy: string = 'balanced';
  selectedComponents: string[] = [];
  testCaseCount: number = 1; // Изменено с 5 на 1

  // Переменные для Git
  gitRepository: string = '';
  gitBranch: string = 'main';
  gitConnected: boolean = false;

  // Переменные для требований
  requirements: string = '';

  // Состояние компонентов
  componentsLoaded: boolean = false;
  availableComponents: any[] = [];

  // Generation runs
  generationRuns: GenerationRun[] = [];

  // для диалога
  showDialog = false;
  dialogMessage = '';
  dialogConfirm!: () => void;

  constructor(
    private notification: NotificationService,
    private router: Router,
    private filterService: TestFilterService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // сразу загрузить историю запуска
    this.loadGenerationHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.loadGenerationHistory();
    }
  }

  private loadGenerationHistory(): void {
    this.http
      .get<any[]>(`/api/generation-scopes/by-project/${this.project.id}`)
      .subscribe({
        next: (data) => {
          console.log('Loaded generation history:', data);
          this.generationRuns = data.map((item) => ({
            id: item.id,
            timestamp: new Date(item.createdAt || item.timestamp),
            status: item.status,
            duration: item.duration || '',
            testCasesCount: item.testCasesCount || 0,
            configuration: item.configuration || '',
          }));
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Failed to load history', err),
      });
  }

  selectStrategy(strategy: string) {
    this.generationStrategy = strategy;
  }

  loadComponents() {
    // Имитация загрузки компонентов с сервера
    setTimeout(() => {
      this.availableComponents = [
        {
          id: 'auth',
          name: 'Authentication',
          description: 'Login, registration, authorization components',
        },
        {
          id: 'api',
          name: 'API Endpoints',
          description: 'REST API controllers and endpoints',
        },
        {
          id: 'ui',
          name: 'User Interface',
          description: 'Front-end components and forms',
        },
        {
          id: 'db',
          name: 'Database Interaction',
          description: 'Data access and storage operations',
        },
        {
          id: 'util',
          name: 'Utilities',
          description: 'Helper classes and common functions',
        },
      ];
      this.componentsLoaded = true;
    }, 1000);
  }

  isComponentSelected(componentId: string): boolean {
    return this.selectedComponents.includes(componentId);
  }

  toggleComponent(componentId: string) {
    const index = this.selectedComponents.indexOf(componentId);
    if (index === -1) {
      this.selectedComponents.push(componentId);
    } else {
      this.selectedComponents.splice(index, 1);
    }
  }

  // Проверка корректности количества тест-кейсов
  get isTestCaseCountValid(): boolean {
    return this.testCaseCount >= 1 && this.testCaseCount <= 10;
  }

  startGeneration() {
    if (!this.requirements.trim() || !this.isTestCaseCountValid) {
      this.notification.error('Invalid generation parameters.');
      return;
    }
    const payload = {
      projectId: this.project.id,
      requirements: this.requirements,
      analyzeSourceCode: this.analyzeCode,
      testCasesCount: this.testCaseCount,
      aiStrategy: this.generationStrategy,
    };
    this.http.post<GenerationRun>('/api/generation-scopes', payload).subscribe({
      next: (run) => {
        console.log('Generation response:', run);
        // добавить новый запуск в начало истории
        this.generationRuns.unshift(run);
        this.cdr.markForCheck();
      },
      error: () => this.notification.error('Generation failed'),
    });
  }

  // Заменить переход на тест-кейс
  viewResults(runId: string) {
    console.log('View results clicked, runId =', runId);
    this.router.navigate(['/project/test-case', runId]);
  }

  cancelGeneration(runId: string) {
    // Logic to cancel generation
    this.notification.info(`Generation run ${runId} cancelled.`);
    // здесь могла бы быть реальная отмена
  }

  deleteRecord(runId: string) {
    this.dialogMessage = `Delete generation record ${runId}?`;
    this.dialogConfirm = () => {
      this.generationRuns = this.generationRuns.filter((r) => r.id !== runId);
      this.showDialog = false;
      this.notification.success(`Record ${runId} deleted.`);
    };
    this.showDialog = true;
  }

  // Методы для работы с Git-репозиторием
  connectToGit() {
    if (!this.gitRepository) {
      alert('Please enter a Git repository URL');
      return;
    }

    // Здесь была бы логика для соединения с Git
    setTimeout(() => {
      this.gitConnected = true;
    }, 1000);
  }

  disconnectGit() {
    this.gitConnected = false;
    this.gitRepository = '';
    this.gitBranch = 'main';
  }

  saveRequirements() {
    if (!this.requirements.trim()) {
      this.notification.error('Please enter requirements before saving.');
      return;
    }
    this.notification.success('Requirements saved successfully!');
  }

  // Обработчик загрузки файла требований
  uploadRequirementsFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.requirements = reader.result as string;
        this.notification.success('Requirements file uploaded successfully!');
      };
      reader.readAsText(file);
    }
  }
}
