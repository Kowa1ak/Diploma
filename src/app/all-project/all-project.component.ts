import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../shared/notification/notification.service';

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
  status: ProjectStatus; // новое свойство
}

@Component({
  selector: 'app-all-project',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ConfirmDialogComponent],
  templateUrl: './all-project.component.html',
  styleUrls: ['./all-project.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllProjectComponent implements OnInit {
  public ProjectStatus = ProjectStatus; // Make the enum accessible in the template
  projects: Project[] = [
    {
      id: 1,
      name: 'Project One',
      description: 'Description for project one',
      primaryLanguage: 'TypeScript',
      lastModified: new Date(),
      status: ProjectStatus.Active,
    },
    {
      id: 2,
      name: 'Project Two',
      description:
        'Description for project two which is longer and might need truncation',
      primaryLanguage: 'JavaScript',
      lastModified: new Date(),
      status: ProjectStatus.Completed,
    },
    {
      id: 3,
      name: 'Project Three',
      description: 'Description for project three',
      primaryLanguage: 'Python',
      lastModified: new Date(),
      status: ProjectStatus.Paused,
    },
    {
      id: 4,
      name: 'Project 4',
      description: 'Description for project three',
      primaryLanguage: 'Python',
      lastModified: new Date(),
      status: ProjectStatus.Paused,
    },
    {
      id: 5,
      name: 'Project 5',
      description: 'Description for project three',
      primaryLanguage: 'Python',
      lastModified: new Date(),
      status: ProjectStatus.Paused,
    },
    {
      id: 6,
      name: 'Project 6',
      description: 'Description for project three',
      primaryLanguage: 'Python',
      lastModified: new Date(),
      status: ProjectStatus.Paused,
    },
  ];

  currentPage: number = 1;
  rowsPerPage: number = 5; // максимум строк на странице
  searchTerm: string = ''; // новое свойство для поиска
  filterPanelOpen: boolean = false; // Новое свойство для отображения панели фильтров

  public selectedOrder: string = '';
  public selectedSort: string = '';
  public selectedStatus: ProjectStatus | '' = '';

  showDialog = false;
  dialogMessage = '';
  dialogConfirm!: () => void;

  constructor(private notification: NotificationService) {}

  ngOnInit() {}

  loadProjects() {
    // Удалён вызов к сервису. Используется статический массив projects.
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
      this.projects = this.projects.filter((p) => p.id !== project.id);
      this.showDialog = false;
      this.notification.success(`Project "${project.name}" deleted.`);
    };
    this.showDialog = true;
  }
}
