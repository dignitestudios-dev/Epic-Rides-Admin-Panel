import { useState, useEffect, useCallback } from "react";
import { api, isAbortError } from "../../lib/services";
import { handleError } from "../../utils/helpers";
import useRequestGuard from "../global/useRequestGuard";

const useAdminUsers = (page = 1, limit = 10, search = "", role = "", sort = "desc") => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalData: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const beginRequest = useRequestGuard();

  const fetchAdmins = useCallback(async () => {
    const { signal, isCurrent } = beginRequest();
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAdminUsers(page, limit, role, search, sort, {
        signal,
      });
      if (!isCurrent()) return;
      setAdmins(response.data || []);
      setPagination({
        totalData: response.pagination?.totalData || 0,
        totalPages: response.pagination?.totalPages || 0,
        currentPage: response.pagination?.currentPage || page,
        limit: response.pagination?.limit || limit,
      });
    } catch (err) {
      if (!isCurrent() || isAbortError(err)) return;
      setError(err.message || "Failed to fetch admin users");
      handleError(err);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [page, limit, role, search, sort, beginRequest]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return { admins, loading, error, pagination, refresh: fetchAdmins };
};

export default useAdminUsers;
