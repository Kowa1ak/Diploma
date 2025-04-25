import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  TestCase,
  TestCaseType,
  TestCaseSource,
  TestCasePriority,
  TestCaseReviewStatus,
} from '../shared/project.models';

@Component({
  selector: 'app-test-case-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, FormsModule],
  templateUrl: './test-case-view.component.html',
  styleUrls: ['./test-case-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCaseViewComponent implements OnInit {
  testCase: TestCase | null = null;
  editMode = false;
  editedProject!: TestCase;

  // Энумы для селектов в режиме редактирования
  testCaseTypes = Object.values(TestCaseType);
  testCaseSources = Object.values(TestCaseSource);
  testCasePriorities = Object.values(TestCasePriority);
  testCaseReviewStatuses = Object.values(TestCaseReviewStatus);

  // Временные переменные для хранения отредактированных шагов и зависимостей
  editedSteps: string = '';
  editedRequirements: string = '';

  // Константы для enum значений
  readonly ReviewStatus = TestCaseReviewStatus;

  hoveredSection: string = '';
  editSection: string = '';

  // Состояние dropdown
  dropdownOpen = {
    type: false,
    priority: false,
    source: false,
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadTestCase(id);
  }

  loadTestCase(id: string | null): void {
    // Моковые данные
    this.testCase = {
      id: id || 'TC-001',
      name: 'Verify user authentication with valid credentials',
      type: TestCaseType.Positive,
      source: TestCaseSource.Combined,
      component: 'Authentication',
      priority: TestCasePriority.High,
      generationRun: 'run-001',
      reviewStatus: TestCaseReviewStatus.New,
      description:
        'This test verifies that a user can successfully authenticate with valid credentials and receive appropriate access token.',
      preconditions:
        'User account exists in the system. User is not currently logged in.',
      inputData:
        '{\n  "username": "valid_user@example.com",\n  "password": "Valid_password123"\n}',
      expectedOutcome:
        'HTTP Status Code: 200 OK\nResponse contains valid JWT token\nUser session is created',
      steps: [
        'Send POST request to /api/auth/login with valid credentials',
        'Validate response status code is 200',
        'Validate response contains JWT token',
        'Verify token structure and expiration date',
        'Try accessing protected endpoint using the token',
      ],
      notes:
        'Generated based on JWT authentication implementation in AuthController.java and security requirements document section 2.3.',
      generatedAt: new Date('2023-05-20T14:30:00'),
      relatedRequirements: [
        'REQ-001: User Authentication',
        'REQ-002: Session Management',
      ],
      aiConfidence: 0.92,
    };

    // Инициализация временных переменных для редактирования
    if (this.testCase) {
      const steps = this.testCase.steps ?? [];
      const reqs = this.testCase.relatedRequirements ?? [];

      this.editedProject = {
        ...this.testCase!,
        steps: [...steps],
        relatedRequirements: [...reqs],
      } as TestCase; // явное приведение

      this.editedSteps = steps.join('\n');
      this.editedRequirements = reqs.join('\n');
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode && this.testCase) {
      const steps = this.testCase.steps ?? [];
      const reqs = this.testCase.relatedRequirements ?? [];

      this.editedProject = {
        ...this.testCase!,
        steps: [...steps],
        relatedRequirements: [...reqs],
      } as TestCase; // явное приведение
      this.editedSteps = steps.join('\n');
      this.editedRequirements = reqs.join('\n');
    }
  }

  saveChanges(): void {
    if (!this.testCase) return;

    // Преобразование строки steps обратно в массив
    if (this.editedSteps.trim()) {
      this.testCase.steps = this.editedSteps
        .split('\n')
        .filter((step) => step.trim().length > 0);
    } else {
      this.testCase.steps = [];
    }

    // Преобразование строки requirements обратно в массив
    if (this.editedRequirements.trim()) {
      this.testCase.relatedRequirements = this.editedRequirements
        .split('\n')
        .filter((req) => req.trim().length > 0);
    } else {
      this.testCase.relatedRequirements = [];
    }

    // копируем обратно изменения
    Object.assign(this.testCase, this.editedProject);
    this.toggleEditMode();

    // Логика сохранения
    alert('Changes saved successfully!');
    this.editMode = false;
  }

  updateReviewStatus(status: TestCaseReviewStatus): void {
    if (this.testCase) {
      this.testCase.reviewStatus = status;
    }
  }

  goBack(): void {
    // Переход на страницу проекта с активным табом Test Cases
    this.router.navigate(['/project'], { queryParams: { tab: 'test-cases' } });
  }

  onMouseEnter(section: string) {
    this.hoveredSection = section;
  }

  onMouseLeave() {
    this.hoveredSection = '';
  }

  startEdit(section: string): void {
    this.editSection = section;
    if (section === 'steps' && this.testCase) {
      // Инициализируем editedSteps из текущих шагов
      this.editedSteps = (this.testCase.steps ?? []).join('\n');
    }
    // ...existing code for other sections...
  }

  saveEdit(section: string): void {
    if (section === 'steps' && this.testCase) {
      // Парсим текст в массив шагов
      const lines = this.editedSteps
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      this.testCase.steps = [...lines];
      this.editedProject = {
        ...this.testCase,
        steps: [...lines],
        relatedRequirements: [...(this.testCase.relatedRequirements ?? [])],
      } as TestCase;
      this.editSection = '';
      return;
    }

    // Для остальных секций оставляем прежнюю логику
    if (this.testCase && this.editedProject) {
      // ...existing saveEdit logic...
    }
  }

  cancelEdit() {
    this.editSection = '';
  }

  addStep(): void {
    // Гарантируем, что steps — массив
    this.editedProject.steps = this.editedProject.steps ?? [];
    this.editedProject.steps.push('');
  }

  removeStep(index: number): void {
    if (this.editedProject) {
      // Гарантируем, что steps — массив
      this.editedProject.steps = this.editedProject.steps ?? [];
      this.editedProject.steps.splice(index, 1);
    }
  }

  toggleDropdown(key: keyof typeof this.dropdownOpen): void {
    // Закрываем остальные
    (
      Object.keys(this.dropdownOpen) as Array<keyof typeof this.dropdownOpen>
    ).forEach((k) => {
      if (k !== key) this.dropdownOpen[k] = false;
    });
    this.dropdownOpen[key] = !this.dropdownOpen[key];
  }

  selectOption(key: 'type' | 'priority' | 'source', value: string) {
    this.dropdownOpen[key] = false;
    switch (key) {
      case 'type':
        this.editedProject.type = value as TestCaseType;
        break;
      case 'priority':
        this.editedProject.priority = value as TestCasePriority;
        break;
      case 'source':
        this.editedProject.source = value as TestCaseSource;
        break;
    }
  }
}
