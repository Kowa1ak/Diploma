import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
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
import { HttpClient } from '@angular/common/http';
import { ProjectService } from '../shared/project.service';

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
export class ProjectTestCasesComponent implements OnInit, OnDestroy, OnChanges {
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
  generationRuns: GenerationRun[] = [];

  // Test cases
  testCases: TestCase[] = [];

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

  // Массив для консольных сообщений
  consoleMessages: string[] = [];

  // Фиксированный шаблон для экспорта
  private readonly exportTemplate = [
    {
      id: 'TC-001',
      type: 'Positive',
      component: 'Registration Form',
      priority: 'High',
      status: 'New',
      name: 'Test Valid Registration Submission',
      description:
        'Verify that a user can successfully register with valid full name, phone number, email, and password.',
      preconditions: ['Registration form is accessible.'],
      test_steps: [
        "Enter a valid full name in the 'Full Name' field.",
        "Enter a valid phone number in the 'Phone Number' field.",
        "Enter a valid email in the 'Email' field.",
        "Enter a valid password in the 'Password' field.",
        "Click the 'Register' button.",
      ],
      input_data: [
        { parameter: 'Full Name', value: 'John Doe' },
        { parameter: 'Phone Number', value: '+1234567890' },
        { parameter: 'Email', value: 'john.doe@example.com' },
        { parameter: 'Password', value: 'SecurePassword123!' },
      ],
      expected_outcome:
        'User is successfully registered and redirected to the dashboard or confirmation page.',
      notes_ai_analysis:
        "Assumes standard registration form fields and a 'Register' button exist.",
      ai_confidence: 90,
      related_requirements: [],
    },
    {
      id: 'TC-002',
      type: 'Negative',
      component: 'Registration Form',
      priority: 'Medium',
      status: 'New',
      name: 'Test Invalid Email Format',
      description:
        'Verify that the registration form rejects an invalid email format.',
      preconditions: ['Registration form is accessible.'],
      test_steps: [
        "Enter a valid full name in the 'Full Name' field.",
        "Enter a valid phone number in the 'Phone Number' field.",
        "Enter an invalid email (missing '@') in the 'Email' field.",
        "Enter a valid password in the 'Password' field.",
        "Click the 'Register' button.",
      ],
      input_data: [
        { parameter: 'Full Name', value: 'Jane Smith' },
        { parameter: 'Phone Number', value: '+9876543210' },
        { parameter: 'Email', value: 'jane.smith.example.com' },
        { parameter: 'Password', value: 'StrongPass456!' },
      ],
      expected_outcome:
        'System displays an error message indicating invalid email format.',
      notes_ai_analysis:
        'Testing email validation. Assumes an error message is displayed for invalid emails.',
      ai_confidence: 85,
      related_requirements: [],
    },
    {
      id: 'TC-003',
      type: 'Negative',
      component: 'Registration Form',
      priority: 'Medium',
      status: 'New',
      name: 'Test Missing Required Fields',
      description:
        'Verify that the registration form rejects submission if any required field is missing.',
      preconditions: ['Registration form is accessible.'],
      test_steps: [
        "Leave the 'Full Name' field empty.",
        "Enter a valid phone number in the 'Phone Number' field.",
        "Enter a valid email in the 'Email' field.",
        "Enter a valid password in the 'Password' field.",
        "Click the 'Register' button.",
      ],
      input_data: [
        { parameter: 'Full Name', value: '' },
        { parameter: 'Phone Number', value: '+1122334455' },
        { parameter: 'Email', value: 'test.user@example.com' },
        { parameter: 'Password', value: 'Password789!' },
      ],
      expected_outcome:
        'System displays an error message indicating that all fields are required.',
      notes_ai_analysis:
        'Testing required field validation. Assumes all fields are mandatory and an error message is displayed for missing fields.',
      ai_confidence: 85,
      related_requirements: [],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private filterService: TestFilterService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private http: HttpClient,
    private projectService: ProjectService
  ) {}

  // Загрузка всех тест-кейсов проекта
  private loadTestCasesHistory(): void {
    const start = Date.now();
    this.http
      .get<any[]>(`/api/generation-scopes/by-project/${this.project.id}`)
      .subscribe({
        next: (data) => {
          const elapsed = ((Date.now() - start) / 1000).toFixed(2) + 's';
          this.generationRuns = data.map((item) => {
            let type = '';
            let component = '';
            try {
              const arr = JSON.parse(item.response || '[]');
              type = arr[0]?.type || '';
              component = arr[0]?.component || '';
            } catch {}

            const run = {
              id: item.id,
              timestamp: new Date(item.createdAt || item.timestamp),
              status: 'New',
              duration: elapsed,
              testCasesCount: item.testCasesCount || 0,
              configuration: item.configuration || '',
              type,
              component,
              selected: false, // <-- инициализировать булево значение
            };

            // сначала в unknown, затем в нужный тип
            return run as unknown as GenerationRun & {
              type: string;
              component: string;
            };
          });
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Failed to load history', err),
      });
  }

  ngOnInit(): void {
    // отключили фильтрацию по generationRun, оставили визуальный дропдаун
    // сразу загружаем все тест-кейсы без фильтра
    if (this.project) {
      this.loadTestCasesHistory();
      // загрузить реальные тест-кейсы
      this.projectService.getTestCases(this.project.id).subscribe((data) => {
        this.testCases = data.map((tc) => ({ ...tc, selected: false }));
        this.cdr.markForCheck();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // при смене проекта обновляем тест-кейсы
    if (changes['project'] && this.project) {
      this.loadTestCasesHistory();
    }
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

  // Экспорт всех тест-кейсов в CSV
  exportCSV(): void {
    const headers = Object.keys(this.exportTemplate[0]);
    const rows = this.exportTemplate.map((item) =>
      headers
        .map((h) => {
          const v = JSON.stringify((item as any)[h])
            .replace(/^"|"$/g, '')
            .replace(/"/g, '""');
          return `"${v}"`;
        })
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Экспорт всех тест-кейсов в JSON
  exportJSON(): void {
    const json = JSON.stringify(this.exportTemplate, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export-template.json';
    a.click();
    URL.revokeObjectURL(url);
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

  // Проверка, есть ли выбранные тест-кейсы или запуски
  get hasSelected(): boolean {
    return (
      (this.testCases?.some((tc) => tc.selected) ?? false) ||
      (this.generationRuns?.some((run) => run.selected) ?? false)
    );
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

  private loadTestCases(): void {
    if (!this.generationRunFilter) {
      this.testCases = [];
      this.consoleMessages.push('No generationRunFilter set');
      this.cdr.markForCheck();
      return;
    }
    this.http
      .get<TestCase[]>(`/api/test-cases/by-scope/${this.generationRunFilter}`)
      .subscribe({
        next: (data) => {
          this.testCases = data;
          this.consoleMessages.push(
            `Loaded test cases: ${JSON.stringify(data)}`
          );
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.consoleMessages.push(`Error loading test cases: ${err.message}`);
          this.notificationService.error('Ошибка загрузки тест-кейсов');
        },
      });
  }

  private loadAllTestCases(): void {
    this.http
      .get<TestCase[]>(`/api/test-cases/by-project/${this.project.id}`)
      .subscribe({
        next: (data) => {
          this.testCases = data;
          this.cdr.markForCheck();
        },
        error: () =>
          this.notificationService.error('Ошибка загрузки тест-кейсов'),
      });
  }

  private loadTestCaseHistory(): void {
    this.http
      .get<any[]>(`/api/test-cases/by-scope/${this.project.id}`)
      .subscribe({
        next: (data) => {
          console.log('Loaded test cases history:', data);
          this.testCases = data.map(
            (item) =>
              ({
                id: item.id,
                name: item.name || '–',
              } as TestCase)
          );
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading test cases history', err),
      });
  }

  private loadGeneratedTestCases(runId: string): void {
    if (!runId) {
      console.log('No generationRunFilter, skipping load');
      return;
    }
    this.http.get<any[]>(`/api/test-cases/by-scope/${runId}`).subscribe({
      next: (data) => {
        console.log('API response for test cases:', data);
        this.testCases = data;
        this.cdr.markForCheck();
      },
      error: () =>
        this.notificationService.error('Ошибка загрузки тест-кейсов'),
    });
  }

  // Выбрать/снять все чекбоксы в списке generationRuns
  selectAllRuns(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.generationRuns.forEach((r) => (r.selected = checked));
    this.cdr.markForCheck();
  }
}
