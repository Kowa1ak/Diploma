import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../shared/notification/notification.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

enum ProjectStatus {
  Active = 'Active',
  Completed = 'Completed',
  Paused = 'Paused',
}

interface Project {
  id: number;
  name: string;
  description: string;
  primaryLanguage: string;
  lastModified: Date;
  status: ProjectStatus;
}

@Component({
  selector: 'app-all-project',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    ConfirmDialogComponent,
    HttpClientModule,
  ],
  templateUrl: './all-project.component.html',
  styleUrls: ['./all-project.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllProjectComponent implements OnInit {
  public ProjectStatus = ProjectStatus;
  projects: Project[] = [];

  currentPage: number = 1;
  rowsPerPage: number = 5;
  searchTerm: string = '';
  filterPanelOpen: boolean = false;
  public selectedOrder: string = '';
  public selectedSort: string = '';
  public selectedStatus: ProjectStatus | '' = '';
  showDialog = false;
  dialogMessage = '';
  dialogConfirm!: () => void;

  constructor(
    private notification: NotificationService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.http.get<any[]>('/api/projects').subscribe((data) => {
      this.projects = data.map((item) => {
        const raw = item.status || '';
        const statusCapitalized =
          raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          primaryLanguage: item.programmingLanguage || item.primaryLanguage,
          lastModified: new Date(item.createdAt || item.lastModified),
          status: (statusCapitalized as ProjectStatus) || ProjectStatus.Active,
        };
      });
      this.currentPage = 1;
      this.cdr.markForCheck();
    });
  }

  get filteredProjects(): Project[] {
    let projs = this.projects;
    if (this.searchTerm) {
      projs = projs.filter((project) =>
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    if (this.selectedStatus) {
      projs = projs.filter((project) => project.status === this.selectedStatus);
    }
    return projs;
  }

  // Новый геттер, который сортирует отфильтрованные проекты
  get sortedProjects(): Project[] {
    const projs = [...this.filteredProjects];
    if (this.selectedSort === 'date') {
      projs.sort((a, b) => {
        const diff = a.lastModified.getTime() - b.lastModified.getTime();
        return this.selectedOrder === 'desc' ? -diff : diff;
      });
    } else if (this.selectedSort === 'alphabetical') {
      projs.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return this.selectedOrder === 'desc' ? -cmp : cmp;
      });
    }
    return projs;
  }

  // Обновлённый геттер, использующий отсортированный список
  get displayedProjects(): Project[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.sortedProjects.slice(start, start + this.rowsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.sortedProjects.length / this.rowsPerPage) || 1;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onDeleteProject(project: Project): void {
    // заменили стандартный confirm на кастомный диалог
    this.confirmDelete(project);
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  onOrder(order: string): void {
    this.selectedOrder = order;
    // Если сортировка ещё не выбрана, по умолчанию выбираем 'date'
    if (!this.selectedSort) {
      this.onSort('date');
    }
    // ...дополнительная логика сортировки...
  }

  onSort(sort: string): void {
    this.selectedSort = sort;
    // По умолчанию при выборе фильтра ставим порядок "asc"
    if (!this.selectedOrder) {
      this.selectedOrder = 'asc';
    }
    // ...дополнительная логика сортировки...
  }

  onStatusFilter(status: ProjectStatus | ''): void {
    this.selectedStatus = status;
  }

  clearFilters(): void {
    this.selectedOrder = '';
    this.selectedSort = '';
    this.selectedStatus = '';
    // ...дополнительная логика очистки фильтров...
  }

  get showClear(): boolean {
    return (
      this.selectedOrder !== '' ||
      this.selectedSort !== '' ||
      this.selectedStatus !== ''
    );
  }

  confirmDelete(project: Project) {
    this.dialogMessage = `Delete project "${project.name}"?`;
    this.dialogConfirm = () => {
      this.http.delete(`/api/projects/${project.id}`).subscribe({
        next: () => {
          this.loadProjects();
          this.notification.success(`Project "${project.name}" deleted.`);
        },
        error: () => {
          this.notification.error('Failed to delete project.');
        },
      });
      this.showDialog = false;
    };
    this.showDialog = true;
  }

  viewProject(id: number): void {
    // сразу переходим на страницу проекта по id
    this.router.navigate(['/project', id]);
  }
}
