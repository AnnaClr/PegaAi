import ImageCard from './ImageCard';

const ImageGrid = ({ images, uploading, onRemove }) => (
  <div className="image-grid">
    {images.map(img => (
      <ImageCard key={img.id} img={img} uploading={uploading} onRemove={onRemove} />
    ))}
  </div>
);

export default ImageGrid;
