# MCG Consultoria

## Overview

MCG Consultoria is a B2B SaaS platform for logistics consulting in Brazil. It provides commercial management tools for logistics companies including CRM, freight and storage calculators, operational checklists across 15 departments, financial management, and marketing materials. The application is built with a React frontend and Express backend, targeting Portuguese-speaking logistics professionals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)
- **Theming**: CSS variables with light/dark mode support via ThemeProvider

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom session-based auth with bcrypt password hashing and secure HTTP-only cookies
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **API Pattern**: RESTful JSON APIs under /api prefix

### Key Design Patterns
- **Monorepo Structure**: Client (client/), Server (server/), Shared types (shared/)
- **Schema Sharing**: Drizzle schemas in shared/schema.ts used by both frontend validation (drizzle-zod) and backend database operations
- **Query Pattern**: TanStack Query with custom queryFn that handles 401 responses gracefully
- **Layout System**: AppLayout component wraps authenticated pages with sidebar navigation

### Authentication Flow
- Custom email/password authentication (not Replit Auth)
- Single active session per user enforced via activeSessionToken field
- Session token stored in HTTP-only cookie named "mcg_session"
- 7-day session expiration

### Page Structure
- **Public Pages**: Landing, Login, Register, Pricing, Privacy, Terms, Calculators (Freight/Storage)
- **Authenticated Pages**: Dashboard, Clients, Pipeline, Calendar, Meeting Records (Ata), Checklist, Tasks, Projects, Financial, Marketing, Settings, Subscription

### New Modules (Phase 2)
- **Meeting Records (Ata Plano de Acao)**: Document meetings with action items, participants, decisions, and next steps. Full CRUD with action item tracking.
  - Selectable meeting objectives (Visita Comercial, Apresentacao Indicadores, Visita Operacional) with custom objective creation
  - Structured participants with name + email fields (JSON format)
  - Auto-create tasks from action items with due dates
  - PDF generation with company logo and full meeting details
  - Send meeting record via email with PDF attachment
- **Calendar (Calendario Comercial)**: Weekly commercial calendar with events linked to clients. Event types include meetings, calls, visits, proposals, and follow-ups.
- **Tasks**: Task management with priorities (low/medium/high/urgent), due dates, assignees, and project assignment. Checkbox toggle for completion.
  - Email reminders sent 1 day before due date (when email configured)
  - Linked to meeting action items with assignedEmail field
- **Projects**: Project management with status tracking (planning/active/on hold/completed), date ranges, and progress calculation based on linked tasks.

### Dashboard Indicators
- **ABC Curve Analysis**: Client classification following Pareto principle (80/20 rule)
- **Clients by State**: Geographic distribution bar chart
- **Clients by Segment**: Market segment distribution pie chart
- **Pipeline Overview**: Real-time funnel statistics

## External Dependencies

### Payment Processing
- **Stripe**: Subscription billing with stripe-replit-sync for webhook management
- Products/prices synced from Stripe with plans: Free, Professional, Enterprise
- Customer portal integration for subscription management

### Database
- **PostgreSQL**: Primary data store (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries with schema migrations via drizzle-kit

### UI Components
- **Radix UI**: Headless accessible components (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix
- **Lucide React**: Icon library

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- Stripe credentials are fetched dynamically via Replit Connectors API

### Brazilian Localization
- ICMS tax rates for all 27 Brazilian states
- Portuguese language throughout UI
- LGPD (Brazilian data protection law) compliance with cookie consent

## Business Context

### Vision
MCG Consultoria is a commercial management platform for logistics, filling the gap between operational ERPs (WMS/TMS) and commercial/sales needs. Created by experienced logistics professionals who understand the pain points between commercial and operational areas.

### Strategic Partnership - Grupo NStech
- **KMM**: ERP for logistics (WMS/TMS) - MCG created the first CRM prototype for KMM
- **QualP**: Route calculation API (distance, tolls, freight tables) - owned by NStech
- **Goal**: Full integration with KMM ecosystem, with potential reseller partnership for QualP API

### Target Market
- Logistics companies (both operators and service providers)
- Industries with logistics operations
- Commercial teams in logistics sector

## Pending Integrations

### QualP API (Grupo NStech)
- **Status**: Pending partnership negotiation
- **Purpose**: Automatic calculation of distance and tolls in freight calculator
- **Environment Variable**: QUALP_ACCESS_TOKEN (to be configured after partnership)
- **Endpoint Ready**: POST /api/route-calculation (code implemented, waiting for API token)
- **Note**: System works fully in manual mode without API configured

### Email Service (Resend)
- **Status**: Fully implemented, pending API key configuration
- **Purpose**: Send meeting records (Ata) as PDF to participants, task reminders 1 day before due date
- **Implementation**:
  - `server/emailService.ts`: Resend wrapper with attachment support
  - `server/reminderService.ts`: Background service for daily task reminders
  - PDF generation with company logo (using PDFKit)
  - Structured participants with name and email fields
  - Tasks have assignedEmail field for reminder delivery
  - Action items auto-create tasks when due date is set
- **Features**:
  - Download meeting record as PDF
  - Send meeting record via email to all participants with PDF attachment
  - Automatic email reminders 1 day before task due date
- **To activate**: Set RESEND_API_KEY secret
- **Note**: System fully functional without email configured; email buttons will show configuration message

### KMM ERP Integration (Grupo NStech)
- **Status**: Pending formal partnership agreement
- **Purpose**: Full integration between MCG (commercial/CRM) and KMM (operational/WMS/TMS)
- **Requirements for integration**:
  1. Official API documentation from NStech (partner access)
  2. Formal partnership contract authorizing integration
  3. Developer credentials and sandbox environment
  4. Data mapping agreement (which fields sync between systems)
- **Potential sync entities**:
  - Clients (MCG) <-> Customers (KMM)
  - Commercial Proposals (MCG) <-> Transport Orders (KMM)
  - Freight Calculations (MCG) <-> Freight Quotes (KMM)
  - Client Operations (MCG) <-> Service Types (KMM)
  - Financial Accounts (MCG) <-> Billing (KMM)
- **Architecture ready**: REST APIs and multi-company structure already support future integration
- **Legal note**: Integration must only proceed after formal authorization from NStech to avoid any legal issues
- **Focus**: Primary integration target, as KMM clients (carriers and logistics operators) are MCG's main audience