import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StatisticsManager() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Sales
        const qSales = query(collection(db, "sales"), orderBy("date", "desc"));
        const unsubSales = onSnapshot(qSales, (snap) => {
            setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Fetch Products for current stock info
        const qProd = query(collection(db, "products"));
        const unsubProd = onSnapshot(qProd, (snap) => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        setLoading(false); // Ideally wait for both, but this is fine for realtime
        return () => { unsubSales(); unsubProd(); };
    }, []);

    // 1. Top Selling Products
    // Aggregate sales by productId
    const productSalesMap = {};
    sales.forEach(sale => {
        const pid = sale.productId;
        if (!productSalesMap[pid]) productSalesMap[pid] = { name: sale.productName, quantity: 0, revenue: 0 };
        productSalesMap[pid].quantity += (sale.quantity || 0);
        productSalesMap[pid].revenue += (sale.quantity * (sale.price || 0));
    });

    const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // 2. Category Sales
    const categorySalesMap = {};
    sales.forEach(sale => {
        const cat = sale.category || 'Boshqa';
        if (!categorySalesMap[cat]) categorySalesMap[cat] = 0;
        categorySalesMap[cat] += (sale.quantity || 0);
    });
    const categoryData = Object.keys(categorySalesMap).map(cat => ({ name: cat, value: categorySalesMap[cat] }));

    // 3. Weekly Sales (Last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('uz-UZ', { weekday: 'short' }); // e.g. Dush, Sesh
    }).reverse();

    // This is simplified. Real logic needs exact date matching.
    // Group sales by Date string.
    const salesByDate = {};
    sales.forEach(sale => {
        if (!sale.date) return;
        const dateKey = new Date(sale.date.seconds * 1000).toLocaleDateString('uz-UZ', { weekday: 'short' });
        if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
        salesByDate[dateKey] += sale.quantity;
    });

    const weeklyData = last7Days.map(day => ({
        name: day,
        sales: salesByDate[day] || 0
    }));

    // COLORS for Pie Chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Stats Cards Data
    const totalSold = sales.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalRevenue = sales.reduce((acc, curr) => acc + ((curr.quantity * curr.price) || 0), 0);
    // Note: Price might not be tracked in sale, usually it is. Assuming we add price to sale record.

    if (loading) return <div className="p-10 text-center">Yuklanmoqda...</div>;

    return (
        <div className="space-y-8 animate-fade-in p-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Statistika & Tahlil</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Umumiy Sotuv (Dona)" value={totalSold} color="bg-blue-500" />
                <StatCard title="Umumiy Tushum (Taxminiy)" value={`${totalRevenue.toLocaleString()} so'm`} color="bg-green-500" />
                <StatCard title="Mavjud Mahsulotlar" value={products.length} color="bg-purple-500" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Products Bar Chart */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow border border-gray-100 dark:border-white/5">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Eng Xaridorgir Mahsulotlar (Top 5)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickFormatter={(val) => val.length > 10 ? val.substr(0, 10) + '...' : val} />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }} />
                                <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow border border-gray-100 dark:border-white/5">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Kategoriyalar Ulushi</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Weekly Sales Line Chart (Using Bar for simplicity matching variable name) */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow border border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Haftalik Sotuv Dinamikasi</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }} />
                            <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className={`p-6 rounded-2xl text-white shadow-lg ${color} bg-opacity-90 backdrop-blur-sm relative overflow-hidden`}>
            <div className="relative z-10">
                <h4 className="opacity-80 text-sm font-medium uppercase tracking-wider mb-1">{title}</h4>
                <div className="text-3xl font-bold">{value}</div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
        </div>
    );
}
