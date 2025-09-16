export function toWebsearchQuery(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((token) => `${token}:*`)
    .join(" & ");
}
