import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Card } from '../components/ui/Card';
import { FaChartPie, FaBoxOpen, FaExclamationTriangle, FaLayerGroup } from 'react-icons/fa';

export default function Statistics() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            setProducts(snapshot.docs.map(doc => doc.data()));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Analytics Logic
    const totalProducts = products.length;
    const totalQuantity = products.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const lowStockProducts = products.filter(p => p.quantity < 3);

    // Category Distribution
    const categoryStats = products.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    const maxCategoryCount = Math.max(...Object.values(categoryStats), 1);

    if (loading) return <div className="text-center text-white py-20">Analitika yuklanmoqda...</div>;

    return (
        <div className="space-y-8 pb-10">
            <h1 className="text-4xl font-black text-white mb-8">
                DO'KON <span className="text-neon-blue">STATISTIKASI</span>
            </h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Jami Mahsulotlar"
                    value={totalProducts}
                    icon={<FaBoxOpen />}
                    color="text-neon-blue"
                    borderColor="border-neon-blue/30"
                />
                <StatsCard
                    title="Jami Zaxira (Dona)"
                    value={totalQuantity}
                    icon={<FaLayerGroup />}
                    color="text-green-400"
                    borderColor="border-green-400/30"
                />
                <StatsCard
                    title="Kam Qolganlar"
                    value={lowStockProducts.length}
                    icon={<FaExclamationTriangle />}
                    color="text-red-500"
                    borderColor="border-red-500/30"
                />
                <StatsCard
                    title="Kategoriyalar"
                    value={Object.keys(categoryStats).length}
                    icon={<FaChartPie />}
                    color="text-purple-400"
                    borderColor="border-purple-400/30"
                />
            </div>

            {/* Category Chart Section */}
            <Card className="p-6 bg-dark-bg/50 border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaChartPie className="text-neon-blue" />
                    Kategoriyalar Bo'yicha Taqsimot
                </h3>
                <div className="space-y-4">
                    {Object.entries(categoryStats)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, count]) => (
                            <div key={cat} className="relative">
                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                    <span>{cat}</span>
                                    <span>{count} ta</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-1000"
                                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </Card>

            {/* Low Stock Alert List */}
            {lowStockProducts.length > 0 && (
                <div className="border border-red-500/20 rounded-xl bg-red-500/5 p-6">
                    <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                        <FaExclamationTriangle />
                        Tugab Borayotgan Mahsulotlar
                    </h3>
                    <div className="grid gap-3">
                        {lowStockProducts.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-dark-bg p-3 rounded border border-white/5">
                                <span className="text-white">{p.name}</span>
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded font-bold">
                                    {p.quantity} dona qoldi
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon, color, borderColor }) {
    return (
        <div className={`p-6 rounded-2xl bg-dark-surface border ${borderColor} shadow-lg backdrop-blur-sm relative overflow-hidden group`}>
            <div className={`absolute top-4 right-4 text-3xl opacity-20 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className={`text-3xl font-black mt-2 ${color}`}>{value}</p>
        </div>
    );
}
