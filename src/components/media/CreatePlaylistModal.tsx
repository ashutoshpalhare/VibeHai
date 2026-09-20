import { useEffect, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { useLibrary } from "@/context/LibraryContext";
import { useToast } from "@/context/ToastContext";

export default function CreatePlaylistModal({
  open,
  onClose,
  onCreated,
  initialName = "",
  editId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
  initialName?: string;
  editId?: string;
}) {
  const { createPlaylist, updatePlaylist, isPlaylistNameTaken, getPlaylist } = useLibrary();
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editId) {
      const p = getPlaylist(editId);
      setName(p?.name ?? "");
      setDescription(p?.description ?? "");
    } else {
      setName(initialName);
      setDescription("");
    }
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please name your playlist");
      return;
    }
    if (isPlaylistNameTaken(trimmed, editId)) {
      setError("A playlist with that name already exists");
      return;
    }
    if (editId) {
      updatePlaylist(editId, { name: trimmed, description: description.trim() });
      toast("Playlist updated", { tone: "success" });
    } else {
      const p = createPlaylist(trimmed, description);
      toast(`Created “${p.name}”`, { tone: "success" });
      onCreated?.(p.id);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editId ? "Edit playlist" : "Create playlist"}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Name
          </label>
          <input
            autoFocus
            value={name}
            maxLength={60}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Late night drive"
            className="w-full rounded-xl border border-white/10 bg-ink-900 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-400/60"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Description <span className="text-white/25">(optional)</span>
          </label>
          <textarea
            value={description}
            maxLength={200}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the mood?"
            className="w-full resize-none rounded-xl border border-white/10 bg-ink-900 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-400/60"
          />
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={submit}>
            {editId ? "Save changes" : "Create playlist"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
