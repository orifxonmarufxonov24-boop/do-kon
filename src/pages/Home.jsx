import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FaSearch, FaFilter, FaBoxOpen } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_CATEGORIES = ['Barchasi', 'Unitaz', 'Vanna', 'Rakovina', 'Ko\'zgu', 'Jo\'mrak', 'Dush', 'Mebel', 'Aksessuarlar'];

export default function Home() {
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Barchasi');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const prods = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(prods);
            setLoading(false);
        }, (error) => {
            console.error("Xatolik:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'Barchasi' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="text-center py-10 space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-neon-blue to-neon-purple tracking-tight pb-2"
                >
                    PREMIUM SANTEHNIKA
                </motion.h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Bizning eksklyuziv zamonaviy santehnika to'plamimizni ko'ring.
                    O'zingizga mos mahsulotni topish uchun filtrlardan foydalaning.
                </p>
            </div>

            <div className="sticky top-20 z-40 space-y-4 bg-dark-bg/95 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-xl md:border md:border-white/10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                        />
                    </div>

                    <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 hide-scrollbar">
                        {ALL_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap px-6 py-2 rounded-full border transition-all ${activeCategory === cat
                                        ? 'bg-neon-blue text-black border-neon-blue font-bold shadow-neon-blue'
                                        : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredProducts.map(product => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedProduct(product)}
                                className="cursor-pointer group"
                            >
                                <Card className="h-full border-transparent hover:border-neon-blue/30 transition-colors p-0 overflow-hidden bg-dark-surface/50">
                                    <div className="aspect-[4/3] overflow-hidden relative">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                <FaBoxOpen size={40} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${product.quantity > 0
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                }`}>
                                                {product.quantity > 0 ? 'SOTUVDA' : 'QOLMAGAN'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="text-xs text-neon-blue font-bold tracking-wider mb-1 uppercase">
                                            {product.category}
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>

                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <div className="bg-white/10 px-2 py-1 rounded">
                                                {product.sizes[0] || 'Std O\'lcham'}
                                            </div>
                                            <div className="bg-white/10 px-2 py-1 rounded">
                                                {product.color || 'Std Rang'}
                                            </div>
                                            {product.sizes.length > 1 && (
                                                <span className="text-xs opacity-50">+{product.sizes.length - 1} ta</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Product Detail Modal */}
            <Modal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                title={selectedProduct?.name || 'Mahsulot Tafsilotlari'}
            >
                {selectedProduct && (
                    <div className="space-y-6">
                        <div className="aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10 relative">
                            {selectedProduct.images?.[0] ? (
                                <img src={selectedProduct.images[0]} className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">Rasm yo'q</div>
                            )}
                        </div>

                        {selectedProduct.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {selectedProduct.images.map((img, i) => (
                                    <img key={i} src={img} className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-80 border border-white/10" />
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-gray-400 text-sm">Kategoriya</span>
                                <span className="text-lg font-bold text-white">{selectedProduct.category}</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-gray-400 text-sm">Holati</span>
                                <span className={`${selectedProduct.quantity > 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                                    {selectedProduct.quantity > 0 ? `${selectedProduct.quantity} dona bor` : 'Qolmagan'}
                                </span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-gray-400 text-sm">O'lchamlar</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedProduct.sizes.map(s => (
                                        <span key={s} className="px-2 py-1 bg-white/10 rounded text-sm text-white">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-gray-400 text-sm">Rangi</span>
                                <span className="text-white">{selectedProduct.color}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <Button className="w-full" onClick={() => setSelectedProduct(null)}>Yopish</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
