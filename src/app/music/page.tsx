import { LibraryView } from "@/components/library-view";

export default function MusicPage() {
  return <LibraryView endpoint="/api/tracks?sort=newest&pageSize=50" title="My Music" subtitle="Searchable, filtered, and free from voice message noise." />;
}
