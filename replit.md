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
- **Authenticated Pages**: Dashboard, Clients, Pipeline, Calendar, Meeting Records (Ata), Checklist, RFI, Tasks, Projects, Financial, Marketing, Settings, Subscription

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
- **Checklist (Enhanced)**: Complete client diagnostic tool with 18 sections following commercial workflow.
  - **Capa/Perfil do Cliente**: Client profile with 5 tabs (Dados, História, Mercado, Contatos, Portais)
    - Client data, CNPJ, Focal Point (internal commercial responsible)
    - Company history, location, segment, products, numbers, news
    - Market share, position, opportunities (BID, Cotação, Projetos, Spot)
    - Pipeline overview (segment, product, volume, target)
    - Client contacts by sector with birthdays
    - Portals and passwords for client systems
  - **18 Sections**: Comercial, Direção, Qualidade, Planejamento, Financeiro, Op. Transporte, Op. Distribuição, Op. Armazenagem, GRISCO, T.I, Compras, Contábil/Fiscal, RH, Jurídico, Cliente em Teste, Boas Vindas, Relacionamento
  - **Responsável com Parecer**: Each section has responsible party with dates, "É Perfil?" decision, and written opinion
  - Progress tracking per section and overall
  - Links to CRM clients for auto-fill
- **RFI (Request for Information)**: Company technical profile for participation in BIDs and logistics bids.
  - Comprehensive company data: Razão Social, CNPJ/CPF, address, contacts
  - Annual revenue by year (faturamento anual)
  - Units/branches with contact details
  - Main suppliers, competitors, and clients
  - Regional coverage (27 Brazilian states)
  - Regional details: deadlines, average values, volumes by region
  - Operational requirements: third-party permissions, vehicle types, XML availability, payment terms
  - Scope of operation: market segments, transportation modes, cargo types, operation types
  - Fleet information: vehicle types, quantities, average age
  - Status tracking: draft, completed, submitted
  - Uses JSONB fields for flexible complex data structures (unidades, fornecedores, frota, etc.)

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

### Google Workspace Integration (Active)
- **Status**: Fully implemented via Replit OAuth Connectors
- **Services Integrated**:
  - **Gmail**: Primary email provider for sending meeting records, reminders
  - **Google Calendar**: Sync commercial events (meetings, visits, calls) with one-click
  - **Google Drive**: File storage integration ready
  - **Google Sheets**: Export clients, tasks, and events to spreadsheets
- **Implementation**:
  - `server/googleServices.ts`: Unified API clients for all Google services
  - `server/emailService.ts`: Gmail as primary provider, Resend as fallback
  - OAuth tokens managed automatically by Replit Connectors
- **Endpoints**:
  - `POST /api/commercial-events/:id/sync-google-calendar`: Sync event to Google Calendar
  - `POST /api/export/google-sheets`: Export data (clients, tasks, events) to Sheets
  - `GET /api/google/status`: Check integration availability
- **UI Features**:
  - Calendar page: "Exportar Sheets" button to export all events
  - Event cards: Google icon to sync individual events to Calendar
- **Usage Limits**:
  - Gmail: 500 emails/day (personal), 2000/day (Workspace)
  - Calendar/Sheets/Drive: Free within normal usage quotas
- **Note**: Integration is OAuth-based and free for normal usage

### Email Service (Resend - Fallback)
- **Status**: Available as fallback if Gmail not configured
- **Purpose**: Send meeting records (Ata) as PDF to participants, task reminders 1 day before due date
- **Priority**: Gmail is preferred when Google integration is available
- **To activate fallback**: Set RESEND_API_KEY secret
- **Note**: System uses Gmail first; falls back to Resend if Gmail unavailable

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