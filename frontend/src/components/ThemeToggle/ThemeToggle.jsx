import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "Light" : "Dark";

  return (
    <li className="nav-item">
      <button
        className="nav-link"
        onClick={toggleTheme}
        style={{ background: "none", border: "none", cursor: "pointer" }}
        type="button"
      >
        <i className="ion-contrast"></i> {nextTheme}
      </button>
    </li>
  );
}

export default ThemeToggle;
