import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { FaRobot, FaLightbulb, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { Button } from '../components/ui/Button';

export default function Recommendations() {
    const [products, setProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data());
            setProducts(data);
            generateRecommendations(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const generateRecommendations = (data) => {
        const recs = [];

        // Logic 1: Restock Needed
        const lowStock = data.filter(p => p.quantity < 3);
        if (lowStock.length > 0) {
            recs.push({
                type: 'critical',
                title: 'Zaxirani To\'ldirish Kerak',
                description: `${lowStock.length} ta mahsulot tugab bormoqda. Savdo to'xtab qolmasligi uchun tezroq buyurtma bering.`,
                items: lowStock.slice(0, 3)
            });
        }

        // Logic 2: Popular Categories (Mock logic based on quantity volume)
        // If we have many items of "Unitaz", maybe we suggest adding "Aksessuarlar"
        const hasUnitaz = data.some(p => p.category === 'Unitaz');
        const hasAccessories = data.some(p => p.category === 'Aksessuarlar');

        if (hasUnitaz && !hasAccessories) {
            recs.push({
                type: 'opportunity',
                title: 'Sotuvni Oshirish Imkoniyati',
                description: "Unitazlar bor, lekin aksessuarlar yo'q. Mijozlar odatda ularni birga sotib oladi. Yangi aksessuarlar qo'shishni tavsiya qilamiz.",
                items: []
            });
        }

        // Logic 3: General Advice
        recs.push({
            type: 'tip',
            title: 'Mavsumiy Maslahat',
            description: "Hozirgi mavsumda 'Vanna' va 'Dush' kabinalariga talab ortishi kutilmoqda. Narxlarni tekshirib ko'ring.",
            items: []
        });

        setRecommendations(recs);
    };

    if (loading) return <div className="text-center py-20 text-neon-blue animate-pulse">AI Tahlil qilmoqda...</div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-neon-blue/10 rounded-full border border-neon-blue shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                    <FaRobot className="text-4xl text-neon-blue animate-bounce-slow" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase">
                        AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-purple-500">TAVSIYALAR</span>
                    </h1>
                    <p className="text-gray-400">Do'koningiz samaradorligini oshirish uchun sun'iy intellekt maslahatlari</p>
                </div>
            </div>

            <div className="grid gap-6">
                {recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-dark-surface/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/30 transition-all">
                        <div className={`absolute top-0 left-0 w-1 h-full ${rec.type === 'critical' ? 'bg-red-500' : rec.type === 'opportunity' ? 'bg-green-400' : 'bg-neon-blue'}`} />

                        <div className="flex items-start justify-between">
                            <div className="space-y-2 max-w-2xl">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {rec.type === 'critical' && <FaLightbulb className="text-red-500" />}
                                    {rec.title}
                                </h3>
                                <p className="text-gray-300 leading-relaxed">{rec.description}</p>

                                {rec.items.length > 0 && (
                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        {rec.items.map((item, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/5">
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 group-hover:bg-white/10">
                                Bajarish <FaArrowRight />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {recommendations.length === 0 && (
                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                    <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">Hammasi joyida!</h3>
                    <p className="text-gray-400">Hozircha hech qanday muammo yoki favqulodda tavsiya yo'q.</p>
                </div>
            )}
        </div>
    );
}
