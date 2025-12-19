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
- **Authenticated Pages**: Dashboard, Clients, Pipeline, Checklist, Financial, Marketing, Settings, Subscription

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