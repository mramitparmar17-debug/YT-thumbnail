import { useState } from "react";
import { api } from "../services/api";

export default function UploadPanel() {
  const [status, setStatus] = useState("Drop Excel file here or click to upload");

  const onChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      setStatus("Processing...");
      const res = await api.post("/upload", form);
      setStatus(`Uploaded ${res.data.file}. Rows: ${res.data.ingestedRows}`);
    } catch {
      setStatus("Upload failed. Please check file format.");
    }
  };

  return (
    <label className="block bg-white border-2 border-dashed border-slate-300 p-8 rounded-xl text-center cursor-pointer hover:border-indigo-400">
      <input className="hidden" type="file" accept=".xls,.xlsx" onChange={onChange} />
      <p className="font-medium">File Upload Section</p>
      <p className="text-sm text-slate-500 mt-2">{status}</p>
    </label>
  );
}
