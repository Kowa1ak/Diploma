import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Project } from '../shared/project.models';

@Component({
  selector: 'app-project-inputs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './project-inputs.component.html',
  styleUrls: ['./project-inputs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInputsComponent {
  @Input() project!: Project;

  // Source code configuration
  sourceCodeMethod: 'git' | 'upload' | 'none' = 'git';
  gitRepositoryUrl: string = 'https://github.com/example/project.git';
  gitBranch: string = 'main';
  repositoryStatus: 'connected' | 'error' | 'not connected' = 'connected';

  // Requirements
  requirements: string =
    'The system should allow users to login with email and password.\n' +
    'Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, and one number.\n' +
    'Users should be able to reset their password via email.';

  connectRepository() {
    // Logic to connect/update repository
    alert('Repository connection updated');
  }

  fetchLatestCode() {
    // Logic to fetch latest code
    alert('Fetching latest code');
  }

  uploadCode() {
    // Logic to upload code archive
    alert('Code upload dialog would open here');
  }

  configureSourceCode() {
    // Logic to configure source code method
    alert('Source code configuration dialog would open here');
  }

  saveRequirements() {
    // Logic to save requirements
    alert('Requirements saved');
  }

  uploadRequirement() {
    // Logic to upload requirement file
    alert('Requirement upload dialog would open here');
  }
}
