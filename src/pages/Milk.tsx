import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../api';
import { toast } from 'react-toastify';

const Milk: React.FC = () => {
    const { t } = useTranslation();
    const [records, setRecords] = useState<any[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [newEntry, setNewEntry] = useState({ date: new Date().toISOString().split('T')[0], morning: '', evening: '', morningRate: '', eveningRate: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await api.get('/milk');
            setRecords(data);
        } catch (error) {
            toast.error('Failed to load milk records');
        }
    };

    const handleSaveEntry = async () => {
        const morningVal = parseFloat(newEntry.morning) || 0;
        const eveningVal = parseFloat(newEntry.evening) || 0;
        const morningRateVal = parseFloat(newEntry.morningRate) || 0;
        const eveningRateVal = parseFloat(newEntry.eveningRate) || 0;
        const total = morningVal + eveningVal;

        if (total === 0) {
            toast.error('Please enter milk quantity');
            return;
        }

        if ((morningVal > 0 && morningRateVal <= 0) || (eveningVal > 0 && eveningRateVal <= 0)) {
            toast.error('Please enter valid rates for milk entered');
            return;
        }

        try {
            await api.post('/milk', {
                date: newEntry.date,
                morning: morningVal,
                evening: eveningVal,
                total: total,
                morningRate: morningRateVal,
                eveningRate: eveningRateVal
            });
            toast.success('Daily Farm Total saved!');
            setIsAddMode(false);
            setNewEntry({ date: new Date().toISOString().split('T')[0], morning: '', evening: '', morningRate: '', eveningRate: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to save milk entry');
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this milk record?')) return;
        try {
            await api.delete(`/milk/${id}`);
            toast.success('Milk record deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    // Calculate Totals
    const totalMilk = records.reduce((sum, record) => sum + (record.total || 0), 0);
    const totalRevenue = records.reduce((sum, record) => {
        const morningVal = record.morning || 0;
        const eveningVal = record.evening || 0;
        const morningRate = record.morningRate || record.ratePerLiter || 50;
        const eveningRate = record.eveningRate || record.ratePerLiter || 50;
        return sum + (morningVal * morningRate) + (eveningVal * eveningRate);
    }, 0);

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(20);
        doc.text('Govardhan - Daily Milk Records', 14, 22);

        // Add Date generated
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Prepare Data for AutoTable
        const tableData = records.map(record => {
            const mRate = record.morningRate || record.ratePerLiter || 50;
            const eRate = record.eveningRate || record.ratePerLiter || 50;
            const mVol = record.morning || 0;
            const eVol = record.evening || 0;
            const rowCost = (mVol * mRate) + (eVol * eRate);

            return [
                record.date,
                (mVol).toFixed(1),
                `Rs. ${mRate}`,
                (eVol).toFixed(1),
                `Rs. ${eRate}`,
                (record.total || 0).toFixed(1),
                `Rs. ${rowCost.toLocaleString()}`
            ];
        });

        // Build Table
        autoTable(doc, {
            startY: 40,
            head: [['Date', 'Morning (L)', 'M Rate', 'Evening (L)', 'E Rate', 'Total (L)', 'Total Cost']],
            body: tableData,
            foot: [
                ['GRAND TOTAL', '', '', '', '', `${totalMilk.toFixed(1)} L`, `Rs. ${totalRevenue.toLocaleString()}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [107, 70, 193] }, // purple-600
            footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' } // gray-100
        });

        doc.save('govardhan-milk-records.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">{t('milk')} (Farm Total)</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                        <FileText className="w-4 h-4 text-red-500" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => setIsAddMode(!isAddMode)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-dark/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Daily Total
                    </button>
                </div>
            </div>



            {isAddMode && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" required value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-primary-dark focus:border-primary-dark" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Morning (Liters)</label>
                            <input type="number" step="0.1" min="0" value={newEntry.morning} onChange={e => setNewEntry({ ...newEntry, morning: e.target.value })} placeholder="0.0" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Morning Rate (₹/L)</label>
                            <input type="number" step="0.1" min="0" value={newEntry.morningRate} onChange={e => setNewEntry({ ...newEntry, morningRate: e.target.value })} placeholder="50" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Evening (Liters)</label>
                            <input type="number" step="0.1" min="0" value={newEntry.evening} onChange={e => setNewEntry({ ...newEntry, evening: e.target.value })} placeholder="0.0" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Evening Rate (₹/L)</label>
                            <input type="number" step="0.1" min="0" value={newEntry.eveningRate} onChange={e => setNewEntry({ ...newEntry, eveningRate: e.target.value })} placeholder="50" className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                        </div>

                        <div className="lg:col-span-5 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAddMode(false)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                            <button type="button" onClick={handleSaveEntry} className="px-6 py-2.5 bg-primary text-primary-dark font-bold hover:bg-primary/80 rounded-xl transition-colors">Save Farm Total</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Record Type</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Morning (L)</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">M Rate (₹)</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Evening (L)</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">E Rate (₹)</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Total (L)</th>
                                <th className="py-3 px-4 text-sm font-semibold text-primary-dark text-right">Total Cost (₹)</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.length === 0 ? (
                                <tr><td colSpan={9} className="py-8 text-center text-gray-500">No milk records found.</td></tr>
                            ) : records.map(record => {
                                const mRate = record.morningRate || record.ratePerLiter || 50;
                                const eRate = record.eveningRate || record.ratePerLiter || 50;
                                const mVol = record.morning || 0;
                                const eVol = record.evening || 0;
                                const rowCost = (mVol * mRate) + (eVol * eRate);
                                return (
                                    <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{record.date}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-900">{record.cowName || 'All Cows (Farm Total)'}</div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600 text-right">{mVol.toFixed(1)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 text-right">₹{mRate}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 text-right">{eVol.toFixed(1)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600 text-right">₹{eRate}</td>
                                        <td className="py-3 px-4 text-sm text-primary-dark font-bold text-right bg-primary/5">{(record.total || 0).toFixed(1)}</td>
                                        <td className="py-3 px-4 text-sm text-green-700 font-bold text-right bg-green-50/50">₹{rowCost.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-center">
                                            <button onClick={() => handleDeleteRecord(record._id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete record">
                                                <Trash2 className="w-5 h-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                            <tr>
                                <td colSpan={6} className="py-4 px-4 text-right font-bold text-gray-700">GRAND TOTAL:</td>
                                <td className="py-4 px-4 text-right font-black text-primary-dark text-lg bg-primary/10">{totalMilk.toFixed(1)} L</td>
                                <td className="py-4 px-4 text-right font-black text-green-700 text-lg bg-green-100">₹{totalRevenue.toLocaleString()}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Milk;
