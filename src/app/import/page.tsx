"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { apiPath } from "@/lib/paths";
import { SectionCard } from "@/components/section-card";

export default function ImportPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [lastError, setLastError] = useState<string>("");

  function handleUpload(file: File) {
    setSelectedFileName(file.name);
    setLastError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(apiPath("/api/tracks/upload"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const payload = (await response.json()) as { track?: { title: string; artist: string }; error?: { message: string } };

      if (!response.ok) {
        const message = payload.error?.message ?? "Upload failed.";
        setLastError(message);
        toast.error(message);
        return;
      }

      setLastError("");
      toast.success(`Imported ${payload.track?.artist ?? "Unknown Artist"} - ${payload.track?.title ?? file.name}`);
    });
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Import" subtitle="Two supported MVP paths: upload inside the Mini App or forward a normal music file to the bot.">
        <div className="mb-4 rounded-2xl bg-black/5 p-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
          <p className="font-medium">Import rules</p>
          <ul className="mt-2 space-y-1">
            <li>Normal music files are accepted: MP3, M4A, AAC, OGG, FLAC.</li>
            <li>Voice messages and video notes are rejected on purpose.</li>
            <li>Duplicates are detected by Telegram file identity or checksum.</li>
          </ul>
        </div>
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-black/20 bg-black/5 px-6 text-center dark:border-white/15 dark:bg-white/5">
          <span className="text-base font-semibold">Upload audio file</span>
          <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Supported: MP3, M4A, AAC, OGG, FLAC
          </span>
          <input
            type="file"
            accept=".mp3,.m4a,.aac,.ogg,.flac,audio/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleUpload(file);
              }
            }}
          />
        </label>
        {selectedFileName ? <p className="mt-3 text-sm text-neutral-500">Selected: {selectedFileName}</p> : null}
        {isPending ? <p className="mt-2 text-sm text-neutral-500">Uploading...</p> : null}
        {lastError ? <p className="mt-2 text-sm text-rose-500">{lastError}</p> : null}
      </SectionCard>
      <SectionCard title="Forward to Bot" subtitle="Open the bot chat, forward a normal music file, and MyMusic will add it automatically.">
        <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <li>1. Open the MyMusic bot in Telegram and tap `/start` if needed.</li>
          <li>2. Forward a Telegram audio track or a supported music document.</li>
          <li>3. The bot confirms success or explains why the media was rejected.</li>
          <li>4. Return to My Music to see the imported track.</li>
        </ol>
      </SectionCard>
    </div>
  );
}
