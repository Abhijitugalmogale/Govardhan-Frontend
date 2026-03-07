import React, { useState, useEffect } from 'react';
import { HeartPulse, Search, Baby } from 'lucide-react';
import { api } from '../api';
import { toast } from 'react-toastify';

const calculatePregnancyParams = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const today = new Date();
    const expectedDelivery = new Date(start.getTime() + 283 * 24 * 60 * 60 * 1000);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const daysCompleted = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 283 - daysCompleted;
    const progressText = `${Math.min(100, Math.max(0, Math.round((daysCompleted / 283) * 100)))}%`;
    const monthsCompleted = Math.floor(daysCompleted / 30.44); // Average days in month
    const remainingDaysInMonth = Math.floor(daysCompleted % 30.44);
    return {
        expectedDelivery: expectedDelivery.toLocaleDateString(),
        daysCompleted,
        monthsCompleted,
        remainingDaysInMonth,
        daysRemaining: Math.max(0, daysRemaining),
        progressText
    };
};

const Pregnancy: React.FC = () => {
    const [cows, setCows] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddMode, setIsAddMode] = useState(false);

    // For marking a cow as inseminated
    const [selectedCowId, setSelectedCowId] = useState('');
    const [inseminationDate, setInseminationDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchCows();
    }, []);

    const fetchCows = async () => {
        try {
            const data = await api.get('/cows');
            setCows(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load cows');
        }
    };

    const handleSaveSemenDate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCowId || !inseminationDate) {
            toast.error('Please select a cow and an insemination date');
            return;
        }

        const selectedDate = new Date(inseminationDate);
        const today = new Date();
        if (selectedDate > today) {
            toast.error('Insemination date cannot be in the future!');
            return;
        }

        try {
            await api.put(`/cows/${selectedCowId}`, {
                pregnancyStartDate: inseminationDate,
                status: 'Pregnant'
            });
            toast.success('Insemination date saved and tracking started!');
            setIsAddMode(false);
            setSelectedCowId('');
            setInseminationDate(new Date().toISOString().split('T')[0]);
            fetchCows();
        } catch (error) {
            toast.error('Failed to save insemination date');
        }
    };

    const handleClearPregnancy = async (cowId: string) => {
        try {
            await api.put(`/cows/${cowId}`, {
                pregnancyStartDate: null,
                status: 'Milking' // Revert to a default active status
            });
            toast.success('Pregnancy tracking cleared');
            fetchCows();
        } catch (error) {
            toast.error('Failed to clear pregnancy tracking');
        }
    };

    // Only show cows that have a pregnancy started
    const pregnantCows = cows.filter(cow => cow.pregnancyStartDate != null);

    // Of all pregnant cows, filter by search term
    const displayedCows = pregnantCows.filter(cow =>
        cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cow.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cows available to be marked as pregnant (only cows NOT already pregnant)
    const availableCows = cows.filter(cow => cow.pregnancyStartDate == null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Breeding & Pregnancy</h1>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                >
                    <HeartPulse className="w-5 h-5" />
                    Log Insemination
                </button>
            </div>

            {isAddMode && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <HeartPulse className="text-purple-600" /> New Insemination Record
                    </h2>
                    <form onSubmit={handleSaveSemenDate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6 items-end">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Cow (Tag/Name)</label>
                            <select
                                required
                                value={selectedCowId}
                                onChange={e => setSelectedCowId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="" disabled>-- Choose a Cow --</option>
                                {availableCows.map(c => (
                                    <option key={c._id} value={c._id}>{c.tag} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semen/Insemination Date</label>
                            <input
                                type="date"
                                required
                                max={new Date().toISOString().split('T')[0]}
                                value={inseminationDate}
                                onChange={e => setInseminationDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        <div className="flex justify-start md:justify-end gap-3 mt-4 lg:mt-0">
                            <button type="button" onClick={() => setIsAddMode(false)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 text-white font-bold rounded-xl transition-colors bg-purple-600 hover:bg-purple-700">
                                Start Tracking
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-shadow text-sm"
                        placeholder="Search active pregnancies..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Pregnancy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedCows.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                        <Baby className="w-16 h-16 text-purple-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Pregnancies</h3>
                        <p className="text-gray-500">Log an insemination date to start tracking progress.</p>
                    </div>
                ) : displayedCows.map((cow) => {
                    const pregDetails = calculatePregnancyParams(cow.pregnancyStartDate);

                    return (
                        <div key={cow._id} className="bg-white rounded-2xl p-5 shadow-sm border-2 border-purple-50 hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-100/50 rounded-full blur-2xl z-0 group-hover:bg-purple-200/50 transition-colors"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                                            {cow.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{cow.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{cow.tag}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleClearPregnancy(cow._id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg" title="Clear Pregnancy Status">
                                        End
                                    </button>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-black text-purple-700">{pregDetails.daysCompleted}</span>
                                            <span className="text-xs font-bold text-purple-400 -mt-1">{pregDetails.monthsCompleted} months, {pregDetails.remainingDaysInMonth} days</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-500 mb-1">/ 283 Days</span>
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000" style={{ width: pregDetails.progressText }}></div>
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-500 font-medium bg-gray-50 p-2 rounded-lg">
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 capitalize">Inseminated</span>
                                            <span className="text-gray-700">{new Date(cow.pregnancyStartDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-purple-400 font-semibold mb-0.5">Est. Delivery</span>
                                            <span className="text-purple-700 font-bold">{pregDetails.expectedDelivery}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Pregnancy;
