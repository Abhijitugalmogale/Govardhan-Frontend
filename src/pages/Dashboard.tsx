import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Droplets, TrendingUp, TrendingDown, ArrowRight, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { toast } from 'react-toastify';
import { format, subDays, differenceInDays } from 'date-fns';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [cows, setCows] = useState<any[]>([]);
    const [milk, setMilk] = useState<any[]>([]);
    const [finance, setFinance] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [cowsData, milkData, financeData] = await Promise.all([
                    api.get('/cows'),
                    api.get('/milk'),
                    api.get('/finance')
                ]);
                setCows(cowsData);
                setMilk(milkData);
                setFinance(financeData);
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load dashboard data');
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center">Loading Dashboard...</div>;

    // --- Statistics Calculations ---
    const totalCows = cows.length;
    const pregnantCows = cows.filter(c => c.status === 'Pregnant').length;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const milkToday = milk.filter(m => m.date === todayStr).reduce((acc, curr) => acc + (curr.total || 0), 0);

    const currentMonthPrefix = todayStr.substring(0, 7); // e.g., '2026-03'
    const currentMonthFinances = finance.filter(f => f.date.startsWith(currentMonthPrefix));

    const monthlyIncome = currentMonthFinances.filter(f => f.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const monthlyExpense = currentMonthFinances.filter(f => f.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);

    const stats = [
        { title: t('total_cows'), value: totalCows.toString(), icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: t('pregnant_cows'), value: pregnantCows.toString(), icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: t('milk_today'), value: `${milkToday.toFixed(1)} L`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: t('monthly_income'), value: `₹${monthlyIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { title: t('monthly_expense'), value: `₹${monthlyExpense.toLocaleString()}`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    // --- Chart Data Calculation (Last 7 Days) ---
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const dayLabel = format(d, 'EEE'); // Mon, Tue, etc.
        const dayTotal = milk.filter(m => m.date === dateStr).reduce((a, b) => a + (b.total || 0), 0);
        chartData.push({ name: dayLabel, amount: dayTotal });
    }

    // --- Upcoming Alerts ---
    const alerts: any[] = [];
    cows.filter(c => c.status === 'Pregnant' && c.pregnancyStartDate).forEach(cow => {
        const start = new Date(cow.pregnancyStartDate);
        const expectedDelivery = new Date(start.getTime() + 283 * 24 * 60 * 60 * 1000);
        const daysRemaining = differenceInDays(expectedDelivery, new Date());
        if (daysRemaining >= 0 && daysRemaining <= 30) {
            alerts.push({
                id: cow._id,
                title: `${cow.name} - Delivery Expected`,
                desc: `Due in ${daysRemaining} days (${format(expectedDelivery, 'dd MMM yyyy')})`,
                type: 'critical'
            });
        }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-500 text-sm font-medium">{stat.title}</span>
                                <div className={`p-2 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Weekly Milk Production (L)</h2>
                        <button className="text-primary-dark text-sm font-semibold flex items-center hover:opacity-80">
                            Details <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#86efac" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#86efac" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorMilk)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reminders / Notifications */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Upcoming Alerts</h2>
                        <Bell className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {alerts.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-8 flex flex-col items-center justify-center">
                                <div className="bg-green-50 p-3 rounded-full mb-2">
                                    <ClipboardList className="w-6 h-6 text-green-500" />
                                </div>
                                All good! No imminent alerts.
                            </div>
                        ) : alerts.map((alert, idx) => (
                            <div key={idx} className="flex gap-4 items-start p-3 bg-red-50 rounded-xl">
                                <div className="bg-red-100 p-2 rounded-full mt-1">
                                    <AlertIcon color="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                                    <p className="text-xs text-gray-600 mt-1">{alert.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlertIcon = ({ color }: { color: string }) => (
    <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export default Dashboard;
