import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <li className="nav-item">
      <button
        className="nav-link btn btn-link"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        }
      >
        <i
          className={`theme-toggle-icon ${
            theme === "dark" ? "ion-ios-sunny" : "ion-ios-moon"
          }`}
        ></i>
      </button>
    </li>
  );
}

export default ThemeToggle;
