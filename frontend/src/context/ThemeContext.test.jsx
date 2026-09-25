import { fireEvent, render, screen } from "@testing-library/react";
import ThemeProvider, { useTheme } from "./ThemeContext";

function stubMatchMedia(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
  }));
}

function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("initial theme, when nothing is stored yet (AC-084)", () => {
  test("follows the OS/browser dark preference", () => {
    stubMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  test("falls back to light when there is no dark preference", () => {
    stubMatchMedia(false);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  test("falls back to light when matchMedia isn't available", () => {
    delete window.matchMedia;

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });
});

test("a stored theme is used instead of the OS/browser preference (AC-085)", () => {
  localStorage.setItem("theme", "light");
  stubMatchMedia(true); // OS prefers dark, but an explicit choice already exists

  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  );

  expect(screen.getByTestId("theme")).toHaveTextContent("light");
});

test("toggling persists the new theme and applies it to <html> (AC-081, AC-083)", () => {
  stubMatchMedia(false);

  render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>,
  );

  fireEvent.click(screen.getByText("toggle"));

  expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});
