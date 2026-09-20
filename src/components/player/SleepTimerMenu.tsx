import { useState } from "react";
import { Menu, useMenu, type MenuItem } from "@/components/ui/Menu";
import { Button, IconButton, Modal } from "@/components/ui";
import { IconClock } from "@/components/ui/Icons";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { formatTime } from "@/lib/format";

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.4 14.5A8.5 8.5 0 0 1 9.5 3.6a8.5 8.5 0 1 0 10.9 10.9Z" />
    </svg>
  );
}

export function SleepTimerButton({ label = "Sleep timer" }: { label?: string }) {
  const player = usePlayer();
  const { toast } = useToast();
  const menu = useMenu();
  const [customOpen, setCustomOpen] = useState(false);
  const [customMins, setCustomMins] = useState(20);

  const active = player.sleepEndsAt !== null || player.sleepTrackEnd;

  const items: MenuItem[] = [
    { label: "15 minutes", onSelect: () => { player.setSleepTimer(15); toast("Sleep timer: 15 min"); } },
    { label: "30 minutes", onSelect: () => { player.setSleepTimer(30); toast("Sleep timer: 30 min"); } },
    { label: "45 minutes", onSelect: () => { player.setSleepTimer(45); toast("Sleep timer: 45 min"); } },
    { label: "60 minutes", onSelect: () => { player.setSleepTimer(60); toast("Sleep timer: 60 min"); } },
    { label: "End of current track", onSelect: () => { player.setSleepAtTrackEnd(); toast("Will stop after this track"); } },
    { label: "Custom…", hint: "min", onSelect: () => setCustomOpen(true), dividerAfter: true },
  ];
  if (active) {
    items.push({ label: "Cancel timer", danger: true, onSelect: () => { player.cancelSleepTimer(); toast("Sleep timer cancelled"); } });
  }

  return (
    <>
      <IconButton
        label={
          player.sleepRemaining !== null
            ? `Sleep timer ${formatTime(player.sleepRemaining)}`
            : player.sleepTrackEnd
              ? "Sleep: end of track"
              : label
        }
        active={active}
        onClick={(e) => menu.openFromEvent(e, items, "Sleep timer")}
        className={active ? "text-brand-300" : ""}
      >
        {active ? <Moon /> : <IconClock className="h-[18px] w-[18px]" />}
      </IconButton>
      <Menu state={menu.state} onClose={menu.close} />

      <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Custom sleep timer">
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
              <Moon />
            </span>
            <div className="flex-1">
              <input
                type="number"
                min={1}
                max={240}
                value={customMins}
                onChange={(e) => setCustomMins(Number(e.target.value))}
                className="w-28 rounded-xl border border-white/10 bg-ink-900 px-3 py-2 text-center text-xl font-bold text-white outline-none focus:border-brand-400/60"
              />
              <span className="ml-2 text-sm text-white/50">minutes</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 45, 90].map((m) => (
              <Button key={m} variant="outline" size="sm" onClick={() => setCustomMins(m)}>
                {m}
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (customMins >= 1) {
                  player.setSleepTimer(customMins);
                  toast(`Sleep timer: ${customMins} min`);
                }
                setCustomOpen(false);
              }}
            >
              Start timer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

/** Small pill showing remaining sleep time — rendered inside the player bar */
export function SleepChip() {
  const player = usePlayer();
  if (player.sleepRemaining === null && !player.sleepTrackEnd) return null;
  return (
    <span className="flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-brand-200">
      <Moon />
      {player.sleepTrackEnd ? "end of track" : formatTime(player.sleepRemaining ?? 0)}
    </span>
  );
}
