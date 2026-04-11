// All errors from the API layer are normalized to plain Error objects by
// http.client.ts interceptor. This utility extracts the message string.
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred';
  }
  return 'An unknown error occurred';
};
