import { useState, useCallback } from 'react';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = async (data) => {
    const res = await transactionAPI.create(data);
    return res.data.transaction;
  };

  const updateTransaction = async (id, data) => {
    const res = await transactionAPI.update(id, data);
    return res.data.transaction;
  };

  const deleteTransaction = async (id) => {
    await transactionAPI.delete(id);
  };

  return { transactions, loading, pagination, fetchTransactions, createTransaction, updateTransaction, deleteTransaction };
};
