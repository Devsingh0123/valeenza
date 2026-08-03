import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMoneyToWallet, fetchWallet } from '../../redux/slices/walletSlice';
import { toast } from 'react-toastify';

const WalletBalance = () => {
  const dispatch = useDispatch();
  const { balance, loading } = useSelector((state) => state.wallet);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setAdding(true);
    try {
      await dispatch(addMoneyToWallet(amt)).unwrap();
      toast.success(`₹${amt} added to wallet`);
      setAmount('');
      dispatch(fetchWallet()); // refresh balance
    } catch (err) {
      toast.error(err || 'Failed to add money');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Wallet</h3>
      <p className="text-2xl font-bold text-amber-600 mb-3">₹{balance.toLocaleString()}</p>
      <form onSubmit={handleAddMoney} className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="border border-gray-300 rounded px-3 py-1 w-32"
        />
        <button
          type="submit"
          disabled={adding}
          className="bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Money'}
        </button>
      </form>
    </div>
  );
};

export default WalletBalance;