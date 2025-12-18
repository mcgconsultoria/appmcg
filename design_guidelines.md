# MCG Consultoria - Design Guidelines

## Design Approach
**System-Based Approach** with Material Design principles for the application modules, **Reference-Based Creative Approach** for the landing page (inspired by modern B2B SaaS like Linear, Stripe, and Notion for professional credibility).

## Core Design Principles
1. **Executive Trust**: Professional, clean, and confidence-inspiring for logistics B2B
2. **Data Clarity**: Information-dense interfaces with clear visual hierarchy
3. **Efficient Navigation**: Multi-module system requires intuitive wayfinding
4. **Brazilian Context**: Localized patterns and Portuguese-first design

---

## Typography

**Font Families**: 
- Primary: Inter (headings, UI elements)
- Secondary: IBM Plex Sans (body text, data tables)

**Scale**:
- Page Titles: text-3xl font-bold (30px)
- Section Headers: text-2xl font-semibold (24px)
- Card Titles: text-lg font-semibold (18px)
- Body: text-base (16px)
- Captions/Labels: text-sm (14px)
- Data Tables: text-sm font-mono for numbers

**Hierarchy**: Use font-weight variations (400, 500, 600, 700) to create clear content layers without size changes.

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 (cards), p-4 (smaller elements)
- Section spacing: mb-8, gap-6 for grids
- Page margins: px-6 md:px-8 lg:px-12

**Grid System**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Data tables: Full-width with horizontal scroll on mobile
- Forms: Single column mobile, 2-column desktop (md:grid-cols-2)
- Checklist tabs: Vertical sidebar + content area split

**Container**: max-w-7xl mx-auto for application content, max-w-screen-xl for landing page

---

## Component Library

### Navigation
**Sidebar** (Application):
- Fixed left sidebar, collapsible on mobile
- Width: w-64 expanded, w-16 collapsed
- Logo at top, navigation items with icons + labels
- Active state: Bold text + subtle background highlight
- Collapse button: Bottom of sidebar

**Top Bar** (Application):
- Fixed header with breadcrumb navigation
- User profile dropdown (right)
- Notification bell icon
- Height: h-16

**Landing Navigation**:
- Transparent header over hero, solid on scroll
- Centered logo, right-aligned CTA buttons
- Sticky positioning

### Cards & Containers
**Dashboard Stats Cards**:
- White background (bg-white)
- Subtle border: border border-gray-200
- Rounded: rounded-lg
- Shadow: shadow-sm hover:shadow-md transition
- Icon in colored circle (gradient background)
- Large number display, label below, trend indicator

**Content Cards**:
- Consistent padding: p-6
- Header with title + action button
- Divider: border-b below header
- Content area with appropriate spacing

### Forms
**Input Fields**:
- Height: h-10 for text inputs
- Border: border border-gray-300 focus:border-blue-500
- Label above field: text-sm font-medium mb-2
- Helper text: text-xs text-gray-500 mt-1
- Required indicator: Red asterisk

**Calculators** (Frete/Armazenagem):
- Multi-step form layout with clear sections
- Real-time calculation results in highlighted card
- Input groups with currency/unit indicators
- Dropdown for state selection (ICMS table)

**Checklist System**:
- Vertical tab navigation (15 departments)
- Tab content with checkbox groups
- Progress indicator showing completion %
- Save/Export actions at bottom

### Data Display
**Tables**:
- Striped rows: even:bg-gray-50
- Sticky header on scroll
- Action column with icon buttons (Edit, Delete)
- Hover state: hover:bg-gray-100
- Responsive: Card layout on mobile

**Pipeline Kanban**:
- Horizontal columns with drag-drop
- Column headers with count badges
- Cards with client name, value, status
- Add button at column bottom

### Buttons
**Primary**: Gradient blue-teal (from-blue-600 to-teal-500), white text, px-6 py-2.5, rounded-md
**Secondary**: Border outline, blue text, hover:bg-gray-50
**Ghost**: Text only, hover:bg-gray-100
**Icon Buttons**: Square (w-10 h-10), centered icon, subtle hover

---

## Landing Page Specific

**Hero Section**:
- Height: min-h-screen with centered content
- Large hero image: Professional logistics imagery (warehouse, trucks, team collaboration)
- Image treatment: Subtle gradient overlay for text readability
- CTA buttons on blurred background cards (backdrop-blur-sm)
- Headline: text-5xl md:text-6xl font-bold
- Subheadline: text-xl text-gray-600 max-w-2xl

**Services Section** (Two Services):
- 2-column grid (lg:grid-cols-2 gap-12)
- Each service card with icon, title, description, feature list
- CTA button per service
- Background: Alternating white/light gray sections

**Features Showcase**:
- 3-column grid for feature highlights
- Icon + title + description format
- Use Lucide icons: BarChart3, Users, Truck, Target, Shield, Zap

**Social Proof**:
- Logo cloud of client companies (if available)
- Testimonial cards with quote, name, company
- Stats banner: "X empresas", "Y usuários", "Z economia gerada"

**Footer**:
- Dark background (bg-gray-900)
- 4-column layout: About, Services, Support, Contact
- Social media icons
- Copyright + legal links

---

## Images

### Landing Page:
1. **Hero Image**: Full-width background image showing modern warehouse operations or logistics team in action. Professional photography style, slight blur/overlay for text contrast.
2. **Service Icons**: Custom illustrations for "Diagnóstico" (checklist icon) and "Estruturação de Vendas" (growth chart icon)
3. **Feature Screenshots**: Dashboard mockups showing system in action

### Application:
- Avatar placeholders for user profiles
- Empty states with illustrations (no clients yet, no data)
- Icon sets via Lucide React (no custom image assets needed)

---

## Accessibility
- Minimum touch target: 44px
- Color contrast ratio: 4.5:1 minimum
- Focus states: 2px blue ring (focus:ring-2 focus:ring-blue-500)
- Keyboard navigation: All interactive elements accessible
- Form labels: Always visible, properly associated
- ARIA labels for icon-only buttons

---

## Animations
Use sparingly:
- Page transitions: Fade in (opacity-0 to opacity-100)
- Button hover: Scale slightly (hover:scale-105)
- Card hover: Shadow elevation
- Loading states: Skeleton screens, not spinners
- No auto-playing animations

---

## Responsive Behavior
- Mobile: Single column, collapsible sidebar → bottom nav, stacked cards
- Tablet: 2-column grids, persistent sidebar
- Desktop: 3-4 column grids, full feature set visible
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)