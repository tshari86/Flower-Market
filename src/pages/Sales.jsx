
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Plus, Trash2, Printer, Save } from 'lucide-react';
import { getBuyers, saveSale, getFarmers } from '../utils/storage';

const FLOWER_TYPES = [
    'Rose / ரோஜா',
    'Malligai / மல்லிகை',
    'Samanthi / சாமந்தி',
    'Mullai / முல்லை',
    'Arali / அரளி',
    'Tulip / டியூலிப்'
];

const Sales = () => {
    const [buyers, setBuyers] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [cart, setCart] = useState([]);
    const [billDetails, setBillDetails] = useState({
        buyerId: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Item entry state
    const [currentItem, setCurrentItem] = useState({
        flowerType: '',
        quantity: '',
        price: '',
        unit: 'Kg'
    });

    useEffect(() => {
        setBuyers(getBuyers());
        setFarmers(getFarmers()); // If we need to link sales to farmers later
    }, []);

    const addItem = (e) => {
        e.preventDefault();
        if (!currentItem.flowerType || !currentItem.quantity || !currentItem.price) return;

        const total = parseFloat(currentItem.quantity) * parseFloat(currentItem.price);
        const newItem = {
            ...currentItem,
            id: Date.now(),
            total
        };

        setCart([...cart, newItem]);
        setCurrentItem({ flowerType: '', quantity: '', price: '', unit: 'Kg' });
    };

    const removeItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const calculateGrandTotal = () => {
        return cart.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSaveBill = () => {
        if (!billDetails.buyerId || cart.length === 0) return;

        const buyer = buyers.find(b => b.id === billDetails.buyerId);
        const saleData = {
            ...billDetails,
            buyerName: buyer?.name || 'Unknown',
            items: cart,
            grandTotal: calculateGrandTotal()
        };

        saveSale(saleData);
        alert('Bill Saved Successfully!');

        // Reset
        setCart([]);
        setBillDetails(prev => ({ ...prev, buyerId: '' }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Billing Form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" size={24} />
                        New Sale / புதிய விற்பனை
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer / வாங்குபவர்</label>
                            <select
                                value={billDetails.buyerId}
                                onChange={e => setBillDetails({ ...billDetails, buyerId: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Buyer...</option>
                                {buyers.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} - {b.location}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date / தேதி</label>
                            <input
                                type="date"
                                value={billDetails.date}
                                onChange={e => setBillDetails({ ...billDetails, date: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Item Entry */}
                    <form onSubmit={addItem} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Flower / பூ</label>
                                <select
                                    value={currentItem.flowerType}
                                    onChange={e => setCurrentItem({ ...currentItem, flowerType: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {FLOWER_TYPES.map(type => (
                                        <option key={type} value={type}>{type.split(' / ')[0]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        value={currentItem.quantity}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-l focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="0"
                                        required
                                    />
                                    <select
                                        value={currentItem.unit}
                                        onChange={e => setCurrentItem({ ...currentItem, unit: e.target.value })}
                                        className="bg-gray-100 border border-l-0 border-gray-300 rounded-r px-2 text-sm outline-none"
                                    >
                                        <option>Kg</option>
                                        <option>Bunch</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Price / விலை</label>
                                <input
                                    type="number"
                                    value={currentItem.price}
                                    onChange={e => setCurrentItem({ ...currentItem, price: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Rate"
                                    required
                                />
                            </div>
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1 text-sm font-medium">
                                <Plus size={16} /> Add
                            </button>
                        </div>
                    </form>
                </div>

                {/* Cart Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between">
                        <span>Current Bill Items</span>
                        <span>{cart.length} Items</span>
                    </div>
                    <div className="overflow-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-white text-gray-500 text-xs uppercase sticky top-0">
                                <tr>
                                    <th className="p-4 border-b">Item</th>
                                    <th className="p-4 border-b text-center">Qty</th>
                                    <th className="p-4 border-b text-right">Price</th>
                                    <th className="p-4 border-b text-right">Total</th>
                                    <th className="p-4 border-b w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {cart.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{item.flowerType}</td>
                                        <td className="p-4 text-center text-gray-600">
                                            {item.quantity} <span className="text-xs text-gray-400">{item.unit}</span>
                                        </td>
                                        <td className="p-4 text-right text-gray-600">₹{item.price}</td>
                                        <td className="p-4 text-right font-bold text-gray-800">₹{item.total.toFixed(2)}</td>
                                        <td className="p-4">
                                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {cart.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-400 italic">
                                            Start adding items to create a bill...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right: Summary & Actions */}
            <div className="lg:col-span-1 flex flex-col h-full gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Grand Total</h3>
                        <div className="text-4xl font-bold text-green-600">
                            ₹{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{calculateGrandTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (0%)</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-dashed">
                            <span>Net Payable</span>
                            <span>₹{calculateGrandTotal().toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveBill}
                        disabled={cart.length === 0 || !billDetails.buyerId}
                        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all ${cart.length > 0 && billDetails.buyerId
                                ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <Save size={20} />
                        Save & Print Bill
                    </button>

                    <button className="w-full py-3 rounded-lg border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <Printer size={20} />
                        Print Preview
                    </button>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">Quick Tips</h4>
                    <ul className="text-sm text-blue-600 space-y-2 list-disc pl-4">
                        <li>Select a buyer first to enable saving.</li>
                        <li>Use "Tab" to move quickly between fields.</li>
                        <li>Double-check rates before adding items.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sales;
