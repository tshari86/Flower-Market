
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Trash2 } from 'lucide-react';
import { getFarmers, saveIntake } from '../utils/storage';

const FLOWER_TYPES = [
    'Rose / ரோஜா',
    'Malligai / மல்லிகை',
    'Samanthi / சாமந்தி',
    'Mullai / முல்லை',
    'Arali / அரளி',
    'Tulip / டியூலிப்'
];

const Intake = () => {
    const [farmers, setFarmers] = useState([]);
    const [formData, setFormData] = useState({
        farmerId: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Item Entry State
    const [currentItem, setCurrentItem] = useState({
        flowerType: '',
        quantity: '',
        price: ''
    });

    // Batch State
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState({
        outstanding: 0,
        commission: 0,
        amountPaid: ''
    });

    useEffect(() => {
        setFarmers(getFarmers());
    }, []);

    // Update outstanding when farmer changes
    useEffect(() => {
        if (formData.farmerId) {
            const farmer = farmers.find(f => f.id === formData.farmerId);
            setSummary(prev => ({ ...prev, outstanding: farmer?.balance || 0 }));
        }
    }, [formData.farmerId, farmers]);

    const handleAddItem = (e) => {
        e.preventDefault();
        if (!currentItem.flowerType || !currentItem.quantity || !currentItem.price) return;

        const newItem = {
            id: Date.now(),
            ...currentItem,
            total: parseFloat(currentItem.quantity) * parseFloat(currentItem.price)
        };

        setItems([...items, newItem]);
        setCurrentItem({ flowerType: '', quantity: '', price: '' });
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Calculations
    const totalFlowerCost = items.reduce((sum, item) => sum + item.total, 0);
    const netTotal = totalFlowerCost - parseFloat(summary.commission || 0);
    const balanceAmount = summary.outstanding + netTotal - parseFloat(summary.amountPaid || 0);

    const handleSubmit = () => {
        if (!formData.farmerId || items.length === 0) return;

        const farmer = farmers.find(f => f.id === formData.farmerId);
        const intakeBatch = {
            ...formData,
            farmerName: farmer?.name,
            items,
            summary: {
                totalCost: totalFlowerCost,
                commission: parseFloat(summary.commission || 0),
                netTotal,
                amountPaid: parseFloat(summary.amountPaid || 0),
                newBalance: balanceAmount
            },
            timestamp: new Date().toISOString()
        };

        // Here we would typically update the farmer's balance in storage as well
        // For now, we just save the intake record
        saveIntake(intakeBatch);

        alert('Intake Saved Successfully!');
        // Reset
        setItems([]);
        setSummary({ outstanding: balanceAmount, commission: 0, amountPaid: '' });
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Daily Intake</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-blue-600 mb-1">Log New Flower Intake</h3>
                    <p className="text-sm text-gray-500">Log details of flowers collected from farmers.</p>
                </div>

                {/* Top Form: Farmer & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Farmer</label>
                        <select
                            value={formData.farmerId}
                            onChange={e => setFormData({ ...formData, farmerId: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 bg-white"
                        >
                            <option value="">Select Farmer Name</option>
                            {farmers.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">Collection Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                {/* Middle Form: Add Items */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Flower Type</label>
                            <select
                                value={currentItem.flowerType}
                                onChange={e => setCurrentItem({ ...currentItem, flowerType: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Flower Type</option>
                                {FLOWER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Weight / Quantity</label>
                            <input
                                type="number"
                                placeholder="e.g. 120"
                                value={currentItem.quantity}
                                onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Price</label>
                            <input
                                type="number"
                                placeholder="e.g. 50"
                                value={currentItem.price}
                                onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <button
                                onClick={handleAddItem}
                                className="w-10 h-10 bg-white border border-blue-200 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-50 shadow-sm transition-all mx-auto md:mx-0"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-sm font-bold text-gray-700">மலர்</th>
                                <th className="p-3 text-sm font-bold text-gray-700">எடை</th>
                                <th className="p-3 text-sm font-bold text-gray-700">விலை</th>
                                <th className="p-3 text-sm font-bold text-gray-700">மொத்தம்</th>
                                <th className="p-3 text-sm font-bold text-gray-700">நீக்கு</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-600">{item.flowerType}</td>
                                    <td className="p-3 text-gray-600">{item.quantity}</td>
                                    <td className="p-3 text-gray-600">₹{item.price}</td>
                                    <td className="p-3 font-semibold text-gray-800">₹{item.total.toFixed(2)}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No items added yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Summary Section */}
                <div className="bg-gray-50 rounded-lg p-6 max-w-md border border-gray-100 mb-6">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Outstanding</span>
                            <span className="font-bold text-gray-800">₹{summary.outstanding.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Flower Cost</span>
                            <span className="font-bold text-gray-800">₹{totalFlowerCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Commission</span>
                            <input
                                type="number"
                                value={summary.commission}
                                onChange={e => setSummary({ ...summary, commission: e.target.value })}
                                className="w-20 p-1 text-right text-sm border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total</span>
                            <span className="font-bold text-gray-800">₹{netTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-gray-800">Amount Paid</span>
                            <input
                                type="number"
                                value={summary.amountPaid}
                                onChange={e => setSummary({ ...summary, amountPaid: e.target.value })}
                                className="w-32 p-1.5 text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span className="font-bold text-gray-800">Balance Amount</span>
                            <span className="font-bold text-green-600 text-lg">₹{balanceAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition-all w-full md:w-auto"
                >
                    Submit Intake
                </button>
            </div>
        </div>
    );
};

export default Intake;
