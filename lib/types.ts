export type UserRole = "STUDENT" | "MENTOR";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Submission = {
  id: string;
  projectName: string;
  repositoryUrl?: string;
  liveUrl?: string;
  description?: string;
  status: SubmissionStatus;
  studentName?: string;
  createdAt?: string;
};

export type SubmissionInput = {
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
};

export type MentorStatistics = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

export type PageInfo = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
};
