import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Plus, Filter, Trash2 } from 'lucide-react';
import { api } from '../api';
import { toast } from 'react-toastify';

const Finance: React.FC = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [transactionType, setTransactionType] = useState<'Income' | 'Expense'>('Expense');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Cattle Feed',
        amount: '',
        description: ''
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await api.get('/finance');
            setTransactions(data);
        } catch (error) {
            toast.error('Failed to load financial records');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/finance', {
                ...formData,
                type: transactionType,
                amount: parseFloat(formData.amount)
            });
            toast.success('Transaction saved!');
            setIsAddMode(false);
            setFormData({ date: new Date().toISOString().split('T')[0], category: transactionType === 'Expense' ? 'Cattle Feed' : 'Milk Sales', amount: '', description: '' });
            fetchTransactions();
        } catch (error) {
            toast.error('Failed to save transaction');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/finance/${id}`);
            toast.success('Transaction deleted');
            fetchTransactions();
        } catch (error) {
            toast.error('Failed to delete transaction');
        }
    };

    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalIncome - totalExpense;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">{t('finance')}</h1>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="flex items-center gap-2 bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Transaction
                </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Income</p>
                        <h3 className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full"><TrendingUp className="w-6 h-6 text-green-600" /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</h3>
                    </div>
                    <div className="bg-red-50 p-3 rounded-full"><TrendingDown className="w-6 h-6 text-red-600" /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 font-medium mb-1">Net Profit</p>
                        <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>₹{netProfit.toLocaleString()}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full"><TrendingUp className={`w-6 h-6 ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`} /></div>
                </div>
            </div>

            {isAddMode && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">New Transaction</h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => { setTransactionType('Income'); setFormData({ ...formData, category: 'Milk Sales' }) }}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${transactionType === 'Income' ? 'bg-white text-green-600 shadow' : 'text-gray-500'}`}
                            >Income</button>
                            <button
                                onClick={() => { setTransactionType('Expense'); setFormData({ ...formData, category: 'Cattle Feed' }) }}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${transactionType === 'Expense' ? 'bg-white text-red-600 shadow' : 'text-gray-500'}`}
                            >Expense</button>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-primary-dark focus:border-primary-dark" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white">
                                {transactionType === 'Expense' ? (
                                    <>
                                        <option>Cattle Feed</option>
                                        <option>Veterinary & Medicine</option>
                                        <option>Labor</option>
                                        <option>Maintenance</option>
                                        <option>Other Expense</option>
                                    </>
                                ) : (
                                    <>
                                        <option>Milk Sales</option>
                                        <option>Cow Sales</option>
                                        <option>Manure Sales</option>
                                        <option>Other Income</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input type="number" required min="1" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short note..." className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-primary-dark focus:border-primary-dark" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAddMode(false)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className={`px-6 py-2.5 text-white font-bold rounded-xl transition-colors ${transactionType === 'Income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                Save {transactionType}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                    <button className="text-gray-500 hover:text-gray-700 p-1"><Filter className="w-5 h-5" /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Amount</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No transactions recorded.</td></tr>
                            ) : transactions.map(t => (
                                <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{t.date}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${t.type === 'Income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{t.category}</div>
                                                <div className="text-xs text-gray-500">{t.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`py-3 px-4 text-sm font-bold text-right ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'Income' ? '+' : '-'}₹{t.amount?.toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Finance;
