import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
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
export class ProjectSettingsComponent {
  @Input() project!: Project;

  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() projectDeleted = new EventEmitter<string>();

  editedProject: Project | null = null;

  ngOnChanges() {
    // Create a copy of the project data to edit
    this.editedProject = { ...this.project };
  }

  saveProjectSettings() {
    if (this.editedProject) {
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
