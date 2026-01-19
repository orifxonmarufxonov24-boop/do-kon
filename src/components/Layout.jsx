import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { FaBoxes } from 'react-icons/fa';

export default function Layout() {
    const { currentUser, logout } = useAuth();

    return (
        <div className="min-h-screen bg-dark-bg text-white font-sans overflow-x-hidden">
            <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <img src="/logo.png" alt="Gravit Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold tracking-tight">
                        Gravit<span className="text-neon-blue">Santehnika</span>
                    </span>
                </Link>

                {currentUser && (
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/statistika">
                            <Button variant="secondary" className="border-neon-blue/30 hover:border-neon-blue hover:shadow-neon-blue/50">
                                <span className="flex items-center gap-2">
                                    📊 Statistika
                                </span>
                            </Button>
                        </Link>
                        <Link to="/ai-tavsiyalar">
                            <Button variant="primary" className="bg-gradient-to-r from-neon-blue to-purple-600 border-none shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                                <span className="flex items-center gap-2">
                                    ✨ AI Tavsiyalar
                                </span>
                            </Button>
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <>
                            <Link to="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">Boshqaruv</Link>
                            <Button variant="outline" size="sm" onClick={() => logout()}>Chiqish</Button>
                        </>
                    ) : (
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Admin Kirish</Link>
                    )}
                </div>
            </nav>

            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>

            <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Gravit Santehnika. Barcha huquqlar himoyalangan.</p>
                <p className="mt-2 text-xs opacity-50">
                    Created by <a href="https://t.me/Orifxon_05" target="_blank" rel="noopener noreferrer" className="text-neon-blue font-bold hover:text-white transition-colors cursor-pointer">Orifxon</a>
                </p>
            </footer>
        </div >
    );
}
