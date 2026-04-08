
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, User, Folder, ChevronDown } from 'lucide-react';
import { getFarmers, saveFarmer, deleteFarmer } from '../utils/storage';

const Farmer = () => {
    const [farmers, setFarmers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFarmer, setCurrentFarmer] = useState({ id: '', name: '', contact: '', location: '' });

    useEffect(() => {
        setFarmers(getFarmers());
    }, []);

    const handleOpenModal = (farmer = null) => {
        if (farmer) {
            setCurrentFarmer(farmer);
        } else {
            setCurrentFarmer({ id: '', name: '', contact: '', location: '', balance: 0 });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const updatedFarmers = saveFarmer(currentFarmer);
        setFarmers(updatedFarmers);
        setIsModalOpen(false);
    };

    const filteredFarmers = farmers.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.contact.includes(searchTerm)
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-700">Payment Dues</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-green-600 mb-1">Payment Dues</h3>
                        <p className="text-sm text-gray-500">View and settle monthly payments for farmers.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="btn bg-blue-600 hover:bg-blue-700 text-white px-6">
                        New +
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={16} />
                        <input
                            type="text"
                            placeholder="விவசாயி பெயரை"
                            className="pl-10 pr-4 py-2 text-sm w-64 border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-4 font-bold text-gray-700 w-1/3">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-orange-500" />
                                        <span className="text-sm text-gray-800">விவசாயி</span>
                                    </div>
                                </th>
                                <th className="py-4 font-bold text-gray-700 w-1/3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-orange-500">💰</span>
                                        <span className="text-sm text-gray-800">நிலுவைத் தொகை</span>
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </div>
                                </th>
                                <th className="py-4 font-bold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Folder size={16} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm text-gray-800">Ledger</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredFarmers.map((farmer) => (
                                <tr key={farmer.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-800" />
                                            <span className="font-medium text-blue-600 text-sm">{farmer.name}</span>
                                            <button
                                                onClick={() => handleOpenModal(farmer)}
                                                className="ml-2 text-orange-400 hover:text-orange-600 transition-colors"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold text-sm text-gray-800">
                                        {formatCurrency(farmer.balance)}
                                    </td>
                                    <td className="py-4">
                                        <button className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-sky-700 rounded border border-sky-200 text-xs font-medium hover:bg-sky-200 transition-colors">
                                            <Folder size={14} className="text-yellow-400 fill-yellow-400" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredFarmers.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-gray-400">
                                        No farmers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20">
                    <div className="bg-white rounded-lg w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-medium text-green-600">புதிய விவசாயி சேர்க்கை</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    👨‍🌾 Farmer Name / விவசாயி பெயர்
                                </label>
                                <input
                                    type="text"
                                    value={currentFarmer.name}
                                    onChange={e => setCurrentFarmer({ ...currentFarmer, name: e.target.value })}
                                    required
                                    placeholder="Enter Farmer name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="flex justify-start gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 font-medium text-sm transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gray-100 text-gray-400 border border-gray-200 rounded cursor-not-allowed font-medium text-sm"
                                    disabled={!currentFarmer.name}
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Farmer;
