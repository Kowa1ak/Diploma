import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../shared/project.models';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSettingsComponent implements OnInit {
  @Input() project!: Project;

  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() projectDeleted = new EventEmitter<string>();

  editedProject: Project | null = null;
  projectStatus: 'Active' | 'Completed' | 'Paused' = 'Active';

  // Primary Programming Language dropdown
  languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go'];
  primaryLanguage: string = '';
  languageDropdownOpen = false;

  uploadedArchives: { name: string; date: Date; size: string }[] = [];

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
    };
    input.click();
  }

  deleteArchive(index: number): void {
    this.uploadedArchives.splice(index, 1);
  }

  private formatSize(bytes: number): string {
    const kb = bytes / 1024;
    return kb < 1024 ? kb.toFixed(1) + ' KB' : (kb / 1024).toFixed(1) + ' MB';
  }

  ngOnChanges() {
    // Create a copy of the project data to edit
    this.editedProject = { ...this.project };
  }

  // Инициализируем после загрузки проекта
  ngOnInit(): void {
    this.primaryLanguage = this.editedProject?.primaryLanguage || '';
  }

  saveProjectSettings() {
    // Сохраняем primaryLanguage в объект проекта
    if (this.editedProject) {
      this.editedProject.primaryLanguage = this.primaryLanguage;
      this.projectUpdated.emit(this.editedProject);
      alert('Project settings saved.');
    }
  }

  cancelChanges() {
    // Reset to original values
    this.editedProject = { ...this.project };
    alert('Changes canceled.');
  }

  deleteProject() {
    const confirmName = prompt(
      'Type the project name to confirm deletion: ' + this.project.name
    );
    if (confirmName === this.project.name) {
      this.projectDeleted.emit(this.project.id);
      alert('Project will be deleted.');
    }
  }
}
