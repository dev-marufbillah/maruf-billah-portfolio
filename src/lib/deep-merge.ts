type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Arrays are replaced; nested plain objects are merged. */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (!isPlainObject(override) || !isPlainObject(base)) {
    return override as T;
  }

  const result: PlainObject = { ...(base as PlainObject) };
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value) as unknown;
    } else if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as T;
}
