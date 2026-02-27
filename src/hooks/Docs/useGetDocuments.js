import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";
import { useNavigate } from "react-router-dom";

const useGetDocuments = (search, status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDone, setBulkDone] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalActiveDocs: 0,
    totalInactiveDocs: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllDocuments = async () => {
    setLoading(true);

    try {
      const response = await api.getAllDocs(search, status, page, limit);
      setDocs(response.data.documents || []);
      setVehicles(response.data.vehicles || []);
      setStats(response.data.stats);
      setTotalPages(response.pagination.totalPages);
      setTotalData(response.pagination.totalItems);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  const bulkRespond = async (
    documents = [],
    vehicles = [],
    status,
    reason = null,
  ) => {
    setBulkLoading(true);

    try {
      const formattedDocs = documents.map((doc) => ({
        id: doc._id,
        status,
        rejectReason: status === "rejected" ? reason : null,
      }));

      const formattedVehicles = vehicles.map((vehicle) => ({
        id: vehicle._id,
        status,
        rejectReason: status === "rejected" ? reason : null,
      }));

      await api.updateDocs(formattedDocs, formattedVehicles);

      setBulkDone(status);
      getAllDocuments();
      navigate("/user-management");
    } catch (err) {
      handleError(err);
    } finally {
      setBulkLoading(false);
    }
  };
  useEffect(() => {
    getAllDocuments();
  }, [page, limit, search, status]);

  return {
    loading,
    docs,
    vehicles,
    totalPages,
    totalData,
    stats,
    getAllDocuments,
    bulkDone,
    bulkRespond,
    bulkLoading,
  };
};

export default useGetDocuments;
