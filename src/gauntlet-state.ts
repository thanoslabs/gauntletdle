export function isGauntletFinished(index: number, selected: readonly string[]): boolean {
  return selected.length > 0 && index >= selected.length;
}
export function nextGauntletIndex(index: number, selected: readonly string[]): number {
  return Math.min(Math.max(0, index + 1), selected.length);
}
