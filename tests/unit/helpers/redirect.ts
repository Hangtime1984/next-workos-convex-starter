import { vi } from "vitest";

export class RedirectSignal extends Error {
  location: string;

  constructor(location: string) {
    super(`Redirect to ${location}`);
    this.name = "RedirectSignal";
    this.location = location;
  }
}

export function createRedirectMock() {
  return vi.fn((location: string) => {
    throw new RedirectSignal(location);
  });
}
