"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  FileImage,
  Film,
  Mic,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Evidence = {
  PK_evidence: number;
  fileType: string;
  fileUrl: string;
  description: string | null;
  createdAt: string;
};

export default function EmergencyEvidencePage() {
  const params = useParams();
  const emergencyCode = params.emergencyCode as string;
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [emergencyId, setEmergencyId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/citizen/emergencies")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.emergencies || []).find(
          (e: { emergencyCode: string }) => e.emergencyCode === emergencyCode,
        );
        if (found) {
          setEmergencyId(found.PK_emergency);
          return fetch(`/api/citizen/emergencies/${found.PK_emergency}/evidence`);
        }
        return null;
      })
      .then((res) => res?.json())
      .then((data) => {
        if (data?.evidences) setEvidences(data.evidences);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [emergencyCode]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!emergencyId) return;

      setUploading(true);
      try {
        // In a real app, upload to storage first, then save URL
        // For now, create a local object URL
        const fileUrl = URL.createObjectURL(file);
        const fileType = file.type.startsWith("image/")
          ? "IMAGE"
          : file.type.startsWith("video/")
            ? "VIDEO"
            : file.type.startsWith("audio/")
              ? "AUDIO"
              : "DOCUMENT";

        const res = await fetch(
          `/api/citizen/emergencies/${emergencyId}/evidence`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileType,
              fileUrl,
              description: file.name,
            }),
          },
        );

        if (res.ok) {
          const evidence = await res.json();
          setEvidences((prev) => [evidence, ...prev]);
        }
      } catch {
        // ignore
      } finally {
        setUploading(false);
      }
    },
    [emergencyId],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload],
  );

  const getIcon = (fileType: string) => {
    switch (fileType) {
      case "IMAGE":
        return <FileImage className="size-5" />;
      case "VIDEO":
        return <Film className="size-5" />;
      case "AUDIO":
        return <Mic className="size-5" />;
      default:
        return <FileImage className="size-5" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href={`/citizen/emergency/${emergencyCode}`}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Evidencias</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {emergencyCode}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Upload buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Camera className="size-6 text-red-500" />
            )}
            <span className="text-xs">Foto</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Film className="size-6 text-blue-500" />
            <span className="text-xs">Video</span>
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Evidence list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : evidences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileImage className="size-12 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              No hay evidencias aún
            </p>
            <p className="text-xs text-muted-foreground">
              Toma una foto o video para adjuntar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {evidences.map((evidence) => (
              <div
                key={evidence.PK_evidence}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  {getIcon(evidence.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {evidence.description || evidence.fileType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(evidence.createdAt).toLocaleString("es-BO")}
                  </p>
                </div>
                {evidence.fileUrl && (
                  <a
                    href={evidence.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-500 font-medium"
                  >
                    Ver
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
