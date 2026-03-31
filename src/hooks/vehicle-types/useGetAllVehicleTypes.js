import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllVehicleTypes = (page, limit, search, rideType) => {
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllVehicleTypes = async () => {
    setLoading(true);
    try {
      const response = await api.getAllVehicleTypes(page, limit, search, rideType);
      setVehicleTypes(response.data.result);
      setTotalPages(response.pagination.totalPages);
      setTotalData(response.pagination.total);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllVehicleTypes();
  }, [page, limit, search, rideType]);

  return {
    loading,
    vehicleTypes,
    totalPages,
    totalData,
    getAllVehicleTypes,
  };
};

export default useGetAllVehicleTypes;
