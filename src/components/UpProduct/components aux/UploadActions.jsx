const UploadActions = ({ uploading, images, onUpload, onClear }) => {
  const allUploaded = images.every(img => img.status === 'done');
  const pendingCount = images.filter(img => img.status !== 'done').length;

  return (
    <div className="upload-actions">
      <button type="button" onClick={onUpload} disabled={uploading || allUploaded}>
        {uploading
          ? '⏳ Enviando...'
          : allUploaded
            ? '✅ Todas enviadas'
            : `📤 Cadastrar Produto (${pendingCount} imagem(ns))`}
      </button>

      {!uploading && images.some(img => img.status === 'done') && (
        <button type="button" onClick={onClear}>
          🗑️ Limpar todas
        </button>
      )}
    </div>
  );
};

export default UploadActions;
