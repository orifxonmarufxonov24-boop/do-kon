import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/Button';
import logoImg from '../assets/logo.png';

import ThemeToggle from './ui/ThemeToggle';

export default function Layout() {
    const { currentUser, logout } = useAuth();
    const { lang, changeLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-300">
            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <Link to="/" className="flex items-center gap-2 group">
                    <img src={logoImg} alt="Gravit Logo" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform mix-blend-multiply dark:mix-blend-screen" />
                    <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Gravit<span className="text-blue-600 dark:text-neon-blue">Santehnika</span>
                    </span>
                </Link>

                {currentUser && (
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/statistika">
                            <Button variant="secondary" className="border-blue-500/30 hover:border-blue-500 dark:border-neon-blue/30 dark:hover:border-neon-blue hover:shadow-lg dark:hover:shadow-neon-blue/50 text-blue-700 dark:text-neon-blue">
                                <span className="flex items-center gap-2">
                                    📊 Statistika
                                </span>
                            </Button>
                        </Link>
                        <Link to="/ai-tavsiyalar">
                            <Button variant="primary" className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-neon-blue dark:to-purple-600 border-none shadow-lg text-white">
                                <span className="flex items-center gap-2">
                                    ✨ AI Tavsiyalar
                                </span>
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <select
                        value={lang}
                        onChange={(e) => changeLanguage(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-neon-blue"
                    >
                        <option value="uz" className="bg-dark-bg">🇺🇿 UZ</option>
                        <option value="en" className="bg-dark-bg">🇬🇧 EN</option>
                        <option value="ru" className="bg-dark-bg">🇷🇺 RU</option>
                    </select>

                    {currentUser ? (
                        <>
                            <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">Boshqaruv</Link>
                            <Button variant="outline" size="sm" onClick={() => logout()}>Chiqish</Button>
                        </>
                    ) : (
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Admin</Link>
                    )}
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>

            <footer className="border-t border-white/10 py-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Gravit Santehnika. Barcha huquqlar himoyalangan.</p>
                <p className="mt-4 text-sm font-medium">
                    Created by <a href="https://t.me/Orifxon_05" target="_blank" rel="noopener noreferrer" className="text-neon-blue font-bold hover:text-white transition-colors cursor-pointer text-base">Orifxon</a>
                </p>
            </footer>
        </div >
    );
}
