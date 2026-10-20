# Bluebird School Project Portal

Bluebird School is a role-based project portal for students to submit coursework
and track mentor feedback, and for mentors to review submissions. The frontend
uses the Next.js App Router and connects to the existing Express API.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Application routes](#application-routes)
- [Backend integration](#backend-integration)
- [Project structure](#project-structure)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

### Student workspace

- Dashboard with submission totals, pending count, and the latest submission.
- Project submission form with client-side validation and live readiness feedback.
- Preview of the project information before it is submitted.
- Submission history with status badges and links to project resources.
- Individual submission detail view.

### Mentor workspace

- Overview with backend-provided pending, approved, and rejected statistics.
- Dedicated review queue with backend-side status filtering and pagination.
- Repository and live application links for each submission.
- Approve and reject actions with confirmation for rejections.

### Shared capabilities

- Student-only public registration and role-aware sign-in.
- Session restoration and protected, role-specific workspaces.
- Responsive sidebar and mobile navigation.
- Global success and error notifications.

## Technology

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4
- [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/)
- [Sonner](https://sonner.emilkowal.ski/) toast notifications
- [Lucide](https://lucide.dev/) icons
- [Bun](https://bun.sh/) for package management (version `1.4.3`)

## Getting started

### Prerequisites

- Bun `1.4.3` (see the `packageManager` field in `package.json`)
- Access to the Bluebird School API

### Install and run locally

```bash
bun install
```

Create `.env.local` from the example and set the API URL:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment configuration

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Public API base URL, including the `/api/v1` prefix. |

The example file targets the configured backend:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://again-chi-nine.vercel.app/api/v1
```

For a local backend, set the value to its reachable API origin, for example
`http://localhost:5000/api/v1`. Restart the development server after changing
environment variables.

> `NEXT_PUBLIC_*` variables are embedded in browser code and are not secrets.
> Never put credentials, private API keys, or signing secrets in this variable
> or in frontend source.

## Application routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Restore the current session and route to the correct workspace | Public entry |
| `/login` | Sign in | Public |
| `/signup` | Register a student account | Public |
| `/student` | Student overview | `STUDENT` |
| `/student/submit` | Submit a project | `STUDENT` |
| `/student/submissions` | View submission history | `STUDENT` |
| `/student/submissions/[submissionId]` | View submission details | `STUDENT` |
| `/mentor` | Statistics and compact review overview | `MENTOR` |
| `/mentor/review-queue` | Full, filterable review queue | `MENTOR` |

The frontend role gate provides navigation and user experience behavior only.
The backend must enforce authentication and authorization for every protected
API request.

## Backend integration

All requests use `NEXT_PUBLIC_API_BASE_URL` and are centralized in
`lib/api.ts`. Current API routes used by the application:

| Method | API path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Student registration |
| `POST` | `/auth/signin` | Sign in |
| `GET` | `/auth/me` | Restore the authenticated user and role |
| `POST` | `/auth/signout` | Sign out |
| `POST` | `/student/submissions` | Create a project submission |
| `GET` | `/student/submissions` | List the current student's submissions |
| `GET` | `/student/submissions/:submissionId` | Get a submission |
| `GET` | `/teacher/statistics` | Mentor statistics |
| `GET` | `/teacher/submissions` | List and filter submissions |
| `PATCH` | `/teacher/submissions/:submissionId/approve` | Approve a submission |
| `PATCH` | `/teacher/submissions/:submissionId/reject` | Reject a submission |

The create-submission request body is:

```json
{
  "projectName": "Example project",
  "repoUrl": "https://github.com/student/example",
  "liveLink": "https://example.com",
  "description": "A description of the project."
}
```

The API adapter handles JSON parsing, HTTP errors, network failures, and
normalizes common response wrappers. A bearer token is attached only when the
sign-in response contains a token. The backend is the final authority for
session validity and role authorization.

### Backend contract verification

This repository contains the frontend only; backend controller source is not
included. Confirm the exact response wrappers and the following request
contracts against the deployed backend before changing them:

- Signup currently sends `name`, `email`, and `password`.
- Mentor queue filtering and pagination currently send `status`, `page`, and
  `limit`.
- Reject currently sends no request body.
- The adapter supports common response field aliases, but the backend's actual
  response fields should be treated as authoritative.

The API host must allow cross-origin requests from the deployed frontend. The
current client does not send browser cookies; bearer authentication is used
only when a token is explicitly returned by sign-in. If the backend uses
HTTP-only cookie authentication, align the backend CORS and cookie settings
with the deployed frontend origin and update the client to use credentialed
requests.

## Project structure

```text
app/                    App Router pages and routes
  login/                Sign-in page
  mentor/               Mentor overview and review queue
  signup/               Student registration
  student/              Student overview, submission form, history, details
components/
  mentor/               Statistics and review queue UI
  student/              Student submission, history, and overview UI
  ui/                   Shared UI primitives and feedback states
  auth-provider.tsx     Authentication/session context
  dashboard-shell.tsx   Shared role-aware navigation and page shell
hooks/                  Reusable student and mentor data workflows
lib/
  api.ts                Central API client and response normalization
  schemas.ts            Form validation schemas
  types.ts              API and domain types
```

Keep route files focused on composing page sections. Put reusable UI in
`components/`, shared data behavior in `hooks/`, API logic in `lib/api.ts`, and
validation in `lib/schemas.ts`.

## Quality checks

Run these before opening a pull request or deploying:

```bash
bun run lint
bun x tsc --noEmit
bun run build
```

## Deployment

The project can be deployed to Vercel or another platform supporting Next.js:

1. Connect the repository to the hosting provider.
2. Set `NEXT_PUBLIC_API_BASE_URL` in the deployment environment to the
   production API base URL, including `/api/v1`.
3. Ensure the API allows requests from the deployed frontend origin and has
   production authentication/CORS settings configured.
4. Build with `bun run build` and deploy the generated Next.js application.
5. Verify sign-in, session restoration, student submission, mentor queue
   filtering, and review actions against the production API.

Do not rely on client-side role checks as an authorization control.

## Troubleshooting

- **The API cannot be reached:** check `NEXT_PUBLIC_API_BASE_URL`, network
  access, and backend availability.
- **Browser reports a CORS error:** allow the frontend origin and required
  methods/headers in the API's CORS configuration.
- **Sign-in succeeds but refresh loses the session:** confirm whether the API
  returns a bearer token or uses cookies, and configure the frontend/backend
  authentication strategy consistently.
- **A route redirects to sign-in:** check that `/auth/me` returns a recognized
  user ID and role (`STUDENT` or `MENTOR`) for the current session.
- **A submission or queue request is rejected:** compare its payload/query
  names with the backend controller contract and inspect the returned API
  validation message.
