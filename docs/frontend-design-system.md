# Frontend Design System

## 1. Purpose

- Keep the UI consistent across `ui / elements / blocks / layouts`.
- Build chart components that are reusable, domain-agnostic, and theme-consistent.
- Manage design quality with Storybook as the single source of truth.

## 2. Layer Responsibilities

- `ui`: Pure primitives (shadcn-based). No domain language, no API shape, no business formatting.
- `elements`: Semantic display units composed from `ui`. Display-only and reusable across pages.
- `blocks`: Feature-level compositions that receive ViewModel data and orchestrate interactions.
- `layouts`: Page skeletons and structural slots. No feature/business logic.

Allowed dependency flow:

- `ui -> elements -> blocks -> layouts`
- Reverse dependency and cyclic dependency are prohibited.

## 3. Server/Client Separation (RSC-first)

- Default to Server Components.
- Move interactivity (filters, range switch, chart toggles, tooltip-heavy visuals) to Client Components.
- In `blocks`, server code prepares ViewModel and client code handles interaction.
- Heavy charts must be loaded with dynamic import at page/block boundaries.

## 4. Tokens and Visual Rules

### 4.1 Semantic Tokens

Use semantic tokens instead of fixed colors:

- Surface: `background`, `card`, `popover`
- Text: `foreground`, `muted-foreground`
- Status: `chart-positive`, `chart-negative`, `chart-neutral`
- Series: `chart-1` ... `chart-8`

Both light and dark modes must define all semantic tokens.

### 4.2 Typography and Spacing

- Keep numeric readability first for financial data.
- Use consistent tabular-feeling sizing for axis/legend/value labels.
- Keep chart panel spacing and title/description spacing consistent via `ChartFrame`.

### 4.3 States

Each component should explicitly support:

- `default`
- `loading`
- `empty`
- `error`

## 5. Chart Usage Guidelines

### 5.1 Chart Selection

- Line: trend over time.
- Bar: categorical comparison.
- Waterfall: additive/subtractive contribution.
- BoxPlot: distribution summary (min/q1/median/q3/max).
- Pie: simple composition with limited categories.
- Radar: multi-axis profile comparison.
- Treemap: hierarchical composition by area.
- Sunburst: hierarchical composition by depth.
- Sankey: flow between nodes.

### 5.2 Do/Don't

Do:

- Pass display-ready ViewModel data into elements.
- Keep API shapes out of element props.
- Keep consistent number/date/currency formatting via shared formatters.

Don't:

- Put data fetching in elements.
- Put chart-specific tokens inline in each chart component.
- Use ad-hoc color rules per screen.

## 6. Public API Rules

- All charts expose a shared `BaseChartProps` contract.
- Chart-specific props must describe keys and series, not backend field names.
- Sankey uses ID-based links in public API and converts to index-based links internally.
- BoxPlot receives precomputed quartiles only. Statistical computation belongs to server-side ViewModel generation.

## 7. Storybook Rules

- Storybook is the design review source of truth.
- Each chart has at least these stories: `Default`, `Loading`, `Empty`, `Error`.
- Include edge stories: large values, negative values, long labels, sparse data.
- Theme toolbar must support light/dark switching.
- Docs section for each chart includes:
  - suitable use cases
  - anti-patterns
  - readability checks

## 8. Definition of Done

A chart component is complete when:

- It follows layer rules and type contracts.
- It supports `default/loading/empty/error`.
- It has Storybook stories with Controls.
- It works in light and dark modes.
- It passes transformation/unit tests and smoke rendering checks.
