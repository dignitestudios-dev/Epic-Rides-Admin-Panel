import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetRewardedBalanceHistory = (page, limit, userType, search, startDate = "", endDate = "", sortBy = "createdAt", order = "desc") => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchHistory = useCallback(async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;

    setLoading(true);
    try {
      const response = await api.getRewardedBalanceHistory(page, limit, userType, search, startDate, endDate, sortBy, order);
      
      // Handle the case where the API might return the data array directly or wrapped in data/results
      const dataArr = Array.isArray(response?.data) 
        ? response.data 
        : response?.data?.results || response?.data?.data || [];
        
      setHistory(dataArr);
      setStats(response.data?.stats || null);
      
      const pagination = response?.pagination || response?.data?.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setTotalData(pagination.total || dataArr.length);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, userType, search, startDate, endDate, sortBy, order]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, stats, loading, totalPages, totalData, refresh: fetchHistory };
};

export default useGetRewardedBalanceHistory;
