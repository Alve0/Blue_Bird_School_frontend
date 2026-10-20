import type {
  MentorStatistics,
  PageInfo,
  Submission,
  SubmissionInput,
  SubmissionStatus,
  User,
  UserRole,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
const TOKEN_KEY = "bluebird_access_token";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
  else window.sessionStorage.removeItem(TOKEN_KEY);
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function findToken(value: unknown, depth = 0): string | null {
  if (depth > 3) return null;
  const record = getRecord(value);
  if (!record) return null;
  for (const key of ["accessToken", "access_token", "token"]) {
    if (typeof record[key] === "string") return record[key];
  }
  return findToken(record.data, depth + 1) ?? findToken(record.user, depth + 1);
}

function errorMessage(status: number, serverMessage: string) {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested item could not be found.";
  const safeMessage =
    serverMessage.length <= 240 && !/[\r\n]| at [\w$.<>/\\:-]+\s*\(/.test(serverMessage)
      ? serverMessage
      : "";
  if (status === 409) return safeMessage || "This request conflicts with existing data.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again.";
  return safeMessage || "The request could not be completed.";
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const route = path.replace(/^\/+/, "");
  const headers = new Headers(options.headers);
  const token = getStoredToken();

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${base}/${route}`, {
      ...options,
      headers,
      credentials: "omit",
    });
  } catch {
    throw new ApiError("Cannot reach the service. Check your connection and try again.");
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }
  const record = getRecord(payload);
  if (!response.ok) {
    if (response.status === 401 && route === "auth/signin") {
      throw new ApiError("Email or password is incorrect.", response.status);
    }
    throw new ApiError(
      errorMessage(
        response.status,
        getString(record?.message) || getString(record?.error),
      ),
      response.status,
    );
  }

  return payload as T;
}

function unwrap(value: unknown): unknown {
  const record = getRecord(value);
  return record && "data" in record ? record.data : value;
}

export function normalizeUser(value: unknown): User {
  const outer = getRecord(value);
  const record = getRecord(outer?.user) ?? getRecord(unwrap(value));
  if (!record) throw new ApiError("The server returned an invalid user.");

  const roleField = record.role;
  const roleValue = getString(
    typeof roleField === "string" ? roleField : getRecord(roleField)?.name,
  ).toUpperCase();
  const role: UserRole | null =
    roleValue === "STUDENT" ? "STUDENT" : roleValue === "MENTOR" ? "MENTOR" : null;
  const id = getString(record.id ?? record._id);
  const name = getString(record.name ?? record.fullName ?? record.username);
  const email = getString(record.email);
  if (!role || !id) throw new ApiError("The server did not return a recognized user role.");
  return { id, name: name || email || "User", email, role };
}

export function rememberTokenFromResponse(value: unknown) {
  setStoredToken(findToken(value));
}

function normalizeStatus(value: unknown): SubmissionStatus {
  const status = getString(value).toUpperCase();
  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    return status;
  }
  throw new ApiError("The server returned an unrecognized submission status.");
}

export function normalizeSubmission(value: unknown): Submission {
  const record = getRecord(value);
  if (!record) throw new ApiError("The server returned an invalid submission.");
  const student = getRecord(record.student) ?? getRecord(record.user);
  return {
    id: getString(record.id ?? record._id ?? record.submissionId),
    projectName: getString(record.projectName ?? record.name ?? record.title) || "Untitled project",
    repositoryUrl: getString(record.repositoryUrl ?? record.repoUrl ?? record.githubUrl) || undefined,
    liveUrl: getString(record.liveLink ?? record.liveUrl ?? record.liveApplicationUrl ?? record.deployedUrl) || undefined,
    description: getString(record.description) || undefined,
    status: normalizeStatus(record.status),
    studentName:
      getString(record.studentName ?? student?.name ?? student?.fullName) || undefined,
    createdAt: getString(record.createdAt ?? record.submittedAt ?? record.created_at) || undefined,
  };
}

function findArray(value: unknown, keys: string[], depth = 0): unknown[] | null {
  if (depth > 3) return null;
  if (Array.isArray(value)) return value;
  const record = getRecord(value);
  if (!record) return null;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return findArray(record.data, keys, depth + 1);
}

export async function getStudentSubmissions() {
  const result = await apiRequest<unknown>("student/submissions");
  const items = findArray(result, ["submissions", "items", "results"]);
  if (!items) throw new ApiError("The server returned an invalid submission list.");
  return items.map(normalizeSubmission);
}

export async function createStudentSubmission(input: SubmissionInput) {
  return apiRequest<unknown>("student/submissions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getSubmission(id: string) {
  const result = await apiRequest<unknown>(`student/submissions/${encodeURIComponent(id)}`);
  return normalizeSubmission(unwrap(result));
}

export async function getMentorStatistics(): Promise<MentorStatistics> {
  const result = await apiRequest<unknown>("teacher/statistics");
  const unwrapped = unwrap(result);
  const outer = getRecord(unwrapped);
  const record =
    getRecord(outer?.statistics) ??
    getRecord(outer?.counts) ??
    outer;
  if (!record) throw new ApiError("The server returned invalid statistics.");
  const readCount = (...keys: string[]) => {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
      if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
        const parsed = Number(value);
        if (parsed >= 0) return parsed;
      }
    }
    return null;
  };
  const pending = readCount("pending", "totalPending", "pendingCount", "pendingSubmissions");
  const approved = readCount("approved", "totalApproved", "approvedCount", "approvedSubmissions");
  const rejected = readCount("rejected", "totalRejected", "rejectedCount", "rejectedSubmissions");
  if (pending === null || approved === null || rejected === null) {
    throw new ApiError("The server returned incomplete statistics.");
  }
  const total = readCount("total", "totalSubmissions") ?? pending + approved + rejected;
  return { pending, approved, rejected, total };
}

export async function getMentorSubmissions(
  status: "ALL" | SubmissionStatus,
  page: number,
  pageSize: number,
): Promise<{ submissions: Submission[]; pageInfo: PageInfo }> {
  const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
  if (status !== "ALL") query.set("status", status);
  const result = await apiRequest<unknown>(`teacher/submissions?${query.toString()}`);
  const items = findArray(result, ["submissions", "items", "results"]);
  if (!items) throw new ApiError("The server returned an invalid review queue.");

  const record = getRecord(unwrap(result));
  const pagination =
    getRecord(record?.pagination) ?? getRecord(record?.meta) ?? record ?? {};
  const resolvedPage = Number(pagination.page ?? pagination.currentPage ?? page);
  const resolvedPageSize = Number(pagination.limit ?? pagination.pageSize ?? pageSize);
  const totalItems = Number(pagination.total ?? pagination.totalItems ?? pagination.count ?? items.length);
  const totalPages = Number(
    pagination.totalPages ?? pagination.pages ?? Math.max(1, Math.ceil(totalItems / resolvedPageSize)),
  );
  return {
    submissions: items.map(normalizeSubmission),
    pageInfo: {
      page: Number.isFinite(resolvedPage) && resolvedPage > 0 ? resolvedPage : page,
      pageSize: Number.isFinite(resolvedPageSize) && resolvedPageSize > 0 ? resolvedPageSize : pageSize,
      totalItems: Number.isFinite(totalItems) ? totalItems : items.length,
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    },
  };
}

export async function reviewSubmission(id: string, action: "approve" | "reject") {
  return apiRequest<unknown>(
    `teacher/submissions/${encodeURIComponent(id)}/${action}`,
    { method: "PATCH" },
  );
}

export function submissionStatusLabel(status: SubmissionStatus) {
  return status[0] + status.slice(1).toLowerCase();
}
