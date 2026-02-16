/**
 * Safe validation helper that never throws.
 * Returns { success, data, error } for use in server actions.
 */
export function validateInput(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("[Validation]", result.error.flatten());
    return { success: false, error: result.error.flatten() };
  }
  return { success: true, data: result.data };
}
