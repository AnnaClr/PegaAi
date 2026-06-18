import { useState } from 'react';
import UploadInput from './UploadInput';
import ImageGrid from './ImageGrid';
import UploadActions from './UploadActions';
import {
  validateFiles,
  createImagePreviews,
  removeImageById,
  clearImagePreviews,
  buildProductPayload,
  createProduct,
  saveImageUrlsToDatabase,
  uploadImageToStorage,
  isAllUploaded,
} from './ImageUploader.helpers';
import './ImageUploader.css';

function ImageUploader({ name, desc, categoryId, price, days, userId = 1 }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [productId, setProductId] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      alert('Limite máximo de 10 imagens por vez');
      e.target.value = '';
      return;
    }

    const invalidFiles = validateFiles(files);
    if (invalidFiles.length > 0) {
      alert('Apenas imagens (JPG, PNG, GIF, WEBP) com até 5MB são permitidas');
      e.target.value = '';
      return;
    }

    setImages(prev => [...prev, ...createImagePreviews(files)]);
    e.target.value = '';
  };

  const removeImage = (id) => {
    setImages(prev => removeImageById(prev, id));
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('Selecione pelo menos uma imagem');
      return;
    }

    const allUploaded = isAllUploaded(images);
    if (allUploaded) {
      alert('Todas as imagens já foram enviadas!');
      return;
    }

    setUploading(true);
    const urls = [];

    try {
      let activeProductId = productId;
      if (!activeProductId) {
        const productPayload = buildProductPayload({ name, desc, categoryId, price, days, userId });
        activeProductId = await createProduct(productPayload);
        setProductId(activeProductId);
      }

      for (const image of images) {
        if (image.status === 'done') continue;

        setImages(prev => prev.map(img =>
          img.id === image.id ? { ...img, status: 'uploading' } : img
        ));

        const { publicUrl } = await uploadImageToStorage(image, (progress) => {
          setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, progress } : img
          ));
        });

        urls.push(publicUrl);

        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, status: 'done', progress: 100, url: publicUrl }
            : img
        ));
      }

      if (urls.length > 0) {
        await saveImageUrlsToDatabase(urls, activeProductId);
        alert(`${urls.length} imagem(ns) enviadas e salvas com sucesso!`);
        console.log('📸 URLs salvas:', urls);
      }

    } catch (error) {
      console.error('❌ Erro:', error.response?.data || error.message);

      setImages(prev => prev.map(img =>
        img.status === 'uploading' ? { ...img, status: 'error' } : img
      ));

      alert('Erro ao processar upload. Verifique o console.');

    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    clearImagePreviews(images);
    setImages([]);
  };

  return (
    <div className="image-uploader">
      <h2>Upload de Imagens</h2>
      <p>
        Máximo 10 imagens (JPG, PNG, GIF, WEBP) - até 5MB cada
      </p>

      <UploadInput uploading={uploading} imageCount={images.length} onChange={handleImageChange} />

      {images.length > 0 && (
        <ImageGrid images={images} uploading={uploading} onRemove={removeImage} />
      )}

      {images.length > 0 && (
        <UploadActions
          uploading={uploading}
          images={images}
          onUpload={handleUpload}
          onClear={clearAll}
        />
      )}
    </div>
  );
}

export default ImageUploader;
