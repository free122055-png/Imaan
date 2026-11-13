import React, { useState, useRef } from 'react';
import { Upload, X, Star, MoveLeft, MoveRight, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxImages?: number;
  aspectRatio?: '1:1' | '21:7' | '16:9';
  targetSizeKb?: number; // 120 for products, 250 for banners
  targetSizeKB?: number;
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  images,
  onChange,
  multiple = false,
  maxFiles = 6,
  maxImages,
  aspectRatio = '1:1',
  targetSizeKb = 120,
  targetSizeKB,
  helperText,
}) => {
  const effectiveMaxFiles = maxImages ?? maxFiles;
  const effectiveTargetSizeKb = targetSizeKB ?? targetSizeKb;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Compress and convert image to WebP using HTML5 Canvas
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Target dimensions based on aspect ratio
          let maxDim = 1000;
          if (aspectRatio === '21:7') maxDim = 1400;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('ইমেজ প্রসেসিং ব্যর্থ হয়েছে।'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Progressive WebP compression to fit targetSizeKb
          let quality = 0.85;
          let dataUrl = canvas.toDataURL('image/webp', quality);

          // Estimate size in KB: (length * 3/4) / 1024
          let approxKb = (dataUrl.length * 0.75) / 1024;
          if (approxKb > targetSizeKb && quality > 0.4) {
            quality = Math.max(0.4, (targetSizeKb / approxKb) * 0.85);
            dataUrl = canvas.toDataURL('image/webp', quality);
          }

          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('ছবি লোড করতে সমস্যা হয়েছে।'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg('');
    setIsProcessing(true);
    setProgress(15);

    try {
      const fileArr = Array.from(files);
      const remainingSlots = multiple ? effectiveMaxFiles - images.length : 1;
      const filesToProcess = fileArr.slice(0, remainingSlots);

      if (filesToProcess.length === 0) {
        setErrorMsg(`সর্বোচ্চ ${effectiveMaxFiles}টি ছবি আপলোড করা যাবে।`);
        setIsProcessing(false);
        return;
      }

      const newUrls: string[] = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        setProgress(Math.round(20 + ((i + 1) / filesToProcess.length) * 75));
        const url = await processImageFile(filesToProcess[i]);
        newUrls.push(url);
      }

      setProgress(100);
      setTimeout(() => {
        if (multiple) {
          onChange([...images, ...newUrls]);
        } else {
          onChange(newUrls);
        }
        setIsProcessing(false);
        setProgress(0);
      }, 300);
    } catch (err: any) {
      console.error('File process error:', err);
      setErrorMsg(err.message || 'ছবি আপলোডে সমস্যা হয়েছে।');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('এই ছবিটি মুছে ফেলতে চান?')) {
      const next = images.filter((_, i) => i !== index);
      onChange(next);
    }
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    onChange([target, ...remaining]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 block">
          {label} {multiple && `(${images.length}/${effectiveMaxFiles})`}
        </label>
        {helperText && <span className="text-[11px] text-gray-500">{helperText}</span>}
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      {(!multiple && images.length === 0) || (multiple && images.length < effectiveMaxFiles) ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 bg-[#FAF7F0]/60 ${
            isDragging
              ? 'border-[#1B4D2B] bg-[#1B4D2B]/5 scale-[0.99]'
              : 'border-[#ECE8DF] hover:border-[#1B4D2B]/40 hover:bg-[#FAF7F0]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-white border border-[#ECE8DF] flex items-center justify-center text-[#1B4D2B] shadow-2xs">
            <Upload className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="text-xs sm:text-sm font-semibold text-gray-800">
            ছবি আপলোড করতে ট্যাপ বা ড্রপ করুন
          </div>
          <p className="text-[11px] text-gray-500">
            গ্যালারি/ক্যামেরা থেকে ফটো বাছাই করুন (স্বয়ংক্রিয়ভাবে WebP ও সর্বোচ্চ {effectiveTargetSizeKb}KB কমপ্রেস হবে)
          </p>

          {isProcessing && (
            <div className="w-full max-w-xs space-y-1 pt-2">
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1B4D2B] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-500 font-medium text-center">
                ছবি অপ্টিমাইজ ও আপলোড হচ্ছে... {progress}%
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative group rounded-xl overflow-hidden border bg-white p-1 shadow-2xs ${
                idx === 0 ? 'border-[#1B4D2B] ring-2 ring-[#1B4D2B]/20' : 'border-[#ECE8DF]'
              }`}
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#FAF7F0] flex items-center justify-center">
                <img src={img} alt={`img-${idx}`} className="w-full h-full object-contain" />
              </div>

              {/* Primary badge */}
              {idx === 0 ? (
                <span className="absolute top-2 left-2 bg-[#1B4D2B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  মূল ছবি
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="absolute top-2 left-2 bg-black/60 hover:bg-[#1B4D2B] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow-xs"
                  title="মূল ছবি হিসেবে সেট করুন"
                >
                  <Star className="w-3 h-3 inline mr-0.5" /> মূল করুন
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 transition opacity-80 group-hover:opacity-100"
                title="মুছে ফেলুন"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Reorder controls for multiple images */}
              {multiple && images.length > 1 && (
                <div className="flex items-center justify-between pt-1 px-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'left')}
                    className="p-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-20"
                    title="বামে সরান"
                  >
                    <MoveLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-gray-400 font-bold">{idx + 1}</span>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, 'right')}
                    className="p-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-20"
                    title="ডানে সরান"
                  >
                    <MoveRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
