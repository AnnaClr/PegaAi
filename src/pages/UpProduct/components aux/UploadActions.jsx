const UploadActions = ({ uploading, images, onUpload, onClear }) => {
  const allUploaded = images.every(img => img.status === 'done');

  return (
    <div className="upload-actions">
      <button
        type="button"
        className="primaryBtn"
        onClick={onUpload}
        disabled={uploading || allUploaded}
      >
        {uploading ? '⏳ Enviando...' : 'Cadastrar Produto'}
      </button>

      {!uploading && images.some(img => img.status === 'done') && (
        <button type="button" className="secondaryBtn" onClick={onClear}>
          🗑️ Limpar todas
        </button>
      )}
    </div>
  );
};

export default UploadActions;
