import React, { useRef, useState } from 'react';

export default function FileDropzone({ label, accept, file, onFileSelected }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const pickFile = () => inputRef.current?.click();

  const handleFiles = (files) => {
    if (!files?.length) return;
    onFileSelected(files[0]);
    setIsDragOver(false);
  };

  return (
    <div
      className={`dropzone ${isDragOver ? 'active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      onClick={pickFile}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden-input"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="dropzone-label">{label}</p>
      <p className="dropzone-subtitle">Drag & drop file here, or click to upload</p>
      {file && <p className="dropzone-file">{file.name}</p>}
    </div>
  );
}
