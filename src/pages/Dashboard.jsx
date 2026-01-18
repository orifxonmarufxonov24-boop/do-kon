import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import ProductForm from '../components/ProductForm';
import Modal from '../components/ui/Modal';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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
            console.error("Firestore xatosi:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
            await deleteDoc(doc(db, "products", id));
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        // Transform arrays back to strings for form
        setEditingProduct({
            ...product,
            sizes: product.sizes.join(', ')
        });
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Omborni Boshqarish</h1>
                    <p className="text-gray-400">Jami Mahsulotlar: {products.length}</p>
                </div>
                <Button onClick={openAddModal} className="flex items-center gap-2">
                    <FaPlus /> Mahsulot Qo'shish
                </Button>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Mahsulotlarni qidirish..."
                        className="w-full bg-dark-bg border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-neon-blue focus:outline-none transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">Yuklanmoqda...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white/5 rounded-xl border border-white/5">
                        Mahsulotlar topilmadi. Yangi mahsulot qo'shing!
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400 uppercase font-medium">
                                <tr>
                                    <th className="p-4">Mahsulot</th>
                                    <th className="p-4">Kategoriya</th>
                                    <th className="p-4">Soni</th>
                                    <th className="p-4">O'lcham/Rang</th>
                                    <th className="p-4 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-dark-card/50">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover bg-white/10" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-xs">Rasm yo'q</div>
                                                )}
                                                <span className="font-medium text-white">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{product.category}</td>
                                        <td className="p-4">
                                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold ${product.quantity <= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                }`}>
                                                {product.quantity} dona
                                                {product.quantity <= 3 && <FaExclamationTriangle />}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            <div>{product.sizes.join(', ')}</div>
                                            <div className="text-xs opacity-60">{product.color}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 hover:bg-neon-blue/20 rounded text-neon-blue transition-colors"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
            >
                <ProductForm
                    onClose={() => setIsModalOpen(false)}
                    showSuccess={(msg) => alert(msg)} // Replace with toast in real app
                    initialData={editingProduct}
                />
            </Modal>
        </div>
    );
}
