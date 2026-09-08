// Logical coordinates are independent of viewport size and animation.
const firstQuarter = [[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8]];
export const COLORS = ['blue', 'yellow', 'red', 'green'];
export function rotate([row, column], turns) {
  for (let i = 0; i < turns; i += 1) [row, column] = [column, 14 - row];
  return [row, column];
}
export const TRACK = COLORS.flatMap((_, quarter) => firstQuarter.map(cell => rotate(cell, quarter)));
export const COMMON_STEPS = TRACK.length - 1;
export const ROUTES = Object.fromEntries(COLORS.map((color, quarter) => [color, [
  ...Array.from({ length: COMMON_STEPS }, (_, step) => TRACK[(quarter * firstQuarter.length + step) % TRACK.length]),
  ...Array.from({ length: 6 }, (_, step) => rotate([7, step + 1], quarter)),
  [7, 7],
]]));
export const FINISH = ROUTES.blue.length - 1;
export function positionFor(color, progress) {
  return ROUTES[color]?.[progress] ?? null;
}
