import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
    const { theme, toggleTheme, adminConfig } = useTheme();

    if (adminConfig?.allowUserSwitch === false) return null;

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner hover:shadow-lg"
            aria-label="Toggle Theme"
        >
            <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform duration-300 ease-in-out flex items-center justify-center
                ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
            >
                {theme === 'dark' ? (
                    <FaMoon className="text-indigo-900 text-[10px]" />
                ) : (
                    <FaSun className="text-orange-400 text-[10px]" />
                )}
            </div>
        </button>
    );
}
