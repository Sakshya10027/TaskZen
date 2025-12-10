import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function ToggleTheme() {
  const { dark, toggle } = useContext(ThemeContext);
  return (
    <button
      onClick={toggle}
      className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium shadow-sm dark:border-gray-600 dark:bg-gray-800"
    >
      {dark ? "Light" : "Dark"} mode
    </button>
  );
}
