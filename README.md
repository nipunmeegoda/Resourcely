# Resourcely
Group 08 project for Y3 S1

blueprint that fits the technical specs in your slide (React.js + ASP.NET (+ADO.NET) + MySQL + GitHub + Azure App Service/Docker + Selenium/JMeter/Unit tests).

1) High-level architecture
	•	Client (React.js SPA) → ASP.NET Core Web API (ADO.NET + MySQLConnector/Dapper-lite) → MySQL DB
	•	Auth: JWT (stateless). Passwords hashed (bcrypt/Argon2).
	•	Realtime: SignalR for timetable/booking updates.
	•	Notifications: Email (SendGrid), optional Web Push.
	•	Approvals: Resource Manager workflow.
	•	CI/CD: GitHub Actions → Azure App Service (or Docker to Azure Web App for Containers).
	•	Obs/Sec: Serilog to Azure Blob/App Insights; rate limiting; input validation; secrets via Azure Key Vault.

2) Tooling (exact picks)
	•	Frontend
	•	React 18 + Vite
	•	React Router, Zustand (simple) or Redux Toolkit (if you want time-travel/debugger)
	•	UI: Ant Design or MUI; Tailwind optional
	•	Axios (API), Zod (schema validation)
	•	Testing: Vitest/Jest + React Testing Library + Playwright (optional)
	•	Backend
	•	ASP.NET Core 8 Web API
	•	ADO.NET with MySqlConnector (fast) + optional Dapper for clean mapping (still ADO.NET underneath)
	•	SignalR, FluentValidation, Serilog, BCrypt.Net-Next/Isopoh for hashing, MailKit or SendGrid SDK
	•	Testing: xUnit + Moq
	•	Database
	•	MySQL 8 (dev via Docker; prod: Azure Database for MySQL – Flexible Server)
	•	Version Control/PM
	•	GitHub (Issues/Projects, PR templates, CODEOWNERS, branch protection)
	•	Deployment
	•	Azure App Service for the API
	•	Azure Static Web Apps or App Service for the React build
	•	Alternative: Docker images pushed to GHCR/Azure Container Registry + App Service for Containers
	•	Testing/QA
	•	Selenium WebDriver (end-to-end UI flows)
	•	JMeter (load on booking/conflict endpoints)
	•	Postman/Newman (API collections in CI)
	•	DevX
	•	EditorConfig, Prettier + ESLint; .editorconfig + .gitattributes; Git Hooks with Husky
	•	Dotnet tools: dotnet-format, dotnet-ef (only if you later add EF for Identity—optional)

3) Suggested DB schema (minimum viable)

Users(id PK, email UNIQUE, password_hash, name, role ENUM('Student','Lecturer','Admin','Manager'), dept_id FK, created_at)
Resources(id PK, name, type, location, capacity, dept_id FK, is_active)
ResourcePermissions(id PK, resource_id FK, role, can_book BOOL, can_approve BOOL)
Bookings(id PK, resource_id FK, user_id FK, start_utc, end_utc, purpose, status ENUM('Pending','Approved','Rejected','Cancelled'), created_at)
Timetables(id PK, course_code, lecturer_id FK Users, room_resource_id FK Resources, start_utc, end_utc, recurrency json/null)
Notifications(id PK, user_id FK, title, body, is_read, created_at)
AuditLogs(id PK, actor_user_id, action, entity, entity_id, details_json, created_at)
Indexes:
- IX_Bookings_Resource_Time (resource_id, start_utc, end_utc)
- IX_Timetables_Room_Time (room_resource_id, start_utc, end_utc)

Conflict rule (overlap check): a new (start,end) conflicts if:

SELECT 1 FROM Bookings
 WHERE resource_id=@rid AND status IN ('Pending','Approved')
   AND NOT (@end <= start_utc OR @start >= end_utc)
 LIMIT 1 FOR UPDATE;   -- inside a transaction

Use SERIALIZABLE or SELECT ... FOR UPDATE to guarantee atomicity; wrap in a stored procedure or a transactional repository method.

4) API surface (clean & enough)

/api/auth/login → JWT
/api/users (Admin) CRUD
/api/resources list/get; POST/PUT (Manager/Admin)
/api/resources/{id}/permissions (Manager/Admin)
/api/bookings GET mine, POST request; PUT/{id}/cancel
/api/bookings/manage (Manager) PUT/{id}/approve|reject
/api/timetables list by course/lecturer/room; POST/PUT (Lecturer/Admin)
/api/notifications fetch/mark-read
/hubs/updates (SignalR) for live timetable/booking status

5) Backend implementation notes
	•	Project layout

src/
  Api/            (ASP.NET Core controllers, SignalR hub)
  Application/    (services, DTOs, validation)
  Infrastructure/ (ADO.NET repositories, SQL, email, auth)
  Domain/         (entities, enums)
tests/
  UnitTests/
  IntegrationTests/


	•	ADO.NET access
	•	IMySqlConnectionFactory (reads connection string from IConfiguration)
	•	Repositories use parameterized SQL (no string concat) + transactions.
	•	Keep complex overlap logic in one method or stored procedure.
	•	Auth
	•	Users table; on login verify bcrypt hash; issue JWT (issuer/audience from config).
	•	Role-based [Authorize(Roles="Admin,Manager,...")]
	•	SignalR
	•	On booking status change or timetable update: IHubContext<UpdatesHub>.Clients.Group(resourceId).SendAsync(...)
	•	Email/Web Push
	•	On approve/reject & timetable change, enqueue notification → send email (SendGrid) and push (optional).

6) Frontend implementation notes
	•	State slices: auth (JWT + refresh), resources, bookings, timetables, notifications.
	•	Routing:
	•	/login, /resources, /book/:resourceId, /timetable, /admin, /manager
	•	Components:
	•	Resource list/detail, availability calendar (e.g., FullCalendar), booking form with conflict feedback, timetable grid, approval queue, reports.
	•	API client: Axios with interceptor for JWT; Zod to parse responses.
	•	Realtime: @microsoft/signalr client to update calendars live.

7) CI/CD (GitHub → Azure)
	•	Branches: main (prod), dev (staging), feature branches → PRs with checks.
	•	Workflows
	•	backend.yml
	•	dotnet build --configuration Release
	•	dotnet test
	•	Publish: dotnet publish → actions/upload-artifact
	•	Deploy: azure/webapps-deploy with App Service publish profile OR docker build & push to ACR then az webapp create --deployment-container-image-name ...
	•	frontend.yml
	•	npm ci && npm run build
	•	Upload dist/ to Azure Static Web Apps or to App Service (Node build).
	•	Config
	•	App settings via Azure App Service settings; secrets in Key Vault; ConnectionStrings__Default injected at runtime.
	•	DB migrations
	•	SQL scripts versioned in /db/migrations; apply in CI with mysql CLI or use Flyway (community).

8) Testing strategy
	•	Unit (xUnit): services (conflict checker, permission checks, timetable rules).
	•	Integration: spin up MySQL in Testcontainers or Docker; test repository methods & transactions.
	•	E2E UI: Selenium tests for login → search resource → request booking → manager approves → student sees notification.
	•	Performance (JMeter):
	•	Scenarios: burst bookings on same resource/time (to validate locking), timetable publish to many students, notification storm.
	•	KPIs: p95 < 300ms for search/list; booking < 800ms under 100 RPS; zero double-book.
	•	Security: ZAP baseline scan in CI; dependency audit (npm audit, dotnet list package --vulnerable).

9) Resource conflict & timetable harmony
	•	When a timetable is created/edited:
	1.	Validate room/resource availability using the same overlap rule against Bookings and Timetables.
	2.	If a timetable owns the slot, mark that window as blocked for student/lecturer self-booking (policy).
	•	Consider a “hard hold” table ResourceLocks(resource_id, start,end, reason) to quickly block maintenance/timeouts.

10) Minimal sprint plan (4–6 weeks)
	1.	Sprint 1: Auth, Users, Resources CRUD, DB plumbing, CI foundation.
	2.	Sprint 2: Booking API + overlap/transactions + basic React UI.
	3.	Sprint 3: Timetable module + SignalR live updates + notifications (email).
	4.	Sprint 4: Roles/permissions, reports, Selenium/JMeter suites, polish, Azure hardening.
	5.	Release: Cutover scripts, monitoring dashboards, runbook.

11) Repo structure & templates

/.github/ISSUE_TEMPLATE/bug.yml, feature.yml
/.github/workflows/backend.yml, frontend.yml
/frontend/  (React app)
/backend/   (API solution)
/db/migrations/  (SQL)
/docs/ADR/  (architectural decisions)
/scripts/   (init_db.sql, seed.sql, dev containers)

Include .gitignore for React and .NET, PR checklist (tests, security, docs).

12) Security & compliance must-haves
	•	Parameterized queries only; input validation (FluentValidation + Zod)
	•	Role-based access in controllers + server-side checks on resource ownership
	•	Rate limiting (AddRateLimiter) on auth and booking endpoints
	•	CORS locked to your frontend origin
	•	Backups: automated MySQL backups + point-in-time restore
	•	Audit everything that changes bookings/timetables

⸻

If you want, I can:
	•	draft the SQL for these tables (with indexes),
	•	sketch the booking overlap repository method (ADO.NET),
	•	or drop in ready-to-use GitHub Actions files for Azure App Service deployment.