import api from "../../utils/axios";

async function getProduct(id) {
  try {
    const response = await api.get(`/products?product_id=eq.${id}`);
    const product = response.data?.[0] ?? null;
    if (!product) return null;
    if (product.category_id) {
      const category = await getCategory(product.category_id);
      product.category = category?.name ?? null;
    } else {
      product.category = null;
    }
    return product;
  } catch (error) {
    console.error(
      "Erro ao buscar produto:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function getProductImages(productId) {
  try {
    const response = await api.get(
      `/product_images?product_id=eq.${productId}`,
    );
    return response.data || [];
  } catch (error) {
    console.error(
      "Erro ao buscar imagens do produto:",
      error.response?.data || error.message,
    );
    return [];
  }
}

async function getCategory(id) {
  try {
    const response = await api.get(`/categories?category_id=eq.${id}`);
    return response.data?.[0] ?? null;
  } catch (error) {
    console.error(
      "Erro ao buscar categoria:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function getProductOwner(userId) {
  try {
    const response = await api.get(`/users?user_id=eq.${userId}`);
    return response.data?.[0] ?? null;
  } catch (error) {
    console.error(
      "Erro ao buscar dono do produto:",
      error.response?.data || error.message,
    );
    return null;
  }
}

export { getProduct, getProductImages, getCategory, getProductOwner };