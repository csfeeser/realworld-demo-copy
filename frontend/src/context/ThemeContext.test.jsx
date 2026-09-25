import { fireEvent, render, screen } from "@testing-library/react";
import ThemeToggle from "../components/ThemeToggle";
import ThemeProvider from "./ThemeContext";

function mockMatchMedia(matches) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

beforeEach(() => {
  localStorage.clear();
  mockMatchMedia(false);
});

function renderToggle() {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

test("defaults to light when no stored theme and no OS preference", () => {
  renderToggle();
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});

test("defaults to dark when no stored theme and OS prefers dark", () => {
  mockMatchMedia(true);
  renderToggle();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});

test("a stored theme wins over the OS preference", () => {
  localStorage.setItem("theme", "light");
  mockMatchMedia(true);
  renderToggle();
  expect(document.documentElement.getAttribute("data-theme")).toBe("light");
});

test("clicking the toggle switches the active theme", () => {
  renderToggle();
  fireEvent.click(screen.getByRole("button"));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});

test("toggling persists the new theme to localStorage", () => {
  renderToggle();
  fireEvent.click(screen.getByRole("button"));
  expect(localStorage.getItem("theme")).toBe("dark");
});

test("a fresh mount restores a previously stored theme", () => {
  localStorage.setItem("theme", "dark");
  renderToggle();
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});
