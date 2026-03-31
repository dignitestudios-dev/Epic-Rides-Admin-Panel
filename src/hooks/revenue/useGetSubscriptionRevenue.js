import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetSubscriptionRevenue = (page, limit, search, startDate, endDate, status) => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getSubscriptionRevenue(page, limit, search, startDate, endDate, status);
      setData(response.data?.results || []);
      setStats(response.data?.stats || null);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, startDate, endDate, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    stats,
    loading,
    totalPages,
    totalData,
    refresh: fetchData,
  };
};

export default useGetSubscriptionRevenue;
