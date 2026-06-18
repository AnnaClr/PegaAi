import axios from "axios";
import api from "../../../utils/axios";

const SUPABASE_URL = import.meta.env.VITE_API_URL?.replace(
  /\/rest\/v1\/?$/,
  "",
);
const SUPABASE_KEY = import.meta.env.VITE_API_KEY;

export const supabaseStorage = axios.create({
  baseURL: `${SUPABASE_URL}/storage/v1/object`,
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
});

export const validateFiles = (files) => {
  return files.filter((file) => {
    const isValidType = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ].includes(file.type);
    const isValidSize = file.size <= 5 * 1024 * 1024;
    return !isValidType || !isValidSize;
  });
};

export const createImagePreviews = (files) => {
  return files.map((file) => ({
    file,
    id: Date.now() + Math.random(),
    preview: URL.createObjectURL(file),
    progress: 0,
    status: "pending",
  }));
};

export const removeImageById = (images, id) => {
  const removed = images.find((img) => img.id === id);
  if (removed) {
    URL.revokeObjectURL(removed.preview);
  }
  return images.filter((img) => img.id !== id);
};

export const clearImagePreviews = (images) => {
  images.forEach((img) => URL.revokeObjectURL(img.preview));
};

export const buildProductPayload = ({
  name,
  desc,
  categoryId,
  price,
  days,
  userId = 1,
}) => {
  const parsedPrice = Number(String(price).replace(",", "."));
  const parsedCategoryId = Number(categoryId);
  const parsedDays = Number(days) || 30;

  if (!name?.trim()) {
    throw new Error("Nome do produto não informado");
  }
  if (!parsedPrice || Number.isNaN(parsedPrice)) {
    throw new Error("Preço inválido");
  }
  if (!parsedCategoryId || Number.isNaN(parsedCategoryId)) {
    throw new Error("Categoria inválida");
  }

  return {
    name: name.trim(),
    description: desc?.trim() ?? "",
    price_per_day: parsedPrice,
    status: "disponível",
    max_days: parsedDays,
    user_id: Number(userId),
    category_id: parsedCategoryId,
  };
};

export const createProduct = async (productPayload) => {
  const response = await api.post("/products", productPayload, {
    headers: {
      Prefer: "return=representation",
    },
  });

  const inserted = response.data?.[0];
  if (!inserted?.product_id) {
    throw new Error("Falha ao criar produto");
  }

  return inserted.product_id;
};

export const saveImageUrlsToDatabase = async (urls, productId) => {
  const imageRecords = urls.map((url) => ({
    product_id: productId,
    image_url: url,
  }));

  const response = await api.post("/product_images", imageRecords, {
    headers: {
      Prefer: "return=representation",
    },
  });

  return response.data;
};

export const getPublicStorageUrl = (filePath) => {
  return `${SUPABASE_URL}/storage/v1/object/public/products/${filePath}`;
};

export const uploadImageToStorage = async (image, onProgress) => {
  const fileExt = image.file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36)}.${fileExt}`;
  const filePath = `${fileName}`;

  const response = await supabaseStorage.post(
    `/products/${filePath}`,
    image.file,
    {
      headers: {
        "Content-Type": image.file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (typeof onProgress === "function") {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    },
  );

  if (response.status !== 200 && response.status !== 201) {
    throw new Error("Upload falhou");
  }

  return {
    publicUrl: getPublicStorageUrl(filePath),
    filePath,
  };
};

export const isAllUploaded = (images) =>
  images.every((img) => img.status === "done");
