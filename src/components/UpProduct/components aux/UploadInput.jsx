const UploadInput = ({ uploading, imageCount, onChange }) => (
  <div className="upload-input">
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={onChange}
      disabled={uploading || imageCount >= 10}
      id="fileInput"
    />
    <label htmlFor="fileInput">
      <div>📁</div>
      <div>
        {imageCount >= 10
          ? 'Limite de 10 imagens atingido'
          : 'Clique para selecionar imagens'}
      </div>
      <div>{imageCount}/10 imagens selecionadas</div>
    </label>
  </div>
);

export default UploadInput;
