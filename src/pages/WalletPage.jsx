// src/pages/WalletPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWallet,
  fetchWalletHistory,
  fetchWalletSummary,
  fetchSpendHistory,
  createOrder,
  verifyPayment,
  clearWalletError,
} from '@/redux/slices/walletSlice';
import Loader from '@/components/common/Loader';
import { toast } from 'react-toastify';
import { Wallet, PlusCircle, History, BarChart3, ArrowLeft, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const formatBalance = (bal) => {
  const num = typeof bal === 'number' ? bal : parseFloat(bal);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const WalletPage = () => {
  const dispatch = useDispatch();
  const {
    balance,
    transactions,
    summary,
    spendHistory,
    loading,
    error,
  } = useSelector((state) => state.wallet);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('balance');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWallet());
      dispatch(fetchWalletHistory());
      dispatch(fetchWalletSummary());
      dispatch(fetchSpendHistory());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearWalletError());
    }
  }, [error, dispatch]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setAdding(true);
    try {
      const orderData = await dispatch(createOrder(numAmount)).unwrap();
      const { order_id, amount: orderAmountInRupees, currency = 'INR' } = orderData;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load');
        setAdding(false);
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Razorpay key missing');
        setAdding(false);
        return;
      }

      const amountInPaise = Math.round(orderAmountInRupees * 100);

      const options = {
        key: razorpayKey,
        amount: amountInPaise,
        currency: currency,
        name: 'AstroTring',
        description: `Add ₹${numAmount} to wallet`,
        order_id: order_id,
        handler: async (response) => {
          try {
            await dispatch(verifyPayment({
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              amount: numAmount,
            })).unwrap();
            toast.success(`₹${numAmount} added to wallet successfully!`);
            setAmount('');
            // Refresh all wallet data
            dispatch(fetchWallet());
            dispatch(fetchWalletHistory());
            dispatch(fetchWalletSummary());
            dispatch(fetchSpendHistory());
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#ea580c' },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err || 'Something went wrong');
    } finally {
      setAdding(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your wallet.</p>
      </div>
    );
  }

  if (loading && !balance && !adding) return <Loader data="Loading wallet..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-amber-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-6 h-6" /> My Wallet
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('balance')}
              className={`flex-1 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'balance'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="w-4 h-4 inline mr-1" /> History
            </button>
            <button
              onClick={() => setActiveTab('spendHistory')}
              className={`flex-1 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'spendHistory'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingDown className="w-4 h-4 inline mr-1" /> Spend History
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'text-amber-600 border-b-2 border-amber-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" /> Summary
            </button>
          </div>

          <div className="p-6">
            {/* Balance Tab */}
            {activeTab === 'balance' && (
              <>
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500">Available Balance</p>
                  <p className="text-4xl font-bold text-amber-600">
                    ₹{formatBalance(balance)}
                  </p>
                </div>
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4">Add Money</h2>
                  <form onSubmit={handleAddMoney} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      min="1"
                      step="1"
                      required
                    />
                    <button
                      type="submit"
                      disabled={adding || loading}
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {adding ? 'Processing...' : <><PlusCircle className="w-4 h-4" /> Add Money</>}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* History Tab (all transactions) */}
            {activeTab === 'history' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions yet.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.map((tx, idx) => (
                      <div key={idx} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="font-medium flex flex-col sm:flex-row sm:justify-center sm:items-center sm:gap-1">{tx.description || 'Wallet transaction'} <p className='text-xs text-gray-600'> ({tx.note})</p> </p>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className={`font-semibold ${tx.type === "credit" ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === "credit" ? `+₹${formatBalance(tx.amount)}` : `-₹${formatBalance(Math.abs(tx.amount))}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Spend History Tab (only debits) */}
            {activeTab === 'spendHistory' && (
              <>
                <h2 className="text-lg font-semibold mb-4">Spend History (Debits)</h2>
                {spendHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No spend transactions yet.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {spendHistory.map((tx, idx) => (
                      <div key={idx} className="flex justify-between border-b pb-2">
                        <div>
                          <p className="font-medium flex flex-col sm:flex-row sm:justify-center sm:items-center sm:gap-1">{tx.description || 'Spent on order'} <p className='text-xs text-gray-600'>({tx?.note})</p> </p>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="font-semibold text-red-600">
                          -₹{formatBalance(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && summary && (
              <>
                <h2 className="text-lg font-semibold mb-4">Wallet Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Credits</span>
                    <span className="font-semibold text-green-600">
                      ₹{formatBalance(summary.total_added || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Refunds</span>
                    <span className="font-semibold text-red-600">
                      ₹{formatBalance(summary.total_refunded || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-red-600">
                      ₹{formatBalance(summary.total_spent || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-gray-800">Net Balance</span>
                    <span className="font-bold text-amber-600 text-lg">
                      ₹{formatBalance(balance)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        onClick={() => navigate('/')}
        className="flex items-center justify-center gap-2 text-amber-600 mt-4 hover:underline mb-6 text-center cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </div>
    </div>
  );
};

export default WalletPage;