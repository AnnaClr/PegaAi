const ImageCard = ({ img, uploading, onRemove }) => (
  <div className="image-card">
    <div className="image-preview-wrapper">
      <img className="image-preview" src={img.preview} alt={`Preview ${img.id}`} />

      {img.status === 'uploading' && (
        <div className="upload-overlay">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${img.progress}%` }} />
          </div>
          <span>{img.progress}%</span>
        </div>
      )}

      {img.status === 'done' && (
        <div className="status-badge success">
          <span>✅</span>
        </div>
      )}

      {img.status === 'error' && (
        <div className="status-badge error">
          <span>❌</span>
        </div>
      )}
    </div>

    <div className="image-info">
      <div>
        {img.file.name.length > 20
          ? img.file.name.slice(0, 20) + '...'
          : img.file.name}
      </div>
      <div>{(img.file.size / 1024 / 1024).toFixed(2)} MB</div>
    </div>

    {img.status !== 'uploading' && (
      <button type="button" onClick={() => onRemove(img.id)} disabled={uploading}>
        ✕
      </button>
    )}
  </div>
);

export default ImageCard;
