import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Project, ProjectStatus } from '../shared/project.models';
import { NotificationService } from '../../shared/notification/notification.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, ConfirmDialogComponent],
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingsComponent implements OnInit {
  @Input() project!: Project;

  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() projectDeleted = new EventEmitter<string>();

  editedProject: Project | null = null;
  projectStatus: ProjectStatus = ProjectStatus.Active;

  // Primary Programming Language dropdown
  languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go'];
  primaryLanguage: string = '';
  languageDropdownOpen = false;

  uploadedArchives: { name: string; date: Date; size: string }[] = [];

  settingsChanged = false;
  showDialog = false;
  dialogMessage = '';
  dialogConfirm!: () => void;

  // Экспортируем enum в шаблон
  ProjectStatusEnum = ProjectStatus;

  constructor(
    private notification: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleLanguageDropdown(): void {
    this.languageDropdownOpen = !this.languageDropdownOpen;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    if (
      this.languageDropdownOpen &&
      !target.closest('.primary-lang-dropdown')
    ) {
      this.languageDropdownOpen = false;
    }
  }

  selectLanguage(lang: string): void {
    this.primaryLanguage = lang;
    this.languageDropdownOpen = false;
    this.onSettingChange();
  }

  uploadArchive(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip';
    input.onchange = () => {
      const file = input.files![0];
      this.uploadedArchives.push({
        name: file.name,
        date: new Date(),
        size: this.formatSize(file.size),
      });
      this.onSettingChange();
    };
    input.click();
  }

  deleteArchive(index: number): void {
    const arch = this.uploadedArchives[index];
    this.dialogMessage = `Delete archive "${arch.name}"?`;
    this.dialogConfirm = () => {
      this.uploadedArchives.splice(index, 1);
      this.showDialog = false;
      this.notification.success('Archive deleted');
      this.cdr.markForCheck();
    };
    this.showDialog = true;
  }

  private formatSize(bytes: number): string {
    const kb = bytes / 1024;
    return kb < 1024 ? kb.toFixed(1) + ' KB' : (kb / 1024).toFixed(1) + ' MB';
  }

  ngOnChanges() {
    // Create a copy of the project data to edit
    this.editedProject = { ...this.project };
    this.projectStatus = this.editedProject.status;
  }

  // Инициализируем после загрузки проекта
  ngOnInit(): void {
    this.primaryLanguage = this.editedProject?.primaryLanguage || '';
  }

  saveProjectSettings(): void {
    if (this.editedProject) {
      // Сохраняем статус в объект проекта
      this.editedProject.status = this.projectStatus;
      this.editedProject.primaryLanguage = this.primaryLanguage;
      this.projectUpdated.emit(this.editedProject);
      this.settingsChanged = false;
      this.notification.success('Settings saved successfully');
    }
  }

  cancelChanges(): void {
    this.editedProject = { ...this.project };
    this.projectStatus = this.editedProject.status; // восстановить статус
    this.settingsChanged = false;
  }

  deleteProject() {
    const confirmName = prompt(
      'Type the project name to confirm deletion: ' + this.project.name
    );
    if (confirmName === this.project.name) {
      this.dialogMessage = 'Are you sure you want to delete this project?';
      this.dialogConfirm = () => {
        this.showDialog = false;
        this.notification.info('Project deleted');
        this.router.navigate(['/all-project']);
      };
      this.showDialog = true;
    }
  }

  onSettingChange(): void {
    this.settingsChanged = true;
  }

  uploadCode(event: Event): void {
    // ...обработка загрузки...
    this.notification.success('Code uploaded successfully');
    this.onSettingChange();
  }

  navigateTo(path: string): void {
    if (this.settingsChanged) {
      this.notification.error('Please save changes before navigating');
      return;
    }
    this.router.navigate([path]);
  }

  confirmDeleteProject(): void {
    this.dialogMessage = 'Are you sure you want to delete this project?';
    this.dialogConfirm = () => {
      this.showDialog = false;
      this.notification.info('Project deleted');
      this.router.navigate(['/all-project']);
    };
    this.showDialog = true;
  }
}
