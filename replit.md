# MCG Consultoria

## Overview
MCG Consultoria is a B2B SaaS platform for logistics consulting in Brazil. It provides commercial management tools including CRM, freight and storage calculators, operational checklists, financial management, and marketing tools. The platform aims to bridge the gap between operational ERPs (WMS/TMS) and the commercial/sales needs of logistics companies. The project targets Portuguese-speaking logistics professionals, with a vision to integrate with leading logistics ERPs like KMM and become a central hub for commercial management in the sector. Key capabilities include a comprehensive 18-section diagnostic checklist, automated meeting record generation, commercial calendar with Google sync, and a detailed RFI module for bids. The platform also features an e-commerce section ("Loja MCG") for corporate gifts, e-books, and manuals, with future plans for a fashion/uniform line ("M. Veste").

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Technologies
-   **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack React Query for server state, Tailwind CSS with shadcn/ui (New York style), Vite.
-   **Backend**: Express.js with TypeScript, PostgreSQL with Drizzle ORM.
-   **Authentication**: Custom session-based authentication with bcrypt and HTTP-only cookies.
-   **Monorepo Structure**: `client/`, `server/`, and `shared/` for shared types.

### Key Features & Modules
-   **CRM**: Client management, sales pipeline, ABC curve analysis, client segmentation (by state, segment).
-   **Calculators**: Freight (with ICMS) and storage calculators.
-   **Checklist**: An 18-section diagnostic tool covering various departments (e.g., Commercial, Operations, Finance) with progress tracking and client profiling.
-   **Meeting Records (Ata Plano de Acao)**: CRUD operations for meetings, action item tracking, PDF generation, and email distribution.
-   **Calendar (Calendario Comercial)**: Weekly commercial calendar with events (meetings, calls, visits) and Google Calendar synchronization.
-   **Tasks & Projects**: Task management with priorities, due dates, assignees; project tracking with status and progress calculation.
-   **RFI (Request for Information)**: Comprehensive company technical profile for bids, supporting complex data structures.
-   **Loja MCG (E-commerce)**: Infrastructure for selling corporate gifts, e-books (CEO-authored trilogy "A Arte do Comercial em Logística"), and manuals, with admin product/category/order management.
-   **Dashboard**: Provides key performance indicators like client ABC curve, geographic distribution, and pipeline overview.
-   **PWA (Progressive Web App)**: Mobile app capabilities for standalone experience, offline fallback, and install prompts.

### Design Patterns & UI/UX
-   **Schema Sharing**: Drizzle schemas are shared between frontend validation and backend database operations.
-   **Query Pattern**: TanStack Query custom query functions handle API responses, including authentication.
-   **Layout**: `AppLayout` provides consistent navigation for authenticated users.
-   **Theming**: Light/dark mode support using CSS variables.
-   **UI Components**: Utilizes Radix UI headless components and shadcn/ui for styled elements, with Lucide React for icons.
-   **Brazilian Localization**: Full Portuguese UI, ICMS tax rates for all states, and LGPD compliance.

## External Dependencies

-   **Payment Processing**: Stripe for subscription billing, integrated with `stripe-replit-sync` for webhooks.
-   **Database**: PostgreSQL as the primary data store, managed with Drizzle ORM.
-   **Email Services**: Google Workspace (Gmail) as the primary provider, with Resend as a fallback. Integrated via Replit OAuth Connectors for seamless authentication.
-   **Google Services**:
    -   **Google Calendar**: For syncing commercial events.
    -   **Google Drive**: For file storage integration.
    -   **Google Sheets**: For exporting data (clients, tasks, events).
-   **WhatsApp Business**: AiSensy for automated customer support journeys (requires API key configuration).
-   **ERP Integration (Pending)**: QualP API (Grupo NStech) for automatic freight calculation (distance, tolls) and KMM ERP (Grupo NStech) for comprehensive operational integration.