export type Track = {
  id: string;
  ownerUserId: string;
  sourceType: "upload" | "forwarded_from_bot_chat" | "manual";
  telegramFileId: string | null;
  telegramUniqueFileId: string | null;
  fileStorageKey: string;
  fileUrl: string;
  title: string;
  artist: string;
  album: string | null;
  durationSec: number | null;
  mimeType: string;
  fileSize: number;
  coverImageUrl: string | null;
  lyrics: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Playlist = {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
};

export type PlaylistDetail = Playlist & {
  items: Array<{
    playlistId: string;
    trackId: string;
    position: number;
    addedAt: string;
    track: Track;
  }>;
};

export type MeResponse = {
  user: {
    id: string;
    telegramUserId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  counters: {
    trackCount: number;
    playlistCount: number;
    favoritesCount: number;
  };
};
