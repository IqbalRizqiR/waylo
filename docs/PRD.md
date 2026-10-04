# Waylo — Product Requirements Document (PRD)

Status: Draft v1.0 — derived from sitemap, flow, and detail-sitemap source material.
Owner: TBD
Last updated: 2026-09-29

## 1. Vision

**Waylo: Find Your Way. Build Your Future.**

Waylo connects Learners, Mentors, Learning Providers, and Company Partners in one ecosystem for career discovery, skill development, and hiring. A Learner should be able to go from "I don't know what career fits me" to "I'm hired" inside one product. A Company should be able to go from "I need this skill" to "I hired someone who has it, verified" without leaving the platform.

## 2. Problem statement

- Job seekers/students often don't know which career fits them, and even when they do, they don't know which skills they're missing or how to close the gap credibly.
- Companies struggle to verify whether a candidate's claimed skills are real before investing time in interviews.
- Mentors and training providers have knowledge and content but no structured channel to reach the right learners at the right stage of their journey.

## 3. Goals

1. Give a Learner a personalized path from career uncertainty to a verified, job-ready skillset.
2. Give a Company a talent pool it can trust, filtered on verified competency rather than self-reported resumes.
3. Give Mentors a structured way to guide learners and be compensated for it.
4. Give Learning Providers a channel to distribute content that plugs directly into learner roadmaps.
5. Monetize via Learner Premium, Company Subscription, and mentor-assisted screening fees.

## 4. Non-goals (for v1)

- Building an in-app video conferencing system for mentoring (use an external link).
- Building a general-purpose LMS authoring tool with rich interactivity (start with structured lessons: text/video/quiz).
- Full ML-based recommendation (start rule-based on the skill graph; revisit later).
- Global/multi-currency payments (start with Indonesia: IDR, Midtrans/Xendit).

## 5. Actors

| Actor | Product surface | Sitemap available | Flow available |
|---|---|---|---|
| Learner | Waylo Web Apps | ✅ | ✅ |
| Mentor | Career Hub | ✅ | ✅ |
| Learning Provider | Career Hub | ❌ **missing** | ❌ **missing** |
| Company / HRD | Company Hub | ✅ | ✅ |
| Admin | Waylo Web Apps | ❌ **missing** | ❌ **missing** |

Admin and Learning Provider are described only in prose in the detail sitemap. They need dedicated discovery/design work before engineering can scope them (see §11).

## 6. Role narratives and feature scope

### 6.1 Learner (Waylo Web Apps)

**Narrative:** Sign up → onboarding → (already knows career, or takes Career Assessment) → Career Recommendation → Basic Assessment → Skill Gap → Roadmap (Free or Premium) → Learning / Mentoring / Project / Assessment → Verified Skill → (opt into) Talent Pool → Apply to jobs → Interview → Hired.

**Features:**
- Auth: Login, Register (email + Google OAuth recommended)
- Onboarding: "Do you know your career path?" branch
- Career Assessment (interest/aptitude-based) → Career Recommendation
- Skill Gap Analysis: Current Skill vs Required Skill vs Gap
- Personalized Roadmap: Overview, Learning Path, Recommended Course, Progress
- Learning: Smart Class Recommendation, Course Detail, Learning Progress
- Mentoring: browse/assigned Mentor, Jadwal Mentoring (schedule), Session Detail
- Project: Project List, Detail, Submission
- Assessment: List, Detail, Result
- Certificate: List, Detail (issued on completion/verification)
- Profile: Profile, Skill, Portfolio, Career Profile, Edit Profile, Settings
- Dashboard: Progress Belajar (learning progress), Daily Task, Learning Journey, Certificate
- **Missing from sitemap but required by the flow (must be added):** Job Match / Job Board, Apply, Interview Preparation, Subscription/Upgrade to Premium page.

**Free vs Premium (from flow, to be confirmed — see §10):**
- Free: Basic Roadmap, Free Learning, Basic Jobs → Job Match (limited)
- Premium: Advanced Assessment, Detailed Skill Gap, Personalized Roadmap, Curated Learning, Practice, Project (mentor-reviewed), Mentor access, Project Review, Final Assessment, Certification, Job Matching, Interview Preparation

### 6.2 Mentor (Career Hub)

**Narrative:** Sign up → Mentor Profile → Mentor Dashboard → (Create/manage Courses) and/or (accept Company program invites → get assigned learners/candidates) → run mentoring sessions → assess and recommend → review/feedback.

**Features:**
- Auth: Login, Register
- Mentor Dashboard: Ringkasan Aktivitas (activity summary), Statistik Course, Statistik Mentoring
- Course Management: Course List, Create Course (title, description, skill mapping, learning material, practice, assessment), Course Publish
- Mentor Program: Company Invite List (Accept/Decline), Assigned Program, Candidates List
- Mentoring: Learner/Candidate List, Session/Review, Assessment, Recommendation
- Review & Feedback
- Profile & Settings

**Open question:** the flow shows a Mentor path ending at "HRD" for the premium company-recruitment flow (mentor screens a candidate on behalf of a company). This needs to be explicit: does the Mentor's recommendation post directly into the Company's pipeline, and is the Mentor paid per screening? (see §10)

### 6.3 Company / HRD (Company Hub)

**Narrative:** Sign up → Company Profile → Company Onboarding → Dashboard → (Free/Trial or Subscribe) → post job with required skills → candidates apply or are sourced from Talent Pool → (Free path: general screening) or (Premium path: hire a Mentor to screen) → HRD review → Interview → Hire/Reject.

**Features:**
- Auth: Login, Register, Company Onboarding
- Company Dashboard: Talent Analytics, Assessment Analytics, Recruitment Analytics
- Overview: Talent Summary, Program Summary, Recruitment Summary
- Talent Pool: Daftar Kandidat (candidate list), Filter Kandidat, Detail Kandidat (Profile, Verified Skill, Assessment Result, Project/Portfolio, Certificate), Rekrut Kandidat (recruit candidate)
- Assessment: Assessment List, Create Assessment, Assessment Result
- Course & Learning Path: Course List, Create Course, Learning Path, Program Detail
- Recruitment: Kandidat Shortlist, Kandidat Detail, Recruitment Proses (process/pipeline), Hired Kandidat
- Company Profile: Company Profile, Edit Profile, Settings
- **Missing from sitemap but required by the flow (must be added):** Create Job / Define Skills / Publish Job as first-class pages (not folded into "Course"), Hire Mentor flow, Subscription/Billing page, Interview scheduling.

### 6.4 Learning Provider (Career Hub) — spec incomplete

Described in prose only: "provides courses/materials relevant to learner skill needs; content is integrated into Personalized Roadmap and Learning Path." No sitemap or flow exists. **Blocked** — needs a discovery session to define: how a Provider onboards, whether they can charge for content, how content quality/moderation works, and how their content differs from Mentor-authored courses.

### 6.5 Admin (Waylo Web Apps) — spec incomplete

Described in prose only: "manages users, courses, skills, assessments, roadmaps, mentors, learning providers, companies, and Talent Pool; monitors platform activity and quality." No sitemap or flow exists. **Blocked** — this is the highest-priority gap because every other role depends on Admin-curated master data (career list, skill taxonomy, question bank).

## 7. Cross-cutting concept: Verified Skill

A `UserSkill` becomes "verified" through some combination of: passing an Assessment above a threshold, a Mentor-approved Project submission, or a Mentor-endorsed mentoring outcome. Verified Skill is what the Talent Pool filters on and what should appear on a public/shareable Learner profile. **The exact verification rule is undefined and must be decided before the skills module is built** (see §10, item 3).

## 8. Monetization

| Side | Tiers | Notes |
|---|---|---|
| Learner | Free, Premium | Premium unlocks advanced assessment, personalized roadmap, mentor access, certification, job matching, interview prep |
| Company | Free/Trial, Subscribe (Premium) | Premium unlocks Premium Recruitment and the ability to hire a Mentor for screening |
| Mentor (indirect) | Paid per company screening engagement | Needs a payout mechanism |

## 9. Success metrics (proposed — confirm with stakeholders)

- Learner: % completing onboarding → roadmap → first verified skill; roadmap completion rate; Free→Premium conversion.
- Mentor: sessions run per mentor per month; course publish rate; company-invite acceptance rate.
- Company: time-to-hire; % of hires sourced via Talent Pool vs external; Free→Subscribe conversion; mentor-screening attach rate.
- Platform: DAU/MAU per role, Verified Skill issuance rate, candidate consent opt-in rate for Talent Pool.

## 10. Decisions needed before engineering can finalize scope

1. **Free vs Premium feature matrix** — exact line, both sides, confirmed by product/business.
2. **Mentor payment model** — who pays, how much, when, and how payout works.
3. **Verified Skill rule** — assessment score threshold, project approval, or both; does it expire or need renewal?
4. **Mentoring session tooling** — external link (Meet/Zoom/Jitsi) vs in-app video. Recommend external for v1.
5. **Course ownership** — can a Company's course be private to them, or is all content global/shared? Can a Provider and a Mentor both author courses, and do they compete for the same roadmap slot?
6. **Recommendation engine approach** — rule-based skill matching (v1) vs ML/embeddings (later).
7. **Talent Pool consent** — must be explicit opt-in per learner, and ideally scoped (visible to all companies vs specific companies only), to comply with Indonesia's UU PDP (Personal Data Protection Law).
8. **Master data ownership** — who seeds/maintains the career list, skill taxonomy, and assessment question bank at launch (this is an Admin responsibility that has no spec yet).
9. **Mentor "HRD" handoff** — what exactly happens when a Mentor completes a company-sponsored screening: does it auto-advance the candidate in the company's Recruitment Proses?

## 11. Open gaps in the current source material

1. Admin: no sitemap, no flow. High priority — most other modules depend on Admin-managed master data.
2. Learning Provider: no sitemap, no flow. Needed before course-authoring permissions can be modeled.
3. Learner sitemap omits Job Match, Apply, Interview Prep, and Subscription — all required by the Learner flow diagram.
4. Company sitemap omits Create Job, Define Skills, Publish Job, Hire Mentor, Subscription/Billing, and Interview scheduling — all required by the Company flow diagram.
5. "Company Onboarding" appears under Learner authentication in the User Sitemap — likely a copy error; confirm.
6. Two assessment types are both just called "Assessment"/"Career Recommendation" in different flows (interest-based Career Assessment vs skill-based Basic/Advanced Assessment) — needs distinct naming end to end.
7. No privacy/consent flow for candidate data exposure in the Talent Pool.
8. Company "Dashboard" and "Overview" overlap in the Company Sitemap; recommend merging into one page with tabs.

## 12. MVP scope recommendation

One golden path, Free tier only, minimal Admin (seed scripts instead of a UI):

Learner onboarding → Career Assessment → Career Recommendation → Skill Gap → Roadmap → Course → Mentor review → Verified Skill → Talent Pool (opt-in) → Company posts Job → Learner applies → Company reviews → Hire.

Out of MVP: payments/premium gating, Learning Provider portal, full Admin UI, analytics dashboards, mentor payouts, in-app messaging.
