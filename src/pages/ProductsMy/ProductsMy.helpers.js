import api from "../../utils/axios";

async function getMyProducts(userId) {
  try {
    const response = await api.get(`/products?user_id=eq.${userId}`);
    const products = response.data ?? [];

    // For each product, load images from product_images and attach first image
    await Promise.all(
      products.map(async (p) => {
        try {
          const id = p.product_id ?? p.id;
          if (!id) {
            p.images = [];
            p.first_image_url = null;
            return;
          }
          const imgs = await api.get(`/product_images?product_id=eq.${id}`);
          p.images = imgs.data ?? [];
          p.first_image_url = p.images?.[0]?.image_url ?? null;
        } catch (err) {
          console.warn(
            "Failed to load product images for id",
            p.product_id ?? p.id,
            err?.message || err,
          );
          p.images = [];
          p.first_image_url = null;
        }
      }),
    );

    return products;
  } catch (error) {
    console.error(
      "Error fetching my products:",
      error.response?.data || error.message || error,
    );
    return [];
  }
}

export { getMyProducts };
