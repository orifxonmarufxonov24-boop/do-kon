import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc, addDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ProductForm from '../components/ProductForm';
import Modal from '../components/ui/Modal';
import MapPicker from '../components/ui/MapPicker';
import ProductManager from '../components/dashboard/ProductManager';
import StatisticsManager from '../components/dashboard/StatisticsManager';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle, FaBox, FaEnvelope, FaStar, FaCheckDouble, FaRegStar, FaCog, FaPhoneAlt, FaTelegramPlane, FaChartBar, FaRobot } from 'react-icons/fa';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className="flex flex-col lg:flex-row min-h-[80vh] gap-6">
            {/* Sidebar / Tabs */}
            <aside className="w-full lg:w-64 flex flex-col gap-2">
                <TabButton
                    active={activeTab === 'products'}
                    onClick={() => setActiveTab('products')}
                    icon={<FaBox />}
                    label="Mahsulotlar"
                />
                <TabButton
                    active={activeTab === 'messages'}
                    onClick={() => setActiveTab('messages')}
                    icon={<FaEnvelope />}
                    label="Xabarlar"
                />
                <TabButton
                    active={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                    icon={<FaStar />}
                    label="Fikrlar"
                />
                <TabButton
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                    icon={<FaCog />}
                    label="Sozlamalar"
                />
                <div className="border-t border-gray-200 dark:border-white/10 my-1 mx-4"></div>
                <TabButton
                    active={activeTab === 'statistics'}
                    onClick={() => setActiveTab('statistics')}
                    icon={<FaChartBar />}
                    label="Statistika"
                />
                <TabButton
                    active={activeTab === 'ai'}
                    onClick={() => setActiveTab('ai')}
                    icon={<FaRobot />}
                    label="AI Tavsiya"
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white/80 dark:bg-dark-card/30 rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-xl dark:shadow-none transition-colors duration-300">
                {activeTab === 'products' && <ProductManager />}
                {activeTab === 'statistics' && <StatisticsManager />}
                {activeTab === 'ai' && <AIRecommendations />}
                {activeTab === 'messages' && <MessageManager />}
                {activeTab === 'reviews' && <ReviewManager />}
                {activeTab === 'settings' && <SettingsManager />}
            </main>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${active
                ? 'bg-blue-600 dark:bg-neon-blue text-white dark:text-black font-bold shadow-lg shadow-blue-500/30 dark:shadow-neon-blue'
                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
        </button>
    );
}

// --- SUB-MANAGERS ---

// ProductManager is now imported from ../components/dashboard/ProductManager
// See imports above

function MessageManager() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState('');
    const messagesEndRef = useRef(null);

    // Fetch Chat List
    useEffect(() => {
        const q = query(collection(db, "chats"), orderBy("lastUpdated", "desc"));
        const unsub = onSnapshot(q, snap => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setChats(list);
        });
        return () => unsub();
    }, []);

    // Fetch Messages for Selected Chat
    useEffect(() => {
        if (!selectedChat) return;
        setMessages([]); // Clear immediately to avoid flicker
        const q = query(collection(db, "chats", selectedChat.id, "messages"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, snap => {
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [selectedChat]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedChat) return;

        try {
            await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
                text: reply,
                sender: 'admin',
                createdAt: serverTimestamp()
            });
            await updateDoc(doc(db, "chats", selectedChat.id), {
                lastUpdated: serverTimestamp(),
                lastMessage: reply,
                adminUnread: false
            });
            setReply('');
        } catch (err) {
            console.error("Reply Error:", err);
            alert("Xatolik yuz berdi");
        }
    };

    const deleteChat = async () => {
        if (window.confirm("Bu chatni butunlay o'chirib tashlaysizmi?")) {
            await deleteDoc(doc(db, "chats", selectedChat.id));
            setSelectedChat(null);
        }
    };

    return (
        <div className="flex h-[600px] border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1e1e1e] overflow-hidden shadow-2xl font-sans transition-colors duration-300">
            {/* LEFT SIDEBAR: Chat List */}
            <div className={`flex flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#252525] w-full md:w-80 shrink-0 transition-all duration-300 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#2d2d2d] flex justify-between items-center text-gray-900 dark:text-white font-bold tracking-wide">
                    <span>Xabarlar ({chats.length})</span>
                    <FaEnvelope className="text-gray-400" />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {chats.length === 0 && (
                        <div className="p-6 text-center text-gray-500 text-sm">Hozircha xabarlar yo'q</div>
                    )}
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`p-4 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-all relative group 
                                ${selectedChat?.id === chat.id
                                    ? 'bg-blue-50 dark:bg-[#2b3a4a] border-l-4 border-blue-500 dark:border-neon-blue'
                                    : 'border-l-4 border-transparent hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-sm ${selectedChat?.id === chat.id ? 'text-blue-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{chat.userName || 'Mijoz'}</h4>
                                <span className="text-[10px] text-gray-500">{chat.lastUpdated?.seconds ? new Date(chat.lastUpdated.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-xs text-blue-600 dark:text-neon-blue font-medium truncate mb-0.5">{chat.productName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                                </div>
                                {chat.adminUnread && <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-neon-blue rounded-full shadow-lg"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT MAIN: Chat Window */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-[#0f0f0f] relative ${selectedChat ? 'flex' : 'hidden md:flex'} transition-colors duration-300`}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="p-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#2d2d2d] flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors">
                                    &larr;
                                </button>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">{selectedChat.userName}</h3>
                                    <p className="text-xs text-blue-600 dark:text-neon-blue cursor-pointer hover:underline" onClick={() => window.location.href = `tel:${selectedChat.userPhone}`}>
                                        {selectedChat.userPhone}
                                    </p>
                                </div>
                            </div>
                            <button onClick={deleteChat} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Chatni o'chirish">
                                <FaTrash size={14} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-[#0f0f0f]">
                            {messages.length === 0 && <p className="text-center text-gray-500 mt-10 text-sm bg-gray-100 dark:bg-black/40 py-2 rounded-full inline-block mx-auto px-4 self-center">Yuklanmoqda... (yoki xabar yo'q)</p>}

                            {messages.map((msg, idx) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={msg.id || idx} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm relative shadow-md transition-colors duration-300 ${isAdmin
                                            ? 'bg-blue-600 dark:bg-neon-blue text-white dark:text-black rounded-tr-none'
                                            : 'bg-gray-100 dark:bg-[#252525] text-gray-800 dark:text-white rounded-tl-none border border-gray-200 dark:border-white/5'}`}
                                        >
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                            <div className={`text-[9px] mt-1 flex justify-end items-center gap-1 ${isAdmin ? 'text-blue-100 dark:text-black/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                {isAdmin && <span>✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendReply} className="p-3 bg-gray-50 dark:bg-[#2d2d2d] border-t border-gray-200 dark:border-white/10 flex gap-3 items-center">
                            <input
                                type="text"
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                                className="flex-1 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white border border-gray-300 dark:border-white/10 rounded-full px-5 py-3 text-sm focus:border-blue-500 dark:focus:border-neon-blue focus:ring-1 focus:ring-blue-500 dark:focus:ring-neon-blue outline-none transition-all placeholder-gray-400"
                                placeholder="Xabar yozing..."
                            />
                            <button
                                type="submit"
                                disabled={!reply.trim()}
                                className="w-10 h-10 bg-blue-600 dark:bg-neon-blue text-white dark:text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
                            >
                                <FaTelegramPlane className="ml-0.5" />
                            </button>
                        </form>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-[#121212] transition-colors duration-300">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <FaEnvelope className="text-4xl opacity-30" />
                        </div>
                        <p className="font-medium">Suhbatni boshlash uchun chatni tanlang</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReviewManager() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, snap => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        return () => unsub();
    }, []);

    const deleteReview = async (id) => {
        if (window.confirm("Fikrni o'chirasizmi?")) await deleteDoc(doc(db, "reviews", id));
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mijozlar Fikrlari ({reviews.length})</h2>
            <div className="grid gap-4">
                {reviews.map(rev => (
                    <div key={rev.id} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none flex justify-between items-start transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 dark:text-white">{rev.name}</span>
                                <div className="flex text-yellow-500 text-xs">
                                    {[...Array(5)].map((_, i) => (i < rev.rating ? <FaStar key={i} /> : <FaRegStar key={i} />))}
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{rev.text}</p>
                        </div>
                        <button onClick={() => deleteReview(rev.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"><FaTrash /></button>
                    </div>
                ))}
                {reviews.length === 0 && <p className="text-gray-500 text-center">Fikrlar yo'q</p>}
            </div>
        </div>
    );
}

function SettingsManager() {
    const [settings, setSettings] = useState({
        address: '',
        phone: '',
        location: null,
        defaultTheme: 'dark',
        allowUserSwitch: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const docRef = doc(db, "settings", "general");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(prev => ({ ...prev, ...docSnap.data() }));
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await setDoc(doc(db, "settings", "general"), settings, { merge: true });
            alert("Sozlamalar saqlandi!");
        } catch (error) {
            console.error(error);
            alert("Xatolik bo'ldi");
        }
        setLoading(false);
    };

    const handleLocationChange = async (loc) => {
        setSettings(prev => ({ ...prev, location: loc }));
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                setSettings(prev => ({ ...prev, address: data.display_name }));
            }
        } catch (error) {
            console.error("Address fetch error", error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sozlamalar</h2>
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1">Manzil (Address)</label>
                    <input
                        type="text"
                        value={settings.address}
                        onChange={e => setSettings({ ...settings, address: e.target.value })}
                        className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue"
                        placeholder="Masalan: Toshkent, Abdulla Qodiriy 11"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1">Telefon Raqam (Asosiy)</label>
                    <input
                        type="text"
                        value={settings.phone}
                        onChange={e => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue"
                        placeholder="+998 90 123 45 67"
                    />
                </div>
                <div>
                    <label className="block text-gray-600 dark:text-gray-400 mb-1">Lokatsiya (Xarita)</label>
                    <MapPicker
                        location={settings.location}
                        onChange={handleLocationChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">Xaritadan joyni belgilang.</p>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mavzu Sozlamalari</h3>

                    <div>
                        <label className="block text-gray-600 dark:text-gray-400 mb-1">Boshlang'ich Rejim (Default Theme)</label>
                        <select
                            value={settings.defaultTheme}
                            onChange={e => setSettings({ ...settings, defaultTheme: e.target.value })}
                            className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white"
                        >
                            <option value="dark">Dark Mode (Tungi)</option>
                            <option value="light">Light Mode (Kunduzgi)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={settings.allowUserSwitch ?? true}
                            onChange={e => setSettings({ ...settings, allowUserSwitch: e.target.checked })}
                            id="allowSwitch"
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="allowSwitch" className="text-gray-700 dark:text-gray-300">
                            Foydalanuvchilar rejimni o'zgartira olsin
                        </label>
                    </div>
                </div>

                <Button type="submit" disabled={loading}>{loading ? 'Saqlanmoqda...' : 'Saqlash'}</Button>
            </form>
        </div>
    );
}
