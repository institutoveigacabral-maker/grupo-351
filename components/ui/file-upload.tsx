"use client";

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // bytes
  maxFiles?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = false,
  onFiles,
  label = "Arraste arquivos ou clique para selecionar",
  description,
  disabled = false,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback(
    (incoming: File[]) => {
      setError(null);

      // Validate size
      const oversized = incoming.find((f) => f.size > maxSize);
      if (oversized) {
        setError(`Arquivo "${oversized.name}" excede o limite de ${formatSize(maxSize)}`);
        return;
      }

      // Validate count
      const total = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
      if (total.length > maxFiles) {
        setError(`Maximo de ${maxFiles} arquivo(s) permitido(s)`);
        return;
      }

      setFiles(total);
      onFiles(total);
    },
    [files, maxSize, maxFiles, multiple, onFiles]
  );

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;

    const dropped = Array.from(e.dataTransfer.files);
    validateAndAdd(dropped);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    validateAndAdd(selected);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFiles(updated);
    setError(null);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer
          ${disabled ? "opacity-50 pointer-events-none bg-gray-50" : ""}
          ${dragOver ? "border-accent bg-accent/[0.03] scale-[1.01]" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}
          ${error ? "border-red-300 bg-red-50/30" : ""}
        `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <Upload className={`w-6 h-6 ${dragOver ? "text-accent" : "text-gray-300"} transition-colors`} />
        <p className="text-sm text-gray-500 text-center">{label}</p>
        {description && <p className="text-xs text-gray-400 text-center">{description}</p>}
        {!description && (
          <p className="text-xs text-gray-400">
            Max {formatSize(maxSize)} por arquivo{multiple ? `, ate ${maxFiles} arquivos` : ""}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500" role="alert">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl"
              >
                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  aria-label={`Remover ${file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
