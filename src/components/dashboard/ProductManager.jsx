import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import ProductForm from '../ProductForm';

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sell Modal State
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [productToSell, setProductToSell] = useState(null);
    const [sellQty, setSellQty] = useState(1);
    const [selling, setSelling] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("O'chirmoqchimisiz?")) {
            await deleteDoc(doc(db, "products", id));
        }
    };

    const openEditModal = (product) => {
        setEditingProduct({ ...product, sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes });
        setIsModalOpen(true);
    };

    const openSellModal = (product) => {
        setProductToSell(product);
        setSellQty(1);
        setSellModalOpen(true);
    };

    const handleSell = async (e) => {
        e.preventDefault();
        if (!productToSell || sellQty <= 0) return;
        if (sellQty > (productToSell.quantity || 0)) {
            alert(`Xatolik: Omborda buncha mahsulot yo'q! Maksimum: ${productToSell.quantity}`);
            return;
        }

        setSelling(true);
        try {
            // 1. Update Product Stock and SoldCount
            const productRef = doc(db, "products", productToSell.id);
            await updateDoc(productRef, {
                quantity: increment(-sellQty),
                soldCount: increment(sellQty)
            });

            // 2. Record Sale in 'sales' collection
            await addDoc(collection(db, "sales"), {
                productId: productToSell.id,
                productName: productToSell.name,
                category: productToSell.category,
                quantity: parseInt(sellQty),
                price: productToSell.price || 0, // Assuming price exists or handled later
                date: serverTimestamp()
            });

            alert("Sotuv muvaffaqiyatli saqlandi!");
            setSellModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Xatolik yuz berdi: " + error.message);
        }
        setSelling(false);
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div>Yuklanmoqda...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mahsulotlar ({products.length})</h2>
                <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} size="sm">
                    <FaPlus className="mr-2" /> Qo'shish
                </Button>
            </div>

            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Qidirish..."
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg pl-10 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-neon-blue transition-colors"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-dark-card">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                        <tr>
                            <th className="p-3">Nomi</th>
                            <th className="p-3">Kategoriya</th>
                            <th className="p-3">Ombor</th>
                            <th className="p-3">Sotilgan</th>
                            <th className="p-3 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 flex items-center gap-3">
                                    <img src={p.images?.[0] || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-white/10" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{p.name}</div>
                                        {p.sku && <div className="text-xs text-gray-400">{p.sku}</div>}
                                    </div>
                                </td>
                                <td className="p-3">{p.category}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.quantity < 3 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500' : 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-500'}`}>
                                        {p.quantity} dona
                                    </span>
                                </td>
                                <td className="p-3 font-mono">
                                    {p.soldCount || 0}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    <button
                                        onClick={() => openSellModal(p)}
                                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition title='Sotish'"
                                        title="Sotish"
                                    >
                                        <FaShoppingCart />
                                    </button>
                                    <button onClick={() => openEditModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition"><FaEdit /></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Existing ADD/EDIT Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? "Tahrirlash" : "Qo'shish"}>
                <ProductForm onClose={() => setIsModalOpen(false)} showSuccess={(m) => alert(m)} initialData={editingProduct} />
            </Modal>

            {/* NEW SELL Modal */}
            <Modal isOpen={sellModalOpen} onClose={() => setSellModalOpen(false)} title={`Sotuv: ${productToSell?.name}`}>
                <form onSubmit={handleSell} className="space-y-4 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nechta sotildi?</label>
                        <input
                            type="number"
                            min="1"
                            max={productToSell?.quantity || 999}
                            value={sellQty}
                            onChange={(e) => setSellQty(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none text-xl font-bold"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">Omborda mavjud: {productToSell?.quantity} dona</p>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => setSellModalOpen(false)} disabled={selling}>Bekor qilish</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" loading={selling}>
                            {selling ? 'Saqlanmoqda...' : 'Sotishni Tasdiqlash'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
