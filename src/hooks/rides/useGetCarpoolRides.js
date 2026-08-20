import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetCarpoolRides = (page, limit, search, status = "", startDate = "", endDate = "") => {
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchRides = useCallback(async () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;

    setLoading(true);
    try {
      const response = await api.getCarpoolRides(page, limit, search, status, startDate, endDate);
      setRides(response.data?.results || []);
      setStats(response.data?.stats || null);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, startDate, endDate]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return { rides, stats, loading, totalPages, totalData, refresh: fetchRides };
};

export default useGetCarpoolRides;
