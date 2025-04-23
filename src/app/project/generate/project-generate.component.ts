import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  Project,
  GenerationRun,
  GenerationStatus,
} from '../shared/project.models';

@Component({
  selector: 'app-project-generate',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './project-generate.component.html',
  styleUrls: ['./project-generate.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectGenerateComponent {
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
  generationRuns: GenerationRun[] = [
    {
      id: 'run-001',
      timestamp: new Date('2023-05-20T14:30:00'),
      status: GenerationStatus.Completed,
      duration: '3m 45s',
      testCasesCount: 25,
      configuration: 'Balanced Coverage',
    },
    {
      id: 'run-002',
      timestamp: new Date('2023-05-18T10:15:00'),
      status: GenerationStatus.Completed,
      duration: '4m 20s',
      testCasesCount: 32,
      configuration: 'Focus on Edge Cases',
    },
    {
      id: 'run-003',
      timestamp: new Date('2023-05-15T16:45:00'),
      status: GenerationStatus.Failed,
      duration: '2m 10s',
      testCasesCount: 0,
      configuration: 'Security Checks',
    },
  ];

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

  startGeneration() {
    // Проверка входных данных
    if (!this.analyzeCode) {
      alert('Please select Source Code analysis');
      return;
    }

    // Ограничиваем количество тест-кейсов до 10
    if (this.testCaseCount > 10) {
      this.testCaseCount = 10;
    } else if (this.testCaseCount < 1) {
      this.testCaseCount = 1;
    }

    // Проверка на необходимость подключения Git
    if (this.analyzeCode && this.useGit && !this.gitConnected) {
      alert('Please connect to Git repository first');
      return;
    }

    // Логика для запуска генерации
    alert(`Starting generation with configuration:
      Analyze Code: ${this.analyzeCode}
      Use Git: ${this.useGit}
      Analyze Requirements: Always enabled
      Strategy: ${this.generationStrategy}
      Components: ${
        this.selectedComponents.length
          ? this.selectedComponents.join(', ')
          : 'All'
      }
      Test Case Count: ${this.testCaseCount}`);

    // Здесь бы шел вызов API для запуска процесса генерации
  }

  viewResults(runId: string) {
    // Logic to view generation results
    alert(`Viewing results for generation run ${runId}`);
  }

  cancelGeneration(runId: string) {
    // Logic to cancel generation
    alert(`Cancelling generation run ${runId}`);
  }

  deleteRecord(runId: string) {
    // Logic to delete generation record
    if (confirm('Are you sure you want to delete this generation record?')) {
      this.generationRuns = this.generationRuns.filter(
        (run) => run.id !== runId
      );
    }
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
    alert('Requirements saved successfully!');
  }

  // Обработчик загрузки файла требований
  uploadRequirementsFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.requirements = reader.result as string;
      };
      reader.readAsText(file);
    }
  }
}
