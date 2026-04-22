import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const usePromoCodes = (page = 1, pageSize = 20) => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [redeemedCodesCount, setRedeemedCodesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPromoCodes(page, pageSize);
      setPromoCodes(res.data?.promoCodes || []);
      setRedeemedCodesCount(res.data?.redeemedCodesCount || 0);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalData(res.pagination?.total || 0);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const createPromoCode = async (payload) => {
    setActionLoading(true);
    try {
      await api.createPromoCode(payload);
      handleSuccess("Promo code created successfully");
      await fetchPromoCodes();
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updatePromoCode = async (id, payload) => {
    setActionLoading(true);
    try {
      await api.updatePromoCode(id, payload);
      handleSuccess("Promo code updated successfully");
      await fetchPromoCodes();
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deletePromoCode = async (id) => {
    setActionLoading(true);
    try {
      await api.deletePromoCode(id);
      handleSuccess("Promo code deleted successfully");
      await fetchPromoCodes();
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    promoCodes,
    redeemedCodesCount,
    loading,
    actionLoading,
    totalPages,
    totalData,
    refresh: fetchPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
  };
};

export default usePromoCodes;
