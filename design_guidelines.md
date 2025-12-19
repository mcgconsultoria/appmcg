# MCG Consultoria - Design Guidelines

## Brand Identity
Based on the MCG logo - minimalist black and white with technology blue accent.

**Core Values:**
- **Profissionalism**: Sophisticated black
- **Clarity**: Clean white and lines
- **Innovation**: Technology blue
- **Trust**: Solid, minimalist design

---

## Color Palette

### Primary Colors (from Logo)
| Name | HEX | HSL | Usage |
|------|-----|-----|-------|
| MCG Black | #0A0A0A | 0 0% 4% | Sidebar, dark backgrounds, main text |
| MCG White | #FAFAFA | 0 0% 98% | Light backgrounds, text on dark |
| MCG Blue | #0EA5E9 | 200 85% 45% | CTAs, buttons, links, highlights |

### Secondary Colors
| Name | HEX | HSL | Usage |
|------|-----|-----|-------|
| Dark Gray | #1A1A1A | 0 0% 10% | Secondary text (light mode) |
| Medium Gray | #737373 | 0 0% 45% | Tertiary text, placeholders |
| Light Gray | #E5E5E5 | 0 0% 90% | Borders, dividers, subtle backgrounds |

### Semantic Colors
| Name | HEX | Usage |
|------|-----|-------|
| Success | #22C55E | Confirmations, positive status |
| Warning | #EAB308 | Alerts, attention |
| Error | #EF4444 | Errors, destructive actions |

---

## Typography

**Font Families**: 
- Primary: Inter (headings, UI elements, navigation)
- Secondary: IBM Plex Sans (body text, long paragraphs)
- Mono: JetBrains Mono (numbers, data tables, technical info)

**Scale**:
- Page Titles (H1): 36px / 2.25rem, Bold (700)
- Section Headers (H2): 30px / 1.875rem, SemiBold (600)
- Subtitles (H3): 24px / 1.5rem, SemiBold (600)
- Card Titles (H4): 20px / 1.25rem, Medium (500)
- Body: 16px / 1rem, Regular (400)
- Small Text: 14px / 0.875rem, Regular (400)
- Captions/Labels: 12px / 0.75rem, Medium (500)

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

**Container**: max-w-7xl mx-auto for application content

---

## Component Library

### Sidebar (Application)
- Background: MCG Black (#0A0A0A)
- Text: White/Light gray
- Active state: MCG Blue highlight or subtle white background
- Width: 16rem expanded, 4rem collapsed

### Cards & Containers
- Background: White (light mode) / Dark gray (dark mode)
- Border: Subtle gray border
- Rounded: rounded-lg (8px)
- Padding: p-6 consistent

### Buttons
**Primary**: MCG Blue background, white text
**Secondary**: Gray background, dark text
**Ghost**: Transparent, text only
**Outline**: Border only, transparent background
**Icon Buttons**: size="icon", square format

### Forms
- Input height: h-10
- Border: Light gray, focus: MCG Blue
- Labels: 14px, Medium weight
- Required: Red asterisk

---

## Iconography

**Library**: Lucide Icons (https://lucide.dev)
- Style: Outline, stroke 1.5-2px
- Sizes: 16px, 20px, 24px
- Color: Inherit from parent text

**Module Icons**:
- Dashboard: LayoutDashboard
- Clients: Users
- Pipeline: TrendingUp
- Calendar: Calendar
- Meeting Records: FileText
- Checklist: ClipboardCheck
- RFI: FileQuestion
- Tasks: CheckSquare
- Projects: FolderKanban
- Financial: DollarSign
- Marketing: Megaphone
- Settings: Settings

---

## Dark Mode

### Light Mode
- Background: #FAFAFA (almost white)
- Cards: #FFFFFF (pure white)
- Sidebar: #0A0A0A (MCG Black)
- Text: #1A1A1A (dark gray)

### Dark Mode
- Background: #0A0A0A (MCG Black)
- Cards: #141414 (dark gray)
- Sidebar: #0F0F0F (darker black)
- Text: #F5F5F5 (almost white)

---

## Landing Page

**Hero Section**:
- Dark wash gradient over images for text readability
- Light text always (white/light gray)
- CTA buttons: MCG Blue primary, outline secondary

**Sections**:
- Alternating backgrounds (white / subtle gray)
- Consistent padding: py-20 or py-24

**Footer**:
- Background: MCG Black
- Text: White/Light gray
- Links: MCG Blue on hover

---

## Accessibility

- Minimum touch target: 44px
- Color contrast ratio: 4.5:1 minimum
- Focus states: 2px MCG Blue ring
- Keyboard navigation: All interactive elements
- ARIA labels for icon-only buttons

---

## Animations

Use sparingly:
- Page transitions: Fade in
- Button hover: Subtle elevation
- Card hover: Shadow elevation
- Loading: Skeleton screens
- No auto-playing animations

---

## Logo Usage

**Primary**: Black background with white elements
**Inverted**: White background with black elements
**Minimum size**: 80px width (digital), 20mm (print)
**Protection zone**: 1x height of "m" around logo

**Do NOT**:
- Distort proportions
- Change colors
- Add shadows/effects
- Rotate
- Place on busy backgrounds
