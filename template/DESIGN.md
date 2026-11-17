---
name: Public Procurement Intelligence
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#a078ff'
  on-tertiary-container: '#340080'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  data-metric:
    fontFamily: Inter
    fontSize: 1.875rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system targets government procurement officers, fiscal oversight auditors, public bidding consortia, and enterprise data analysts navigating public procurement platforms (e.g., SECOP, Open Contracting standards). 

The emotional signature is institutional authority, mathematical precision, and clarity under high information density. It fuses Corporate SaaS engineering with executive PowerBI-inspired observability. The aesthetic leverages flat structural planes, high-contrast typography, and purposeful telemetry accents to strip cognitive friction away from million-dollar bidding events, risk scores, and procurement workflow states. Visuals maintain deep, balanced darkness without harsh glare or distracting decoration.

## Colors

The palette establishes a strict functional hierarchy built on low-strain dark surfaces and telemetry-focused accents:

- **Base Canvas (`#0f172a`):** Deep slate canvas serving as the visual anchor.
- **Surface & Containers (`#1e293b`):** Modular card backgrounds, header panels, and table row groupings.
- **Structural Dividers & Borders (`#334155`):** Subdued boundaries that delineate operational zones without dominating visual weight.
- **Electric Blue (`#3b82f6` - Primary):** Navigation highlights, primary interactive controls, active filter pills, and selected contract rows.
- **Emerald Green (`#10b981` - Secondary):** Approved tenders, executed budgets, positive fiscal variance, and completed compliance milestones.
- **Violet (`#8b5cf6` - Tertiary):** Aggregated metrics, advanced predictive vendor analytics, and specialized contract modality tags.
- **Amber Warning (`#f59e0b`):** Pending approvals, audit flags, risk deviations, and deadline thresholds nearing expiration.
- **Foreground Text:** `#f8fafc` for high-priority metrics and headers; `#94a3b8` for secondary labels, metadata, and column headers.

## Typography

Typography relies entirely on Inter to ensure clean numeric tabular alignment, crisp rendering in dark environments, and immediate readability across compact data layouts.

All numerical tables and KPI values must activate tabular figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during real-time updates and sorting. Primary KPI values use `data-metric` with tight negative letter-spacing for punchy visual authority. Section headers use semi-bold cuts to maintain balance over dense interface structures without overpowering data rows.

## Layout & Spacing

The layout is built on a 12-column responsive fluid grid designed to host multi-widget dashboards, split audit screens, and large-format tables:

- **Desktop (≥ 1280px):** 12 columns, `1.5rem` gutters, and `2rem` outer page margins. Supports three-tier KPI strips (3-4 cards across), 8-column data grid paired with a 4-column audit feed, and multi-tier filter ribbons.
- **Tablet (768px - 1279px):** 8 columns, `1rem` gutters, and `1.5rem` outer canvas margins. KPI strips wrap into 2x2 grids; secondary analytical sidebars collapse into toggleable drawer views.
- **Mobile (< 768px):** 4 columns, `0.75rem` gutters, and `1rem` margin. Complex data grids switch to scrollable cards or horizontally pannable views with pinned status/action columns.

Spacing maintains generous outer boundaries (`space-lg`, `space-xl`) around containers to isolate contextual modules, while internal component spacing (`space-xs`, `space-sm`) retains the tactical density demanded by PowerBI-grade operational dashboards.

## Elevation & Depth

Visual hierarchy uses a tonal container model with subtle, crisp outlines instead of heavy atmospheric drops:

- **Base Layer (`#0f172a`):** Underlies the global app shell, canvas background, and navigation rails.
- **Container Surfaces (`#1e293b`):** Houses dashboards, data tables, KPI containers, and filter toolbars.
- **Interactive / Raised Surfaces (`#334155` at 50% opacity or `#243248`):** Applied to hovering states, active table rows, and input backgrounds.
- **Overlays & Modals (`#1e293b` with 1px border `#475569`):** Floats above content with a deep ambient shadow (`box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)`).
- **Outlines:** Every module container possesses a 1px uniform perimeter in `#334155`. This maintains boundary discipline between widgets under low-ambient viewing conditions.

## Shapes

The design system implements a controlled, architectural soft curvature (`roundedness: 1`):

- **Containers, Cards, and Data Tables:** Standardized at `0.375rem` to `0.5rem` (`rounded-lg`), establishing stable structure without softening the technical tone.
- **Inputs, Buttons, and Controls:** `0.25rem` (`rounded-sm`), delivering distinct, click-confident affordances.
- **Badges, Trend Indicators, and Filter Chips:** Fully pill-shaped (`9999px`) to create clear shape differentiation between interactive or status indicators and structural rectangular panels.

## Components

### 1. KPI Cards & Trend Badges
- **Structure:** `#1e293b` background, 1px border `#334155`, padded at `space-lg`.
- **Top Row:** Metric category in `label-sm` (`#94a3b8`) paired with an operational status badge.
- **Center Value:** Displayed via `data-metric` in `#f8fafc`.
- **Trend Footer:** Inline flex row showing delta percentages. Green (`#10b981`) text inside a subtle `rgba(16, 185, 129, 0.12)` background for positive metrics; Amber (`#f59e0b`) or Red (`#ef4444`) for budget overruns and delays.

### 2. Tabular Data Grids (SECOP / Procurement Records)
- **Header:** Uppercase `label-sm`, tracking wide, text `#64748b`, bordered below by `#334155`.
- **Rows:** Alternating rows leverage transparent vs. `rgba(30, 41, 59, 0.6)`. Hover state triggers background `#334155` at 30% opacity.
- **Cell Padding:** Compact vertical padding (`0.625rem`) and standard horizontal padding (`1rem`) to support high data density.
- **Numeric Columns:** Right-aligned, Inter tabular numbers.

### 3. Buttons & Trigger Controls
- **Primary:** Electric Blue (`#3b82f6`) fill, text `#ffffff`, font `label-md`. Hover background `#2563eb`.
- **Secondary / Filter Triggers:** `#1e293b` fill, 1px border `#334155`, text `#f8fafc`. Hover border `#64748b`.
- **Danger / Audit Flag:** Subtle red tint `rgba(239, 68, 68, 0.15)`, text `#ef4444`, border `rgba(239, 68, 68, 0.3)`.

### 4. Input Fields & Data Selectors
- **Input Surfaces:** `#0f172a` background inside `#1e293b` cards. 1px border `#334155`.
- **Active / Focus:** 1px ring and border in `#3b82f6`. Text `#f8fafc`, placeholder `#64748b`.
- **Search Prepend:** Monochromatic glass magnifier icon in `#64748b`.

### 5. Chips & Procurement Modality Badges
- **Style:** Compact height (`1.375rem`), radius `9999px`, font `label-sm`.
- **Direct Award (Contratación Directa):** Violet tone (`rgba(139, 92, 246, 0.15)`, text `#a78bfa`, border `rgba(139, 92, 246, 0.3)`).
- **Public Tender (Licitación Pública):** Blue tone (`rgba(59, 130, 246, 0.15)`, text `#60a5fa`, border `rgba(59, 130, 246, 0.3)`).
- **Executed / Compliant:** Emerald tone (`rgba(16, 185, 129, 0.15)`, text `#34d399`, border `rgba(16, 185, 129, 0.3)`).

### 6. Filter Ribbons & Parameter Bars
- Consolidated bar mounted above grids with modular dropdown triggers for Department/Region, Contracting Agency (Entidad), Modality, Fiscal Year, and Bidding Stage. Active filters feature an electric blue indicator dot and clear-all command.