import { useMemo, useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { useToast } from "@/context/ToastContext";
import { Button, Modal } from "@/components/ui";
import { IconNote, IconPlus } from "@/components/ui/Icons";
import type { Song } from "@/lib/types";
import { cn } from "@/utils/cn";

export default function AddToPlaylistModal({
  open,
  onClose,
  songs,
}: {
  open: boolean;
  onClose: () => void;
  songs: Song[];
}) {
  const { playlists, addToPlaylist, createPlaylist, isPlaylistNameTaken } = useLibrary();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const target = useMemo(() => songs, [songs]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give your playlist a name");
      return;
    }
    if (isPlaylistNameTaken(trimmed)) {
      setError("You already have a playlist with that name");
      return;
    }
    const created = createPlaylist(trimmed, "", target);
    toast(
      target.length
        ? `Created “${created.name}” with ${target.length} song${target.length === 1 ? "" : "s"}`
        : `Created “${created.name}”`,
      { tone: "success" },
    );
    setName("");
    setError(null);
    setCreating(false);
    onClose();
  };

  const handleAdd = (id: string, playlistName: string) => {
    setBusyId(id);
    const added = addToPlaylist(id, target);
    setTimeout(() => setBusyId(null), 300);
    toast(
      added
        ? `Added ${added} song${added === 1 ? "" : "s"} to “${playlistName}”`
        : `Already in “${playlistName}”`,
      { tone: added ? "success" : "default" },
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={target.length > 1 ? `Add ${target.length} songs to playlist` : "Add to playlist"}>
      <div className="space-y-4">
        {!creating ? (
          <Button variant="brand" className="w-full" onClick={() => setCreating(true)}>
            <IconPlus className="h-4 w-4" /> New playlist
          </Button>
        ) : (
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Playlist name"
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-400/60"
            />
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <div className="flex gap-2">
              <Button variant="brand" size="sm" onClick={handleCreate}>
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCreating(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="scroll-area max-h-72 space-y-1 overflow-y-auto pr-1">
          {playlists.length === 0 && !creating && (
            <p className="py-6 text-center text-sm text-white/40">
              No playlists yet — create your first one above.
            </p>
          )}
          {playlists.map((p) => (
            <button
              key={p.id}
              disabled={busyId === p.id}
              onClick={() => handleAdd(p.id, p.name)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.07]",
                busyId === p.id && "opacity-50",
              )}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.06] text-white/50">
                {p.songs[0]?.image ? (
                  <img
                    src={p.songs[0].image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <IconNote className="h-5 w-5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{p.name}</span>
                <span className="block text-xs text-white/40">
                  {p.songs.length} song{p.songs.length === 1 ? "" : "s"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
