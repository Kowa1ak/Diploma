import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TestFilterService } from '../shared/test-filter.service';
import {
  Project,
  TestCase,
  TestCaseType,
  TestCaseSource,
  TestCasePriority,
  TestCaseReviewStatus,
  GenerationRun,
} from '../shared/project.models';

@Component({
  selector: 'app-project-test-cases',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  templateUrl: './project-test-cases.component.html',
  styleUrls: ['./project-test-cases.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTestCasesComponent implements OnInit, OnDestroy {
  @Input() project!: Project;

  // Search and filters
  searchTerm: string = '';
  typeFilter: string = '';
  componentFilter: string = '';
  statusFilter: string = '';
  generationRunFilter: string = '';

  // Подписки для отслеживания изменений
  private subscriptions: Subscription[] = [];

  // Generation runs (for filtering)
  generationRuns: GenerationRun[] = [
    {
      id: 'run-001',
      timestamp: new Date('2023-05-20T14:30:00'),
      status: 'Completed' as any,
      duration: '3m 45s',
      testCasesCount: 25,
    },
    {
      id: 'run-002',
      timestamp: new Date('2023-05-18T10:15:00'),
      status: 'Completed' as any,
      duration: '4m 20s',
      testCasesCount: 32,
    },
  ];

  // Test cases
  testCases: TestCase[] = [
    {
      id: 'TC-001',
      name: 'Verify login with valid credentials',
      type: TestCaseType.Positive,
      source: TestCaseSource.Combined,
      component: 'Authentication',
      priority: TestCasePriority.High,
      generationRun: 'run-001',
      reviewStatus: TestCaseReviewStatus.Reviewed,
    },
    {
      id: 'TC-002',
      name: 'Test login with invalid password',
      type: TestCaseType.Negative,
      source: TestCaseSource.Code,
      component: 'Authentication',
      priority: TestCasePriority.Medium,
      generationRun: 'run-001',
      reviewStatus: TestCaseReviewStatus.Reviewed,
    },
    {
      id: 'TC-003',
      name: 'Verify user input with maximum character limit',
      type: TestCaseType.Boundary,
      source: TestCaseSource.Requirement,
      component: 'User Profile',
      priority: TestCasePriority.Medium,
      generationRun: 'run-002',
      reviewStatus: TestCaseReviewStatus.New,
    },
    {
      id: 'TC-004',
      name: 'Check SQL injection prevention in login form',
      type: TestCaseType.Security,
      source: TestCaseSource.ModelInternal,
      component: 'Authentication',
      priority: TestCasePriority.High,
      generationRun: 'run-002',
      reviewStatus: TestCaseReviewStatus.NeedsRevision,
    },
    {
      id: 'TC-005',
      name: 'Test API response time under load',
      type: TestCaseType.Performance,
      source: TestCaseSource.Code,
      component: 'API',
      priority: TestCasePriority.Low,
      generationRun: 'run-002',
      reviewStatus: TestCaseReviewStatus.New,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private filterService: TestFilterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Подписываемся на изменения в URL параметрах
    this.subscriptions.push(
      this.route.queryParams.subscribe((params) => {
        if (params['generationRun']) {
          this.generationRunFilter = params['generationRun'];
          this.cdr.markForCheck(); // Явно говорим Angular проверить изменения
        }
      })
    );

    // 2. Подписываемся на изменения в сервисе фильтрации
    this.subscriptions.push(
      this.filterService.generationRunFilter$.subscribe((runId) => {
        if (runId !== this.generationRunFilter) {
          this.generationRunFilter = runId;
          this.cdr.markForCheck();
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Отписываемся от всех подписок при уничтожении компонента
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // При изменении фильтра вручную, обновляем состояние в сервисе
  onFilterChange(): void {
    this.filterService.setGenerationRunFilter(this.generationRunFilter);
  }

  get filteredTestCases(): TestCase[] {
    return this.testCases.filter((tc) => {
      // Apply search term
      if (
        this.searchTerm &&
        !tc.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Apply type filter
      if (this.typeFilter && tc.type !== this.typeFilter) {
        return false;
      }

      // Apply component filter
      if (this.componentFilter && tc.component !== this.componentFilter) {
        return false;
      }

      // Apply status filter
      if (this.statusFilter && tc.reviewStatus !== this.statusFilter) {
        return false;
      }

      // Apply generation run filter
      if (
        this.generationRunFilter &&
        tc.generationRun !== this.generationRunFilter
      ) {
        return false;
      }

      return true;
    });
  }

  viewTestCase(testCaseId: string) {
    // Logic to view test case details
    alert(`Viewing details for test case ${testCaseId}`);
  }

  editTestCase(testCaseId: string) {
    // Logic to edit test case
    alert(`Editing test case ${testCaseId}`);
  }

  deleteTestCase(testCaseId: string) {
    if (confirm('Are you sure you want to delete this test case?')) {
      this.testCases = this.testCases.filter((tc) => tc.id !== testCaseId);
    }
  }

  changeTestCaseStatus(testCaseId: string, newStatus: TestCaseReviewStatus) {
    const testCase = this.testCases.find((tc) => tc.id === testCaseId);
    if (testCase) {
      testCase.reviewStatus = newStatus;
    }
  }

  exportCSV() {
    // Logic to export as CSV
    alert('Exporting test cases as CSV');
  }

  exportJSON() {
    // Logic to export as JSON
    alert('Exporting test cases as JSON');
  }
}
