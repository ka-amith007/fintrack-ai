import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Investment', 'Other'];
const CATEGORIES_EXPENSE = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const CATEGORY_ICONS = {
  Food: '🍔', Travel: '✈️', Shopping: '🛍️', Bills: '📱', Entertainment: '🎬',
  Health: '🏥', Education: '📚', Salary: '💼', Investment: '📈', Freelance: '💻', Other: '📌'
};

const defaultForm = {
  title: '', amount: '', type: 'expense', category: 'Food',
  date: format(new Date(), 'yyyy-MM-dd'), notes: ''
};

export const TransactionModal = ({ isOpen, onClose, onSave, editData = null }) => {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title,
        amount: editData.amount,
        type: editData.type,
        category: editData.category,
        date: format(new Date(editData.date), 'yyyy-MM-dd'),
        notes: editData.notes || ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form, editData?._id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const categories = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="card w-full max-w-md p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-lg text-white">
                {editData ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                {['expense', 'income'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(p => ({
                      ...p,
                      type: t,
                      category: t === 'income' ? 'Salary' : 'Food'
                    }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      form.type === t
                        ? t === 'income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Zomato order, Monthly salary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (₹)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className="input-field"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="input-field appearance-none pr-8 cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="input-field"
                  placeholder="Any additional details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 justify-center"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : editData ? 'Update' : 'Add Transaction'
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;
