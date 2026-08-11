import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/services";
import { handleError, handleSuccess } from "../../utils/helpers";

const useRideRatesActions = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const getRideRates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getRideRates();
      const payload = response.data?.data || response.data || { rates: [], peakWindows: [] };
      setData(payload);
      return payload;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRideRate = async (rideType, payload) => {
    setLoading(true);
    try {
      const response = await api.updateRideRate(rideType, payload);
      handleSuccess(`${rideType.charAt(0).toUpperCase() + rideType.slice(1)} ride rate updated successfully`);
      await getRideRates();
      return response.data?.data || response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRideRates();
  }, [getRideRates]);

  return {
    loading,
    data,
    getRideRates,
    updateRideRate,
  };
};

export default useRideRatesActions;
