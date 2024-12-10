import { useEffect, useState } from "react";
import axios from "axios";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Function to fetch all products with pagination
  const fetchAllProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/products/all');
      let { products } = response; // Adjusted to access data correctly
      // Map and parse the product data
      products = products.map((product) => ({
        ...product,
        price: parseFloat(product.price),
        isOnSale: Boolean(product.isOnSale),
        isWholesaleProduct: Boolean(product.isWholesaleProduct),
        stockQuantity: parseInt(product.stockQuantity),
      }));

      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return { data: products, isLoading, isError };
};
