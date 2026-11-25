# UAE Motors Marketplace

## Agent Execution Playbook --- MZA-Logics

**Project:** UAE Motors Marketplace\
**Prepared for:** MZA-Logics\
**Project owner:** Umer Javed\
**Reference:** https://www.dubizzle.com/\
**Market:** United Arab Emirates\
**Languages:** English and Arabic (full RTL)\
**Currency:** AED\
**Categories:** Cars, Motorcycles and Boats

------------------------------------------------------------------------

# 1. How the agent must use this document

This document is the operating manual for the AI coding agent. Follow it
in order. Do not attempt to build the entire product in one pass.

The agent is responsible for acting as: - Product analyst - Solution
architect - UI/UX designer - Senior full-stack engineer - Database
engineer - QA engineer - Deployment and documentation engineer

## Non-negotiable working rules

1.  Inspect the existing repository before changing anything.
2.  If the repository is empty, initialize the project using the
    approved stack.
3.  Do not delete, replace or restructure existing working code without
    explaining why and obtaining approval.
4.  Work in small, reviewable phases.
5.  At the end of each phase, report what was completed, what remains,
    files changed, tests run, risks and decisions needed.
6.  Stop at every approval gate in this playbook. Do not proceed until
    the project owner approves.
7.  Never claim a feature is complete merely because its screen exists.
8.  Do not use fake buttons, fake API responses or hardcoded production
    data.
9.  Mock data may be used temporarily for visual prototyping only.
    Clearly isolate it and replace it before declaring the feature
    complete.
10. Never commit secrets, API keys, passwords, OTP credentials or
    payment credentials.
11. Use realistic UAE examples, AED prices, emirate names and vehicle
    specifications.
12. Keep English and Arabic content equivalent. RTL must be tested, not
    assumed.
13. Prefer maintainable, boring, proven solutions over unnecessary
    complexity.
14. If requirements conflict, stop and ask the project owner rather than
    silently choosing.
15. Keep the project documentation updated throughout development.

## Required project documents

Create and maintain these files in the repository:

-   `README.md` --- setup, run, test and deployment instructions.
-   `ARCHITECTURE.md` --- system architecture and key decisions.
-   `DATABASE_SCHEMA.md` --- entities, relations and indexes.
-   `ROUTES_AND_PAGES.md` --- route inventory and access rules.
-   `API_SPECIFICATION.md` --- endpoints, inputs, outputs and
    authorization.
-   `DESIGN_SYSTEM.md` --- colors, typography, spacing and components.
-   `TASKS.md` --- implementation checklist.
-   `DEVELOPMENT_STATUS.md` --- completed, in-progress and blocked work.
-   `QA_TEST_PLAN.md` --- test cases and results.
-   `.env.example` --- names and descriptions of required environment
    variables only.

------------------------------------------------------------------------

# 2. Product definition and scope

Build a bilingual, responsive, lead-generation classifieds marketplace
for motor vehicles in the UAE.

Buyers browse listings and contact sellers directly by phone or
WhatsApp. The marketplace does not need an internal buyer-seller chat or
checkout for the vehicle itself.

## User roles

1.  Visitor --- browse and search public listings.
2.  Individual seller --- manage a personal account and vehicle
    listings.
3.  Dealer --- manage business profile, inventory and dealer package.
4.  Moderator --- moderate users/listings/reports within assigned
    permissions.
5.  Super Admin --- full administration and configuration access.

## Phase 1 product modules

-   Public homepage
-   Cars, Motorcycles and Boats category pages
-   Search, filters, sorting and pagination
-   Listing detail pages
-   Registration, login, verification and password recovery
-   Individual and dealer profiles
-   Create/edit/manage listings
-   Favorites
-   Email and in-app notifications
-   Social video link support
-   Featured, Premium and Urgent promotions
-   Dealer packages
-   One client-selected payment gateway
-   Admin panel and moderation
-   Content pages and banners
-   English and Arabic with complete RTL
-   Responsive desktop, tablet and mobile layouts

## Explicitly outside the initial scope unless approved

-   Native iOS or Android apps
-   Buyer-seller internal chat
-   Vehicle purchase checkout or escrow
-   Financing, insurance or vehicle inspection services
-   Hosting uploaded video files
-   Multiple payment gateways at once
-   Property, jobs, electronics or non-motors categories

Record any requested scope change in `TASKS.md` and obtain approval
before implementation.

------------------------------------------------------------------------

# 3. Recommended technology stack

Use the latest stable, mutually compatible versions at project
initialization. Record exact versions in the lockfile and `README.md`.
Do not blindly use an old version number from a prompt.

## Application

-   Next.js with App Router
-   React
-   TypeScript with strict mode
-   Tailwind CSS
-   shadcn/ui
-   Lucide icons

## Backend and data

-   Next.js Route Handlers for HTTP APIs
-   Server Actions only where appropriate
-   PostgreSQL
-   Prisma ORM
-   Zod validation
-   A service/repository layer for business logic

## Authentication and localization

-   Auth.js or a carefully designed custom authentication implementation
-   Secure password hashing
-   Email verification
-   Mobile OTP using a UAE-compatible provider selected by the client
-   `next-intl` for English and Arabic
-   Correct RTL document direction and locale-aware formatting

## Storage and infrastructure

-   Cloudflare R2 or S3-compatible object storage for listing images
-   Managed PostgreSQL
-   Vercel or another approved Next.js host
-   Redis only when justified for rate limiting, caching or background
    jobs
-   Sentry or equivalent error monitoring

## Payments

Use a payment-provider adapter so the business logic is not tightly
coupled to one provider. Integrate only the provider selected by the
client: Telr, Network International or Stripe, subject to merchant
eligibility and provider approval.

Do not assume a gateway account, API access or merchant approval exists.
Obtain credentials and sandbox access from the client.

## Testing

-   Vitest for unit tests
-   Playwright for end-to-end tests
-   TypeScript checks
-   ESLint and formatting checks

## Architecture decision

Start with a modular monolith: one Next.js application, one PostgreSQL
database and clearly separated modules. Do not introduce microservices,
Elasticsearch or a separate backend service for the MVP without evidence
that they are required.

------------------------------------------------------------------------

# 4. Phase 0 --- Repository inspection and requirements analysis

**Do not write application code in this phase.**

## Agent actions

1.  Inspect the repository structure, package files, current branch and
    existing implementation.
2.  Identify existing frameworks, dependencies, conventions and
    unfinished work.
3.  Read the full requirements supplied by the project owner.
4.  Compare the requirements with the reference website for user-flow
    inspiration only.
5.  Create a requirements traceability matrix.
6.  Identify unclear requirements, third-party dependencies and risks.
7.  Propose the architecture and data model.
8.  List all pages, routes, user roles and permission boundaries.
9.  Estimate implementation effort by module.
10. Present the plan and wait for approval.

## Questions that must be resolved

Brand Name: Bumayed

- Logo design will be handled by myself.
- Domain: Currently working locally; domain and deployment will be finalized later.
- SMS and OTP integration: Leave it for now.
- Hosting and database accounts: We will decide later.
- Registration: Users can register using either email or mobile number. Both are not mandatory.
- Listing limits: No limits for individual users or dealers.
- Images: No fixed image-count limit. Automatically resize and optimize uploaded images to fit the website perfectly while maintaining quality and aspect ratio.
- Social video: Support flexible embedding for Instagram, YouTube and TikTok, with external viewing links as a fallback if embedding is unavailable.

For all remaining questions, proceed with sensible defaults and keep the implementation flexible. We can finalize those decisions later.

- Dealer verification documents and
approval process. - Featured/Premium/Urgent prices and durations. -
Dealer package prices, quotas and validity. - Tax/VAT display and
invoice requirements. - Arabic translations and who approves them. -
Privacy, terms, moderation and prohibited-listing policies. - Whether
location selection requires emirate, city and area. - Whether the client
supplies the UAE make/model/trim data.

Do not invent commercial rules or legal wording. Use clearly marked
draft content until the client approves it.

## Phase 0 deliverables

-   `ARCHITECTURE.md`
-   `DATABASE_SCHEMA.md`
-   `ROUTES_AND_PAGES.md`
-   `TASKS.md`
-   `DEVELOPMENT_STATUS.md`
-   Requirements questions and risk register

**Approval gate:** Stop and obtain written approval of architecture,
scope assumptions, route list and database design.

------------------------------------------------------------------------

# 5. Phase 1 --- Project foundation and design system

Start only after Phase 0 approval.

## 5.1 Initialize and configure

1.  Initialize or safely adapt the Next.js application.
2.  Configure TypeScript strict mode.
3.  Configure Tailwind and shadcn/ui.
4.  Configure ESLint and formatting.
5.  Add environment variable validation.
6.  Add a health-check endpoint.
7.  Configure localization routing.
8.  Configure English and Arabic locale dictionaries.
9.  Implement locale-aware layout and RTL direction.
10. Add global error and not-found pages.
11. Add a consistent application shell.

## 5.2 Design system

Before building full pages, define:

-   Primary, secondary, accent and neutral colors
-   Typography for Latin and Arabic
-   Heading and body scales
-   Spacing scale
-   Border and radius rules
-   Elevation/shadow rules
-   Breakpoints
-   Button variants and states
-   Input, select and dropdown styles
-   Cards, badges, tables and dialogs
-   Toasts, alerts and confirmation dialogs
-   Skeleton, loading, empty and error states

Use a premium automotive direction: clean, confident, high-quality
vehicle photography, clear search and strong readability. Do not copy
Dubizzle branding or proprietary assets.

Use a suitable Arabic font such as Noto Sans Arabic alongside a Latin
font such as Inter, subject to visual review.

## 5.3 Shared components

Build reusable components for: - Site header and footer - Main
navigation - Language switcher - Search bar - Category shortcuts -
Listing card - Price display - Vehicle specification rows - Filter
controls - Pagination - Image gallery - Seller contact panel - Form
fields - Dashboard sidebar - Admin navigation - Data tables - Status
badges - Confirmation dialogs

## Phase 1 acceptance criteria

-   App runs locally using documented commands.
-   No TypeScript or lint errors.
-   English and Arabic routes work.
-   RTL layout changes correctly, including navigation, forms, icons and
    alignment.
-   Shared components have consistent styling.
-   Desktop, tablet and mobile layouts are usable.
-   No secrets are committed.

**Approval gate:** Show the owner the design system and key responsive
layouts before implementing the full product UI.

------------------------------------------------------------------------

# 6. Phase 2 --- Public marketplace UI

Implement the public experience. If backend APIs are not ready, use
isolated mock fixtures only for this visual phase.

## 6.1 Homepage

Include: - Header with logo, navigation, language switcher and account
actions - Post an Ad call to action - Hero/search section - Cars,
Motorcycles and Boats shortcuts - Emirate selector - Featured ads -
Latest ads - Popular makes - Dealer promotion section - Banners - How it
works - Footer with About, FAQ, Terms, Privacy and contact links

## 6.2 Category/search results pages

Create separate routes for: - Cars - Motorcycles - Boats

Each page needs: - Category title and helpful description - Search
input - Relevant category filters - Result count - Sort selector -
Listing cards - Pagination - No-results state - Loading and error states

Desktop: filters can appear in a sidebar.\
Mobile: filters should open in a usable drawer or sheet.

Filters must eventually be represented in URL query parameters so
results can be bookmarked and shared.

## 6.3 Listing details page

Include: - Image gallery - Title and AED price - Vehicle
specifications - Description - Location - Seller profile and
verification status - Dealer details when applicable - Call button -
WhatsApp button - Share action - Report action - Social video section -
Similar listings

Do not show private seller information that the seller has not chosen to
publish.

## 6.4 Static content pages

Create editable page layouts for: - About - FAQ - Terms and Conditions -
Privacy Policy - Contact

Content must be client-approved before launch.

## Phase 2 acceptance criteria

-   All public routes render correctly.
-   Navigation and links work.
-   Listing cards navigate to detail pages.
-   Search/filter UI is usable at mobile and desktop widths.
-   Arabic layouts are genuinely RTL.
-   No broken images or console errors.
-   Mock data is clearly isolated and documented.

**Approval gate:** Owner approves public website UI before backend
integration.

------------------------------------------------------------------------

# 7. Phase 3 --- Database and backend

Implement real persistence and business logic.

## 7.1 Database modeling

Design normalized tables/models for the following concepts:

-   User
-   UserProfile
-   DealerProfile
-   Role or permission mapping
-   Listing
-   ListingImage
-   ListingVideo
-   Category
-   VehicleMake
-   VehicleModel
-   VehicleTrim
-   Category-specific vehicle attributes
-   Emirate
-   City
-   Area
-   Favorite
-   Notification
-   Report
-   Package
-   Subscription or dealer package entitlement
-   FeaturedPromotion
-   Payment
-   Transaction
-   Banner
-   ContentPage
-   AdminActivityLog

Use explicit relations, constraints, timestamps and indexes. Do not
create one giant unstructured JSON field for all vehicle data. A JSON
field may be used selectively for genuinely flexible attributes, with
validation and documented structure.

## 7.2 Listing lifecycle

Define and enforce valid states, for example: - Draft - Pending
moderation - Approved/Active - Rejected - Paused - Sold - Expired -
Removed

Document allowed state transitions. Prevent users from changing
moderation-controlled states directly.

## 7.3 Search and filters

Support: - Category - Keyword - Make and model - Emirate, city and
area - Price range - Listing date - Seller type - Year - Mileage where
relevant - Category-specific specifications - Sorting by newest, price,
mileage and year

Implement server-side filtering, pagination, input validation and
database indexes. Do not fetch all listings and filter them in the
browser.

Use stable sorting and pagination. Consider query performance with
realistic seed data.

## 7.4 API design

Document every endpoint: - Method and route - Authentication
requirement - Role/permission requirement - Request schema - Response
schema - Error codes - Rate limits

Keep business rules in service functions, not duplicated across UI
components and API handlers.

## 7.5 Seed data

Create seed scripts for: - Seven UAE emirates - Approved city/area data
where supplied - Vehicle categories - Makes and models - Relevant
category field options - Development-only sample users and listings

Clearly mark sample accounts and never use development passwords in
production.

## Phase 3 acceptance criteria

-   Migrations run from a clean database.
-   Seed scripts are repeatable and safe.
-   CRUD operations persist correctly.
-   Search, filters, sorting and pagination work server-side.
-   Invalid data is rejected.
-   Unauthorized requests are denied.
-   Important database queries have suitable indexes.
-   Automated tests cover core services.

**Approval gate:** Review schema, API specification and core listing
workflows.

------------------------------------------------------------------------

# 8. Phase 4 --- Authentication and account types

## Required flows

-   Individual registration
-   Dealer registration
-   Login
-   Logout
-   Email verification
-   Mobile OTP verification
-   Password recovery
-   Password reset
-   Session expiration and revocation

## Security requirements

-   Hash passwords using a modern password hashing algorithm.
-   Never store OTP values in plaintext where avoidable; store a secure
    hash and expiry.
-   OTPs must expire and have attempt and resend limits.
-   Rate-limit login, registration, OTP and password reset.
-   Avoid revealing whether an email or phone number exists.
-   Validate sessions server-side.
-   Enforce permissions on every protected API and server action.
-   Do not trust role values sent by the browser.

## Individual profile

-   Name
-   Profile photo
-   Contact details
-   Verification status
-   Account settings

## Dealer profile

-   Business name
-   Logo
-   Business contact details
-   Location
-   Business description
-   Verification documents/status
-   Dealer inventory

Dealer verification must have a defined admin workflow. Do not display a
verified badge merely because a user selected dealer account type.

## Phase 4 acceptance criteria

Test registration, verification, login, logout, recovery, expired OTP,
repeated OTP attempts, suspended accounts and role boundaries.

**Approval gate:** Owner approves authentication and account workflows.

------------------------------------------------------------------------

# 9. Phase 5 --- Listing creation and seller dashboards

## 9.1 Create listing wizard

Build a guided multi-step form:

1.  Select Cars, Motorcycles or Boats.
2.  Enter category-specific specifications.
3.  Enter title and description.
4.  Enter price and location.
5.  Upload photos.
6.  Add one supported social video URL.
7.  Preview.
8.  Submit for moderation.

Support: - Field-level validation - Draft saving - Back/next
navigation - Upload progress - Image preview - Image reorder - Image
removal - Configurable image limits - Clear submission result

## 9.2 Vehicle fields

### Cars

-   Make
-   Model
-   Trim
-   Year
-   Mileage
-   Regional specification: GCC, American, European, Japanese
-   Body type
-   Transmission
-   Fuel type
-   Colour
-   Condition
-   Warranty

### Motorcycles

-   Make
-   Model
-   Year
-   Mileage
-   Engine capacity (cc)
-   Motorcycle type
-   Condition

### Boats

-   Boat type
-   Make
-   Length
-   Year
-   Engine hours
-   Engine type
-   Condition

Make category fields configurable through the admin panel where
practical.

## 9.3 Image storage

-   Upload directly to approved object storage using short-lived signed
    upload URLs where appropriate.
-   Validate MIME type, extension, file size and image dimensions.
-   Do not trust browser-provided content type alone.
-   Generate optimized thumbnails.
-   Store object keys and metadata, not large image binaries in
    PostgreSQL.
-   Prevent arbitrary file uploads.
-   Define deletion and orphan cleanup behavior.

## 9.4 Social video URLs

Allow one Instagram, YouTube or TikTok URL per listing. Validate host
and URL format. Use provider-supported embeds only where allowed. If the
provider blocks embedding, show a safe external "Watch on" link. Do not
download, proxy or host third-party videos.

## 9.5 Seller dashboard

Provide: - Overview - My listings - Active - Pending - Rejected -
Expired - Favorites - Notifications - Profile settings - Payment history

Actions: - Edit - Delete - Pause - Reactivate - Renew - Mark as sold -
View status and expiry

Enforce ownership on the server. A user must never edit another user's
listing by changing an ID in the URL.

## Phase 5 acceptance criteria

Complete end-to-end tests for creating a listing, uploading images,
moderation submission, editing, pausing, renewing and marking sold.

**Approval gate:** Owner approves the seller journey.

------------------------------------------------------------------------

# 10. Phase 6 --- Dealer dashboard and admin panel

## 10.1 Dealer dashboard

Include: - Business profile - Verification status - Inventory - Listing
status - Package details - Featured slot usage - Renewal information -
Payment history - Basic listing statistics

Enforce package quotas on the server, not just in the UI.

## 10.2 Admin dashboard

Display useful counts: - Users - Dealers - Listings - Active listings -
Pending approvals - Reports - Expired listings - Payment/revenue
summaries

## 10.3 Admin modules

Users: - Search and view - Verify - Edit - Suspend - Block - Manage
dealer accounts

Listings: - Review - Approve - Reject with reason - Edit where
authorized - Remove - Feature - Review reports and expired listings

Catalog: - Categories - Makes - Models - Trims - Category fields and
options

Locations: - Emirates - Cities - Areas

Commercial: - Promotion prices - Dealer packages - Package quotas and
validity - Transactions

Content: - Homepage banners - About - FAQ - Terms - Privacy

Admin users: - Super Admin - Moderator - Role-based permissions

## 10.4 Audit log

Record sensitive actions: - Actor - Action - Target record - Timestamp -
Relevant before/after metadata where appropriate

Do not store passwords, OTPs, payment secrets or unnecessary personal
data in audit logs.

## 10.5 Permission rules

-   Super Admin has full authorized control.
-   Moderator can perform only assigned moderation tasks.
-   Moderators must not manage super-admin accounts, payment credentials
    or critical system settings unless explicitly granted.
-   All admin APIs must verify permissions server-side.

## Phase 6 acceptance criteria

Test every admin permission with both authorized and unauthorized
accounts. Confirm moderation changes are reflected on the public
marketplace.

**Approval gate:** Owner approves admin and dealer workflows.

------------------------------------------------------------------------

# 11. Phase 7 --- Promotions, packages and payments

## Promotion types

-   Featured
-   Premium
-   Urgent

## Dealer packages

Support configurable: - Package name - Price - Validity - Monthly
listing quota - Featured slots - Active/inactive status

Do not hardcode prices or quotas.

## Payment lifecycle

Implement: - Payment initiation - Pending state - Provider redirect or
checkout flow - Verified callback/webhook - Success/failure handling -
Idempotency - Transaction history - Refund handling if supported and
approved

Critical rule: Never activate a paid promotion or package based solely
on a browser redirect or client-side success message. Verify the
provider's signed webhook or server-side transaction status.

Store provider references and transaction metadata safely. Never store
card details.

## Payment provider checklist

Before integration, obtain: - Client's selected provider - Merchant
account approval - Sandbox credentials - API documentation - Webhook
configuration - Production credentials - Refund/cancellation rules -
Currency and settlement confirmation

## Phase 7 acceptance criteria

Test successful, failed, cancelled, duplicated and delayed payment
events. Confirm that repeated webhooks cannot grant duplicate
entitlements.

**Approval gate:** Client approves sandbox payment flow before
production credentials are used.

------------------------------------------------------------------------

# 12. Phase 8 --- Notifications, content and moderation

## Notifications

Required events: - Listing submitted - Listing approved - Listing
rejected - Listing expiry approaching - Listing expired -
Promotion/payment result - Dealer package expiry

Support email and in-app notifications. SMS notifications are optional
unless separately approved.

Create notification preferences and avoid sending duplicate
notifications on retried events.

## Moderation

-   Report listing workflow
-   Report reason
-   Admin review
-   Resolution status
-   Rejection reason
-   User notification
-   Audit record

Create configurable moderation rules and prohibited-listing policy. The
client must approve the actual policy.

## Content management

Admins should be able to manage: - Homepage banners - About - FAQ -
Terms - Privacy

Validate banner image dimensions and links. Sanitize any rich text
content before rendering.

------------------------------------------------------------------------

# 13. Phase 9 --- SEO, accessibility and performance

## SEO

-   Unique page titles and descriptions
-   Canonical URLs
-   Open Graph metadata
-   XML sitemap
-   robots.txt
-   Structured data where valid
-   Indexable category and listing pages
-   Correct language alternates for English and Arabic
-   Clean URLs and meaningful slugs

Do not expose private or draft listings to search engines.

## Accessibility

-   Semantic HTML
-   Keyboard navigation
-   Visible focus states
-   Labels for form fields
-   Appropriate contrast
-   Accessible dialogs and menus
-   Alt text for meaningful images
-   Screen-reader-friendly status messages

## Performance

-   Optimize images
-   Lazy-load below-the-fold media
-   Paginate results
-   Avoid unnecessary client-side JavaScript
-   Add database indexes
-   Cache only data that can safely be cached
-   Revalidate changed listing pages
-   Avoid N+1 database queries

Measure performance instead of claiming the site is fast without
evidence.

------------------------------------------------------------------------

# 14. Phase 10 --- Comprehensive QA

Create a test matrix and execute it.

## Functional tests

-   Homepage navigation
-   Category navigation
-   Search by keyword
-   Every category filter
-   Sorting
-   Pagination
-   Listing details
-   Call link
-   WhatsApp link
-   Favorites
-   Share
-   Report
-   Registration and login
-   OTP expiry and resend
-   Password reset
-   Listing creation
-   Image uploads
-   Listing moderation
-   Edit/pause/renew/sold
-   Dealer package quota
-   Promotion purchase
-   Payment webhook
-   Notifications
-   Admin permissions
-   Content updates

## Localization tests

Test: - English LTR - Arabic RTL - Mixed Arabic/English vehicle names -
AED formatting - Arabic and English numerals as selected by product
requirements - Dates and time zones - Phone number display - Form
validation messages - Mobile navigation and drawers

## Security tests

-   Unauthorized access to another user's listing
-   Privilege escalation
-   Invalid role changes
-   Brute-force login/OTP attempts
-   Malformed inputs
-   Upload of unsupported files
-   Oversized files
-   Forged payment callback
-   Duplicate webhook
-   Admin route access by ordinary users
-   Sensitive data leakage

## Responsive tests

At minimum test: - Small mobile width - Common mobile width - Tablet -
Desktop - Wide desktop

## Release blockers

Do not launch if any of these remain: - Critical security issue -
Payment verification bypass - Unauthorized admin access - Data loss or
broken listing ownership - Broken Arabic RTL navigation - Listing
creation cannot complete - Core search is unusable - Production secrets
exposed - Critical console/server errors

------------------------------------------------------------------------

# 15. Phase 11 --- Deployment and handover

## Pre-deployment

1.  Confirm production environment variables.
2.  Provision managed PostgreSQL.
3.  Configure object storage and access policies.
4.  Configure domain and DNS.
5.  Configure email provider.
6.  Configure SMS provider.
7.  Configure payment production credentials.
8.  Configure webhooks.
9.  Run database migrations.
10. Run seed scripts only for approved reference data.
11. Create initial super-admin securely.
12. Configure monitoring and backups.
13. Test production smoke flows.
14. Confirm legal pages and client approvals.

## Handover package

Provide: - Source code repository - Setup guide - Environment variable
guide - Database schema and migration instructions - Deployment
instructions - Admin guide - Dealer/user guide - API documentation -
Test report - Known limitations - Third-party service list - Backup and
recovery notes

Never put live credentials in the handover document or repository.
Transfer them securely.

------------------------------------------------------------------------

# 16. Daily agent operating procedure

At the start of each work session:

1.  Read `DEVELOPMENT_STATUS.md`.
2.  Read the current task in `TASKS.md`.
3.  Inspect the relevant files before editing.
4.  Confirm the current phase and approval status.
5.  Work only on the approved task.
6.  Run relevant tests after changes.
7.  Review the diff for unrelated modifications.
8.  Update documentation and status.
9.  Report blockers and decisions needed.

At the end of each session, report:

**Completed** - Exact functionality implemented.

**Files changed** - List paths and purpose.

**Validation** - Commands and tests run. - Pass/fail results.

**Remaining** - Unfinished work.

**Risks/blockers** - Credentials, client decisions or technical issues.

**Next step** - The next smallest approved task.

Do not mark a task complete if it has not been tested.

------------------------------------------------------------------------

# 17. Initial prompt to give the coding agent

Paste this after adding this playbook and the full client requirements
to the agent's project context:

> Read the complete `UAE_Motors_Marketplace_Agent_Playbook.md` and the
> supplied project requirements. Treat the playbook as the execution
> contract.
>
> Begin with Phase 0 only. Inspect the existing repository, analyze
> requirements, identify ambiguities, and prepare the architecture,
> database proposal, routes, permission matrix, risk register and phased
> task plan.
>
> Do not implement application code yet. Do not skip approval gates. Do
> not assume missing commercial decisions. Present the Phase 0
> deliverables and ask me to approve or revise them before proceeding.

------------------------------------------------------------------------

# 18. Definition of done

A feature is complete only when:

-   Its approved requirements are implemented.
-   Its UI works at required screen sizes.
-   English and Arabic behavior is correct where applicable.
-   Backend authorization is enforced.
-   Data persists correctly.
-   Loading, empty and error states are handled.
-   Validation is implemented.
-   Relevant automated tests pass.
-   No critical console or server errors remain.
-   Documentation is updated.
-   The project owner has reviewed it where an approval gate applies.

**The objective is a dependable, maintainable UAE motors
marketplace---not merely a polished prototype.**
