import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, c, i] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getCharts(),
        analyticsAPI.getInsights()
      ]);
      setSummary(s.data);
      setCharts(c.data);
      setInsights(i.data.insights || []);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return { summary, charts, insights, loading, refetch: fetchAll };
};
