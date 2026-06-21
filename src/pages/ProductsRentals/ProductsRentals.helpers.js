import api from "../../utils/axios";

async function getRentalsByUserId(userId) {
  try {
    const response = await api.get(`/rentals?user_id=eq.${userId}`);
    const rentals = response.data ?? [];
    if (response.status === 200 && Array.isArray(rentals)) {
      await Promise.all(
        rentals.map(async (rental) => {
          const product = await getProduct(rental.product_id);
          rental.product = product;
        }),
      );
    }
    return rentals;
  } catch (error) {
    console.error(
      "Erro ao buscar produtos alugados:",
      error.response?.data || error.message,
    );
    return [];
  }
}

async function getProduct(id) {
  try {
    const response = await api.get(`/products?product_id=eq.${id}`);
    return response.data?.[0] ?? null;
  } catch (error) {
    console.error(
      "Erro ao buscar produto:",
      error.response?.data || error.message,
    );
    return null;
  }
}

export { getRentalsByUserId, getProduct };
