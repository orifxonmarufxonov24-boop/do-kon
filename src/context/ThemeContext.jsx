import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Default to 'dark' if nothing saved, or respect persistence
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [adminConfig, setAdminConfig] = useState(null);

    // Fetch Admin Config (optional: control default or lock)
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, "settings", "general");
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setAdminConfig(data);

                    // Logic: If user hasn't visited before (no localStorage), use Admin Default
                    // If user HAS visited, respect their choice (unless forced?)
                    if (!localStorage.getItem('theme') && data.defaultTheme) {
                        setTheme(data.defaultTheme);
                    }
                }
            } catch (error) {
                console.error("Theme config error:", error);
            }
        };
        fetchConfig();
    }, []);

    // Apply Theme to HTML root
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        // Optional: Check if admin disabled switching
        if (adminConfig?.allowUserSwitch === false) {
            // Maybe show a notification? currently just ignoring
            return;
        }
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, adminConfig }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
