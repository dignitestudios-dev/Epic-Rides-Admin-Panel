import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError } from "../../utils/helpers";

const useGetUsers = (type, page, limit, search, startDate, endDate) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getUsers(type, page, limit, search, startDate, endDate);
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalData(response.pagination?.total || 0);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [type, page, limit, search, startDate, endDate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    totalPages,
    totalData,
    refresh: fetchUsers,
  };
};

export default useGetUsers;
