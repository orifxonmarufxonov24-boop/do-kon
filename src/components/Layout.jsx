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
                    <div className="bg-neon-blue/20 p-2 rounded-lg group-hover:bg-neon-blue/30 transition-colors">
                        <FaBoxes className="text-neon-blue text-2xl" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Ozodbek<span className="text-neon-blue">Santehnika</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/statistika" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Statistika</Link>
                    <Link to="/ai-tavsiyalar" className="text-sm font-medium text-gray-400 hover:text-neon-blue transition-colors relative group">
                        AI Tavsiyalar
                        <span className="absolute -top-1 -right-2 w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
                    </Link>
                </div>

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
                <p>&copy; {new Date().getFullYear()} Ozodbek Santehnika. Barcha huquqlar himoyalangan.</p>
                <p className="mt-2 text-xs opacity-50">
                    Created by <a href="https://t.me/Orifxon_05" target="_blank" rel="noopener noreferrer" className="text-neon-blue font-bold hover:text-white transition-colors cursor-pointer">Orifxon</a>
                </p>
            </footer>
        </div >
    );
}
