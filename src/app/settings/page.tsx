import { SectionCard } from "@/components/section-card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <SectionCard title="Help" subtitle="How MyMusic works inside Telegram.">
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <li>MyMusic is a Mini App, not a custom Telegram client.</li>
          <li>It imports only the tracks you upload or explicitly forward to the bot.</li>
          <li>Voice messages and video notes are intentionally rejected.</li>
          <li>Open it from the bot menu button, direct link, or the Telegram attachment menu after installation.</li>
        </ul>
      </SectionCard>
      <SectionCard title="Attachment Menu" subtitle="Install MyMusic into the Telegram attachment menu for quicker access.">
        <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <li>1. Open the bot and tap the `Install in 📎` button from `/start`.</li>
          <li>2. Accept the Telegram prompt to add MyMusic to the attachment menu.</li>
          <li>3. Open a supported chat, tap 📎, and choose MyMusic.</li>
        </ol>
      </SectionCard>
      <SectionCard title="Supported Formats" subtitle="Kept intentionally small for a sane MVP.">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">MP3, M4A, AAC, OGG music files, and FLAC. Unsupported documents and Telegram voice notes are excluded.</p>
      </SectionCard>
    </div>
  );
}
