import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { scanImage } from "./api";

interface Props { onNav: (tab: string) => void; }

const SCAN_STEPS = ["Detecting objects with YOLOv8…", "Reading expiry dates with OCR…", "Classifying with Gemini AI…", "Updating your fridge inventory…"];

export default function ScannerView({ onNav }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userLabel, setUserLabel] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    // Basic client-side validation
    if (f.type && !f.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Image too large — please pick a file under 8MB.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => { setFile(null); setPreview(null); setUserLabel(""); setScanning(false); setProgress(0); setStepIdx(0); };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Choose an image first");
      return;
    }
    const trimmed = userLabel.trim();
    if (trimmed.length > 80) {
      toast.error("Optional name too long (max 80 characters)");
      return;
    }
    setScanning(true); setProgress(5);

    progressRef.current = setInterval(() =>
      setProgress((p) => Math.min(p + Math.random() * 12, 88)), 700
    );
    stepRef.current = setInterval(() =>
      setStepIdx((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 2000
    );

    try {
      await scanImage(file, userLabel);
      clearInterval(progressRef.current!); clearInterval(stepRef.current!);
      setProgress(100);
      toast.success("Item scanned & added to your fridge!");
      setTimeout(() => onNav("inventory"), 900);
    } catch (err: any) {
      clearInterval(progressRef.current!); clearInterval(stepRef.current!);
      setScanning(false); setProgress(0); setStepIdx(0);
      const msg = err.response?.data?.detail ?? "Backend unreachable — make sure it's running on port 8000";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <h1 className="font-display text-[28px] font-bold tracking-tight mb-1.5">Smart Scanner</h1>
      <p className="text-[#8a9bbf] text-sm mb-5">Upload a fridge photo — YOLOv8 + OCR detects items & reads expiry dates automatically.</p>

      <div className="mb-7">
        <label className="text-xs uppercase tracking-wider text-[#6c7aa6] font-semibold mb-2 block">Optional item name</label>
        <input
          value={userLabel}
          onChange={(e) => setUserLabel(e.target.value)}
          placeholder="e.g., Oreo biscuits"
          className="w-full px-4 py-3 rounded-[12px] bg-[rgba(13,21,38,0.6)] border border-[rgba(99,157,255,0.12)] text-[#e8edf8] placeholder-[#4a5878] focus:outline-none focus:border-[rgba(99,157,255,0.3)] transition-colors"
        />
        <p className="text-[11px] text-[#4a5878] mt-2">Leave blank to let the model detect and name it for you.</p>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {progress > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-1 rounded-full bg-[rgba(99,157,255,0.1)] overflow-hidden mb-6"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#00e5a0] to-[#639dff]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone or preview */}
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className={`relative border-2 border-dashed rounded-[28px] p-12 text-center cursor-pointer transition-all ${
              over ? "border-[rgba(99,157,255,0.5)] bg-[rgba(20,32,58,0.6)]" : "border-[rgba(99,157,255,0.2)] bg-[rgba(13,21,38,0.4)]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <span className="text-5xl block mb-4">📷</span>
            </motion.div>
            <p className="font-display text-lg font-semibold mb-2">Drop your fridge photo here</p>
            <p className="text-[#8a9bbf] text-sm mb-5">or click to browse · PNG, JPG, WEBP supported</p>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] border border-[rgba(99,157,255,0.2)] bg-[rgba(99,157,255,0.06)] text-[#639dff] text-sm font-medium hover:bg-[rgba(99,157,255,0.12)] hover:border-[rgba(99,157,255,0.3)] transition-all mx-auto"
              onClick={(e) => { e.stopPropagation(); camRef.current?.click(); }}
            >
              <Camera size={15} /> Use Camera
            </button>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Image preview with scan overlay */}
            <div className="relative rounded-[20px] overflow-hidden mb-5 bg-black">
              <img src={preview} alt="Preview" className="w-full max-h-80 object-contain block" />

              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="scan-line absolute left-0 right-0 h-0.5" />
                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#00e5a0] rounded-tl-sm" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#00e5a0] rounded-tr-sm" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#00e5a0] rounded-bl-sm" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#00e5a0] rounded-br-sm" />
                  {/* Status bar */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-[rgba(0,229,160,0.3)] border-t-[#00e5a0] animate-spin" />
                    <span className="text-[#00e5a0] text-xs font-semibold tracking-widest uppercase">
                      {SCAN_STEPS[stepIdx]}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!scanning && (
                <button
                  onClick={reset}
                  className="flex-1 py-3 rounded-[11px] border border-[rgba(99,157,255,0.15)] bg-transparent text-[#8a9bbf] text-sm hover:text-[#e8edf8] hover:border-[rgba(99,157,255,0.3)] transition-all"
                >
                  Choose Different
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={scanning}
                className="flex-[2] py-3 rounded-[11px] text-sm font-semibold text-[#020d08] bg-gradient-to-br from-[#00e5a0] to-[rgba(0,180,120,0.85)] flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,229,160,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
              >
                {scanning ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-[rgba(2,13,8,0.3)] border-t-[#020d08] animate-spin" /> Analyzing…</>
                ) : (
                  <><Upload size={15} /> Scan This Image</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-7 p-5 rounded-[14px] bg-[rgba(99,157,255,0.04)] border border-[rgba(99,157,255,0.1)]"
      >
        <h3 className="font-display text-sm font-semibold text-[#639dff] mb-3">How it works</h3>
        <div className="flex flex-col gap-3">
          {[
            ["🔍", "YOLOv8 Detection", "Detects grocery items with bounding boxes in milliseconds"],
            ["📖", "OCR Expiry Reading", "Google Vision or PaddleOCR reads dates from packaging text"],
            ["🧠", "Gemini AI", "Categorises, names, and adds items to your fridge inventory"],
          ].map(([emoji, title, desc]) => (
            <div key={title} className="flex gap-3 items-start">
              <span className="text-base flex-shrink-0 mt-0.5">{emoji}</span>
              <div>
                <p className="text-sm font-medium text-[#e8edf8] mb-0.5">{title}</p>
                <p className="text-xs text-[#4a5878]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
