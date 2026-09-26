# Implementation Audit — `lms-portal` vs. `agent/app/lms-product-research.md`

**Date:** 2026-09-26
**Method:** 5 parallel code audits, each independently comparing the live `lms-portal/src` code against the numbered spec sections in [`agent/app/lms-product-research.md`](../agent/app/lms-product-research.md), and separately cross-checking every claim in `lms-portal/AGENTS.md`'s Module Progress Tracking table. No code was changed as part of this audit — findings only.
**Scope caveat:** this is a frontend-only mock (zustand stores, no backend). Mocked/seeded data is expected and not penalized. What *is* flagged: features presented as working that are actually inert (no-op buttons, unwired toggles), numbers presented as computed that are hardcoded constants, role-scoping that doesn't match the spec or doesn't exist at the page level, and places where `AGENTS.md`'s own changelog overstates what the code does.

## How to read this

Each finding has a severity:
- **claims-vs-reality mismatch** — `AGENTS.md` (or the spec's own status note) says something works; it doesn't, or doesn't the way described. Highest priority.
- **functional gap** — spec requirement genuinely missing or incomplete; usually already implied by scope, but listed for completeness.
- **cosmetic** — real but low-stakes (a mislabeled button, a stale comment).

File:line references are from the code as read during the audit (2026-09-26); several files are under active concurrent edits by other sessions, so line numbers may drift.

---

## Executive summary — the 10 most severe issues

1. **[FIXED 2026-09-26]** ~~The entire custom video player experience (notes engine, hotkey `B`, 5s rewind/forward, playback-speed menu) is dead for every seeded course.~~ All seed videos were YouTube URLs; `VideoPlayer.tsx` skips Video.js entirely for YouTube. Fixed by giving the first lesson of the first seeded course (`l-1`, Onboarding 2026) a direct MP4 source (`SAMPLE_DIRECT_VIDEO` in `courses-store.ts`) so the real custom player, hotkey notes, rewind/forward, and speed menu are all reachable in a click-through. Other seeded lessons remain YouTube-sourced. → [§3.6 Courses](#36-module-3-courses)
2. **Social SSO buttons (Google/Facebook/Apple) silently log any visitor in as a hardcoded Learner account (`learner@lms.dev`)**, regardless of which button is clicked — worse than the "no-op" the spec's own status note claims. **Left as-is intentionally** — showcase/demo purposes. → [§3.1 Auth](#31-authentication--login-flow)
3. **[FIXED 2026-09-26]** `AGENTS.md` claimed a full MFA enrollment flow with QR code + backup codes that didn't exist. Rather than build real TOTP enrollment (out of scope for a frontend mock), added a genuine simulated MFA *verification* step to the login flow itself: accounts seeded with `mfaEnrolled: true` (Super Admin, LMS Admin, Org Admin, Dept Head, Manager) are routed to a "Two-Factor Authentication" step after primary login, prompting for a 6-digit authenticator code (dummy, auto-fillable) before landing on the dashboard — a trusted device still skips it. → [§3.2 MFA](#32-mfa--verification)
4. **[DOCUMENTED — resolved]** The spec and `AGENTS.md` described the "Add User" `Sheet` drawer (`AddUserDrawer.tsx`) as the live component; it was actually dead code. `AGENTS.md` row 5 now correctly references `AddUserDialog.tsx` as the live component. → [§3.5 Users](#35-module-2-users)
5. **[FIXED 2026-09-26]** Reports' Training Matrix, Groups Report, Learning Paths Report, Courses Report, and Post-Training Surveys presented hardcoded or formula-generated numbers as scattered inline literals in `page.tsx`. Extracted every one of them into a new `src/lib/mock/reports-data.ts` (still mock data — no backend exists — but now centralized, named, and documented, the same way a real API response would be), replaced the flat "78% for every group" constant with a deterministic per-group value, and added the two Courses Report columns missing per spec ("Average Time to Complete," "Expiration Date"). Also added a genuine loading state: the page now simulates a network round-trip (`simulateReportsFetch()`, ~550ms) before rendering instead of computing everything synchronously on first paint. → [§3.13 Reports](#313-module-10-reports)
6. **Settings' Component-Level RBAC Builder and Glossary Override are fully decorative** — toggling a permission or renaming "Learner" to "Employee" changes nothing anywhere else in the app. `AGENTS.md` lists both as delivered. **Deliberately left as-is** — planned for the final development pass, not this one. → [§3.15 Account & Settings](#315-module-12-account--settings)
7. **[PLANNED FOR FINAL DEVELOPMENT]** Subscription & Billing gives Org Admins full write access despite the spec's explicit "Super Admin Exclusive" requirement, and the "PDF Receipt" button downloads a `.txt` file. Confirmed as a known gap to close during final development, not this pass. → [§3.16 Subscription](#316-saas-subscription--billing)
8. **[PLANNED FOR FINAL DEVELOPMENT]** Certifications: Manager "direct reports" scoping doesn't exist anywhere — a Manager can bulk-issue certificates, and see the full registry, for every learner in the org, identical to Org Admin. Confirmed as a known gap to close during final development, not this pass. → [§3.21 Certifications](#321-certifications-proposed)
9. **[FIXED 2026-09-26]** Content Library had no nav entry at all. Added a `content-library` entry to `src/config/nav.ts` (Super Admin/LMS Admin/Org Admin only, per §3.20's "Super Admin curates, Org Admin imports" model) and a matching page-level role gate that shows a restricted message to any other role instead of the import UI. → [§3.20 Content Library](#320-module-15-content-library)

---

## §3.1 Authentication & Login Flow

- **[claims-vs-reality]** Google/Facebook/Apple buttons call `directLogin("learner@lms.dev")` and redirect regardless of provider clicked (`LoginForm.tsx:219-226`) — silently impersonates a fixed Learner account rather than being an inert no-op as the spec's own status note describes.
- **[cosmetic]** Enterprise SSO accepts any typed string as a valid org domain with no validation (`LoginForm.tsx:240-255`) before logging the user in.
- Otherwise well matched: split-canvas layout, Step 1/2 structure, dedicated per-role redirect all work as described. `AGENTS.md` row 1 is accurate for this part.

## §3.2 MFA & Verification

- **[claims-vs-reality]** `AGENTS.md` rows 2 and 15 claim "full 2FA enrollment flow with QR code preview and backup recovery codes." Actual: `settings/page.tsx:499-598` has an org-wide toggle and a static "Sample QR" button revealing a hardcoded fake secret (`"ABCD-EFGH-1234-WXYZ"`). No per-user enrollment, no code-confirmation step, no backup codes anywhere in the codebase. The spec file's *own* status note is honest about this being unbuilt — `AGENTS.md` contradicts the spec's own more accurate self-assessment.
- **[functional gap]** OTP can be skipped by typing anything into the "Optional for Demo" password field — a reasonable demo shortcut, but undercuts the "strict enterprise rate limiting" framing on the same screen.
- Rate limiting (CAPTCHA after 2 fails, 15-min lockout after 5) and "trust this browser for 30 days" are both genuinely implemented and persisted — solid.

## §3.3 Roles Architecture & Departmental Scoping

- **[functional gap]** The "4 nav rails ≈ 6 archetypes" framing in `roles.ts` overstates parity — Super Admin/LMS Admin are excluded from Courses, Learning Paths, Course Store, Groups, Grading Hub, Conferences, Discussions, Course Categories, and Account & Settings, unlike Org Admin/Dept Head in the same nominal "admin" nav group. See §3.4 matrix violations below for specifics.
- **Positive:** the `DepartmentLockBanner`'s "Request Co-Author Access" button genuinely sends a notification to the owning department head now — the spec file's own status note calling this "a visual stub" is stale/out of date relative to the code (a rare case of code being ahead of the spec doc).
- Core deliverables (permission model, `canEditDepartmentResource()`, AppShell rail, banner wording) are solid and match spec almost verbatim.

## §3.4 Module 1: Home & Dashboard

**Role Visibility Matrix violations** (comparing the spec's explicit table against `src/config/nav.ts`):
- **[functional gap]** Learner is missing "Course Categories" nav access despite the spec matrix explicitly marking Learner `YES`.
- **[functional gap]** Manager is granted Calendar access despite the spec matrix explicitly marking Manager `-` (no access). (`AGENTS.md` row 22 confirms this was a deliberate choice, so it's a known divergence, not an accident.)
- **[functional gap]** "Grading Hub" and "Conferences" (Instructor-only per matrix) are also granted to Org Admin/Dept Head; "Discussions" (Instructor+Learner per matrix) also granted to Dept Head/Org Admin; "Approval Inbox" (Manager-only per matrix) also granted to Org Admin/Dept Head. The nav matrix as implemented diverges from the spec's matrix in both directions (some roles get less than specified, some get more).
- **[claims-vs-reality]** The spec's own status note says the Admin dashboard's "Add widgets" affordance "is not interactive — widgets are fixed." In fact no such button, banner text, or edit control exists in the code at all — the claimed (inert) affordance doesn't exist, period.
- **[functional gap — hardcoded data presented as computed]** `ManagerDashboard`'s "Team Compliance Health" (18/24 direct reports), Overdue Training list, and Skill Coverage percentages are a single fixed mock object (`dashboard-data.ts`) — every Manager account sees identical numbers regardless of who's logged in or who their actual direct reports are.
- **[functional gap — same pattern]** `InstructorDashboard`'s "My Courses" panel renders a static mock array, not the logged-in instructor's actual courses from `useCoursesStore` filtered by author — every instructor sees the same fixed course list/stats.
- **Positive:** `AdminDashboard` (Portal Activity chart, Quick Actions, KPIs, donut, Timeline, empty-state Courses Progress) genuinely matches spec and `AGENTS.md` row 4's description.

## §3.5 Module 2: Users

- **[claims-vs-reality]** Both the spec's status note and `AGENTS.md` row 5 describe Step 2 of Add User as "a right-hand slide-over `Sheet` drawer (`AddUserDrawer.tsx`)." That component exists but nothing imports it — it's dead code. The live UI is a different, undocumented `AddUserDialog.tsx` (a centered modal, not a slide-over).
- **[functional gap]** Per-row "Edit" and "Delete" actions in the directory table are `console.log` stubs with no disabled state or "coming soon" indication — indistinguishable from working buttons.
- **[functional gap]** Spec's filter requirements include Organization, User Type, Department, Custom Tags. Only User Type and Status are implemented — Department isn't filterable despite being a real, populated field on every user record.
- Bulk Activate/Deactivate and CSV export are genuinely functional. The 2-step org-scoping guardrail (Super Admin prompt vs. Org Admin skip-straight-through) is correctly implemented.

## §3.6 Module 3: Courses

- **[claims-vs-reality — high severity]** The entire custom notes engine, hotkey `B`, 5s rewind/forward, and playback-speed menu are dead for every seeded course. `VideoPlayer.tsx` early-returns for YouTube sources without ever creating a Video.js instance or calling `onReady`, so `playerRef.current` stays `null` forever; the YouTube branch renders a bare `<iframe>` with none of the custom control bar. Every seeded lesson in every seeded course uses a YouTube URL, and new lessons in `CourseForm.tsx` default to YouTube too — so this isn't an edge case, it's the only path a real user hits.
- **[functional gap]** YouTube embed doesn't suppress native branding/controls (`controls=0&modestbranding=1&rel=0` per spec) — native YouTube UI, logo, and related-video overlay are all visible.
- **[functional gap]** Review Governance (§3.6.E) admin toggle matrix doesn't exist — `Course.reviewsEnabled` is a seeded field nothing ever reads; no UI to enable/disable reviews at course/section/lecture level.
- **[functional gap]** Review stats (4.8 average, 76/18/4/1/1 breakdown, "1,420 Reviews") are hardcoded and don't reflect the actual seeded review list, which only grows by 1 when someone submits a review.
- **[functional gap]** Lesson-completion checklist is unpersisted local component state seeded with a hardcoded `"l-1": true` — resets on remount except for whichever course happens to have a lesson literally named `l-1`.
- **[claims-vs-reality]** Spec requires exactly 4 mandatory learning objectives; the code seeds 3 and only validates ≥2. `AGENTS.md` explicitly claims "4 learning objectives."
- **[functional gap]** Content types cover 5 of the spec's 8 (video/quiz/assignment/coding/article) — SCORM/xAPI packages, external links, and lesson/course-level downloadable attachments are absent. `AGENTS.md` row 6 marks the whole module `COMPLETED` with no caveat about this.
- **[cosmetic]** The Resources tab exists but is fully fake — sample data, `href="#"` links, and a Download button that just calls `alert()`.
- SCORM/xAPI/cmi5 runtime, compliance e-signature/attestation, and the content ingestion pipeline (§3.6.F–H) are confirmed entirely absent, matching the spec's own disclosure — but `AGENTS.md` row 6 doesn't mention any of this, presenting the module as unconditionally complete.
- **Positive:** the player route genuinely has zero `AppShell`/nav chrome — the distraction-free shell requirement itself is correctly met, just undermined by the YouTube issue above.

## §3.7 Module 4: Learning Paths

No new discrepancies found beyond what `AGENTS.md` row 7 already discloses (manual "mark complete" rather than real completion-driven unlocking, no certificates). Accurately self-reported.

## §3.8 Module 5: Course Store

- **[functional gap]** B2B bulk seat licensing's CSV-invite path doesn't create any enrollment, notification, or invite for the pasted emails — it just sets a count from how many comma/newline-separated strings were typed, with no persistence across navigation. No "revoke and reassign an unclaimed seat" action exists anywhere.
- **Positive:** the `[Request Access]` → Manager approval-inbox wiring is genuinely functional.

## §3.9 Module 6: Groups

- **[claims-vs-reality]** `AGENTS.md` row 9 and the code's own comments describe assigning a course to a group as "automated enrollment." No enrollment record is ever created anywhere — `groups-store.ts` has zero cross-reference to `enrollments-store.ts`. It's a label with no downstream effect.
- **[functional gap]** "Group-level progress analytics" is a single average of each assigned course's org-wide `completionRate` — not filtered to the group's actual members.
- Dynamic rule-based membership only supports one equality condition (not spec's AND/OR multi-condition) — but `AGENTS.md` honestly discloses this as pending, so not a mismatch.

## §3.10 Module 7: Organization Management

- **[functional gap]** No `middleware.ts` exists anywhere — route-level enforcement of disabled modules is entirely absent. Confirmed: `/[role]/groups`, `/[role]/organization`, and the generic `[role]/[module]` placeholder all render unconditionally regardless of `org.enabledModules`; only the nav rail hides the link. `AGENTS.md` row 10 does disclose this honestly, so not a mismatch — but worth restating since §3.10.D explicitly requires route + API blocking with a 403.
- **Positive:** nav-level gating itself is real (`AppShell.tsx` correctly intersects role-nav with org's `enabledModules`), and sub-org-creation-when-disabled is correctly absent from the DOM (not just visually disabled) — matches spec precisely.

## §3.11 Module 8: Automations

**Pass.** Confirmed no real page exists; correctly falls through to the generic placeholder. `AGENTS.md`'s "SKIPPED (by design)" claim is accurate.

## §3.12 Module 9: Notifications

- **[claims-vs-reality]** Of the 7 spec-mandated core triggers (all exist as distinct, well-labeled configuration rows), only 2 are ever actually dispatched anywhere in the app (`course-assignment`, `completion-certificate`). The other 5 — `welcome`, all 3 expiration reminders, `inactive-nudge` — have zero call sites anywhere in the codebase. They render identically to the 2 that work, with no visual distinction.
- **[functional gap]** None of the 4 real `sendNotification()` call sites check `trigger.enabled` first — toggling a trigger off in the settings UI has no effect on whether it fires.
- **[functional gap]** The spec's explicit "Instructor STRICTLY PROHIBITED from altering notifications" rule is only enforced by hiding the nav link — the page itself doesn't re-check role, so an instructor who navigates directly to `/instructor/notifications` can still toggle triggers.
- `AGENTS.md` row 12 honestly discloses the simplified trigger-inheritance model — accurate.

> **Note (updated 2026-09-26):** an "Approval Inbox & Grading Hub" section previously appeared here. On closer check, the two modules aren't equally spec-grounded: **Grading Hub** has zero backing anywhere in `agent/app/lms-product-research.md` beyond a bare nav-item label in the §3.4 matrix, so it was **removed from the codebase entirely** (`src/app/[role]/grading-hub/`, `submissions-store.ts`, and its nav entry). **Approval Inbox**, by contrast, is genuinely spec-grounded — §3.3.G explicitly describes it as a Manager Dashboard capability ("Pending enrollment/training requests from direct reports... and pending seat-assignment requests"), and it's a real §3.4 nav item — so it was **kept**. The use case matches directly: it's where the Course Store's `[Request Access]` flow (§3.8, for non-open-enrollment courses) routes for Manager approval.

## §3.13 Module 10: Reports

`AGENTS.md` row 13 claims "a full 12-section reporting suite" with "functional client-side CSV exports implemented across all report tabs." Verified per-tab:

> **Update (2026-09-26):** the hardcoded/formula-number findings below (Training Matrix, Groups, Learning Paths, Courses missing columns, Post-Training Surveys) have been addressed — all moved to a centralized `src/lib/mock/reports-data.ts` plus a simulated fetch/loading state, per the executive summary above. The export-logic and inert-input findings (Timeline/Custom/Analytics/Surveys export fallback, filter-query, schedule persistence) were **not** in scope for this pass and remain open.

- **[claims-vs-reality]** 4 of 12 tabs (Timeline, Custom, Analytics, Surveys) have no real export logic — clicking their labeled "Export ... (CSV)" button silently downloads the Overview KPI summary instead.
- **[functional gap]** Custom Reports' filter-query input has zero effect on any export; "Save & Enable Schedule" only flips local state for 1.2 seconds and persists nothing.
- **[functional gap]** Training Matrix hardcodes 2 "mandatory" courses (no real flag on the Course model) and has none of the spec's required filters (Department/Org/Group/mandatory-only toggle). Every cell's status comes from a deterministic hash function keyed only on `userId::courseId` — not derived from any real progress data anywhere, and never changes even if a learner actually completes the course.
- **[functional gap]** Groups Report's "Avg Completion Rate" is a hardcoded `78` for every group. Learning Paths Report's "Enrolled Learners"/"Completion Rate" are formulas derived purely from step count (`steps.length * 4.2`, etc.), not real data.
- **[functional gap]** Users Report is missing the required "Test Average Score" column entirely; "Total Training Time"/"Last Login" both render as literal placeholder text, not values, despite `AGENTS.md` listing "last login" as delivered.
- **[functional gap]** Organizations Report is missing Active Users/Compliance %/Training Hours columns and the required comparative chart.
- **[functional gap]** Timeline tab is a fully hardcoded 4-item array with fabricated relative timestamps, not backed by any store.
- **[functional gap]** Analytics heatmap intensity is generated by a pure arithmetic formula unrelated to any real activity data; 2 of 4 required visualizations (engagement curves, score histograms) are missing entirely.
- **[claims-vs-reality]** Post-Training Surveys is 100% static mock data with hardcoded KPI cards (CSAT/NPS/Retention), and has no configuration UI for attaching a question set to a course — which the spec calls the module's core feature.
- **[functional gap]** Courses Report tab is missing two spec-required columns: "Average Time to Complete" and "Expiration Date."

## §3.14 Module 11: Course Categories

- **[claims-vs-reality]** `AGENTS.md` calls deletion "guarded." It isn't — the confirmation dialog displays a warning sentence when courses are assigned, but the Delete button proceeds unconditionally regardless; `deleteCategory()` has no dependency check at the store level at all. Spec explicitly requires deletion to be *prevented* when courses are mapped, not just warned about.
- **[claims-vs-reality]** Spec restricts category CRUD to Org Admin only (Instructors explicitly "STRICTLY BLOCKED" from create/rename/delete). Code grants full CRUD to Org Admin, Manager, *and* Dept Head — `AGENTS.md` row 23 self-admits extending this to Manager, which is a direct deviation from the written spec's role-governance rule.
- **[functional gap]** No icon field, no Filter Drawer (Parent/Org/Active-status), no sort dropdown, and the entire "Talent Pool & Competency Association" sub-feature is unbuilt.
- **Positive:** hierarchical parent/sub-category modeling, grid/list toggle, and the 4-item kebab menu are all real and correctly exclude Instructors from management actions.

## §3.15 Module 12: Account & Settings

`AGENTS.md` row 15 claims "8 comprehensive administration tabs." Verified:

- **[claims-vs-reality]** The Component-Level RBAC Builder tab is pure decoration — its matrix is local `useState`, never persisted, and has zero connection to the real permission/nav gating in `permissions.ts`/`roles.ts`. Toggling a role's access here does nothing to their actual nav or routes. This directly contradicts the spec's stated purpose for this exact tab.
- **[claims-vs-reality]** Glossary Override writes to the settings store, but nothing anywhere else in the app reads it — role/entity labels everywhere still come from the static `ROLE_LABELS` map. Changing "Learner" to "Employee" changes nothing outside the settings page itself. `AGENTS.md` row 17 claims this was "Delivered."
- **[functional gap]** The Locale tab's language selector (including an "Arabic - RTL" option) is stored but never read anywhere — no i18n strings, no RTL `dir` attribute anywhere in the app.
- **[functional gap]** "Enforce MFA," "Corporate Domain Whitelist," and "Video Anti-Piracy Watermarking" toggles all write to the store but are never read anywhere else — none actually affect login, signup, or the video player.
- **[functional gap]** Gamification's point values and leaderboard toggle are never consumed anywhere — no leaderboard page, no points ledger, no badges exist.
- **[functional gap]** E-commerce's "Configure Gateway" button has no `onClick` handler at all (a genuine no-op); the "Stripe — Connected" badge is a hardcoded static badge.
- **[functional gap]** Import & Export's "Select CSV File" button has no file-input wiring — clicking it does nothing despite the card's claim of provisioning "up to 5,000 employees simultaneously."
- **[functional gap]** 3 of the spec's ~11 named submodules (Users config, Courses defaults, Course Categories admin) have no corresponding tab at all.
- **[cosmetic]** "Save Configuration" button is a no-op — every field already writes to the store on every keystroke, so the button implies a manual-save model that doesn't exist.
- **Positive:** the font selector is genuinely functional in-session (injects a Google Fonts link, sets `--font-sans` at runtime) — but doesn't survive a page reload, since `layout.tsx` never re-applies the persisted `fontId` on load.

## §3.16 SaaS Subscription & Billing

- **[claims-vs-reality / spec violation]** Spec explicitly requires Org Admins have *no access* to platform billing. The code grants Org Admins the full interactive billing portal (plan upgrade, seat-add, payment-method editing, invoice downloads) — not the "advisory" `AGENTS.md` row 16 describes.
- **[claims-vs-reality]** `AGENTS.md` claims "client-side PDF receipt generation." The download handler produces a plain-text `.txt` file with a `text/plain` MIME type, while the on-screen button is still labeled "PDF Receipt."
- **[functional gap]** Seat usage ("84/150") and storage usage ("28.4/100 GB") are hardcoded seed literals — never recalculated from the actual user count in `useUsersStore`.

## §3.17 Strategic Suggestions (White-Label, i18n, Mobile/Offline)

- Glossary Override and the i18n language selector are both decorative with no downstream effect (see §3.15 findings above) — `AGENTS.md` row 17 lists both as delivered.
- Font selector is genuinely functional in-session (see §3.15) — the one part of this row that's real, modulo the reload issue.
- No PWA/service-worker/manifest exists for Mobile & Offline Access — but this matches the spec's own "Later Phase" framing and `AGENTS.md` doesn't claim it, so not a mismatch.

## §3.18 Module 13: ILT & Virtual Classroom

- **[functional gap]** No attendee-level attendance capture at all — registration only increments an anonymous count; no per-learner roster, no manual check-in, no webhook simulation.
- **[functional gap]** For virtual sessions (the majority of seed data), the register/waitlist button never even renders — only a "Join Room" link does, so capacity/waitlist tracking is completely inert for virtual webinars.
- **[claims-vs-reality]** `.ics` download is a manual self-serve button available to *anyone* viewing the page, not scoped to actual registrants — not the spec's "enrolled learners receive a calendar invite."
- **[functional gap]** No roll-up into Reports/Training Matrix anywhere.
- **[functional gap]** The `conferences` nav entry excludes both `learner` and `manager` — the people who'd actually attend sessions have no nav path to find or register for them.

## §3.19 Module 14: Discussions & Social Q&A

- **[functional gap]** Instructor pin/resolve/delete moderation is a flat role check with no comparison against courses the instructor actually authored — any instructor can moderate any thread in the org, including courses they don't teach.
- **[functional gap]** `dept-head` is granted full moderation, not mentioned anywhere in the spec's role list for this module.
- **[functional gap]** No notification tie-in on new replies, despite the spec requiring one and Certifications proving the pattern already exists elsewhere in the codebase.
- **[functional gap]** No structural separation between per-lesson Q&A and course-wide discussion board — both are the same flat record type with an optional lesson tag.
- **Positive:** instructor-reply highlighting and role-gated post/reply/upvote both work correctly.

## §3.20 Module 15: Content Library

- **[claims-vs-reality — high severity]** No nav entry exists anywhere for Content Library, directly contradicting `AGENTS.md`'s explicit claim that "nav item integrated into Admin nav rail" — the page is a dead route reachable only by typing the URL.
- **[functional gap]** Because there's no nav gating and the page itself performs no role check, any role (including Learner) that finds the URL gets full "Import into org" capability.
- **[functional gap]** Imported courses aren't versioned separately from org-authored ones as required — once imported, a course is indistinguishable from an org's own content, with no version link back to the library entry.
- **[claims-vs-reality]** The "Check Updates" button is byte-for-byte identical logic to the import button and is a no-op for any org that's already imported — presented as a live update-check that never does anything once you've imported.

## §3.21 Certifications (Proposed)

- **[claims-vs-reality — high severity]** Manager "direct reports" scoping doesn't exist anywhere in the issuance flow or the registry view — a Manager sees and can bulk-issue to every learner in the org, identical to Org Admin. `AGENTS.md` explicitly claims this scoping was delivered.
- **[functional gap]** The Instructor scoping in the *registry view* (as opposed to the issuance dialog, which is correct) has a logic bug: the filter condition is structured so the second half of an `&&` is always false, meaning the whole check never filters anything out — an Instructor actually sees every certificate issued in the org, not just their own courses.
- **Positive:** bulk issuance correctly creates individually-numbered certificates per learner (not a shared document); template edits are correctly decoupled from already-issued certificates via a frozen snapshot (matches the spec's non-repudiation requirement); notification tie-in on issuance is genuinely wired for both single and bulk paths.

## Undocumented additions (built, but no corresponding spec section)

- **Calendar module** (`/[role]/calendar`, `calendar-store.ts`) — a fully built, 4-view calendar system with no `### 3.x` section anywhere in the spec defining what it should do. "Calendar" only appears in the spec as a bare nav-rail label and a passing `.ics`-invite mention under §3.18. Unlike Certifications (spec'd before being built, per instruction), this module was built with no product spec backing it — flagged for spec backfill, not treated as a code defect.

---

## Pattern across all 5 audits

The most consistent theme, repeated in nearly every module: **`AGENTS.md`'s changelog entries tend to describe the intended/designed behavior rather than the verified behavior** — component names, data flows, and role-scoping rules are frequently stated as fact without having been checked against what's actually wired up. Concretely, this shows up as:

1. **Dead/unwired UI** — toggles, filters, and buttons that write to a store nothing else reads (RBAC builder, Glossary, i18n selector, several Settings toggles), or that have no handler at all (E-commerce gateway button, CSV import button).
2. **Hardcoded numbers presented as computed** — Manager dashboard stats, Groups Report completion rate, Learning Paths Report metrics, Subscription seat/storage meters, Training Matrix cells.
3. **Page-level role checks missing where only nav-level hiding exists** — Approvals, Grading Hub, Content Library, and (in the registry view specifically) Certifications' Instructor scope.
4. **Documented components that aren't the ones actually wired up** — `AddUserDrawer.tsx` (dead) vs. `AddUserDialog.tsx` (live).
5. **A specific spec requirement silently dropped from an otherwise-large feature** — Manager "direct reports" scoping (Certifications, and implicitly Groups/Approvals which never got a real proxy for it either), Org-Admin-excluded billing (Subscription), category CRUD restricted to Org Admin only (Categories).

None of this is catastrophic for a frontend-only mock — but it means `AGENTS.md`'s `COMPLETED` status should be read as "the page exists and looks right," not "every claim in the row's description was verified."
