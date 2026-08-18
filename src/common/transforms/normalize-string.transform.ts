export function normalizeEmailTransform(input: { value: unknown }): unknown {
  return typeof input.value === 'string'
    ? input.value.trim().toLowerCase()
    : input.value;
}

export function trimStringTransform(input: { value: unknown }): unknown {
  return typeof input.value === 'string' ? input.value.trim() : input.value;
}
