import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-new-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', padding: '*' })),
      state('collapsed', style({ height: '*', padding: '*' })),
      transition('expanded <=> collapsed', animate('800ms ease-in-out')),
    ]),
  ],
})
export class NewProjectComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef;

  projectForm: FormGroup;
  formError: string = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  uploadError: string = '';
  containerState: string = 'expanded';

  programmingLanguages = ['Java', 'Python', 'JavaScript', 'C#', 'Go'];
  sourceCodeMethods = [
    { value: 'manual', label: 'Manual Setup / No Code Analysis' },
    { value: 'git', label: 'Link Git Repository' },
    { value: 'upload', label: 'Upload Code Archive (.zip, .tar.gz)' },
  ];

  showLanguageOptions: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      primaryLanguage: ['', Validators.required],
      sourceCodeMethod: ['manual', Validators.required],
      gitUrl: [''],
    });

    this.projectForm
      .get('sourceCodeMethod')
      ?.valueChanges.subscribe((value) => {
        const gitUrlControl = this.projectForm.get('gitUrl');
        if (value === 'git') {
          gitUrlControl?.setValidators([Validators.required]);
        } else {
          gitUrlControl?.clearValidators();
        }
        gitUrlControl?.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    window.addEventListener('click', this.closeDropdown.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.closeDropdown.bind(this));
  }

  ngAfterViewInit(): void {
    // this.animateContainerHeight(); // убрано
  }

  closeDropdown(event: Event): void {
    console.log('closeDropdown: event target', event.target);
    if (!this.el.nativeElement.contains(event.target)) {
      console.log('Closing dropdown because click is outside');
      this.showLanguageOptions = false;
    } else {
      console.log('Click inside dropdown, not closing.');
    }
  }

  toggleLanguageOptions(event: Event): void {
    console.log('toggleLanguageOptions called, event:', event);
    event.stopPropagation(); // предотвращает закрытие списка глобальным кликом
    if (!this.showLanguageOptions) {
      this.showLanguageOptions = true;
      console.log(
        'Dropdown opened, showLanguageOptions =',
        this.showLanguageOptions
      );
    } else {
      console.log('Dropdown already open, state remains true');
    }
  }

  selectLanguage(lang: string): void {
    this.projectForm.get('primaryLanguage')?.setValue(lang);
    this.showLanguageOptions = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      if (file.name.endsWith('.zip') || file.name.endsWith('.tar.gz')) {
        this.selectedFile = file;
        this.selectedFileName = file.name;
        this.uploadError = '';
      } else {
        this.uploadError =
          'Invalid file type. Only .zip and .tar.gz are allowed.';
        this.selectedFile = null;
        this.selectedFileName = '';
      }
    }
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }
    const projectName = this.projectForm.value.projectName;
    const projectId = Math.floor(Math.random() * 1000);
    alert(`Project '${projectName}' created successfully!`);
    this.router.navigate([`/project/${projectId}/dashboard`]);
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }
}
