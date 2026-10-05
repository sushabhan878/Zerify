'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
  required?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Campaign Cover / Product Showcase Image',
  helperText = 'SVG, PNG, JPG or WEBP (Max 10MB). Uploads directly to Cloudinary CDN.',
  className = '',
  required = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size exceeds 10MB limit.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/file-upload/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        throw new Error(msg || 'Failed to upload image to Cloudinary');
      }

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        throw new Error('No URL returned from upload server');
      }
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
          {label} {required && <span className="text-pink-400">*</span>}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        /* Preview Card */
        <div className="relative group rounded-2xl overflow-hidden border border-purple-400/30 bg-slate-900/90 backdrop-blur-md p-3 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-slate-950 border border-white/10 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded campaign cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 w-full space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Uploaded to Cloudinary CDN</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md font-mono">
              {value}
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-purple-200 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? 'border-purple-400 bg-purple-500/10 scale-[0.99]'
              : 'border-purple-400/20 bg-slate-900/60 hover:bg-slate-900/90 hover:border-purple-400/40'
          }`}
        >
          {isUploading ? (
            <div className="py-4 flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <span className="text-xs font-bold text-purple-200">
                Uploading image to Cloudinary...
              </span>
              <span className="text-[10px] text-slate-400">
                Optimizing and storing on CDN
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(192,132,252,0.15)]">
                <UploadCloud className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div>
                <span className="text-xs font-bold text-white block">
                  Click to upload <span className="text-purple-300">or drag and drop</span>
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {helperText}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
