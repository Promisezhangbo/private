import { OpenApiBlogFn } from '@packages/openapi';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInVzZXJOYW1lIjoidGVzdCIsImN1cnJlbnRUZW5hbnRJZCI6MSwiZXhwIjoxNzc1NDU1NjAyLCJpc3MiOiJTRUxGX0hPU1RFRCIsInN1YiI6IkNvbnNvbGUgQVBJIFBhc3Nwb3J0In0.-JqV9oyE8z-Yn61pb8KSpWEnXrI1l3xGIMXkafjT-PA';

export const api = OpenApiBlogFn({
  BASE: 'http://103.237.29.234:31011',
  token: () => token,
  WITH_CREDENTIALS: true,
  errorHandling: { reporter: () => {}, debounceMs: 200 },
});
