// Global test setup — runs before all test files
// Mock the DOM-dependent log module with a no-op stub
import { vi } from 'vitest';

vi.mock('../src/ui/logic/log', () => ({
  default: (_message: string, _type?: string | null): void => {
    // no-op in tests
  },
}));
