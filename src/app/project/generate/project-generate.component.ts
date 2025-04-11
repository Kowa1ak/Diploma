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
  analyzeRequirements: boolean = true;
  generationStrategy: string = 'balanced';
  selectedComponents: string[] = [];
  testCaseCount: number = 5; // значение по умолчанию

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
    if (!this.analyzeCode && !this.analyzeRequirements) {
      alert(
        'Please select at least one source for analysis (Code or Requirements)'
      );
      return;
    }

    // Логика для запуска генерации с учетом выбранного количества тест-кейсов
    alert(`Starting generation with configuration:
      Analyze Code: ${this.analyzeCode}
      Analyze Requirements: ${this.analyzeRequirements}
      Strategy: ${this.generationStrategy}
      Components: ${
        this.selectedComponents.length
          ? this.selectedComponents.join(', ')
          : 'All'
      }
      Test Case Count: approximately ${this.testCaseCount}`);

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
}
