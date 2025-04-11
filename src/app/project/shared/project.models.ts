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
}

export interface GenerationRun {
  id: string;
  timestamp: Date;
  status: GenerationStatus;
  duration: string;
  testCasesCount: number;
  configuration?: string;
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
