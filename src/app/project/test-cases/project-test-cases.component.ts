import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../shared/notification/notification.service';

@Component({
  selector: 'app-project-test-cases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    RouterModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './project-test-cases.component.html',
  styleUrls: ['./project-test-cases.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
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

  // Варианты фильтров
  types = ['Unit', 'Integration', 'E2E'];
  componentsList = ['Auth', 'Dashboard', 'Settings'];
  statuses = ['New', 'Reviewed', 'Failed', 'Completed'];
  runsList = ['Last 24h', 'Last 7 Days', 'Last 30 Days'];

  // Состояние раскрытия dropdown
  dropdownOpen = {
    type: false,
    component: false,
    status: false,
    run: false,
  };

  // Выбранные значения
  selectedType = 'All Types';
  selectedComponent = 'All Components';
  selectedStatus = 'All Status';
  selectedRun = 'All Runs';

  // для диалога
  showDialog = false;
  dialogMessage = '';
  dialogItems: string[] = []; // <– добавлено
  dialogConfirm!: () => void;

  constructor(
    private route: ActivatedRoute,
    private filterService: TestFilterService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // 1. Подписываемся на изменения в URL параметрах
    this.subscriptions.push(
      this.route.queryParams.subscribe((params) => {
        if (params['generationRun']) {
          this.generationRunFilter = params['generationRun'];
          this.updateSelectedRunLabel(this.generationRunFilter);
          this.cdr.markForCheck(); // Явно говорим Angular проверить изменения
        }
      })
    );

    // 2. Подписываемся на изменения в сервисе фильтрации
    this.subscriptions.push(
      this.filterService.generationRunFilter$.subscribe((runId) => {
        if (runId !== this.generationRunFilter) {
          this.generationRunFilter = runId;
          this.updateSelectedRunLabel(runId);
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
    const tc = this.testCases.find((t) => t.id === testCaseId)!;
    this.dialogItems = [`${tc.id}: "${tc.name}"`];
    this.dialogMessage = 'Delete test case:'; // заголовок перед списком
    this.dialogConfirm = () => {
      this.testCases = this.testCases.filter((t) => t.id !== testCaseId);
      this.notificationService.success(`Deleted ${testCaseId}`);
      this.showDialog = false;
      this.cdr.markForCheck();
    };
    this.showDialog = true;
  }

  deleteSelected(): void {
    this.dialogItems = this.testCases
      .filter((tc) => tc.selected)
      .map((tc) => `${tc.id}: "${tc.name}"`);
    this.dialogMessage = 'Delete selected cases:';
    this.dialogConfirm = () => {
      this.testCases = this.testCases.filter((tc) => !tc.selected);
      this.notificationService.success('Selected test cases deleted.');
      this.showDialog = false;
      this.cdr.markForCheck();
    };
    this.showDialog = true;
  }

  exportCSV(): void {
    const list = this.testCases
      .filter((t) => t.selected)
      .map((t) => `${t.id}: "${t.name}"`);
    this.dialogItems = list;
    this.dialogMessage = 'Export as CSV:';
    this.dialogConfirm = () => {
      // ...реальный экспорт...
      this.notificationService.success('CSV exported.');
      this.showDialog = false;
    };
    this.showDialog = true;
  }

  exportJSON(): void {
    const list = this.testCases
      .filter((t) => t.selected)
      .map((t) => `${t.id}: "${t.name}"`);
    this.dialogItems = list;
    this.dialogMessage = 'Export as JSON:';
    this.dialogConfirm = () => {
      // ...реальный экспорт...
      this.notificationService.success('JSON exported.');
      this.showDialog = false;
    };
    this.showDialog = true;
  }

  toggleDropdown(key: keyof typeof this.dropdownOpen): void {
    // закрываем все остальные
    (
      Object.keys(this.dropdownOpen) as Array<keyof typeof this.dropdownOpen>
    ).forEach((k) => {
      if (k !== key) this.dropdownOpen[k] = false;
    });
    this.dropdownOpen[key] = !this.dropdownOpen[key];
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown')) {
      // закрываем все dropdown
      Object.keys(this.dropdownOpen).forEach(
        (k) => (this.dropdownOpen[k as keyof typeof this.dropdownOpen] = false)
      );
      this.cdr.markForCheck();
    }
  }

  selectFilter(key: keyof typeof this.dropdownOpen, value: string): void {
    this.dropdownOpen[key] = false;
    switch (key) {
      case 'type':
        this.selectedType = value;
        this.typeFilter = value === 'All Types' ? '' : value;
        break;
      case 'component':
        this.selectedComponent = value;
        this.componentFilter = value === 'All Components' ? '' : value;
        break;
      case 'status':
        this.selectedStatus = value;
        this.statusFilter = value === 'All Status' ? '' : value;
        break;
      case 'run':
        const runObj = this.generationRuns.find((r) => r.id === value);
        if (runObj) {
          this.selectedRun = `${this.datePipe.transform(
            runObj.timestamp,
            'M/d/yy, h:mm a'
          )} (${runObj.testCasesCount} tests)`;
          this.generationRunFilter = runObj.id;
        } else {
          this.selectedRun = 'All Runs';
          this.generationRunFilter = '';
        }
        this.onFilterChange();
        break;
    }
    this.cdr.markForCheck();
  }

  // Выбирает все или снимает выбор (если передан event с флагом)
  selectAll(event?: Event): void {
    const checked = event ? (event.target as HTMLInputElement).checked : true;
    this.testCases.forEach((tc) => (tc.selected = checked));
    this.cdr.markForCheck();
  }

  // Проверка, есть ли выбранные тест-кейсы
  get hasSelected(): boolean {
    return this.testCases.some((tc) => tc.selected);
  }

  private updateSelectedRunLabel(runId: string): void {
    const runObj = this.generationRuns.find((r) => r.id === runId);
    if (runObj) {
      this.selectedRun = `${this.datePipe.transform(
        runObj.timestamp,
        'M/d/yy, h:mm a'
      )} (${runObj.testCasesCount} tests)`;
    } else {
      this.selectedRun = 'All Runs';
    }
  }
}
