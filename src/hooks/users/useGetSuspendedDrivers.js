import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetSuspendedDrivers = (page, limit, search, suspensionType = "all") => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getSuspendedDrivers(page, limit, suspensionType, search);
      setDrivers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, suspensionType, search]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, loading, totalPages, totalData, refresh: fetchDrivers };
};

export default useGetSuspendedDrivers;
