export const GRID_COLUMNS = 24

const colWidthExpr = `((100vw - 2 * var(--grid-margin-desktop) - (${GRID_COLUMNS} - 1) * var(--grid-gutter-desktop)) / ${GRID_COLUMNS})`

export const colsToWidth = (cols: number) =>
  `calc(${colWidthExpr} * ${cols} + (${cols} - 1) * var(--grid-gutter-desktop))`

export const COLUMN_NUM_MAP: Record<string, number> = {
  '8col': 8,
  '16col': 16,
  '24col': 24,
}