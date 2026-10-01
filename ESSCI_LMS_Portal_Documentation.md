# ESSCI LMS Portal — Complete User Documentation

> **Portal URL:** [https://essci.demodevelopment.com/](https://essci.demodevelopment.com/)

---

## Table of Contents

1. [Portal Overview](#1-portal-overview)
2. [How to Log In (Step-by-Step)](#2-how-to-log-in-step-by-step)
3. [All User Accounts & Credentials](#3-all-user-accounts--credentials)
4. [Role-by-Role Access Guide](#4-role-by-role-access-guide)
   - [4.1 Super Administrator](#41-super-administrator)
   - [4.2 LMS Administrator](#42-lms-administrator)
   - [4.3 Organization Administrator](#43-organization-administrator)
   - [4.4 Department Head](#44-department-head)
   - [4.5 Instructor](#45-instructor)
   - [4.6 Manager](#46-manager)
   - [4.7 Learner](#47-learner)
5. [Module Reference](#5-module-reference)
6. [Security & MFA Notes](#6-security--mfa-notes)
7. [Self-Registration (New Learners)](#7-self-registration-new-learners)
8. [Forgot Password Flow](#8-forgot-password-flow)
9. [Quick Reference Card](#9-quick-reference-card)

---

## 1. Portal Overview

The **ESSCI LMS Portal** is a multi-tenant, role-based Learning Management System built for enterprise training and professional development. It supports:

- **7 built-in user roles** with distinct access scopes and permission tiers
- **Course creation, video playback**, and structured curriculum management
- **Learning paths, certifications**, and gamification (badges, leaderboards)
- **Real-time reports, compliance tracking**, and organizational management
- **Calendar, virtual conferences, discussions**, and automated notifications
- **Multi-Factor Authentication (MFA / OTP)** for secure login across all devices

---

## 2. How to Log In (Step-by-Step)

### Step 1 — Open the Portal

Navigate to **[https://essci.demodevelopment.com/](https://essci.demodevelopment.com/)** in any modern browser (Chrome, Firefox, Edge, Safari).

### Step 2 — Enter Your Identifier

On the login page, enter your **email address** in the *"Email or username"* field, then click **Continue**.

### Step 3 — OTP Verification (MFA)

If your account has MFA enabled, you are prompted for a 6-digit verification code.

> **Demo OTP for all accounts: `123456`**

Enter `123456` and click **Verify**.

- Optionally tick **"Trust this browser for 30 days"** to skip OTP on future logins from the same device.

> **Accounts without MFA** (Instructor, Learner) skip this step entirely and land directly on the dashboard.

### Step 4 — You're In!

You are automatically redirected to your role-specific dashboard:

```
https://essci.demodevelopment.com/[role]/dashboard
```

> **Password note:** This is a demo/mock portal. No password is required — only your email identifier, plus the OTP `123456` if your account has MFA enabled.

---

## 3. All User Accounts & Credentials

| # | Role | Display Name | Login Email | OTP | MFA Enrolled | Org | Department |
|---|------|-------------|-------------|-----|-------------|-----|------------|
| 1 | **Super Administrator** | Aarav Sharma | `super@lms.dev` | `123456` | ✅ Yes | LMS Platform | — |
| 2 | **LMS Administrator** | Alok Verma | `lmsadmin@lms.dev` | `123456` | ✅ Yes | LMS Platform | — |
| 3 | **Organization Administrator** | Dr. Rajeshwar Rao | `admin@lms.dev` | `123456` | ✅ Yes | ESSCI | — |
| 4 | **Department Head** | Devika Patel | `depthead@lms.dev` | `123456` | ✅ Yes | ESSCI | Engineering |
| 5 | **Instructor** | Prof. Priya Nair | `instructor@lms.dev` | *(not required)* | ❌ No | ESSCI | Engineering |
| 6 | **Learner** | Rohan Deshmukh | `learner@lms.dev` | *(not required)* | ❌ No | ESSCI | Electronics |
| 7 | **Manager** | Ananya Gupta | `manager@lms.dev` | `123456` | ✅ Yes | ESSCI | Electronics |

---

## 4. Role-by-Role Access Guide

---

### 4.1 Super Administrator

| | |
|---|---|
| **Login Email** | `super@lms.dev` |
| **OTP** | `123456` |
| **Dashboard URL** | `https://essci.demodevelopment.com/super-admin/dashboard` |
| **Scope** | Platform-wide (all organizations, all tenants) |
| **Person** | Aarav Sharma |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Portal Activity line charts, KPI overview cards, Users-by-role donut chart, administrative Timeline |
| **Users** | View and manage users across **all** organizations |
| **Organization Management** | Create organizations, create sub-orgs, enable/disable modules per org, manage full org tree |
| **Notifications** | Configure and view platform-wide notification triggers |
| **Reports** | Full 12-section suite (Overview, Users, Courses, Learning Paths, Organizations, Groups, Activities, Training Matrix, Timeline, Custom Reports, Analytics, Surveys) + CSV export |
| **Calendar** | View and create events across the entire platform |
| **Certificates** | View all certificates issued across all organizations |
| **Content Library** | Curate the global off-the-shelf course catalog (SOC 2, HIPAA, GDPR, OSHA, AI compliance) |
| **Subscription** | Manage SaaS billing — seat capacity meters, video storage, tier upgrades, invoice history |
| **Help Center** | Access support resources |

#### Key Capabilities

- **Module gating** — Enable or disable any LMS module for any organization. When a module is disabled, it disappears from that org's sidebar for every role within it.
- **Org tree management** — Create parent organizations and nested sub-organizations (contingent on `allowSubOrgs` being enabled on the parent).
- **Billing control** — Upgrade subscription plans, edit payment methods, download invoices. This is a Super Admin–exclusive capability.
- **Cross-tenant visibility** — Can see users, data, and reports from every organization on the platform.

---

### 4.2 LMS Administrator

| | |
|---|---|
| **Login Email** | `lmsadmin@lms.dev` |
| **OTP** | `123456` |
| **Dashboard URL** | `https://essci.demodevelopment.com/lms-admin/dashboard` |
| **Scope** | Platform-wide (singleton — only one LMS Admin may exist) |
| **Person** | Alok Verma |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Full portal activity and admin KPI dashboard |
| **Users** | Manage users across all organizations |
| **Organization Management** | Full control over every organization on the platform |
| **Notifications** | Platform-wide notification management |
| **Reports** | Complete 12-section reporting suite |
| **Calendar** | Platform-wide calendar access |
| **Certificates** | View all platform-issued certificates |
| **Content Library** | Manage the global content catalog |
| **Subscription** | Billing and plan management |
| **Help Center** | Access support |

#### Key Capabilities

- Identical breadth of access to Super Admin for most operations.
- **Singleton enforcement** — Only one account of this type can exist on the platform at any time.
- Can manage all organizations and all users globally.

---

### 4.3 Organization Administrator

| | |
|---|---|
| **Login Email** | `admin@lms.dev` |
| **OTP** | `123456` |
| **Dashboard URL** | `https://essci.demodevelopment.com/org-admin/dashboard` |
| **Scope** | ESSCI organization (all departments within ESSCI) |
| **Person** | Dr. Rajeshwar Rao |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Org-level KPIs, Portal Activity, Users-by-role donut, Quick Actions |
| **Users** | Full CRUD for all users within ESSCI; 2-step Add User dialog; bulk activate/deactivate; CSV export |
| **Courses** | Create, edit, publish, and manage all courses within ESSCI |
| **Learning Paths** | Create and manage sequential learning journeys; assign course steps and tasks |
| **Course Store** | Browse external course catalog; request or purchase seats; B2B bulk seat licensing |
| **Groups** | Create static or rule-based groups; assign courses for automated enrollment |
| **Notifications** | Configure 7 core notification triggers; view notification activity log |
| **Reports** | Full 12-section reporting suite with CSV export |
| **Approval Inbox** | Review and approve/deny enrollment requests |
| **Calendar** | Create and manage training events, webinars, and deadlines |
| **Certificates** | View, issue, and design certificates |
| **Content Library** | Import off-the-shelf courses directly into ESSCI's course catalog |
| **Course Categories** | Create color-coded categories; manage the category directory |
| **Conferences** | Schedule Zoom / MS Teams / physical room sessions with capacity tracking |
| **Discussions** | Moderate all discussion threads; pin, resolve, delete |
| **Account & Settings** | Full portal & branding configuration (8 tabs — see below) |
| **Subscription** | View seat meters and billing |
| **Help Center** | Access support |

#### Account & Settings — 8 Configuration Tabs

| Tab | What Can Be Configured |
|-----|----------------------|
| **Portal & Branding** | Site name, logo, CNAME, color palette, font selector (Geist/Inter/Roboto/Outfit), white-label, announcements, registration policy |
| **Configurable Terminology** | Override glossary terms (e.g., rename "Course" → "Module", "Learner" → "Trainee") |
| **Security & MFA** | Lockout thresholds, password complexity rules, MFA enforcement, anti-piracy video watermarking |
| **User Types / RBAC Builder** | Component-level access control builder per role |
| **Integrations** | API keys, webhooks, SSO configuration, Zoom, Teams, Slack |
| **Sessions & Devices** | Revoke individual sessions; sign out everywhere |
| **Gamification** | Configure points, badges, and leaderboard behavior |
| **E-Commerce & Import/Export** | CSV bulk onboarding with sample template; full JSON backup archive |

---

### 4.4 Department Head

| | |
|---|---|
| **Login Email** | `depthead@lms.dev` |
| **OTP** | `123456` |
| **Dashboard URL** | `https://essci.demodevelopment.com/dept-head/dashboard` |
| **Scope** | Engineering department within ESSCI |
| **Person** | Devika Patel |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Department-scoped KPIs and activity overview |
| **Users** | View and manage users within the Engineering department |
| **Courses** | Manage Engineering-owned courses; view (read-only) cross-department courses |
| **Learning Paths** | Create and manage learning paths for Engineering |
| **Groups** | Manage groups within Engineering; configure auto-enrollment rules |
| **Notifications** | View and configure department-level notifications |
| **Reports** | Read org-wide reports (cannot modify org-level settings) |
| **Approval Inbox** | Approve or deny enrollment requests from Engineering staff |
| **Calendar** | View and create events |
| **Certificates** | View certificates for department members |
| **Course Categories** | Create and manage categories |
| **Conferences** | Schedule and manage conferences |
| **Discussions** | Moderate discussions in Engineering courses |
| **Help Center** | Access support |

#### Key Limitations

- Resources are scoped **exclusively to the Engineering department**.
- Attempting to edit another department's course shows a **Department Lock Banner** with a "Request Co-Author Access" button that notifies the owning department head.
- Cannot access: Course Store, Account & Settings, or Subscription.

---

### 4.5 Instructor

| | |
|---|---|
| **Login Email** | `instructor@lms.dev` |
| **OTP** | *(not required — MFA not enrolled)* |
| **Dashboard URL** | `https://essci.demodevelopment.com/instructor/dashboard` |
| **Scope** | Own courses within the Engineering department |
| **Person** | Prof. Priya Nair |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Create-course CTA, My Courses list with enrollment stats, quick actions |
| **Courses** | Create new courses; edit and manage own courses; launch the video player |
| **Learning Paths** | Create and manage learning paths using a course picker |
| **Groups** | View and manage groups for enrollment management |
| **Reports** | View reports scoped to own courses |
| **Calendar** | View events; add new events |
| **Certificates** | Issue certificates to learners from own courses |
| **Course Categories** | View and use categories; create new ones inline |
| **Conferences** | Schedule live webinars and virtual classroom sessions |
| **Discussions** | Post in Q&A threads; mark verified answers; pin/resolve threads |
| **Help Center** | Access support |

#### Course Creation — Step-by-Step

1. Navigate to **Courses** → click **+ Create Course**
2. Enter **Course Title** (max 60 characters with live character counter)
3. Select **Course Type** and **Category** (or create a new category inline)
4. Write a **Description** and add up to 4 **Learning Objectives**
5. Upload a **Cover Image**
6. Build the **Curriculum**:
   - Add **Sections** (chapters/modules)
   - Under each section, add **Lessons** in one of 4 types: `Video`, `Document`, `Quiz`, or `Assignment`
   - For **Video** lessons: paste a YouTube URL *or* upload a local video file
7. Monitor the sticky **Readiness Checklist** sidebar to track completion status
8. Click **Publish** when all checklist items are green

#### Video Player Features

| Feature | Details |
|---------|---------|
| **Adaptive playback** | HLS/DASH via Video.js — adjusts quality to connection speed |
| **Playback rate** | 0.5×, 1×, 1.25×, 1.5×, 2× |
| **Rewind / Forward** | 5-second rewind and fast-forward buttons |
| **Timestamped Notes** | Press `B` to pause and anchor a note at current timestamp; click a note to seek to it |
| **Persistence** | Notes survive browser refresh and persist per lesson |

#### Key Limitations

- Cannot edit courses belonging to other departments without co-author approval.
- No access to: Users directory, Organization Management, Course Store, Account & Settings, or Subscription.

---

### 4.6 Manager

| | |
|---|---|
| **Login Email** | `manager@lms.dev` |
| **OTP** | `123456` |
| **Dashboard URL** | `https://essci.demodevelopment.com/manager/dashboard` |
| **Scope** | Direct reports within the Electronics department |
| **Person** | Ananya Gupta |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Team Compliance widget, Overdue Training alerts, Approval Inbox preview, Skill Coverage heatmap |
| **Reports** | View training and compliance reports for direct reports |
| **Approval Inbox** | Full searchable Pending/Resolved view of enrollment requests; Approve or Deny |
| **Calendar** | View team training schedule and deadlines |
| **Certificates** | View certificates earned by direct reports |
| **Course Categories** | View available categories |
| **Help Center** | Access support |

#### Approval Inbox — End-to-End Workflow

1. A **Learner** requests access to a course via the Course Store or Catalog
2. A **notification** is automatically sent to the learner's Manager
3. **Manager** logs in → navigates to **Approval Inbox** (or clicks "View all" on the dashboard widget)
4. Reviews the request: course name, requester, date submitted
5. Clicks **Approve** or **Deny**
6. The **Learner** receives a notification of the decision; an approved course appears in their My Training

#### Key Limitations

- Cannot create or edit courses, learning paths, or groups.
- No access to: Users directory, Organization Management, Course Store, or Account & Settings.
- Read-only visibility into team training; cannot manually override completion status.

---

### 4.7 Learner

| | |
|---|---|
| **Login Email** | `learner@lms.dev` |
| **OTP** | *(not required — MFA not enrolled)* |
| **Dashboard URL** | `https://essci.demodevelopment.com/learner/dashboard` |
| **Scope** | Own training, progress, and certificates only |
| **Person** | Rohan Deshmukh |

#### Accessible Modules

| Module | What They Can Do |
|--------|-----------------|
| **Dashboard** | Quick Resume (last course), Upcoming Deadlines, My Courses with progress bars, Achievements |
| **My Training** | Full enrolled course list with progress, status filters, and resume buttons |
| **Catalog** | Browse public course catalog; request access or self-enroll |
| **Calendar** | View upcoming deadlines, webinars, and scheduled assessments |
| **Certificates** | View and download own earned certificates as PDF |
| **Discussions** | Ask questions in course Q&A threads; upvote helpful answers |
| **Help Center** | Access support resources |

#### Learner Course Journey — Step-by-Step

1. Log in at `learner@lms.dev` → land on `/learner/dashboard`
2. Click **Quick Resume** to continue the last course, or scroll to **My Courses** and click any card
3. The **Video Player** opens (distraction-free — no sidebar chrome)
4. Watch the lesson; press `B` at any point to save a **timestamped note**
5. Progress through all lessons in order to complete the curriculum
6. On completion, wait for an Instructor or Manager to **issue a Certificate**
7. Certificate appears in the **Certificates** module — downloadable as PDF

#### Course Store / Catalog Workflow

1. Navigate to **Catalog** in the sidebar
2. Search or filter by category, price range, or rating
3. Click any course card → view objectives, syllabus accordion (expandable by section), ratings, pricing
4. Click **Request Access** → an approval request is sent to your Manager
5. Once the Manager approves, the course appears in **My Training** automatically

---

## 5. Module Reference

| Module | URL Segment | Available To | Purpose |
|--------|-------------|-------------|---------|
| Dashboard | `/dashboard` | All roles | Role-specific KPIs, charts, and quick actions |
| Users | `/users` | Super Admin, LMS Admin, Org Admin, Dept Head | User directory; add/edit/bulk actions; CSV export |
| Organization Management | `/organization` | Super Admin, LMS Admin | Org tree; sub-org creation; module enable/disable |
| My Training | `/my-training` | Learner | Enrolled courses and personal progress tracking |
| Catalog | `/catalog` | Learner | Public course browsing and enrollment requests |
| Courses | `/courses` | Org Admin, Dept Head, Instructor | Course management, creation, and curriculum builder |
| Learning Paths | `/learning-paths` | Org Admin, Dept Head, Instructor | Sequential multi-step training journeys |
| Course Store | `/course-store` | Org Admin | External/marketplace course purchasing and seat licensing |
| Groups | `/groups` | Org Admin, Dept Head, Instructor | Static or rule-based groups with auto-enrollment |
| Notifications | `/notifications` | Super Admin, LMS Admin, Org Admin, Dept Head | Event-triggered notification trigger management |
| Reports | `/reports` | Super Admin, LMS Admin, Org Admin, Dept Head, Instructor, Manager | 12-section analytics and compliance reporting |
| Approval Inbox | `/approvals` | Manager, Org Admin, Dept Head | Review pending training and enrollment requests |
| Calendar | `/calendar` | All roles | Month/Week/Day/Agenda training calendar with `.ics` export |
| Certificates | `/certificates` | All roles | Issue, view, and download completion certificates |
| Content Library | `/content-library` | Super Admin, LMS Admin, Org Admin | Curated off-the-shelf compliance course catalog |
| Course Categories | `/categories` | Org Admin, Dept Head, Instructor, Manager | Category management with color swatches |
| Conferences | `/conferences` | Org Admin, Dept Head, Instructor | ILT & virtual classroom scheduling (Zoom/Teams/physical rooms) |
| Discussions | `/discussions` | Org Admin, Dept Head, Instructor, Learner | Course Q&A threads and social learning |
| Account & Settings | `/settings` | Org Admin | Portal branding, security, integrations, RBAC, gamification |
| Subscription | `/subscription` | Super Admin, LMS Admin, Org Admin | SaaS billing, seat meters, plan upgrades |
| Help Center | `/help` | All roles | Support and documentation access |

---

## 6. Security & MFA Notes

| Policy | Detail |
|--------|--------|
| **Demo OTP** | `123456` — valid for all MFA-enrolled accounts |
| **CAPTCHA trigger** | Shown automatically after **2 failed OTP attempts** |
| **Account lockout** | **15-minute lockout** after 5 failed OTP attempts |
| **Trusted device** | Check *"Trust this browser for 30 days"* to skip OTP for 30 days on the same device |
| **MFA enrollment** | Configurable per user via Account & Settings → Security tab |
| **Session revocation** | Org Admin can revoke all active sessions from Settings → Sessions & Devices |
| **Password policy** | Minimum 6 characters (configurable by Org Admin via Security settings) |

---

## 7. Self-Registration (New Learners)

New learners can self-register without a pre-existing admin-created account:

1. Navigate to **[https://essci.demodevelopment.com/auth/signup](https://essci.demodevelopment.com/auth/signup)**
2. Enter your **full name** and **email address**
3. *(Optional)* Complete **Face Biometric Registration** — camera capture for identity verification
4. Submit the form — you are automatically signed in as a **Learner** in the ESSCI organization
5. Redirected to `/learner/dashboard` and ready to start learning

> **Course-linked signup:** If you arrived via a course listing link (e.g., `?courseId=xyz`), the course summary is shown during signup and you are **auto-enrolled** upon successful registration.

---

## 8. Forgot Password Flow

1. Navigate to **[https://essci.demodevelopment.com/auth/forgot-password](https://essci.demodevelopment.com/auth/forgot-password)**
2. Enter your **email address** → click **Send Reset Code**
3. Enter the **6-digit OTP** sent to your email *(demo OTP: `123456`)*
4. Create a **new password** (minimum 6 characters — a live strength meter is shown)
5. Confirmation screen — click **Back to Login** to sign in with your new credentials

---

## 9. Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════╗
║            ESSCI LMS Portal — Quick Access Reference            ║
║  Portal URL: https://essci.demodevelopment.com/                 ║
║  Demo OTP  : 123456  (for all MFA-enrolled accounts)            ║
╠═══════════════════════╦══════════════════════╦══════════════════╣
║ Role                  ║ Login Email          ║ OTP Required     ║
╠═══════════════════════╬══════════════════════╬══════════════════╣
║ Super Administrator   ║ super@lms.dev        ║ Yes → 123456     ║
║ LMS Administrator     ║ lmsadmin@lms.dev     ║ Yes → 123456     ║
║ Org Administrator     ║ admin@lms.dev        ║ Yes → 123456     ║
║ Department Head       ║ depthead@lms.dev     ║ Yes → 123456     ║
║ Instructor            ║ instructor@lms.dev   ║ No               ║
║ Manager               ║ manager@lms.dev      ║ Yes → 123456     ║
║ Learner               ║ learner@lms.dev      ║ No               ║
╚═══════════════════════╩══════════════════════╩══════════════════╝
```

---

*Documentation generated for ESSCI LMS Portal — Demo Environment*  
*Last updated: October 2026*
