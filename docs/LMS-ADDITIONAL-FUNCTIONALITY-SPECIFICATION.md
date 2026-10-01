# LMS Additional & Advanced Functionality Specification
## Companion Specification to `LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`

**Project:** Next.js 16.3.6 App Router Enterprise LMS Portal  
**Document Purpose:** Comprehensive Specification of Portal Functionalities Implemented Beyond the Open edX / Moodle Baseline Reference Mapping  
**Companion Document:** [`docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md)  
**Specification Version:** 1.0.0 | **Build Status:** Verified (`tsc --noEmit` passing, exit code 0)  
**Deliverable Type:** Architectural Verification & Unlisted Functionality Specification  

---

> [!IMPORTANT]
> **Audit & Traceability Finding:**  
> The baseline reference mapping document ([`docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md)) was intentionally structured around the direct academic and pedagogical synthesis of **Open edX** (`docs/OpenedX.md`) and **Moodle** (`docs/Moodle.md`), capturing **15 core screens (SCR-01 through SCR-15)**, **16 routes**, and **6 state stores**.
> 
> However, the actual deployed portal codebase contains **22 concrete module routes**, a public marketing storefront, a multi-step password recovery suite, a global topbar notification bell, and **19 persistent Zustand state stores**. 
> 
> This document specifies all **extra, advanced, and enterprise functionalities** currently functional in the portal that are **not listed or only superficially referenced** in the baseline reference mapping document.

---

## Table of Contents

1. [Verification Summary & Gap Analysis](#1-verification-summary--gap-analysis)
2. [Master Functionality Comparison Matrix](#2-master-functionality-comparison-matrix)
3. [Unlisted Core Module Specifications](#3-unlisted-core-module-specifications)
   - [3.1 Virtual Classrooms & Conferences (ILT Hub)](#31-virtual-classrooms--conferences-ilt-hub)
   - [3.2 Discussions & Social Q&A Hub](#32-discussions--social-qa-hub)
   - [3.3 Curated Content Library (Compliance Catalog)](#33-curated-content-library-compliance-catalog)
   - [3.4 Learning Paths & Onboarding Journey Builder](#34-learning-paths--onboarding-journey-builder)
   - [3.5 Course Store & B2B Bulk Seat Licensing](#35-course-store--b2b-bulk-seat-licensing)
   - [3.6 Groups & Cohort Automated Enrollment Engine](#36-groups--cohort-automated-enrollment-engine)
   - [3.7 Multi-Tenant Organization Tree & Dynamic Module Gating](#37-multi-tenant-organization-tree--dynamic-module-gating)
   - [3.8 Manager Approval Inbox](#38-manager-approval-inbox)
   - [3.9 System Notifications Engine & Topbar Bell Drawer](#39-system-notifications-engine--topbar-bell-drawer)
   - [3.10 SaaS Subscription, Plan Tiers & Billing Portal](#310-saas-subscription-plan-tiers--billing-portal)
   - [3.11 Academic & Training Interactive 4-View Calendar](#311-academic--training-interactive-4-view-calendar)
   - [3.12 Digital Certificate Designer, Wallet & Bulk Issuance](#312-digital-certificate-designer-wallet--bulk-issuance)
   - [3.13 User Profile, Security & Session Management](#313-user-profile-security--session-management)
   - [3.14 Public Marketing Storefront & Direct Enrollment Funnel](#314-public-marketing-storefront--direct-enrollment-funnel)
   - [3.15 Self-Service Password Recovery & Auth Onboarding](#315-self-service-password-recovery--auth-onboarding)
   - [3.16 Advanced Enterprise Governance in Settings](#316-advanced-enterprise-governance-in-settings)
   - [3.17 Extended 12-Section Institutional Reports Suite](#317-extended-12-section-institutional-reports-suite)
   - [3.18 Dark / Light Theme System & Nova Design Tokens](#318-dark--light-theme-system--nova-design-tokens)
4. [Complete State Architecture: 19 Zustand Stores Audit](#4-complete-state-architecture-19-zustand-stores-audit)
5. [Complete Master Route Registry](#5-complete-master-route-registry)

---

## 1. Verification Summary & Gap Analysis

A rigorous audit of the active codebase against [`docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md) identified the following discrepancies:

| Domain | In Reference Mapping Document | Actually Implemented in Portal | Verification Status |
|---|---|---|---|
| **Documented Screens** | 15 Screens (`SCR-01` to `SCR-15`) | **30+ distinct functional screens/views** across all roles | **Significant Extra Functionality** |
| **Active Routes** | 16 routes documented in Section 7 | **26+ routes** (22 module folders under `[role]`, plus `/`, `/auth/*`) | **10+ Unlisted Routes** |
| **Zustand State Stores** | 6 stores documented in Section 17 | **19 persistent Zustand stores** in `src/lib/store/` | **13 Unlisted State Stores** |
| **Enterprise Governance** | User table, category swatches, basic settings | Tree hierarchy, module gating, subscription billing, RBAC builder, glossary | **Substantial Depth Unlisted** |
| **Collaborative / Social** | Mentioned in passing in 1 line | Full ILT webinar hub, threaded Q&A, verified answers, pin/resolve | **Entire Modules Unlisted** |
| **Public & Acquisition** | Mentioned in 1 tree line | Complete public storefront (`/`), course checkout, 4-step password recovery | **Entire Flows Unlisted** |

---

## 2. Master Functionality Comparison Matrix

The table below contrasts every functional module present in the application with its documentation status in [`docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md):

| Feature / Module | Route / File Path | In Reference Mapping? | Implementation Detail in Codebase |
|---|---|---|---|
| **Public Storefront** | `/` (`src/app/page.tsx`) | ❌ Unlisted in Screens | 887 lines; category filters, search, syllabus modal, course preview, direct enrollment routing |
| **Auth Login & Social SSO** | `/auth/login` | ✅ Covered (`SCR-01`) | 2-step identifier/OTP, Google/Apple/Facebook SSO marks, demo credentials |
| **Password Recovery Suite** | `/auth/forgot-password`, `/auth/reset-password` | ❌ Unlisted in Screens | 6-digit OTP dispatch, live password strength calculator, multi-step verification |
| **Course Purchaser Signup** | `/auth/signup` | ⚠️ Route row only | Onboarding registration linking directly to pre-selected course checkout & auto-enrollment |
| **Learner Dashboard** | `/[role]/dashboard` | ✅ Covered (`SCR-02`) | Quick resume hero, progress rings, upcoming milestones, recent certificates |
| **Instructor Dashboard** | `/[role]/dashboard` | ✅ Covered (`SCR-09`) | Authored courses, total enrollments, completion rates, SpeedGrader submission queue |
| **Admin Dashboard** | `/[role]/dashboard` | ✅ Covered (`SCR-12`) | Enterprise KPI cards, user distribution donut, portal activity line chart |
| **Manager Dashboard** | `/[role]/dashboard` | ❌ Unlisted in Screens | Team compliance matrix, overdue training alerts, direct-report approval queue |
| **Course Catalog & Modal** | `/[role]/catalog` | ✅ Covered (`SCR-03`, `SCR-04`) | Faceted category search, price toggles, Open edX Course About syllabus modal |
| **My Training** | `/[role]/my-training` | ⚠️ Route row only | Dedicated learner enrolled courses grid, completion badges, direct player launcher |
| **Cinema Video Player** | `/[role]/courses/[id]/player` | ✅ Covered (`SCR-05`) | Video.js stage, hotkey timestamped notes (key `B`), 5s rewind/forward, transcript seeking |
| **Inline CAPA Quiz Engine** | `/[role]/courses/[id]/player` | ✅ Covered (`SCR-06`) | Single/multi-choice radio questions, submit, immediate explanatory rationales |
| **Progress & Grade Chart** | `/[role]/courses/[id]/player` | ✅ Covered (`SCR-07`) | Stacked SVG grade distribution, 70% passing cutoff threshold line, certificate CTA |
| **Milestone Dates Timeline** | `/[role]/courses/[id]/player` | ✅ Covered (`SCR-08`) | Chronological release & due dates, past-due pills, `.ics` calendar download |
| **Studio Course Builder** | `/[role]/courses/[id]` | ✅ Covered (`SCR-10`) | 3-tier outline editor, 60-char title limit, dynamic category picker, readiness checklist |
| **SpeedGrader Hub** | `/[role]/grading` | ✅ Covered (`SCR-11`) | Split-screen student submission inspection, multi-criteria rubric sliders, grade publishing |
| **User Directory & Bulk Actions** | `/[role]/users` | ✅ Covered (`SCR-13`) | Search, role filtering, bulk activate/deactivate, client-side CSV download |
| **Category Governance** | `/[role]/categories` | ✅ Covered (`SCR-14`) | Custom hex color swatch picker, course association counters, guarded deletion |
| **Institutional Reports** | `/[role]/reports` | ⚠️ Partially (`SCR-15`) | Only matrix/timeline cited; actually has 12 tabs, query builder, heatmap, CSAT surveys |
| **Conferences & ILT Hub** | `/[role]/conferences` | ❌ **Completely Unlisted** | Zoom/Teams/In-person scheduling, capacity meters, waitlists, attendee registration, `.ics` invites |
| **Discussions & Social Q&A** | `/[role]/discussions` | ❌ **Completely Unlisted** | Threaded lesson discussions, upvotes, instructor verified answers, moderation pin/resolve |
| **Content Library** | `/[role]/content-library` | ❌ **Completely Unlisted** | Off-the-shelf catalog, SOC 2/HIPAA/GDPR compliance badges, 1-click org course provisioning |
| **Learning Paths Builder** | `/[role]/learning-paths` | ❌ **Completely Unlisted** | Onboarding journeys, mixed course + task steps, sequential prerequisite locking, progress |
| **Course Store & B2B Licensing** | `/[role]/course-store` | ❌ **Completely Unlisted** | Marketplace catalog, course landing page, syllabus accordion, seat key generator, request access |
| **Groups & Dynamic Cohorts** | `/[role]/groups` | ❌ **Completely Unlisted** | Static & attribute rule-based cohorts, automated course enrollment, average completion rollups |
| **Organization Management Tree**| `/[role]/organization` | ❌ **Completely Unlisted** | Nested sub-org tree, `allowSubOrgs` permission gating, per-org dynamic module enable/disable |
| **Manager Approval Inbox** | `/[role]/approvals` | ❌ **Completely Unlisted** | Dedicated pending/resolved access request triage, approve/deny actions with audit trail |
| **Notifications & Bell Drawer** | `/[role]/notifications` | ❌ **Completely Unlisted** | 7 automated system triggers, settings toggle, topbar unread indicator & slide-down drawer |
| **SaaS Subscription & Billing** | `/[role]/subscription` | ❌ **Completely Unlisted** | 1,234 lines; seat capacity meters, cloud video storage meters, plan upgrades, invoice history |
| **Interactive 4-View Calendar**| `/[role]/calendar` | ⚠️ Route row only | 1,436 lines; Month/Week/Day/Agenda views, multi-type events, scheduling modal, bulk `.ics` sync |
| **Digital Certificate Suite** | `/[role]/certificates` | ⚠️ Route row only | 3 layout styles, visual certificate designer, printable credential view, bulk issuance |
| **User Profile & Device Trust** | `/[role]/profile` | ❌ **Completely Unlisted** | Profile editing, password change, 2FA QR code enrollment, active session device revocation |
| **Advanced Settings Features** | `/[role]/settings` | ⚠️ Mentioned generally | Glossary terminology override, dynamic font switcher, video watermark, RBAC matrix, CSV import |
| **Dark / Light Mode System** | Global (`next-themes`) | ❌ Unlisted in Screens | CSS variables `@theme`, persistent theme switcher in header & login screen |

---

## 3. Unlisted Core Module Specifications

### 3.1 Virtual Classrooms & Conferences (ILT Hub)
* **Route:** `/[role]/conferences` (Accessible by `instructor`, `org-admin`, `dept-head`, `learner`)
* **Underlying Store:** [`src/lib/store/conferences-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/conferences-store.ts) (`lms-conferences-store`)
* **Component File:** [`src/app/[role]/conferences/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/conferences/page.tsx) (434 lines)

#### Key Capabilities & Workflows:
1. **Multi-Format Session Scheduling:**  
   Instructors and Admins can schedule live training sessions supporting both **Virtual Classrooms** (Zoom, Microsoft Teams, Google Meet via meeting link) and **Physical In-Person Classrooms** (room assignment and physical building address).
2. **Capacity Management & Waitlists:**  
   Sessions specify maximum attendee limits (`maxCapacity`). The system tracks registered attendees and dynamically routes overflow registrations to an automated `waitlist`.
3. **Attendee Registration & Cancellation:**  
   Learners can join or leave sessions with a single click, updating available seat counters in real time.
4. **Calendar Export (`.ics` Generation):**  
   Each conference card features a direct "Export `.ics`" action that compiles standard iCalendar payload strings (`BEGIN:VCALENDAR...`) and initiates a client-side `.ics` file download for Outlook, Google Calendar, and Apple Calendar.
5. **Session Filtering & Statuses:**  
   Faceted filtering by format (All, Virtual, Physical), associated course, and status (`upcoming`, `in-progress`, `completed`, `cancelled`).

---

### 3.2 Discussions & Social Q&A Hub
* **Route:** `/[role]/discussions` (Accessible by `instructor`, `learner`, `org-admin`, `dept-head`)
* **Underlying Store:** [`src/lib/store/discussions-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/discussions-store.ts) (`lms-discussions-store`)
* **Component File:** [`src/app/[role]/discussions/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/discussions/page.tsx) (459 lines)

#### Key Capabilities & Workflows:
1. **Contextual Threading:**  
   Questions can be posted globally or bound directly to a specific course and lesson unit.
2. **Community Upvoting & Engagement:**  
   Students and faculty can upvote high-value questions; thread cards highlight vote counts and answer counts.
3. **Instructor "Verified Answer" Badge:**  
   Instructors and teaching assistants can mark authoritative replies as "Verified Answer", elevating them with a distinct green highlight and badge to guide learners.
4. **Moderator Capabilities:**  
   Staff can **Pin** critical announcements or FAQs to the top of the discussion stream, toggle threads as **Resolved**, and delete inappropriate content.
5. **Deep Search & Filters:**  
   Real-time keyword search across thread titles and bodies, filtered by course and resolution state (All, Unresolved, Resolved).

---

### 3.3 Curated Content Library (Compliance Catalog)
* **Route:** `/[role]/content-library` (Accessible by `super-admin`, `org-admin`, `lms-admin`)
* **Underlying Store:** [`src/lib/store/content-library-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/content-library-store.ts) (`lms-content-library-store`)
* **Component File:** [`src/app/[role]/content-library/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/content-library/page.tsx) (298 lines)

#### Key Capabilities & Workflows:
1. **Curated Off-the-Shelf Library:**  
   Pre-built catalog of professional enterprise training modules covering Cybersecurity, Workplace Safety, Healthcare Compliance, and Generative AI Ethics.
2. **Industry Compliance Badging:**  
   Courses display verified compliance standards: **SOC 2 Type II**, **HIPAA**, **OSHA 1910**, **GDPR**, and **ISO 27001**.
3. **1-Click Tenant Provisioning:**  
   Admins can click "Import into {Organization}", which creates an active course entry directly in [`src/lib/store/courses-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/courses-store.ts), scoping it to the active organization with curriculum sections and lessons ready for learner enrollment.
4. **Version Synchronization:**  
   Maintains version metadata (e.g. `v2.4`); notifies administrators when central compliance updates are available with a "Sync Update" action.

---

### 3.4 Learning Paths & Onboarding Journey Builder
* **Route:** `/[role]/learning-paths`, `/[role]/learning-paths/[pathId]` (Accessible by `org-admin`, `dept-head`, `instructor`, `learner`)
* **Underlying Store:** [`src/lib/store/learning-paths-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/learning-paths-store.ts) (`lms-learning-paths-store`)
* **Component Files:**  
  - List View: [`src/app/[role]/learning-paths/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/learning-paths/page.tsx) (81 lines)  
  - Dynamic Pathway View: [`src/app/[role]/learning-paths/[pathId]/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/learning-paths/%5BpathId%5D/page.tsx) (104 lines)  
  - Authoring Form: [`src/components/learning-paths/PathForm.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/learning-paths/PathForm.tsx) (165 lines)

#### Key Capabilities & Workflows:
1. **Dual-Audience Architecture at One URL:**  
   When an Admin or Instructor opens `/[role]/learning-paths/[pathId]`, they are presented with the **Studio Path Editor** (`PathForm.tsx`). When a Learner or Manager opens the same route, they see the **Learner Journey Checklist** (`LearnerPathView`).
2. **Mixed Step Taxonomy (Course + Task):**  
   Tracks combine digital LMS courses (`type: "course"`) with real-world operational milestones (`type: "task"`), such as setting up developer workstations, completing I-9 paperwork, or scheduling a 1-on-1 manager check-in.
3. **Strict Sequential Prerequisite Locking:**  
   Downstream steps remain locked (`locked: true`) with padlock icons until the preceding step is marked complete.
4. **Milestone Progress Rollup:**  
   Calculates completed steps against total track length, displaying a progress bar and completion percentage.
5. **Path Authoring Engine:**  
   Allows administrators to select courses from `useCoursesStore`, configure custom tasks with due days, and reorder steps using move up/down controls.

---

### 3.5 Course Store & B2B Bulk Seat Licensing
* **Route:** `/[role]/course-store`, `/[role]/course-store/[courseId]` (Accessible by `org-admin`, `dept-head`, `manager`, `learner`)
* **Underlying Stores:** [`src/lib/store/courses-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/courses-store.ts), [`src/lib/store/approvals-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/approvals-store.ts)
* **Component Files:**  
  - Store Catalog: [`src/app/[role]/course-store/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/course-store/page.tsx) (230 lines)  
  - Course Landing Page: [`src/app/[role]/course-store/[courseId]/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/course-store/%5BcourseId%5D/page.tsx) (268 lines)

#### Key Capabilities & Workflows:
1. **Marketplace Catalog & Search:**  
   Faceted e-commerce view with price filter (Any, Free, Paid), category selector, keyword search, and simulated network latency loader.
2. **Course Landing Page (Syllabus Accordion):**  
   Detailed marketing page featuring course description, 4 learning objectives, instructor card, sticky pricing checkout card, and a syllabus accordion dynamically generated from the course's sections and lessons.
3. **"Request Access" Approval Workflow:**  
   Learners clicking "Request Access" trigger an approval record in `useApprovalsStore`, which automatically notifies their designated Manager with an actionable approval card.
4. **B2B Bulk Seat Licensing Dialog:**  
   Organization Admins can purchase bulk seats for employee cohorts. Features an instant license key generator, CSV email paste field, and real-time calculation of claimed vs available seat quotas.

---

### 3.6 Groups & Cohort Automated Enrollment Engine
* **Route:** `/[role]/groups`, `/[role]/groups/[groupId]` (Accessible by `org-admin`, `dept-head`, `instructor`)
* **Underlying Store:** [`src/lib/store/groups-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/groups-store.ts) (`lms-groups-store`)
* **Component Files:**  
  - Directory: [`src/app/[role]/groups/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/groups/page.tsx) (90 lines)  
  - Creator & Editor: [`src/components/groups/GroupForm.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/groups/GroupForm.tsx) (162 lines)

#### Key Capabilities & Workflows:
1. **Dual Membership Models (Static vs Dynamic Rule):**  
   - **Static Groups:** Explicit user selection from `useUsersStore`.  
   - **Dynamic Rule-Based Groups:** Automated matching based on profile attributes (e.g. `department == "Engineering"` or `role == "instructor"`).
2. **Automated Course Enrollment:**  
   Assigning courses to a group in `GroupForm.tsx` automatically provisions enrollments for all current and future matching members.
3. **Live Member Derivation:**  
   Dynamic groups compute their membership count on-the-fly against the active user directory without stale data caching.
4. **Group-Level Analytics Rollup:**  
   Calculates and displays the average course completion percentage across all assigned courses for members of that cohort.

---

### 3.7 Multi-Tenant Organization Tree & Dynamic Module Gating
* **Route:** `/[role]/organization` (Accessible by `super-admin`, `lms-admin`)
* **Underlying Store:** [`src/lib/store/organizations-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/organizations-store.ts) (`lms-organizations-store`)
* **Component File:** [`src/app/[role]/organization/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/organization/page.tsx) (243 lines)

#### Key Capabilities & Workflows:
1. **Hierarchical Organization Tree:**  
   Supports multi-tenant parent-to-sub-organization nesting (e.g., Parent "Acme Corp" → Sub-Org "Acme EMEA").
2. **Sub-Org Creation Guardrail:**  
   The "Add Sub-Organization" trigger is strictly governed by the `allowSubOrgs` boolean flag. If false, the button is entirely removed from the interface.
3. **Dynamic Sidebar Module Gating:**  
   Super Admins can toggle individual module checkboxes (`enabledModules`) for any tenant. [`src/components/layout/AppShell.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/layout/AppShell.tsx) inspects this list and dynamically filters the sidebar rail, completely removing disabled modules from navigation for all roles in that organization.

---

### 3.8 Manager Approval Inbox
* **Route:** `/[role]/approvals` (Accessible by `manager`, `org-admin`, `dept-head`)
* **Underlying Store:** [`src/lib/store/approvals-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/approvals-store.ts) (`lms-approvals-store`)
* **Component File:** [`src/app/[role]/approvals/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/approvals/page.tsx) (120 lines)

#### Key Capabilities & Workflows:
1. **Centralized Request Triage:**  
   Provides People Managers with a dedicated inbox for course access requests and seat assignment petitions submitted by direct reports.
2. **Pending vs Resolved Tabs:**  
   Separates actionable requests from historical decisions, showing requester name, department, requested course, request type, and submission date.
3. **1-Click Decision Dispatch:**  
   Approve or Deny buttons update the request status, create an audit record, and automatically dispatch a notification to the learner via `useNotificationsStore`.

---

### 3.9 System Notifications Engine & Topbar Bell Drawer
* **Route:** `/[role]/notifications` (Admin trigger configuration)
* **Topbar Component:** [`src/components/layout/NotificationBell.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/layout/NotificationBell.tsx) (179 lines)
* **Underlying Store:** [`src/lib/store/notifications-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/notifications-store.ts) (`lms-notifications-store`, 507 lines in settings page)

#### Key Capabilities & Workflows:
1. **7 Core Automated Triggers:**  
   Manages templates and on/off switches for:
   - `course_assigned`: Direct course assignment notification
   - `enrollment_approved`: Manager access approval confirmation
   - `deadline_approaching`: Assessment due date reminder
   - `certificate_awarded`: Credential issuance alert
   - `coauthor_requested`: Cross-department co-author permission request
   - `discussion_reply`: New reply in a subscribed discussion thread
   - `system_maintenance`: Administrative broadcast
2. **Global Topbar Notification Bell:**  
   Persistent `NotificationBell` in `AppShell` header with red unread badge counter, slide-down dropdown menu showing recent notifications, "Mark as Read", and "Mark All as Read".
3. **Cross-Module Notification Dispatch:**  
   Interconnected with `DepartmentLockBanner` (requesting co-author access triggers a notification to the owning Dept Head) and `CourseStore` (requesting course access notifies the manager).

---

### 3.10 SaaS Subscription, Plan Tiers & Billing Portal
* **Route:** `/[role]/subscription` (Accessible by `super-admin`, `org-admin`, `lms-admin`)
* **Underlying Store:** [`src/lib/store/subscription-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/subscription-store.ts) (`lms-subscription-store`)
* **Component File:** [`src/app/[role]/subscription/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/subscription/page.tsx) (1,234 lines)

#### Key Capabilities & Workflows:
1. **Seat Capacity Utilization Meters:**  
   Real-time progress meter tracking active assigned user seats against organizational plan limits (e.g. 84 / 150 seats consumed).
2. **Video Cloud Storage Quota Meters:**  
   Storage gauge monitoring video hosting bandwidth and uploaded video assets (e.g. 28.4 GB / 100 GB used).
3. **Tier Plan Comparison & Upgrade Modal:**  
   Interactive tier selection between **Starter**, **Professional**, and **Enterprise** tiers, highlighting per-seat pricing, storage allowances, custom branding rights, and SSO integration.
4. **Billing Payment Management & Invoices:**  
   Displays active payment card details and downloadable historical invoices with simulated client-side receipt downloads.

---

### 3.11 Academic & Training Interactive 4-View Calendar
* **Route:** `/[role]/calendar` (Accessible across all roles)
* **Underlying Store:** [`src/lib/store/calendar-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/calendar-store.ts) (`lms-calendar-store`)
* **Component File:** [`src/app/[role]/calendar/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/calendar/page.tsx) (1,436 lines)

#### Key Capabilities & Workflows:
1. **4 Switchable Layout Modes:**  
   - **Month Grid:** Full 7-column calendar matrix with date-overflow event chips.  
   - **Week Schedule:** Multi-column weekly view showing daily event blocks.  
   - **Day Hourly Timeline:** 24-hour vertical timeline showing scheduled time slots.  
   - **Agenda List:** Chronological feed grouped by date with search and filtering.
2. **Multi-Type Event Taxonomy:**  
   Color-coded badges for **Live Sessions / Webinars**, **Course Deadlines**, **Office Hours**, **Exams & Assessments**, and **Platform Events**.
3. **Interactive Event Scheduler:**  
   Admins and Instructors can create events with title, date, start/end time, event type, course linkage, and virtual meeting URLs.
4. **Full Calendar Sync & Direct Join:**  
   - **Join Session:** Direct meeting launcher button for virtual events.  
   - **Individual & Bulk `.ics` Export:** Export single events or the entire institutional training schedule into `.ics` format.
5. **Dashboard Widgets:**  
   Includes "Today at a Glance" schedule drawer and "Upcoming Deadlines" countdown cards.

---

### 3.12 Digital Certificate Designer, Wallet & Bulk Issuance
* **Route:** `/[role]/certificates` (Accessible across all roles)
* **Underlying Store:** [`src/lib/store/certificates-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/certificates-store.ts) (`lms-certificates-store`)
* **Component Files:**  
  - Main Page: [`src/app/[role]/certificates/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/certificates/page.tsx) (566 lines)  
  - Certificate View: [`src/components/certificates/CertificateView.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/certificates/CertificateView.tsx)  
  - Certificate Designer: [`src/components/certificates/CertificateDesigner.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/certificates/CertificateDesigner.tsx)  
  - Bulk Issue Modal: [`src/components/certificates/BulkIssueDialog.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/certificates/BulkIssueDialog.tsx)

#### Key Capabilities & Workflows:
1. **Learner Digital Credential Wallet:**  
   Displays all earned certificates with course titles, issuance dates, issuing authority signatures, and unique verification hash codes.
2. **Visual Certificate Designer:**  
   Allows Admins and Instructors to customize certificate templates across 3 styles:
   - **Classic Academic:** Traditional ornate double border with serif typography and golden seal.  
   - **Modern Corporate:** Clean asymmetrical branding with corporate color accents and sleek typography.  
   - **Minimalist Tech:** Monospace code accents, dark-mode border, and verification QR code.
3. **Print & PDF Export Dialog:**  
   High-resolution printable layout optimized for `@media print` with crisp borders and vector seals.
4. **Manual & Bulk Certificate Issuance:**  
   Instructors can issue certificates to individual learners upon course completion or trigger bulk issuance for entire student cohorts.
5. **Certificate Revocation:**  
   Administrators can revoke credentials with reason tracking, updating the verification status in real time.

---

### 3.13 User Profile, Security & Session Management
* **Route:** `/[role]/profile` (Accessible across all roles)
* **Underlying Store:** [`src/lib/store/auth-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/auth-store.ts)
* **Component File:** [`src/app/[role]/profile/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/profile/page.tsx) (496 lines)

#### Key Capabilities & Workflows:
1. **Personal Profile Management:**  
   Edit user display name, contact phone number, department assignment, and biographical summary.
2. **Password Change Validation:**  
   In-app password update dialog with current password verification and confirmation checks.
3. **Two-Factor Authentication (2FA) Setup:**  
   Visual MFA setup flow displaying a TOTP QR code preview and 6-digit confirmation code verification.
4. **Active Sessions & Device Trust:**  
   Lists all active device sessions (Desktop Chrome, Mobile Safari, etc.) with IP addresses, locations, and 1-click remote session revocation.

---

### 3.14 Public Marketing Storefront & Direct Enrollment Funnel
* **Route:** `/` (Public entry point)
* **Component Files:** [`src/app/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/page.tsx) (887 lines), [`src/components/home/HomeHeader.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/home/HomeHeader.tsx), [`src/components/home/HomeFooter.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/home/HomeFooter.tsx)

#### Key Capabilities & Workflows:
1. **Storefront Course Showcase:**  
   Public course catalog with category tabs, search input, price filters (Any, Free, Paid), and Udemy-inspired 16:9 cards with bestseller ribbons and star ratings.
2. **Interactive Syllabus Modal:**  
   Visitors can inspect full course details and lesson outlines directly on the homepage without signing in.
3. **Seamless Acquisition Funnel:**  
   Clicking "Enroll Now" or "Purchase" directs unauthenticated users to `/auth/login?courseId=[id]` or `/auth/signup?courseId=[id]`. Upon completing authentication, the user is automatically enrolled and immediately redirected into the course cinema player.

---

### 3.15 Self-Service Password Recovery & Auth Onboarding
* **Routes:** `/auth/forgot-password`, `/auth/reset-password`, `/auth/signup`
* **Component Files:**  
  - Request Code: [`src/app/auth/forgot-password/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/auth/forgot-password/page.tsx)  
  - OTP & Reset: [`src/app/auth/reset-password/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/auth/reset-password/page.tsx)  
  - Signup Onboarding: [`src/app/auth/signup/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/auth/signup/page.tsx)

#### Key Capabilities & Workflows:
1. **Password Recovery Request:**  
   Input email to receive a recovery code, with built-in demo helper buttons to test common accounts.
2. **6-Digit OTP Verification:**  
   Authenticates the recovery code against stored credentials.
3. **Live Password Strength Meter:**  
   Dynamic password strength calculation analyzing character count, uppercase, numbers, and special symbols before password reset is accepted.
4. **Tailored Purchaser Signup:**  
   Specialized signup onboarding that captures student credentials, provisions an active learner account in `useUsersStore`, auto-authenticates the session in `useAuthStore`, and enrolls them into their chosen course.

---

### 3.16 Advanced Enterprise Governance in Settings
* **Route:** `/[role]/settings` (Accessible by `org-admin`, `super-admin`)
* **Underlying Store:** [`src/lib/store/settings-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/settings-store.ts) (`lms-settings-store`)
* **Component File:** [`src/app/[role]/settings/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/settings/page.tsx)

#### Key Capabilities & Workflows (8 Modular Tabs):
1. **Configurable Terminology (Glossary Override):**  
   System-wide terminology replacement engine allowing institutions to override core platform nouns (e.g., rename "Course" → "Module", "Instructor" → "Professor", "Learner" → "Trainee").
2. **Dynamic Typography Selector:**  
   Allows administrators to switch the application font family in real time between **Geist Sans**, **Inter**, **Roboto**, and **Outfit**, automatically re-rendering the layout.
3. **Anti-Piracy Dynamic Video Watermarking:**  
   Configurable video player security feature that renders a semi-transparent, moving watermark containing the logged-in user's email address and timestamp across video playback to prevent unauthorized screen capture.
4. **Component-Level Access Control (RBAC) Builder:**  
   Matrix of granular capability checkboxes enabling administrators to fine-tune UI permissions for each role.
5. **Bulk CSV User Onboarding:**  
   Batch user creation tool with downloadable sample CSV template, file drag-and-drop, validation summary, and auto-provisioning into `useUsersStore`.
6. **White-Label Portal Branding:**  
   Custom logo URL upload, CNAME custom domain mapping, accent color palette selectors, and announcement banner management.
7. **Integrations Hub:**  
   API key generation, webhook URL dispatchers, SAML/OIDC SSO configurations, and third-party conferencing webhooks (Zoom/Teams/Slack).
8. **JSON System Backup Archive:**  
   1-click full platform state export generating a timestamped JSON backup archive.

---

### 3.17 Extended 12-Section Institutional Reports Suite
* **Route:** `/[role]/reports` (Accessible by `org-admin`, `super-admin`, `dept-head`, `manager`, `instructor`)
* **Underlying Store:** [`src/lib/store/activity-log-store.ts`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/lib/store/activity-log-store.ts)
* **Component File:** [`src/app/[role]/reports/page.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/%5Brole%5D/reports/page.tsx)

The reference mapping document briefly cites the Training Matrix and Audit Timeline. In reality, the portal features a **full 12-tab enterprise reporting engine**:

1. **Executive Overview:** High-level KPI summary, portal activity line chart, and course category donut chart.
2. **Users Report:** Detailed table of users, roles, enrolled course counts, and last login timestamps.
3. **Courses Report:** Course completion rates, average quiz scores, and active student enrollment numbers.
4. **Learning Paths Report:** Track completion rates, step dropout rates, and milestone duration averages.
5. **Organizations Report:** Multi-tenant distribution, sub-organization counts, and active enabled modules.
6. **Groups Report:** Group member counts, rule vs static breakdown, and average cohort progress.
7. **Learning Activities Audit Log:** Chronological stream of all user events (logins, lesson completions, quiz attempts) backed by `activity-log-store.ts`.
8. **2D Training Matrix:** Moodle-style matrix mapping Users × Required Courses with color-coded compliance status pills.
9. **Administrative & Security Timeline:** Audit stream of role modifications, course deletions, and security alerts.
10. **Custom Report Query Builder:** Ad-hoc query tool allowing admins to select metrics, apply filters, and schedule automated report delivery.
11. **Learning Analytics Heatmap:** Visual heatmap identifying peak platform learning hours by day-of-week and device breakdown.
12. **Post-Training CSAT/NPS Surveys:** Student satisfaction evaluations with rating distributions and qualitative feedback comments.
*All 12 reporting sections include functional client-side CSV downloads.*

---

### 3.18 Dark / Light Theme System & Nova Design Tokens
* **Files:** [`src/components/theme-provider.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/theme-provider.tsx), [`src/components/theme-toggle.tsx`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/components/theme-toggle.tsx), [`src/app/globals.css`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/src/app/globals.css)

1. **Complete CSS Variables `@theme` Architecture:**  
   Tailwind CSS v4 tokens for `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--surface-*`, and `--chart-1/2/3`.
2. **Persistent Theme Toggle:**  
   Segmented light/dark/system mode toggle accessible on the public home page, authentication screens, and in the `AppShell` header.
3. **Color-Contrast Validated:**  
   All charts and UI components maintain verified contrast ratios in both light and dark modes.

---

## 4. Complete State Architecture: 19 Zustand Stores Audit

The baseline reference mapping document lists only **6 state stores** in Section 17. The complete system actually runs on **19 persistent, synchronized Zustand stores**:

| Store File | Storage Key | Documented in Baseline? | Core Responsibility |
|---|---|---|---|
| `auth-store.ts` | `lms-auth-store` | ✅ Yes | User session, active role, department, org, MFA status, device trust |
| `courses-store.ts` | `lms-courses-store` | ✅ Yes | 3-tier curriculum, video URLs, lessons, objectives, price, category |
| `enrollments-store.ts`| `lms-enrollments-storage`| ✅ Yes | Enrolled courses, progress percentages, completion timestamps |
| `submissions-store.ts`| `lms-submissions-store` | ✅ Yes | Student assignment submissions, rubric criteria scores, SpeedGrader marks |
| `users-store.ts` | `lms-users-store` | ✅ Yes | User directory, roles, statuses, and multi-tenant scoping |
| `categories-store.ts` | `lms-categories-store` | ✅ Yes | Course category taxonomy, custom hex swatch colors, course counts |
| `activity-log-store.ts`| `lms-activity-log-store` | ❌ **No** | Chronological audit events for the institutional reports activities log |
| `approvals-store.ts` | `lms-approvals-store` | ❌ **No** | Manager approval inbox for course access and bulk seat assignment requests |
| `calendar-store.ts` | `lms-calendar-store` | ❌ **No** | Events, live sessions, deadlines, exams, and `.ics` generation data |
| `certificates-store.ts`| `lms-certificates-store`| ❌ **No** | Issued credentials, verification hashes, signatures, and visual templates |
| `conferences-store.ts`| `lms-conferences-store` | ❌ **No** | Virtual and physical ILT sessions, attendee lists, capacity, waitlists |
| `content-library-store.ts`| `lms-content-library-store`| ❌ **No**| Curated compliance courses, SOC 2/HIPAA badges, 1-click org import |
| `discussions-store.ts`| `lms-discussions-store` | ❌ **No** | Per-course threaded Q&A, upvotes, verified answers, pin/resolve flags |
| `groups-store.ts` | `lms-groups-store` | ❌ **No** | Static & dynamic rule-based cohorts, course assignment enrollments |
| `learning-paths-store.ts`| `lms-learning-paths-store`| ❌ **No**| Onboarding tracks, course & task steps, prerequisite lock states |
| `notifications-store.ts`| `lms-notifications-store`| ❌ **No**| 7 system triggers, recipient inbox, topbar bell unread notifications |
| `organizations-store.ts`| `lms-organizations-store`| ❌ **No**| Multi-tenant parent/sub-org hierarchy, `allowSubOrgs`, module gating |
| `settings-store.ts` | `lms-settings-store` | ❌ **No** | Glossary overrides, typography, video watermark, RBAC permissions, branding |
| `subscription-store.ts`| `lms-subscription-store` | ❌ **No** | Seat utilization, cloud video storage meters, plan tiers, invoices |

---

## 5. Complete Master Route Registry

The following registry reflects the **true complete routing table** of the LMS Portal application:

| Route Path | Role Access | Description & Primary Feature |
|---|---|---|
| `/` | Public | Public course catalog storefront, search, category pills, syllabus preview modal, direct checkout |
| `/auth/login` | Public | Multi-role split-canvas login, 2-step OTP, social SSO brand marks, demo logins |
| `/auth/signup` | Public | Purchaser-tailored registration with course summary, auto-provisioning & auto-enrollment |
| `/auth/forgot-password` | Public | Password reset request with email recovery helper |
| `/auth/reset-password` | Public | 6-digit OTP verification, real-time password strength meter, password update form |
| `/[role]/dashboard` | All Roles | Role-adaptive dashboard (Learner, Instructor, Org Admin, Super Admin, Manager) |
| `/[role]/catalog` | Learner / All | Faceted course catalog with category chips, price filters, and syllabus modal |
| `/[role]/my-training` | Learner | Enrolled courses directory with progress bars, completion badges, launch buttons |
| `/[role]/courses` | Instructor / Admin | Course directory with departmental ownership badges and cross-department lock banners |
| `/[role]/courses/[courseId]` | Instructor / Admin | Studio 3-tier curriculum builder (sections, lessons, quiz/assignment units) |
| `/[role]/courses/[courseId]/player` | Learner | Full-screen cinema player, Video.js, hotkey notes, quiz engine, grade distribution chart |
| `/[role]/grading` | Instructor / Admin | SpeedGrader split-screen submission inspection, interactive rubric scoring, grade publication |
| `/[role]/users` | Admin Roles | User directory with search, role filtering, bulk activate/deactivate, and CSV export |
| `/[role]/categories` | Admin / Instructor | Course category taxonomy with custom hex swatches and course association counters |
| `/[role]/reports` | Admin / Staff | 12-section reporting suite: training matrix, timeline, query builder, heatmap, surveys, CSV export |
| `/[role]/calendar` | All Roles | 4-view interactive calendar (Month, Week, Day, Agenda), event scheduler, `.ics` sync |
| `/[role]/certificates` | All Roles | Digital certificate wallet, 3 template themes, printable credential view, bulk issuance |
| `/[role]/conferences` | Instructor / Admin | Virtual & physical ILT classroom scheduling, capacity tracking, waitlists, attendee registration |
| `/[role]/discussions` | All Roles | Threaded social Q&A hub, upvoting, instructor verified answers, moderation pin/resolve |
| `/[role]/content-library` | Admin Roles | Curated compliance catalog (SOC 2, HIPAA, GDPR), 1-click organization course import |
| `/[role]/learning-paths` | All Roles | Onboarding journey builder, mixed course/task steps, prerequisite locking, milestone progress |
| `/[role]/course-store` | Admin / Learner | Marketplace storefront, course landing page, syllabus accordion, B2B bulk seat licensing |
| `/[role]/groups` | Admin / Instructor | Static and dynamic rule cohorts, automated course enrollment, average completion rollups |
| `/[role]/organization` | Super Admin | Parent/sub-organization tree, `allowSubOrgs` permissions, per-organization module gating |
| `/[role]/approvals` | Manager / Admin | Dedicated triage inbox for employee course access requests and seat assignment requests |
| `/[role]/notifications` | Admin Roles | 7 automated trigger event configurations, email templates, topbar notification drawer |
| `/[role]/subscription` | Admin Roles | SaaS subscription billing, seat & storage meters, plan upgrades, invoice history |
| `/[role]/profile` | All Roles | User profile management, password update, 2FA QR enrollment, active device session revocation |
| `/[role]/settings` | Org Admin / Super Admin | 8 governance tabs: branding, glossary override, font switcher, video watermark, RBAC builder |

---

## 6. Conclusion & Recommendation

1. **Verification Verdict:**  
   The LMS Portal matches **all** functionality documented in [`docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md), but also contains **significant extra enterprise capabilities** that were omitted or only mentioned in passing in that document.
2. **Structural Cause:**  
   `LMS-IMPLEMENTATION-REFERENCE-MAPPING.md` was specifically scoped to demonstrate traceability against the academic research documents (`OpenedX.md` and `Moodle.md`). Advanced commercial features (SaaS billing, multi-tenant organization trees, ILT conferences, curated content libraries, onboarding learning paths, and B2B seat licensing) were built for the production portal but left outside that document's research-mapping boundaries.
3. **Documentation Strategy:**  
   Keeping [`docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-IMPLEMENTATION-REFERENCE-MAPPING.md) as the Open edX / Moodle academic traceability document while maintaining this companion specification ([`docs/LMS-ADDITIONAL-FUNCTIONALITY-SPECIFICATION.md`](file:///c:/Users/insph/Desktop/lms_v1/lms-portal/docs/LMS-ADDITIONAL-FUNCTIONALITY-SPECIFICATION.md)) provides the platform with complete, unambiguous, 100% functional and architectural coverage.
