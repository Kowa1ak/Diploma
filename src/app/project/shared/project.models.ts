export enum ProjectStatus {
  Active = 'Active',
  Completed = 'Completed',
  Paused = 'Paused',
}

export enum TestCaseType {
  Positive = 'Positive',
  Negative = 'Negative',
  Boundary = 'Boundary',
  Security = 'Security',
  Performance = 'Performance',
}

export enum TestCaseSource {
  Code = 'Code',
  Requirement = 'Requirement',
  Combined = 'Combined',
  ModelInternal = 'Model Internal',
}

export enum TestCasePriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum TestCaseReviewStatus {
  New = 'New',
  Reviewed = 'Reviewed',
  NeedsRevision = 'Needs Revision',
}

export enum GenerationStatus {
  Completed = 'Completed',
  Failed = 'Failed',
  InProgress = 'In Progress',
  Cancelled = 'Cancelled',
}

export interface TestCase {
  id: string;
  name: string;
  type: TestCaseType;
  source: TestCaseSource;
  component: string;
  priority: TestCasePriority;
  generationRun: string;
  reviewStatus: TestCaseReviewStatus;
  inputData?: string;
  expectedOutcome?: string;
  // Новые поля для детального представления
  description?: string;
  preconditions?: string;
  steps?: string[];
  notes?: string;
  generatedAt?: Date;
  relatedRequirements?: string[];
  aiConfidence?: number;
  // Добавлено для чекбоксов в UI
  selected?: boolean; // для чекбокса
  // Ошибка от API
  error_message?: string;
}

export interface GenerationRun {
  id: string;
  timestamp: Date;
  status: GenerationStatus;
  duration: string;
  testCasesCount: number;
  configuration: string;
  type?: string; // добавлено
  component?: string; // добавлено
  selected?: boolean; // для чекбоксов
}

export interface Project {
  id: string;
  name: string;
  description: string;
  primaryLanguage: string;
  creationDate: Date;
  lastModifiedDate: Date;
  status: ProjectStatus;
}
