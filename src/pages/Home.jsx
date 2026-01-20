import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Lightbox from '../components/ui/Lightbox';
import {
    FaSearch, FaBoxOpen, FaPhoneAlt, FaTelegramPlane,
    FaStar, FaTruck, FaShieldAlt, FaMedal, FaRegStar, FaEnvelope
} from 'react-icons/fa';
import MapDisplay from '../components/ui/MapDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ALL_CATEGORIES = ['Barchasi', 'Unitaz', 'Vanna', 'Rakovina', 'Ko\'zgu', 'Jo\'mrak', 'Dush', 'Mebel', 'Aksessuarlar'];

export default function Home() {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Barchasi');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);
    const [loading, setLoading] = useState(true);

    // Message State
    const [messageMode, setMessageMode] = useState(false);
    const [messageData, setMessageData] = useState({ name: '', phone: '', text: '' });
    const [sendingMessage, setSendingMessage] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Chat State
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatId] = useState(() => {
        const stored = localStorage.getItem('chatId');
        if (stored) return stored;
        const newId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chatId', newId);
        return newId;
    });

    useEffect(() => {
        // Listen to user's chat messages
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, snap => {
            const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setChatMessages(msgs);
            // If new admin message comes and chat is closed, maybe show badge (todo)
        });
        return () => unsub();
    }, [chatId]);

    // Settings State
    const [settings, setSettings] = useState({ address: 'Toshkent', phone: '+998 90 123 45 67', location: null }); // location: {lat,lng}

    useEffect(() => {
        // Fetch Settings
        getDoc(doc(db, "settings", "general")).then(snap => {
            if (snap.exists()) setSettings(snap.data());
        });
        // Fetch Products
        const qProd = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubProd = onSnapshot(qProd, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        // Fetch Reviews
        const qRev = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const unsubRev = onSnapshot(qRev, (snapshot) => {
            setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubProd(); unsubRev(); };
    }, []);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!newReview.name || !newReview.text) return;
        setSubmittingReview(true);
        try {
            await addDoc(collection(db, "reviews"), {
                ...newReview,
                createdAt: serverTimestamp()
            });
            setNewReview({ name: '', text: '', rating: 5 });
            alert(t('success_review'));
        } catch (error) {
            console.error(error);
        }
        setSubmittingReview(false);
    };

    const submitMessage = async (e) => {
        e.preventDefault();
        if (!messageData.name || !messageData.phone) return;
        setSendingMessage(true);
        try {
            // Ensure Chat Thread Exists
            const chatRef = doc(db, "chats", chatId);
            const chatSnap = await getDoc(chatRef);

            const chatInfo = {
                userName: messageData.name,
                userPhone: messageData.phone,
                lastUpdated: serverTimestamp(),
                lastMessage: messageData.text,
                adminUnread: true
            };

            if (selectedProduct) {
                chatInfo.productName = selectedProduct.name;
                chatInfo.productId = selectedProduct.id;
            }

            if (!chatSnap.exists()) {
                await setDoc(chatRef, chatInfo);
            } else {
                await updateDoc(chatRef, chatInfo);
            }

            // Add Message
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: messageData.text,
                sender: 'user',
                createdAt: serverTimestamp()
            });

            alert("Xabaringiz yuborildi! Chat orqali javobni kuzatishingiz mumkin.");
            setMessageMode(false);
            setMessageData({ name: '', phone: '', text: '' });
            setChatOpen(true); // Open Chat Widget
        } catch (error) {
            console.error(error);
            alert("Xatolik yuz berdi.");
        }
        setSendingMessage(false);
    };

    const filteredProducts = products.filter(p => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            return activeCategory === 'Barchasi' || p.category === activeCategory;
        }

        // Comprehensive Search
        const nameMatch = p.name?.toLowerCase().includes(term);
        const categoryMatch = p.category?.toLowerCase().includes(term);
        const colorMatch = p.color?.toLowerCase().includes(term);

        let sizeMatch = false;
        if (p.sizes) {
            if (Array.isArray(p.sizes)) {
                sizeMatch = p.sizes.some(s => s.toLowerCase().includes(term));
            } else if (typeof p.sizes === 'string') {
                sizeMatch = p.sizes.toLowerCase().includes(term);
            }
        }

        return nameMatch || categoryMatch || colorMatch || sizeMatch;
    });

    const scrollToContact = () => {
        document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-16 pb-20">
            {/* 1. HERO SECTION (Carousel Effect placeholder) */}
            <section className="relative -mt-8 py-24 px-4 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-neon-blue/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    key={t('hero_title')} // Re-animate on language change
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto space-y-6"
                >
                    <span className="px-4 py-1.5 rounded-full border border-blue-500/30 dark:border-neon-blue/30 bg-blue-500/10 dark:bg-neon-blue/10 text-blue-600 dark:text-neon-blue text-sm font-bold uppercase tracking-wider backdrop-blur-md mb-4 inline-block">
                        {t('premium_quality')} 💎
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-700 dark:from-yellow-300 dark:via-yellow-500 dark:to-yellow-600 drop-shadow-lg dark:drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-none tracking-tighter uppercase font-sans">
                        {t('hero_title')}
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                        {t('hero_subtitle')}
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <Button
                            className="text-lg px-8 py-4 shadow-neon-blue h-auto"
                            onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}
                        >
                            {t('catalog_btn')}
                        </Button>
                        <Button variant="outline" className="text-lg px-8 py-4 h-auto border-white/20 hover:bg-white/5" onClick={scrollToContact}>
                            <FaPhoneAlt className="mr-2" /> {t('contact_btn')}
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* 2. ADVANTAGES */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                <AdvantageCard icon={<FaTruck />} title={t('delivery_title')} desc={t('delivery_desc')} />
                <AdvantageCard icon={<FaShieldAlt />} title={t('guarantee_title')} desc={t('guarantee_desc')} />
                <AdvantageCard icon={<FaMedal />} title={t('price_title')} desc={t('price_desc')} />
            </section>

            {/* 3. CATALOG */}
            <div id="catalog" className="scroll-mt-24 space-y-6">
                <div className="sticky top-20 z-40 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-xl border-y border-gray-200 dark:border-white/10 py-4 shadow-2xl transition-colors duration-300">
                    <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pl-12 pr-6 py-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-neon-blue focus:shadow-lg dark:focus:shadow-neon-blue focus:outline-none transition-all placeholder-gray-500"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                            {ALL_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`whitespace-nowrap px-6 py-2.5 rounded-full border text-sm font-bold transition-all ${activeCategory === cat
                                        ? 'bg-blue-600 dark:bg-neon-blue text-white dark:text-black border-blue-600 dark:border-neon-blue shadow-lg scale-105'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    {cat === 'Barchasi' ? t('all') : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 max-w-7xl min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1].map(i => <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <AnimatePresence>
                                {filteredProducts.map(product => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group"
                                    >
                                        <Card className="h-full border border-white/5 bg-dark-surface/50 hover:border-neon-blue/50 hover:shadow-2xl hover:shadow-neon-blue/10 transition-all duration-300 p-0 overflow-hidden flex flex-col">
                                            <div className="aspect-[4/3] overflow-hidden relative bg-black/50">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                                                        onClick={() => setSelectedProduct(product)}
                                                    />
                                                ) : <div className="p-10"><FaBoxOpen /></div>}
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="text-xs text-neon-blue font-bold tracking-wider mb-2 uppercase opacity-80">{product.category}</div>
                                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{product.name}</h3>

                                                {/* Specs restored */}
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-4 mt-auto">
                                                    {product.sizes && <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{Array.isArray(product.sizes) ? product.sizes[0] : product.sizes}</span>}
                                                    {product.color && <span className="bg-white/5 px-2 py-1 rounded border border-white/5">{product.color}</span>}
                                                </div>

                                                <Button
                                                    size="sm"
                                                    className="w-full py-2 text-sm group-hover:shadow-neon-blue/20"
                                                    onClick={() => setSelectedProduct(product)}
                                                >
                                                    {t('details_btn')}
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. REAL REVIEWS */}
            <section className="py-16 border-t border-white/5 bg-white/[0.02]">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-black text-center mb-10 text-white">
                        {t('reviews_title')}
                    </h2>

                    {/* Review List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {reviews.length > 0 ? (
                            reviews.slice(0, 6).map(rev => (
                                <ReviewCard key={rev.id} name={rev.name} text={rev.text} stars={rev.rating || 5} date={rev.createdAt} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 col-span-3">Hozircha fikrlar yo'q. Birinchi bo'ling!</p>
                        )}
                    </div>

                    {/* Review Form */}
                    <div className="max-w-xl mx-auto bg-dark-surface p-8 rounded-2xl border border-white/10 text-center">
                        <h3 className="text-xl font-bold mb-6">{t('write_review')}</h3>
                        <form onSubmit={submitReview} className="space-y-4">
                            <input
                                type="text"
                                placeholder={t('name_placeholder')}
                                value={newReview.name}
                                onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                required
                            />
                            <textarea
                                placeholder={t('review_placeholder')}
                                value={newReview.text}
                                onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-neon-blue outline-none h-32 resize-none"
                                required
                            />
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button type="button" key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                                        {star <= newReview.rating ? <FaStar className="text-yellow-500 text-xl" /> : <FaRegStar className="text-gray-600 text-xl" />}
                                    </button>
                                ))}
                            </div>
                            <Button type="submit" className="w-full shadow-neon-blue" disabled={submittingReview}>
                                {submittingReview ? '...' : t('send')}
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

            {/* 5. CONTACT */}
            <section id="contact-section" className="border-t border-white/10 pt-16 pb-8">
                <h2 className="text-3xl font-black text-center mb-10 text-white">{t('contact_section')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 mb-8">
                    <ContactCard icon={<FaPhoneAlt />} title={t('call')} value={settings.phone || "+998 93 285 14 06"} link={`tel:${settings.phone?.replace(/ /g, '')}`} color="text-neon-blue" shadow="shadow-neon-blue" />
                    <ContactCard icon={<FaTelegramPlane />} title={t('telegram')} value="@Gravit_call" link="https://t.me/Gravit_call" color="text-neon-purple" shadow="shadow-neon-purple" />
                </div>
                {settings.location && (
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-96 grayscale hover:grayscale-0 transition-all duration-700 relative z-10">
                            <MapDisplay location={settings.location} address={settings.address} />
                        </div>
                        {settings.address && <p className="text-center text-gray-400 mt-4 text-sm bg-black/30 inline-block px-4 py-2 rounded-full border border-white/5 mx-auto block w-fit"><FaTruck className="inline mr-2" /> Manzil: {settings.address}</p>}
                    </div>
                )}
            </section>

            {/* FAB & Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
                <a href="https://t.me/Gravit_call" target="_blank" className="w-14 h-14 bg-neon-blue rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-neon-blue/50 hover:scale-110 transition-transform"><FaTelegramPlane /></a>

                <button onClick={() => setChatOpen(!chatOpen)} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform relative">
                    <FaEnvelope />
                    {chatMessages.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{chatMessages.length}</span>}
                </button>
            </div>

            {/* Chat Window Overlay */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-dark-bg border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        <div className="p-4 bg-neon-blue text-black font-bold flex justify-between items-center">
                            <span>Yordam Chati</span>
                            <button onClick={() => setChatOpen(false)}>x</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40">
                            {chatMessages.length === 0 && <p className="text-gray-400 text-center text-sm">Savollaringizni shu yerda qoldiring.</p>}
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-neon-blue text-black rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10 bg-black/60">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const text = e.target.msg.value;
                                if (!text.trim()) return;
                                e.target.msg.value = '';

                                // Send quick msg
                                const chatRef = doc(db, "chats", chatId);
                                await setDoc(chatRef, { lastUpdated: serverTimestamp(), lastMessage: text, adminUnread: true }, { merge: true });
                                await addDoc(collection(db, "chats", chatId, "messages"), { text, sender: 'user', createdAt: serverTimestamp() });
                            }} className="flex gap-2">
                                <input name="msg" className="flex-1 bg-transparent border border-white/20 rounded px-3 text-white text-sm focus:border-neon-blue outline-none" placeholder="Yozing..." />
                                <button type="submit" className="text-neon-blue"><FaTelegramPlane /></button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRODUCT MODAL */}
            <Modal isOpen={!!selectedProduct} onClose={() => { setSelectedProduct(null); setMessageMode(false); }} title={selectedProduct?.name}>
                {selectedProduct && (
                    <div className="space-y-6">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
                            {selectedProduct.images?.[0] && (
                                <img
                                    src={selectedProduct.images[0]}
                                    className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform"
                                    onClick={() => setViewingImage(selectedProduct.images[0])}
                                />
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <InfoBox label="Kategoriya" value={selectedProduct.category} />
                            <InfoBox label="Holati" value={selectedProduct.quantity > 0 ? 'Bor' : '—'} />
                            <InfoBox label="O'lcham" value={Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes.join(', ') : selectedProduct.sizes} />
                            <InfoBox label="Rang" value={selectedProduct.color} />
                        </div>

                        {messageMode ? (
                            <form onSubmit={submitMessage} className="mt-4 space-y-4 border-t border-gray-200 dark:border-white/10 pt-4 animate-fade-in">
                                <h4 className="font-bold text-gray-900 dark:text-white">Xabar qoldirish</h4>
                                <input
                                    type="text"
                                    placeholder="Ismingiz"
                                    className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded p-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-neon-blue outline-none placeholder-gray-500"
                                    required
                                    value={messageData.name}
                                    onChange={e => setMessageData({ ...messageData, name: e.target.value })}
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefon raqamingiz"
                                    className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded p-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-neon-blue outline-none placeholder-gray-500"
                                    required
                                    value={messageData.phone}
                                    onChange={e => setMessageData({ ...messageData, phone: e.target.value })}
                                />
                                <textarea
                                    placeholder="Savolingiz..."
                                    className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded p-3 text-gray-900 dark:text-white h-24 focus:border-blue-500 dark:focus:border-neon-blue outline-none resize-none placeholder-gray-500"
                                    value={messageData.text}
                                    onChange={e => setMessageData({ ...messageData, text: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setMessageMode(false)}>Bekor qilish</Button>
                                    <Button type="submit" className="flex-1 shadow-neon-blue" disabled={sendingMessage}>
                                        {sendingMessage ? 'Yuborilmoqda...' : 'Yuborish'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                                <Button
                                    size="sm"
                                    className="w-full py-3 text-base shadow-neon-blue/20"
                                    onClick={() => {
                                        const msg = `Salom! Shu mahsulot menga yoqdi, shu haqida ma'lumot bera olasizmi?\n\n📦 Nomi: ${selectedProduct.name}\n📂 Kategoriya: ${selectedProduct.category}\n🎨 Rang: ${selectedProduct.color || '-'}\n📏 O'lcham: ${Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes.join(', ') : selectedProduct.sizes || '-'}`;
                                        window.open(`https://t.me/Gravit_call?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                >
                                    <FaTelegramPlane className="mr-2" /> {t('order_telegram')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full py-3 text-base border-white/10 hover:bg-white/5"
                                    onClick={() => setMessageMode(true)}
                                >
                                    <FaEnvelope className="mr-2" /> Sayt orqali yozish
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {viewingImage && <Lightbox src={viewingImage} onClose={() => setViewingImage(null)} />}
        </div >
    );
}

function AdvantageCard({ icon, title, desc }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-neon-blue/30 shadow-lg dark:shadow-none hover:shadow-xl transition-all duration-300 text-center group">
            <div className="text-4xl text-gray-400 dark:text-gray-500 mb-4 group-hover:text-blue-600 dark:group-hover:text-neon-blue transition-colors flex justify-center">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
        </div>
    );
}

function ReviewCard({ name, text, stars, date }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-white/5 relative shadow-md dark:shadow-none transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="flex text-yellow-500 text-sm">
                    {[...Array(5)].map((_, i) => (
                        i < stars ? <FaStar key={i} /> : <FaRegStar key={i} />
                    ))}
                </div>
                {date && <span className="text-xs text-gray-500 dark:text-gray-600">{new Date(date.seconds * 1000).toLocaleDateString()}</span>}
            </div>
            <p className="text-gray-700 dark:text-gray-300 italic mb-4 text-sm leading-relaxed">"{text}"</p>
            <h4 className="font-bold text-gray-900 dark:text-white text-right text-sm">- {name}</h4>
        </div>
    );
}

function ContactCard({ icon, title, value, link, color, shadow }) {
    // Note: color props like 'text-neon-blue' might need conditional handling if they are specific colors
    // But usually classes like 'text-blue-500' work well. 
    // Assuming passed colors are generic text/shadow classes.
    return (
        <a href={link} className={`group relative bg-white dark:bg-dark-bg border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-blue-400 dark:hover:border-white/30 transition-all duration-300 overflow-hidden hover:shadow-xl dark:hover:${shadow} flex flex-col items-center text-center shadow-lg dark:shadow-none`}>
            <div className={`w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-900 dark:text-white group-hover:${color} transition-colors text-2xl`}>{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <div className={`text-2xl font-mono font-bold ${color}`}>{value}</div>
        </a>
    );
}

function InfoBox({ label, value }) {
    return (
        <div className="p-3 bg-gray-100 dark:bg-white/5 rounded border border-gray-200 dark:border-white/5">
            <span className="block text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</span>
            <span className="font-bold text-gray-900 dark:text-white">{value}</span>
        </div>
    );
}
