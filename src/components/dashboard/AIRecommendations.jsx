import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FaRobot, FaLightbulb, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function AIRecommendations() {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubProd = onSnapshot(collection(db, "products"), snap => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        const unsubSales = onSnapshot(query(collection(db, "sales"), orderBy("date", "desc")), snap => {
            setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Creating artificial delay for "AI Processing" effect
        setTimeout(() => setLoading(false), 1500);

        return () => { unsubProd(); unsubSales(); };
    }, []);

    useEffect(() => {
        if (loading) return;
        generateRecommendations();
    }, [products, sales, loading]);

    const generateRecommendations = () => {
        const recs = [];

        // 1. RE-STOCK WARNING (Based on Stock & Popularity)
        // Check products with low stock (< 5) but have sales history
        const lowStock = products.filter(p => (p.quantity || 0) < 5);
        lowStock.forEach(p => {
            // Count recent sales for this product (last 30 days)
            const recentSales = sales.filter(s => s.productId === p.id && isRecent(s.date, 30));
            const totalRecentQty = recentSales.reduce((sum, s) => sum + (s.quantity || 0), 0);

            if (totalRecentQty > 2) {
                recs.push({
                    type: 'restock',
                    priority: 'high',
                    icon: <FaExclamationTriangle className="text-red-500" />,
                    title: `Zudlik bilan omborga korishingiz kerak: ${p.name}`,
                    desc: `Qoldiq atigi ${p.quantity} dona. So'nggi 30 kunda ${totalRecentQty} dona sotildi. Talab yuqori!`
                });
            } else if (p.quantity === 0) {
                recs.push({
                    type: 'restock',
                    priority: 'medium',
                    icon: <FaExclamationTriangle className="text-yellow-500" />,
                    title: `Tugagan mahsulot: ${p.name}`,
                    desc: `Omborda qolmadi. Agar bu mahsulot muhim bo'lsa, buyurtma bering.`
                });
            }
        });

        // 2. TRENDING CATEGORY
        // Group recent sales by category
        const catSales = {};
        sales.filter(s => isRecent(s.date, 7)).forEach(s => {
            const cat = s.category || 'Boshqa';
            if (!catSales[cat]) catSales[cat] = 0;
            catSales[cat] += s.quantity || 0;
        });
        // Find top category
        let topCat = null;
        let maxQty = 0;
        Object.entries(catSales).forEach(([cat, qty]) => {
            if (qty > maxQty) {
                maxQty = qty;
                topCat = cat;
            }
        });

        if (topCat && maxQty > 0) {
            recs.push({
                type: 'trend',
                priority: 'info',
                icon: <FaArrowUp className="text-green-500" />,
                title: `Hafta trendi: ${topCat}`,
                desc: `So'nggi 7 kunda "${topCat}" kategoriyasi eng ko'p (${maxQty} dona) sotildi. Shu turdagi mahsulotlarga e'tibor qarating.`
            });
        }

        // 3. DEAD STOCK (Slow moving)
        // Products created > 30 days ago, with 0 sales in last 30 days, and stock > 5
        const deadStock = products.filter(p => {
            const created = p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : new Date();
            const daysOld = (new Date() - created) / (1000 * 60 * 60 * 24);
            const stock = p.quantity || 0;
            if (daysOld < 30 || stock < 5) return false;

            const hasRecentSales = sales.some(s => s.productId === p.id && isRecent(s.date, 30));
            return !hasRecentSales;
        });

        if (deadStock.length > 0) {
            recs.push({
                type: 'slow',
                priority: 'low',
                icon: <FaArrowDown className="text-blue-500" />,
                title: `Sekin sotilayotgan mahsulotlar (${deadStock.length} ta)`,
                desc: `Masalan: ${deadStock[0].name}. So'nggi oyda umuman sotilmadi. Balki chegirma e'lon qilarsiz?`
            });
        }

        setRecommendations(recs);
    };

    const isRecent = (timestamp, days) => {
        if (!timestamp) return false;
        const date = new Date(timestamp.seconds * 1000);
        const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
        return diff <= days;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center animate-pulse">
                <FaRobot className="text-6xl text-neon-blue mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sun'iy Intellekt tahlil qilmoqda...</h2>
                <p className="text-gray-500">Sotuvlar tarixi va ombor holatini o'rganayapman</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-neon-blue/20 rounded-full text-neon-blue">
                    <FaRobot size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Tavsiyalar</h2>
                    <p className="text-gray-500 dark:text-gray-400">Biznesingizni yanada rivojlantirish uchun aqlli maslahatlar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {recommendations.length > 0 ? recommendations.map((rec, i) => (
                    <div key={i} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/10 p-6 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-2xl mt-1">{rec.icon}</div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{rec.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{rec.desc}</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-10 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        <FaLightbulb className="mx-auto text-4xl text-yellow-500 mb-4" />
                        <p className="text-gray-500">Hozircha alohida tavsiyalar yo'q. Hammasi joyida ko'rinadi!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
