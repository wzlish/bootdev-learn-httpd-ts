export function isValidUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  );
}

export function selectFields<T extends object, K extends keyof T>(
  source: T,
  keys: K[],
): Pick<T, K> {
  const result: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    if (source.hasOwnProperty(key)) {
      result[key] = source[key];
    }
  }
  return result as Pick<T, K>;
}
