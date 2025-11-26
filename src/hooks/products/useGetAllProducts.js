import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllProducts = (search, status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalActiveProducts: 0,
    totalInactiveProducts: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllProducts = async () => {
    setLoading(true);

    try {
      const response = await api.getAllProducts(search, status, page, limit);
      setProducts(response.data.products);
      setStats(response.data.stats);
      setTotalPages(response.pagination.totalPages);
      setTotalData(response.pagination.totalItems);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, [page, limit, search, status]);

  return { loading, products, totalPages, totalData, stats, getAllProducts };
};

export default useGetAllProducts;
