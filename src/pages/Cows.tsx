import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, HeartPulse, Droplets, Trash2 } from 'lucide-react';
import { api } from '../api';
import { toast } from 'react-toastify';
import { differenceInDays } from 'date-fns';

const calculatePregnancyParams = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const today = new Date();
    const expectedDelivery = new Date(start.getTime() + 283 * 24 * 60 * 60 * 1000);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const daysCompleted = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = 283 - daysCompleted;
    const progressText = `${Math.min(100, Math.round((daysCompleted / 283) * 100))}%`;
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

const Cows: React.FC = () => {
    const { t } = useTranslation();
    const [cows, setCows] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isAddMode, setIsAddMode] = useState(false);
    const [newCow, setNewCow] = useState({ tag: '', name: '', breed: '', age: 0, status: 'Milking', pregnancyStartDate: '', milkingStartDate: '' });

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

    const handleAddCow = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean up payload
            const payload = { ...newCow };
            if (payload.status !== 'Pregnant') {
                delete (payload as any).pregnancyStartDate;
            }
            if (payload.status !== 'Milking') {
                delete (payload as any).milkingStartDate;
            }
            await api.post('/cows', payload);
            toast.success('Cow added successfully!');
            setIsAddMode(false);
            setNewCow({ tag: '', name: '', breed: '', age: 0, status: 'Milking', pregnancyStartDate: '', milkingStartDate: '' });
            fetchCows();
        } catch (error) {
            toast.error('Failed to add cow');
        }
    };

    const handleDeleteCow = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
        try {
            await api.delete(`/cows/${id}`);
            toast.success(`${name} deleted successfully!`);
            fetchCows();
        } catch (error) {
            toast.error('Failed to delete cow');
        }
    };

    // Filter cows
    const filteredCows = cows.filter(cow => {
        const matchesSearch = cow.name.toLowerCase().includes(searchTerm.toLowerCase()) || cow.tag.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'All' ? true : cow.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const counts = {
        All: cows.length,
        Pregnant: cows.filter(c => c.status === 'Pregnant').length,
        Milking: cows.filter(c => c.status === 'Milking').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">{t('cows')}</h1>
                <button
                    onClick={() => setIsAddMode(!isAddMode)}
                    className="flex items-center gap-2 bg-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    {t('add_cow')}
                </button>
            </div>

            {isAddMode && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Register New Cow</h2>
                    <form onSubmit={handleAddCow} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tag No.</label>
                            <input type="text" required value={newCow.tag} onChange={e => setNewCow({ ...newCow, tag: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" placeholder="TAG-001" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" required value={newCow.name} onChange={e => setNewCow({ ...newCow, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" placeholder="Ganga" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                            <input type="text" required value={newCow.breed} onChange={e => setNewCow({ ...newCow, breed: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" placeholder="Gir, HF, Jersey..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age (Years)</label>
                            <input type="number" required min="1" value={newCow.age} onChange={e => setNewCow({ ...newCow, age: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={newCow.status} onChange={e => setNewCow({ ...newCow, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white">
                                <option value="Milking">Milking</option>
                                <option value="Dry">Dry</option>
                                <option value="Pregnant">Pregnant</option>
                                <option value="Heifer">Heifer</option>
                            </select>
                        </div>

                        {newCow.status === 'Pregnant' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Start Date</label>
                                <input type="date" required={newCow.status === 'Pregnant'} value={newCow.pregnancyStartDate} onChange={e => setNewCow({ ...newCow, pregnancyStartDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                            </div>
                        )}

                        {newCow.status === 'Milking' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Milking Start Date</label>
                                <input type="date" required={newCow.status === 'Milking'} value={newCow.milkingStartDate} onChange={e => setNewCow({ ...newCow, milkingStartDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl" />
                            </div>
                        )}

                        <div className="md:col-span-full flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAddMode(false)} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 text-white font-bold rounded-xl transition-colors bg-green-600 hover:bg-green-700">
                                Save Cow Record
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-primary-dark focus:border-primary-dark transition-shadow text-sm"
                        placeholder="Search by name or tag..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                    <button onClick={() => setActiveFilter('All')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All ({counts.All})</button>
                    <button onClick={() => setActiveFilter('Pregnant')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'Pregnant' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>Pregnant ({counts.Pregnant})</button>
                    <button onClick={() => setActiveFilter('Milking')} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'Milking' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>Milking ({counts.Milking})</button>
                </div>
            </div>

            {/* Cows Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCows.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">No cows found in this category.</div>
                ) : filteredCows.map((cow) => {
                    const isPregnant = cow.status === 'Pregnant' && cow.pregnancyStartDate;
                    let pregDetails = null;
                    if (isPregnant) {
                        pregDetails = calculatePregnancyParams(cow.pregnancyStartDate);
                    }

                    return (
                        <div key={cow._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl z-0 group-hover:bg-primary/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-gray-600 font-bold text-lg">
                                            {cow.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{cow.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono">{cow.tag}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleDeleteCow(cow._id, cow.name)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete Cow">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Breed</p>
                                        <p className="text-sm font-semibold text-gray-800">{cow.breed}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Age</p>
                                        <p className="text-sm font-semibold text-gray-800">{cow.age} Years</p>
                                    </div>
                                </div>

                                {isPregnant && pregDetails ? (
                                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-xs uppercase tracking-wide">
                                                <HeartPulse className="w-4 h-4" />
                                                Pregnant
                                            </div>
                                            <span className="text-xs font-bold text-purple-800">{pregDetails.daysRemaining} days left</span>
                                        </div>
                                        <div className="w-full bg-purple-200 rounded-full h-2 mb-2 overflow-hidden">
                                            <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000" style={{ width: pregDetails.progressText }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-purple-600 font-medium">
                                            <span>Start: {new Date(cow.pregnancyStartDate).toLocaleDateString()}</span>
                                            <span>Est. Del: {pregDetails.expectedDelivery}</span>
                                        </div>
                                    </div>
                                ) : cow.status === 'Milking' && cow.milkingStartDate ? (
                                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex flex-col justify-center h-[88px]">
                                        <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs uppercase tracking-wide mb-1">
                                            <Droplets className="w-4 h-4" />
                                            Milking Active
                                        </div>
                                        <div className="text-xl font-bold text-blue-800">
                                            {differenceInDays(new Date(), new Date(cow.milkingStartDate))} <span className="text-sm font-medium text-blue-600">days completed</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-center border border-gray-100 h-[88px]">
                                        <span className="text-gray-700 font-semibold text-sm">Status: {cow.status}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Cows;
