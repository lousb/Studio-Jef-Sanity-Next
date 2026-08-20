export const GRID_COLUMNS = 24

const colWidthExpr = `((100vw - 2 * var(--grid-margin-desktop) - (${GRID_COLUMNS} - 1) * var(--grid-gutter-desktop)) / ${GRID_COLUMNS})`

export const colsToWidth = (cols: number) =>
  `calc(${colWidthExpr} * ${cols} + (${cols} - 1) * var(--grid-gutter-desktop))`

export const COLUMN_NUM_MAP: Record<string, number> = {
  '8col': 8,
  '16col': 16,
  '24col': 24,
}

// Mobile grid is 8 columns, not 24 — map each width option straight to its
// mobile column count. 8col -> 4/8 (half), 16col -> 6/8 (three quarters),
// 24col -> 8/8 (full).
export const MOBILE_COLUMN_NUM_MAP: Record<string, number> = {
  '8col': 4,
  '16col': 6,
  '24col': 8,
}

const MOBILE_GRID_COLUMNS = 8

// Built from 100vw, not %, on purpose — mirrors colsToWidth above. A
// %-based width resolves against the element's containing block, which on
// the homepage can be a `w-min` (min-content) <Link>: child-width-from-%
// + parent-width-from-content is circular, and the browser resolves that
// by collapsing the box to 0 (invisible). vw never looks at the parent's
// box, so it can't create that loop.
const mobileColWidthExpr = `((100vw - 2 * var(--grid-margin-mobile) - (${MOBILE_GRID_COLUMNS} - 1) * var(--grid-gutter-mobile)) / ${MOBILE_GRID_COLUMNS})`

export const colsToWidthMobile = (cols: number) =>
  `calc(${mobileColWidthExpr} * ${cols} + (${cols} - 1) * var(--grid-gutter-mobile))`