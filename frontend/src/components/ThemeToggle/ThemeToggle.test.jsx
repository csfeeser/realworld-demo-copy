import { fireEvent, render, screen } from "@testing-library/react";
import ThemeProvider from "../../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
  }));
});

test("clicking the control switches the theme immediately (AC-081)", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );

  fireEvent.click(screen.getByRole("button"));

  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("theme")).toBe("dark");
});
