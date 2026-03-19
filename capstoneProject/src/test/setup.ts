import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

const noop = (): void => undefined;

class ResizeObserverMock implements ResizeObserver {
  observe = noop;

  unobserve = noop;

  disconnect = noop;
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
