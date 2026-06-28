# Northbridge Motors — Staff Portal: Backend System Design Document

> **Status:** Design draft — review and annotate before implementation begins.
> **Scope:** Internal staff portal only. No public-facing routes. No front-end integration yet.

---

## 0. Purpose of This Document

This document defines the architecture, role system, authentication approach, UI design language, and page/feature inventory for the Northbridge Motors internal staff portal. It is written so a senior Next.js/TypeScript developer can begin implementation directly from it after sign-off.

Nothing in this document should be implemented speculatively. Each section is a decision that requires approval. Sections marked **[DECISION REQUIRED]** need a client answer before work begins.

---

## 1. Strategic Overview

### 1.1 What This System Does

The staff portal gives Northbridge Motors employees a private, authenticated workspace to:

- Receive and manage **trade-in valuation requests** submitted through the public site
- Receive and manage **finance applications**
- Receive and manage **general contact/enquiry requests**
- Manage **vehicle inventory** (view, create, edit, mark as sold)
- Manage **staff accounts** and their access levels

### 1.2 What This System Does Not Do (Yet)

- It does not replace a dealer management system (DMS)
- It does not process real payments or credit checks
- It does not connect live to the public front-end (this is Phase 2)
- It does not send automated emails or SMS (this is Phase 2)

### 1.3 Design Philosophy

The portal inherits the same visual DNA as the public site — same type scale, same colour tokens, same spacing discipline — but shifts from a *buyer-facing* register to a *task-first* register. Where the public site is calm and persuasive, the portal is dense and efficient. Staff have intent when they open it; they don't need to be convinced of anything.

---

## 2. Technology Decisions

### 2.1 Framework

**Next.js (App Router) + TypeScript** — consistent with the public site stack. The portal is served from a route group within the same Next.js application during development, then promoted to a dedicated subdomain before production deployment.

```
Development:    localhost:3000/admin              ← active during development
Production:     staff.northbridgemotors.co.nz    ← target at deployment
```

**[RESOLVED ✓]** `/admin` route during development, subdomain in production. The code is identical between environments — only the routing config and domain mapping change at deployment time. On Vercel this means adding `staff.northbridgemotors.co.nz` as a custom domain and updating the Next.js middleware matcher; no structural refactor is required.

### 2.2 Authentication

**Recommended: [NextAuth.js v5 (Auth.js)](https://authjs.dev/)** — the de-facto standard for Next.js authentication. Reasons:

- Battle-tested, actively maintained, widely audited
- Supports credentials (email + password) out of the box for internal staff accounts
- Can add OAuth providers later (e.g. Google Workspace login) with minimal change
- Built-in CSRF protection, secure session handling, JWT or database sessions
- No vendor lock-in — runs on your own infrastructure

**Session strategy:** Database sessions (not JWT-only) so sessions can be revoked immediately when a staff member leaves. A compromised JWT that's not yet expired cannot be invalidated — a database session can.

**[RESOLVED ✓]** Northbridge Motors does not use Google Workspace or Microsoft 365. The portal will use **email + password authentication** via NextAuth.js credentials provider. bcrypt hashing applies as defined in section 2.4. OAuth SSO can be added in a future phase if the business adopts a workspace provider.

### 2.3 Database

**[RESOLVED ✓]** **Vercel + Neon Postgres** — selected as the hosting solution. The public site is already on Vercel, so this keeps the entire stack within one platform: unified deployments, preview environments, and a single billing account. Neon's free tier supports always-on serverless Postgres with generous limits suitable for this use case.

**ORM: Prisma** — generates fully-typed query clients from the schema, consistent with the TypeScript-first approach. Prisma migrations provide a clear, reviewable history of schema changes.

**[RESOLVED ✓]** Database hosting: **Vercel + Neon Postgres**
| Option | Status |
|---|---|
| **Vercel + Neon Postgres** | ✓ Selected — consistent with existing Vercel hosting |
| ~~Supabase~~ | Not selected |
| ~~Railway~~ | Not selected |
| ~~Self-hosted VPS~~ | Not selected |

### 2.4 Password Handling

**bcrypt** hashing via NextAuth's built-in credentials provider pattern. Minimum 12 rounds. Passwords are never stored in plain text or reversibly encrypted — only the bcrypt hash is persisted.

Password reset flow uses a **time-limited, single-use token** sent to the staff member's registered email address. Tokens expire after 1 hour.

### 2.5 Additional Libraries

| Library | Purpose |
|---|---|
| `zod` | Server-side schema validation for all form inputs and API routes |
| `@tanstack/react-table` | Data tables for request queues (sortable, filterable, paginated) |
| `date-fns` | Date formatting throughout the portal |
| `react-hot-toast` | Lightweight, accessible toast notifications for actions |
| `lucide-react` | Icon set (already used on public site) |

---

## 3. Role & Permission System

### 3.1 Custom Role Model

**[RESOLVED ✓]** Roles and permissions are **fully customisable** within the portal. Rather than a fixed hierarchy, the system uses a **role + permission matrix** model: an Owner can create any number of named roles and toggle individual permissions on or off per role. Users are assigned exactly one role.

**System-protected role: Owner**

One role — **Owner** — is built into the system and cannot be deleted, renamed, or have its permissions reduced. It always has full access to everything, including role management. This prevents an Owner from accidentally locking themselves out of the system. All other roles are user-defined and fully editable.

**Default roles (pre-seeded at setup, fully editable):**

To give a working system out of the box, four roles are pre-seeded with sensible defaults. These are starting points only — the Owner can rename, adjust, add, or remove them at any time.

| Default Role Name | Suggested for | Starting permission set |
|---|---|---|
| **Owner** | Business owner(s) | All permissions — protected, cannot be modified |
| **Manager** | Branch managers | All permissions except role management and system settings |
| **Sales Staff** | Salespeople | View + action requests; mark vehicles sold; no staff or inventory creation |
| **Viewer** | Accountants, observers | Read-only on contact requests, trade-in requests, inventory |

### 3.2 Permission Catalogue

Every capability in the system is represented as a discrete, toggleable permission. The Owner assigns any combination of these to any role via the Role Management interface (Section 6.11).

**Requests — Contact**
- `contact.view` — View contact request queue and details
- `contact.update` — Update status, assign, add internal notes

**Requests — Trade-In**
- `tradein.view` — View trade-in request queue and details
- `tradein.update` — Update status, assign, add notes, set estimated value

**Requests — Finance**
- `finance.view` — View finance application queue and details
- `finance.update` — Update status, assign, add internal notes

**Inventory**
- `inventory.view` — View vehicle inventory list and detail pages
- `inventory.create` — Create new vehicle listings
- `inventory.edit` — Edit existing vehicle listings
- `inventory.sold` — Mark vehicles as sold or pending
- `inventory.archive` — Archive vehicles

**Staff Management**
- `staff.view` — View staff list and profiles
- `staff.invite` — Invite new staff members
- `staff.edit` — Edit staff profiles and location assignments
- `staff.deactivate` — Deactivate staff accounts
- `staff.roles` — Create, edit, and delete roles; assign roles to users *(Owner only by default)*

**Locations**
- `locations.view` — View location list
- `locations.manage` — Create and edit locations *(Owner only by default)*
- `locations.viewall` — Override location scoping; view data from all locations *(Owner only by default)*

**System**
- `audit.view` — View the audit log
- `settings.manage` — Access system settings *(Owner only by default)*

**Default permission assignments (pre-seeded, fully editable except Owner):**

| Permission | Owner | Manager | Sales Staff | Viewer |
|---|---|---|---|---|
| `contact.view` | ✓ | ✓ | ✓ | ✓ |
| `contact.update` | ✓ | ✓ | ✓ | — |
| `tradein.view` | ✓ | ✓ | ✓ | ✓ |
| `tradein.update` | ✓ | ✓ | ✓ | — |
| `finance.view` | ✓ | ✓ | ✓ | — |
| `finance.update` | ✓ | ✓ | ✓ | — |
| `inventory.view` | ✓ | ✓ | ✓ | ✓ |
| `inventory.create` | ✓ | ✓ | — | — |
| `inventory.edit` | ✓ | ✓ | — | — |
| `inventory.sold` | ✓ | ✓ | ✓ | — |
| `inventory.archive` | ✓ | ✓ | — | — |
| `staff.view` | ✓ | ✓ | — | — |
| `staff.invite` | ✓ | ✓ | — | — |
| `staff.edit` | ✓ | ✓ | — | — |
| `staff.deactivate` | ✓ | — | — | — |
| `staff.roles` | ✓ | — | — | — |
| `locations.view` | ✓ | ✓ | — | — |
| `locations.manage` | ✓ | — | — | — |
| `locations.viewall` | ✓ | — | — | — |
| `audit.view` | ✓ | ✓ | — | — |
| `settings.manage` | ✓ | — | — | — |

**Implementation note:** Permissions are stored in the database as a JSON array on the `Role` model (or a normalised `RolePermission` join table — to be decided at schema time based on query patterns). Server-side middleware resolves `session.user.role.permissions` on every request and checks the required permission for that route/action. There is no client-side permission gating — the UI hides elements for cleanliness, but the server never trusts the client.

### 3.3 Multi-Location Model

**[RESOLVED ✓]** The portal uses a **multi-location model**. A `Location` entity is added to the schema. Each inbound request (contact, trade-in, finance) and each vehicle listing is associated with a location.

**Assignment rules:**
- Each user is assigned one or more locations at account creation or by an Owner/Manager via the staff management interface.
- Users see only requests and inventory belonging to their assigned location(s).
- **Owners** always see all locations and can manage location assignments for any user.
- **Managers** can view all locations assigned to them and manage location assignments for Viewers and Sales Staff within those locations.

**Location switching UI:**
When a user is assigned to more than one location, a **location selector** appears in the portal header (or sidebar). Options:
- Individual location name (scopes all queues and counts to that location)
- **"All Locations"** option (shows combined view across all assigned locations)

The active location context is persisted in session state and displayed clearly in the header at all times, e.g.:

```
[NB Logo]  Staff Portal  |  📍 Wellington Yard  ▾
```

The location selector is a dropdown. Switching location refreshes all queue counts and data without a full page reload.

**Location entity (Prisma pseudocode):**

```
Location {
  id          String    @id @default(cuid())
  name        String    // e.g. "Wellington Yard", "Auckland Yard"
  address     String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  // Relations
  users       UserLocation[]
  requests    ContactRequest[]
  tradeIns    TradeInRequest[]
  finances    FinanceApplication[]
  vehicles    Vehicle[]
}

UserLocation {
  userId      String
  locationId  String
  user        User     @relation(fields: [userId], references: [id])
  location    Location @relation(fields: [locationId], references: [id])
  @@id([userId, locationId])
}
```

### 3.4 Status Model for Requests

All three request types (contact, trade-in, finance) share a common status lifecycle:

```
New → In Progress → Awaiting Response → Resolved / Closed
                                      ↘ Declined (finance/trade-in only)
```

Status transitions are logged to the audit trail with a timestamp and the acting staff member's ID.

---

## 4. Data Models

A high-level schema expressed as Prisma-style pseudocode. Full Prisma schema will be generated from this during implementation.

### 4.1 User (Staff Account)

```
User {
  id            String        @id @default(cuid())
  name          String
  email         String        @unique
  passwordHash  String?       // null if using OAuth
  roleId        String
  role          Role          @relation(fields: [roleId], references: [id])
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  lastLoginAt   DateTime?
  // Relations
  locations     UserLocation[]
  sessions      Session[]
  auditLogs     AuditLog[]
}

Role {
  id            String        @id @default(cuid())
  name          String        @unique   // e.g. "Manager", "Finance Team"
  isSystem      Boolean       @default(false) // true = Owner role; cannot be deleted/modified
  permissions   String[]      // array of permission keys e.g. ["contact.view", "tradein.update"]
  createdAt     DateTime      @default(now())
  // Relations
  users         User[]
}
```

### 4.2 Contact Request

```
ContactRequest {
  id            String        @id @default(cuid())
  name          String
  email         String
  phone         String
  message       String
  locationId    String
  location      Location      @relation(fields: [locationId], references: [id])
  status        RequestStatus @default(NEW)
  assignedTo    User?
  internalNotes Note[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

### 4.3 Trade-In Request

```
TradeInRequest {
  id                  String        @id @default(cuid())
  // Contact
  name                String
  email               String
  phone               String
  preferredContact    String
  // Vehicle
  vehicleMake         String
  vehicleModel        String
  vehicleYear         Int
  plateNumber         String?
  odometerKm          Int
  condition           String
  isModified          Boolean       @default(false)
  modifications       String[]
  vehicleDescription  String?
  outstandingFinance  Boolean       @default(false)
  // Location
  locationId          String
  location            Location      @relation(fields: [locationId], references: [id])
  // Staff fields
  estimatedValue      Int?          // Set by staff after review
  status              RequestStatus @default(NEW)
  assignedTo          User?
  internalNotes       Note[]
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
}
```

### 4.4 Finance Application

```
FinanceApplication {
  id                String        @id @default(cuid())
  // Personal
  fullName          String
  email             String
  phone             String
  dateOfBirth       DateTime
  address           String
  // Employment
  employmentStatus  String
  employerName      String?
  monthlyIncome     Int
  timeInRoleMonths  Int
  // Loan
  vehicleId         String?
  desiredLoanAmount Int
  depositAmount     Int
  termMonths        Int
  hasTradeIn        Boolean       @default(false)
  // Consents
  creditCheckConsent Boolean
  termsAccepted     Boolean
  // Location
  locationId        String
  location          Location      @relation(fields: [locationId], references: [id])
  // Staff fields
  status            RequestStatus @default(NEW)
  assignedTo        User?
  internalNotes     Note[]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}
```

### 4.5 Shared Enums & Models

```
enum RequestStatus {
  NEW
  IN_PROGRESS
  AWAITING_RESPONSE
  RESOLVED
  DECLINED
  CLOSED
}

Note {
  id          String    @id @default(cuid())
  body        String
  author      User
  createdAt   DateTime  @default(now())
  // Polymorphic relation (one of the three below is set)
  contactRequestId     String?
  tradeInRequestId     String?
  financeApplicationId String?
}

AuditLog {
  id          String    @id @default(cuid())
  actor       User
  action      String    // e.g. "STATUS_CHANGED", "NOTE_ADDED", "USER_CREATED"
  entityType  String    // e.g. "TradeInRequest", "User"
  entityId    String
  locationId  String?   // location context at time of action
  metadata    Json?     // before/after values for status changes etc.
  createdAt   DateTime  @default(now())
}
```

---

## 5. Portal Routes

The portal is protected behind authentication at the middleware level — every route under `/` of the staff subdomain requires a valid session. Unauthenticated requests redirect to `/login`.

```
/login                          Public — authentication page
/                               Dashboard (redirect target after login)
/requests
  /contact                      Contact request queue
  /contact/[id]                 Individual contact request detail
  /trade-in                     Trade-in request queue
  /trade-in/[id]                Individual trade-in request detail
  /finance                      Finance application queue
  /finance/[id]                 Individual finance application detail
/inventory                      Vehicle inventory list (Manager+)
/inventory/[id]                 Vehicle detail / edit (Manager+)
/inventory/new                  Create new vehicle listing (Manager+)
/staff                          Staff account list (staff.view)
/staff/[id]                     Staff member detail / edit (staff.edit)
/staff/invite                   Invite new staff member (staff.invite)
/roles                          Role list and management (staff.roles)
/roles/[id]                     Edit role permissions (staff.roles)
/roles/new                      Create new role (staff.roles)
/locations                      Location management (Owner only)
/locations/[id]                 Edit location details (Owner only)
/locations/new                  Create new location (Owner only)
/audit                          Audit log (Manager+)
/settings                       System settings (Owner only)
/account                        Own account / change password (all roles)
```

---

## 6. Page Designs

### 6.1 Design Language

The portal uses the same tokens as the public site with one shift: **information density increases**. Where the public site uses generous whitespace to feel premium, the portal uses tighter spacing so staff can read more per screen. The rule: one screen should show a full request queue without scrolling on a standard 1080p monitor.

**Token overrides for portal context:**

| Token | Public site | Portal |
|---|---|---|
| Section padding | `5rem 0` | `1.5rem 0` |
| Card padding | `1.5rem` | `1rem` |
| Base font size | `1rem` | `0.9rem` |
| Table row height | N/A | `48px` |

Everything else — colours, typefaces, border radius, focus rings — inherits unchanged.

---

### 6.2 Login Page `/login`

**Layout:** Centred card on a navy (`#142036`) background. Minimal. No navigation.

**Elements:**
- Northbridge Motors wordmark + "Staff Portal" label beneath
- Email field
- Password field with show/hide toggle
- "Sign in" primary button (Ignition Orange)
- "Forgot your password?" link below the button
- Error state: inline red banner — "Incorrect email or password." (deliberately vague — never confirm which field is wrong)
- No "Create account" link — accounts are invitation-only

**Security behaviour:**
- Rate limiting: after 5 failed attempts within 10 minutes, the form is locked for 15 minutes with a countdown
- Lock message: "Too many attempts. Try again in [X] minutes."
- Failed attempts are logged to the audit trail

---

### 6.3 Dashboard `/`

**Purpose:** Orientation at a glance. No deep data — just counts and recent activity.

**Layout:** Full-width, sidebar navigation persistent left, main content right.

**Location selector:** Displayed in the header bar when a user is assigned to more than one location. Shows the currently active location name with a dropdown chevron. Selecting a different location or "All Locations" immediately refreshes all counts and queue data.

```
┌─────────────────────────────────────────────────────┐
│  [NB Logo]  Staff Portal    📍 Wellington Yard  ▾   │
└─────────────────────────────────────────────────────┘
```

**Sidebar navigation:**
```
[NB Logo]  Staff Portal

○  Dashboard
─────────────
○  Contact Requests        [badge: new count]  (contact.view)
○  Trade-In Requests       [badge: new count]  (tradein.view)
○  Finance Applications    [badge: new count]  (finance.view)
─────────────
○  Inventory               (inventory.view)
─────────────
○  Staff                   (staff.view)
○  Roles                   (staff.roles)
○  Locations               (locations.manage)
○  Audit Log               (audit.view)
○  Settings                (settings.manage)
─────────────
○  My Account
   [Name]  [Role pill]
   Sign out
```

Navigation items are shown or hidden based on the current user's permissions. The role pill in the sidebar footer shows the user's role name.

Badges are orange pills showing the count of `NEW` items within the active location context. They disappear when count is 0.

**Main content — four summary cards:**

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Contact        │  │  Trade-In       │  │  Finance        │  │  Inventory      │
│                 │  │                 │  │                 │  │                 │
│   3  New        │  │   1  New        │  │   2  New        │  │  47  Listed     │
│  12  Open       │  │   5  Open       │  │   8  Open       │  │   3  Sold       │
│   —  This week  │  │  $18,500 est.   │  │   —  In review  │  │   2  Pending    │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

All counts reflect the currently selected location context (or all assigned locations if "All Locations" is selected).

Below the cards: **Recent activity feed** — last 15 audit log entries across all types within the active location context, newest first. Each entry shows: actor name, action, entity type + truncated ID, time ago. E.g. "Sarah marked Trade-In #TI-0041 as In Progress · 12 minutes ago."

---

### 6.4 Request Queue Pages `/requests/[type]`

All three queue pages share identical layout. Only the columns differ.

**Layout:** Table with sticky header, filter bar above.

**Filter bar (above table):**
```
[ Search name / email…  🔍 ]  [ Status ▾ ]  [ Assigned to ▾ ]  [ Date range ]  [ Clear ]
```

The queue is automatically scoped to the active location context. If the user is viewing "All Locations", a **Location** column is added to the table so staff can see which yard each request belongs to.

**Table columns:**

*Contact Requests:*
| # | Name | Email | Phone | Message preview | Status | Received | Assigned | Location* |
|---|---|---|---|---|---|---|---|---|

*Trade-In Requests:*
| # | Name | Vehicle | Year | Odometer | Condition | Modified | Status | Received | Assigned | Location* |
|---|---|---|---|---|---|---|---|---|---|---|

*Finance Applications:*
| # | Name | Loan amount | Term | Employment | Status | Received | Assigned | Location* |
|---|---|---|---|---|---|---|---|---|

*\* Location column only shown in "All Locations" view.*

**Status pills:**

| Status | Colour |
|---|---|
| New | Orange background, white text |
| In Progress | Navy background, white text |
| Awaiting Response | Amber background, dark text |
| Resolved / Closed | Grey background, muted text |
| Declined | Red background, white text |

**Row behaviour:**
- Click any row → navigate to detail page
- Hover → subtle row highlight (`--color-bg`)
- "New" rows display a left-edge orange accent border to draw the eye
- Unread/unassigned rows are visually distinct (slightly bolder name text)

**Pagination:** 25 rows per page, numbered pagination below table.

---

### 6.5 Request Detail Pages `/requests/[type]/[id]`

**Layout:** Two-column. Left (wider): request data. Right (narrower): staff action panel.

**Left column — request data:**

Displays all submitted form fields in a clean definition-list style. The associated location is shown in the request header:

```
┌─────────────────────────────────────────────┐
│  ← Back to Trade-In Requests                │
│                                             │
│  TI-0041  ·  Toyota Hilux 2019             │
│  📍 Wellington Yard                         │
│  Received 2 hours ago · John Smith          │
│                                             │
│  CONTACT DETAILS                            │
│  Name        John Smith                     │
│  Email       john@example.com               │
│  Phone       021 123 4567                   │
│  Prefers     Phone call                     │
│                                             │
│  VEHICLE                                    │
│  Make/Model  Toyota Hilux                   │
│  Year        2019                           │
│  Plate       ABC123                         │
│  Odometer    87,000 km                      │
│  Condition   Good                           │
│  Modified    Yes — Performance, Wheels      │
│                                             │
│  DESCRIPTION                                │
│  "Full service history, new tyres fitted    │
│   3 months ago, tow bar included…"          │
│                                             │
│  FINANCE     Outstanding finance on vehicle │
└─────────────────────────────────────────────┘
```

**Right column — staff action panel:**

```
┌──────────────────────────┐
│  STATUS                  │
│  [ In Progress      ▾ ]  │
│                          │
│  ASSIGNED TO             │
│  [ Sarah K.         ▾ ]  │
│                          │
│  ─── Trade-in only ───   │
│  ESTIMATED VALUE         │
│  [ $___,___      NZD ]   │
│  [ Save Estimate   ]     │
│                          │
│  ─────────────────────── │
│  INTERNAL NOTES          │
│  ┌────────────────────┐  │
│  │ Add a note…        │  │
│  └────────────────────┘  │
│  [ Add Note ]            │
│                          │
│  ── Previous notes ──    │
│  Sarah K. · 1hr ago      │
│  "Called, left voicemail"│
│                          │
│  Marcus C. · 3hrs ago    │
│  "Initial review done"   │
└──────────────────────────┘
```

Notes are private to staff — never visible to the customer.

**Finance application only:** An additional section shows a simple serviceability indicator:

```
  QUICK SERVICEABILITY
  Monthly income    $4,500
  Loan amount       $28,000
  Term              60 months
  Est. repayment    ~$520/mo    ← calculated, not a real quote
  Income ratio      11.6%       ← repayment as % of income
  ─────────────────────────
  ⚠ This is indicative only. A qualified finance assessment is required.
```

This is a convenience for staff, not a credit decision.

---

### 6.6 Inventory `/inventory`

Mirrors the public inventory page in data but shows all statuses (including Sold, Pending) and adds management controls. Scoped to the active location context.

**Table columns:**
| Photo | Year/Make/Model | Price | Odometer | Status | Location* | Listed | Actions |
|---|---|---|---|---|---|---|---|

*\* Location column only shown in "All Locations" view.*

**Actions column:** Edit · Mark Sold · Archive (icon buttons, not text links — space-efficient).

**"+ New Vehicle" button** top-right (Manager+ only), Ignition Orange. New vehicles are created under the currently active location.

Status pills add two new states not on the public site:

| Status | Colour |
|---|---|
| Available | Green |
| Pending | Amber |
| Sold | Grey/muted |
| Archived | Light grey, italic |

---

### 6.7 Staff Management `/staff`

**Requires `staff.view` permission.** Staff without this permission do not see this section in navigation at all.

**List view:**

```
┌──────────────┬───────────────┬─────────────┬──────────────┬────────────┬──────────────────┬─────────┐
│ Name         │ Email         │ Role        │ Locations    │ Last login │ Status           │ Actions │
├──────────────┼───────────────┼─────────────┼──────────────┼────────────┼──────────────────┼─────────┤
│ Brendan Park │ b@nb.co.nz    │ Owner       │ All          │ Today 9:14 │ Active           │ View    │
│ Sarah K.     │ s@nb.co.nz    │ Sales Staff │ Wellington   │ Today 8:02 │ Active           │ Edit    │
│ Marcus Chen  │ m@nb.co.nz    │ Manager     │ Wgtn, Akl   │ Yesterday  │ Active           │ Edit    │
│ Old Employee │ o@nb.co.nz    │ Viewer      │ Wellington   │ 3 months   │ Inactive         │ Edit    │
└──────────────┴───────────────┴─────────────┴──────────────┴────────────┴──────────────────┴─────────┘
```

**Staff detail / edit page:** Includes a **Locations** section where authorised staff (`staff.edit`) can assign or remove locations for that user. Includes a **Role** dropdown listing all available roles. The Owner role is listed but can only be assigned/unassigned by users who themselves hold the Owner (system) role.

**Invite flow (`staff.invite`):**
1. Inviting user enters name, email, role, and assigned location(s)
2. System sends invitation email with a time-limited setup link (24 hours)
3. New staff member sets their own password via the link
4. Account is created with the role and location(s) assigned at invite time
5. Invitations that haven't been accepted show as "Pending" in the list

**Deactivation (`staff.deactivate`):**
- The Owner system role cannot be deactivated if it is the last active account holding that role — the system enforces a minimum of one active Owner at all times
- Deactivation immediately invalidates all active sessions for that user

---

### 6.8 Role Management `/roles`

**Requires `staff.roles` permission** — Owner only by default. Hidden from navigation for all other roles.

This is where Owners create, edit, and delete custom roles and define exactly which permissions each role has.

**Role list view:**

```
┌─────────────────┬────────────────────────────────────────────┬──────────┬─────────┐
│ Role Name       │ Permissions summary                        │ Users    │ Actions │
├─────────────────┼────────────────────────────────────────────┼──────────┼─────────┤
│ Owner  🔒       │ All permissions (system role)              │ 1        │ View    │
│ Manager         │ All except settings, roles                 │ 2        │ Edit    │
│ Sales Staff     │ Requests, inventory (limited)              │ 4        │ Edit    │
│ Viewer          │ View only — contacts, trade-ins, inventory │ 1        │ Edit    │
│ Finance Team    │ Finance applications only                  │ 2        │ Edit    │
└─────────────────┴────────────────────────────────────────────┴──────────┴─────────┘
```

The lock icon (🔒) on Owner indicates it is a system role — the row has no Edit action, only View.

**"+ New Role" button** top-right, Ignition Orange.

**Role create/edit page:**

A form with a **role name** field at the top and a **permission toggle matrix** below. Permissions are grouped by category (Requests, Inventory, Staff, Locations, System) with toggle switches per permission. A summary of active permissions is shown at the bottom before saving.

```
  Role name:  [ Finance Team              ]

  REQUESTS
  ○ contact.view    View contact requests          [ OFF ]
  ○ contact.update  Update contact requests        [ OFF ]
  ○ tradein.view    View trade-in requests         [ OFF ]
  ○ tradein.update  Update trade-in requests       [ OFF ]
  ○ finance.view    View finance applications      [  ON ]
  ○ finance.update  Update finance applications    [  ON ]

  INVENTORY
  ○ inventory.view    View inventory               [ OFF ]
  ○ inventory.create  Create listings              [ OFF ]
  ...

  STAFF
  ...

  SYSTEM
  ...

  Active permissions: finance.view, finance.update
  Users with this role: 2

  [ Save Role ]   [ Cancel ]
```

**Deletion rules:**
- Roles with active users cannot be deleted. The Owner must reassign those users first, or the delete action prompts: "Reassign 2 users before deleting this role."
- The system Owner role cannot be deleted under any circumstances.
- Deleting a role is logged to the audit trail as `ROLE_DELETED` with the role name and permission set captured in metadata.

---

### 6.9 Location Management `/locations`

**[Owner only]**

A simple management page for the yard/location entities.

**List view:**

```
┌────────────────────┬──────────────────────┬─────────────────┬─────────┐
│ Name               │ Address              │ Active Staff    │ Actions │
├────────────────────┼──────────────────────┼─────────────────┼─────────┤
│ Wellington Yard    │ 12 Cuba St, Te Aro   │ 4               │ Edit    │
│ Auckland Yard      │ 34 Great North Rd    │ 2               │ Edit    │
└────────────────────┴──────────────────────┴─────────────────┴─────────┘
```

**"+ New Location" button** top-right, Ignition Orange.

**Create/edit form fields:** Name, address, phone (optional). Locations cannot be deleted once they have associated requests or staff — they can be marked **Inactive** instead, which hides them from selectors but preserves historical data.

---

### 6.10 Audit Log `/audit`

**Requires `audit.view` permission.**

A chronological log of all system actions. Immutable — no staff member can delete or edit entries.

**Columns:** Timestamp · Actor · Action · Entity type · Entity ID · Location · Detail

**Filterable by:** Actor, action type, entity type, location, date range.

**Retention:** Logs are kept indefinitely (no auto-deletion). This is important for compliance and dispute resolution.

**Example entries:**
```
2026-06-25 09:14  Brendan P.   STATUS_CHANGED    TradeInRequest   TI-0041   Wellington   New → In Progress
2026-06-25 08:55  Sarah K.     NOTE_ADDED        FinanceApp       FA-0019   Wellington   —
2026-06-25 08:02  Marcus C.    USER_CREATED      User             USR-0008  —            sarah@nb.co.nz
2026-06-24 17:30  Sarah K.     LOGIN             User             USR-0004  —            —
2026-06-24 16:45  System       INVITE_SENT       User             USR-0008  —            sarah@nb.co.nz
```

---

### 6.11 Settings `/settings`

**Requires `settings.manage` permission** — Owner only by default.

A simple settings page. Initially sparse — will grow over time.

**Sections:**

- **Business details** — name, phone, address, hours (used to populate site-wide contact info once front-end integration is built)
- **Notification preferences** — Email notifications on new requests are **not implemented in this phase**. The settings UI will include a placeholder section marked "Coming soon — Phase 4" so the Owner knows it is planned.
- **Data retention** — configurable retention period for finance applications (default: 1 month). After the retention period, applications are automatically purged. The retention value is adjustable from this page; changes apply prospectively. A warning is shown when reducing the retention period: "Reducing this value will permanently delete applications older than the new threshold."
- **Danger zone** — account-level actions (export all data, future: delete account)

---

## 7. Security Considerations

### 7.1 Authentication

- All sessions stored server-side in the database (not client-side JWT only) — revocable immediately
- Sessions expire after **8 hours of inactivity** — staff should not stay logged in overnight unattended
- Session cookies are `HttpOnly`, `Secure`, `SameSite=Lax`
- CSRF protection via NextAuth's built-in mechanisms

### 7.2 Authorisation

- Permission checks happen **server-side on every request** — never trust client-side permission state alone
- Every API route resolves the session user's role and its permission array, then checks the required permission key for that route/action
- Middleware protects all portal routes at the edge — unauthenticated requests never reach page code
- Location scoping is enforced at the database query level — staff cannot access records outside their assigned locations regardless of URL manipulation
- The UI hides navigation items and controls the user lacks permission for, but this is cosmetic only — the server enforces all access rules independently

### 7.3 Data

- Finance applications contain sensitive personal data (income, DoB, address). These fields should be:
  - Encrypted at rest if the hosting provider does not handle this automatically
  - Excluded from audit log `metadata` fields (log the action, not the data)
  - Subject to a **configurable data retention period** (default: 1 month, adjustable in Settings by Owner)
- A scheduled job (cron) runs daily to purge finance applications older than the configured retention period. Purges are logged to the audit trail as `FINANCE_APPLICATION_PURGED` with a count but without personal data.
- Plate numbers and personal details in trade-in requests fall under NZ Privacy Act obligations — access should be limited to staff who need it (enforced by the role matrix above, and by location scoping)

### 7.4 Input Validation

- All inputs validated with **Zod** schemas on the server before any database write
- No raw SQL — Prisma's query builder prevents SQL injection by design
- File uploads (if added for vehicle photos): type and size validation before storage, stored in a CDN/object store (not the database)

### 7.5 Rate Limiting

- Login endpoint: 5 attempts per 10 minutes per IP
- API routes: general rate limiting per session (prevents bulk data scraping by a compromised account)
- Invite links: single-use, expire after 24 hours, invalidated immediately on use

---

## 8. Open Decisions Summary

| # | Decision | Status | Resolution |
|---|---|---|---|
| 1 | Portal location | ✓ Resolved | `/admin` in development · subdomain in production |
| 2 | Auth method | ✓ Resolved | Email + password via NextAuth credentials provider |
| 3 | Database hosting | ✓ Resolved | Vercel + Neon Postgres |
| 4 | Multi-location | ✓ Resolved | Multi-location model implemented; location selector in header; Owners see all |
| 5 | Email notifications | ✓ Resolved | Not implemented in this phase; placeholder in Settings UI; deferred to Phase 4 |
| 6 | Finance data retention | ✓ Resolved | Default 1 month; configurable from Settings page by Owner |
| 7 | Role system | ✓ Resolved | Fully customisable roles and permissions; Owner is system-protected; four roles pre-seeded as defaults |

**All decisions resolved. Implementation may begin.**

---

## 9. Implementation Phases

### Phase 1 — Authentication & Shell
- NextAuth setup with credentials provider
- Database schema + Prisma migrations (including Location, UserLocation, Role, permission array)
- Seed default roles (Owner, Manager, Sales Staff, Viewer) with default permissions
- Login page, session middleware, portal shell with navigation
- Permission-based navigation visibility
- Location selector component in header
- Permission and location-based route protection
- Own account / change password page

### Phase 2 — Request Queues
- Contact request queue + detail view
- Trade-in request queue + detail view
- Finance application queue + detail view
- Status updates, assignment, internal notes
- Audit logging for all state changes
- Location context applied to all queues

### Phase 3 — Inventory, Staff & Role Management
- Inventory list and detail/edit views
- New vehicle creation form
- Staff list, invite flow, role assignment
- Location assignment UI in staff detail pages
- Role management pages — create/edit roles, toggle permissions (Owner only)
- Location management pages (Owner only)
- Audit log page

### Phase 4 — Settings & Notifications
- Settings page (including data retention configuration and notification placeholder)
- Email notification on new request (transactional email integration via Resend or Postmark)
- Password reset flow via email
- Scheduled purge job for finance applications (with audit logging)

### Phase 5 — Front-End Integration
- API endpoints consumed by the public site for form submissions
- Real-time badge counts (new request notifications in portal)
- Webhook or polling for live updates

---

## 10. Summary

The Northbridge Motors staff portal is a private, permission-gated internal tool that gives the team a single place to manage all inbound customer requests across multiple locations. It uses proven, auditable authentication (NextAuth.js with email + password), a fully customisable role and permission system (with four sensible defaults pre-seeded and the Owner role system-protected), and a multi-location model that scopes all data to the user's assigned yard(s) while giving Owners a unified cross-location view. The data model is designed to support the front-end integration that follows in Phase 5. The visual language inherits the public site's design tokens — same colours, same typefaces, same component quality — but shifts to a higher-density, task-first layout appropriate for staff rather than customers.

All decisions are resolved. Implementation may begin with Phase 1.

---

*Document version: 0.4 — all decisions resolved; custom role/permission model adopted; email notifications deferred to Phase 4*
*Prepared for: Northbridge Motors*