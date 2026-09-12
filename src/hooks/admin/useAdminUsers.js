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
    totalPages: 1,
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
      
      const paginationObj = response?.data?.pagination || response?.pagination || {};
      
      const adminList = Array.isArray(response?.data)
        ? response.data
        : (response?.data?.admins || response?.data?.results || response?.data?.data || []);
      setAdmins(adminList);

      const totalCount =
        paginationObj.total ??
        paginationObj.totalData ??
        paginationObj.totalItems ??
        response?.data?.totalData ??
        response?.data?.total ??
        response?.total ??
        response?.totalCount ??
        adminList.length;

      const calculatedPages =
        paginationObj.totalPages ??
        response?.data?.totalPages ??
        response?.totalPages ??
        (totalCount > 0 ? Math.ceil(totalCount / limit) : 1);

      const currentPageNum =
        paginationObj.currentPage ??
        paginationObj.page ??
        response?.data?.currentPage ??
        page;

      const currentLimitNum =
        paginationObj.limit ??
        paginationObj.pageSize ??
        paginationObj.page ??
        response?.data?.limit ??
        limit;

      setPagination({
        totalData: totalCount,
        totalPages: Math.max(1, calculatedPages),
        currentPage: currentPageNum,
        limit: currentLimitNum,
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
