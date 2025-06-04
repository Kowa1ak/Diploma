import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tcId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<any>(`/api/test-cases/${tcId}`).subscribe({
      next: (resp) => {
        const outer = Array.isArray(resp) ? resp[0] : resp;
        const raw = outer?.response;
        const arr: any[] = JSON.parse(raw || '[]');
        const d = arr[0] || {};
        this.testCase = {
          id: d.id,
          name: d.name,
          type: d.type,
          component: d.component,
          priority: d.priority,
          reviewStatus: d.status,
          description: d.description,
          preconditions: d.preconditions,
          steps: d.test_steps,
          inputData: d.input_data,
          expectedOutcome: d.expected_outcome,
          notes: d.notes_ai_analysis,
          aiConfidence: d.ai_confidence / 100,
          relatedRequirements: d.related_requirements,
          generatedAt: new Date(outer.createdAt), // <-- добавлено
        } as TestCase;

        // заполнить поля для просмотра
        if (this.testCase) {
          this.editedProject = { ...this.testCase };
          this.editedSteps = this.testCase.steps?.join('\n') ?? '';
          this.editedRequirements =
            this.testCase.relatedRequirements?.join('\n') ?? '';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load test case:', err);
        this.testCase = null;
        this.cdr.markForCheck();
      },
    });
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
