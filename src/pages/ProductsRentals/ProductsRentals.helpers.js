import api from "../../utils/axios";

async function getRentalsByUserId(userId) {
  try {
    const resp = await api.get(`/rentals?user_id=eq.${userId}`);
    const rentals = resp.data ?? [];

    if (!Array.isArray(rentals) || rentals.length === 0) return [];

    // collect unique product ids
    const productIds = Array.from(
      new Set(rentals.map((r) => r.product_id).filter(Boolean)),
    );

    // fetch products and images in parallel
    const [prodResp, imgsResp] = await Promise.all([
      api.get(`/products?product_id=in.(${productIds.join(",")})`),
      api.get(`/product_images?product_id=in.(${productIds.join(",")})`),
    ]);

    const products = prodResp.data ?? [];
    const imgs = imgsResp.data ?? [];

    // map images by product_id
    const imgsByProduct = imgs.reduce((acc, im) => {
      const id = im.product_id ?? im.productId ?? im.product_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(im.image_url ?? im.url ?? im.imageUrl ?? im.image_url);
      return acc;
    }, {});

    // map products by id and attach first image
    const productsById = products.reduce((acc, p) => {
      const id = p.product_id ?? p.id;
      const productImages = imgsByProduct[id] ?? [];
      const firstImage = productImages[0] ?? null;
      acc[id] = {
        ...p,
        images: productImages,
        first_image_url: firstImage,
        image: firstImage ?? p.image ?? p.image_url ?? null,
      };
      return acc;
    }, {});

    // attach product object to rentals
    const mapped = rentals.map((r) => ({
      ...r,
      product: productsById[r.product_id] ?? null,
    }));

    return mapped;
  } catch (error) {
    console.error(
      "Erro ao buscar produtos alugados:",
      error.response?.data || error.message,
    );
    return [];
  }
}

export { getRentalsByUserId };
