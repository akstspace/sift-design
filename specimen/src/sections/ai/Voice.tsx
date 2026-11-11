import { useEffect, useRef, useState } from "react";
import { Button } from "@sift-design/ui/button";
import {
  MicSelector,
  MicSelectorContent,
  MicSelectorEmpty,
  MicSelectorInput,
  MicSelectorItem,
  MicSelectorLabel,
  MicSelectorList,
  MicSelectorTrigger,
  MicSelectorValue,
} from "@sift-design/ui/ai/mic-selector";
import {
  VoiceSelector,
  VoiceSelectorAccent,
  VoiceSelectorAge,
  VoiceSelectorAttributes,
  VoiceSelectorBullet,
  VoiceSelectorContent,
  VoiceSelectorDescription,
  VoiceSelectorEmpty,
  VoiceSelectorGender,
  VoiceSelectorGroup,
  VoiceSelectorInput,
  VoiceSelectorItem,
  VoiceSelectorList,
  VoiceSelectorName,
  VoiceSelectorPreview,
  VoiceSelectorSeparator,
  VoiceSelectorShortcut,
  VoiceSelectorTrigger,
} from "@sift-design/ui/ai/voice-selector";
import { IconCheck, IconChevronDown, IconMicrophone, IconVolume } from "@tabler/icons-react";
import { SpecimenItem } from "../../frame";

const devices: MediaDeviceInfo[] = ["Desk microphone", "Headset", "Greenhouse speakerphone"].map((label, index) => ({
  deviceId: `input-${index}`,
  groupId: "fernbrook-audio",
  kind: "audioinput" as const,
  label,
  toJSON() {
    return { deviceId: this.deviceId, kind: this.kind, label: this.label };
  },
}));
const noDevices: MediaDeviceInfo[] = [];
const voices = [
  {
    id: "rowan",
    name: "Rowan",
    gender: "non-binary",
    accent: "british",
    age: "Adult",
    description: "Clear and measured. For daily greenhouse updates.",
    group: "Suggested for updates",
    frequency: 220,
  },
  {
    id: "hazel",
    name: "Hazel",
    gender: "female",
    accent: "irish",
    age: "Adult",
    description: "Warm and direct. For the morning task list.",
    group: "Suggested for updates",
    frequency: 262,
  },
  {
    id: "sorrel",
    name: "Sorrel",
    gender: "female",
    accent: "australian",
    age: "Young adult",
    description: "Bright and concise. For short stock checks.",
    group: "More voices",
    frequency: 294,
  },
  {
    id: "linden",
    name: "Linden",
    gender: "male",
    accent: "canadian",
    age: "Mature",
    description: "Low and steady. For longer growing notes.",
    group: "More voices",
    frequency: 175,
  },
] as const;
type Voice = (typeof voices)[number];

/** Generated audio only. No media APIs run until the listener presses preview. */
function useTonePreview() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [status, setStatus] = useState("Preview uses a short tone, not a recorded voice.");
  const audio = useRef<AudioContext | null>(null);
  const run = useRef(0);
  const stop = () => {
    run.current += 1;
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => {});
    setPlaying(null);
    if (context) setStatus("Preview stopped.");
  };
  useEffect(
    () => () => {
      run.current += 1;
      const context = audio.current;
      if (context && context.state !== "closed") void context.close().catch(() => {});
    },
    [],
  );
  const play = async (voice: Voice) => {
    const wasPlaying = playing === voice.id;
    stop();
    if (wasPlaying) {
      setStatus("Preview stopped.");
      return;
    }
    const currentRun = run.current;
    try {
      if (typeof AudioContext === "undefined") throw new Error("Audio unavailable");
      const context = new AudioContext();
      audio.current = context;
      await context.resume();
      if (currentRun !== run.current) return;
      const gain = context.createGain();
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(voice.frequency, context.currentTime);
      oscillator.frequency.setValueAtTime(voice.frequency * 1.25, context.currentTime + 0.4);
      oscillator.frequency.setValueAtTime(voice.frequency * 1.5, context.currentTime + 0.8);
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, context.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, context.currentTime + 1.05);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + 1.3);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => {
        if (currentRun !== run.current) return;
        setPlaying(null);
        setStatus(`${voice.name} preview finished. The tone does not represent the voice.`);
        audio.current = null;
        void context.close().catch(() => {});
      };
      setPlaying(voice.id);
      setStatus(`Playing a sample tone for ${voice.name}.`);
      oscillator.start();
      oscillator.stop(context.currentTime + 1.35);
    } catch {
      if (currentRun !== run.current) return;
      stop();
      setStatus("Audio preview is unavailable. You can still choose a voice from its description.");
    }
  };
  return { playing, status, play, stop };
}

type Preview = ReturnType<typeof useTonePreview>;
function VoicePicker({
  voice,
  setVoice,
  preview,
  compact = false,
}: {
  voice: Voice;
  setVoice: (voice: Voice) => void;
  preview: Preview;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <VoiceSelector
      value={voice.id}
      onValueChange={(id) => {
        const next = voices.find((item) => item.id === id);
        if (next) setVoice(next);
      }}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) preview.stop();
      }}
    >
      <VoiceSelectorTrigger asChild>
        <Button
          variant="outline"
          className={
            compact
              ? "w-full [&>[data-slot=button-label]]:w-full [&>[data-slot=button-label]]:justify-between"
              : "gap-3"
          }
          aria-label={compact ? `Assistant voice: ${voice.name}` : "Browse voices"}
        >
          {compact ? voice.name : "Browse voices"}
          <IconChevronDown aria-hidden="true" size={14} />
        </Button>
      </VoiceSelectorTrigger>
      <VoiceSelectorContent title="Voice for the Larkspur assistant">
        <div className="border-b px-4 pb-3 pt-4 pr-12">
          <p className="text-[14px] font-semibold">Choose an assistant voice</p>
          <p className="mt-1 text-[12px] text-muted-foreground">For task lists and greenhouse updates.</p>
        </div>
        <VoiceSelectorInput />
        <VoiceSelectorList className="max-h-[min(340px,44dvh)] p-1">
          <VoiceSelectorEmpty>No voices match. Try a name or accent.</VoiceSelectorEmpty>
          {["Suggested for updates", "More voices"].map((group, index) => (
            <div key={group}>
              {index > 0 && <VoiceSelectorSeparator />}
              <VoiceSelectorGroup heading={group}>
                {voices
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <VoiceSelectorItem
                      key={item.id}
                      value={item.id}
                      keywords={[item.name, item.accent, item.age, item.gender]}
                      data-current={item.id === voice.id ? "true" : "false"}
                      onSelect={() => {
                        preview.stop();
                        setVoice(item);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <VoiceSelectorName className="block">{item.name}</VoiceSelectorName>
                        <VoiceSelectorAttributes className="mt-0.5 capitalize">
                          <VoiceSelectorGender value={item.gender} />
                          <VoiceSelectorBullet />
                          <VoiceSelectorAccent value={item.accent} />
                          <VoiceSelectorBullet />
                          <VoiceSelectorAge className="font-sans">{item.age}</VoiceSelectorAge>
                        </VoiceSelectorAttributes>
                      </div>
                      <IconCheck
                        aria-hidden="true"
                        size={16}
                        className={item.id === voice.id ? "text-foreground" : "opacity-0"}
                      />
                      {item.id === voice.id && <span className="sr-only">Selected voice</span>}
                    </VoiceSelectorItem>
                  ))}
              </VoiceSelectorGroup>
            </div>
          ))}
        </VoiceSelectorList>
        <div className="border-t bg-tint p-4">
          <div className="flex items-center gap-3">
            <VoiceSelectorPreview
              aria-label={`${preview.playing === voice.id ? "Pause" : "Play"} ${voice.name} preview`}
              playing={preview.playing === voice.id}
              onPlay={() => void preview.play(voice)}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">{voice.name}</p>
              <VoiceSelectorDescription className="block">{voice.description}</VoiceSelectorDescription>
            </div>
          </div>
          <p role="status" className="mt-2 min-h-8 text-[12px] text-muted-foreground">
            {preview.status}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <VoiceSelectorShortcut className="ml-0">↑ ↓</VoiceSelectorShortcut>Browse voices
            </span>
            <Button
              size="sm"
              onClick={() => {
                setOpen(false);
                preview.stop();
              }}
            >
              Use {voice.name}
            </Button>
          </div>
        </div>
      </VoiceSelectorContent>
    </VoiceSelector>
  );
}

export default function VoiceExamples() {
  const [microphone, setMicrophone] = useState<string | undefined>(devices[0].deviceId);
  const [connected, setConnected] = useState(true);
  const [voice, setVoice] = useState<Voice>(voices[0]);
  const preview = useTonePreview();
  const microphoneName = connected
    ? (devices.find((device) => device.deviceId === microphone)?.label ?? "No microphone selected")
    : "No microphones connected";
  return (
    <>
      <SpecimenItem
        name="Mic selector"
        wide
        note="Choose an audio input before a conversation. The selected check fades between devices without a permission request in this example."
      >
        <div className="w-full">
          <div className="flex items-start gap-3 border-b pb-4">
            <IconMicrophone aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <h4 className="text-[14px] font-semibold">Voice for the Larkspur assistant</h4>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Read the morning task list at Fernbrook Greenhouse.
              </p>
            </div>
          </div>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-2 text-[12px] font-medium">Microphone</p>
              <MicSelector
                devices={connected ? devices : noDevices}
                value={connected ? microphone : undefined}
                onValueChange={setMicrophone}
              >
                <MicSelectorTrigger className="w-full" aria-label={`Microphone: ${microphoneName}`}>
                  <MicSelectorValue />
                </MicSelectorTrigger>
                <MicSelectorContent popoverOptions={{ align: "start" }}>
                  <MicSelectorInput />
                  <MicSelectorList>
                    {(items) =>
                      items.map((device) => (
                        <MicSelectorItem key={device.deviceId} value={device.deviceId} keywords={[device.label]}>
                          <MicSelectorLabel device={device} />
                        </MicSelectorItem>
                      ))
                    }
                  </MicSelectorList>
                  <MicSelectorEmpty>No microphones connected. Connect an input device.</MicSelectorEmpty>
                </MicSelectorContent>
              </MicSelector>
            </div>
            <div>
              <p className="mb-2 text-[12px] font-medium">Assistant voice</p>
              <VoicePicker voice={voice} setVoice={setVoice} preview={preview} compact />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <p role="status" className="text-[12px] text-muted-foreground">
              {microphoneName} · {voice.name}
            </p>
            <Button
              size="sm"
              variant="ghost"
              aria-pressed={!connected}
              onClick={() => setConnected((current) => !current)}
            >
              {connected ? "Show no devices" : "Restore devices"}
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            These devices are fictional. This example does not access your microphone.
          </p>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Voice selector"
        wide
        note="Compare voice attributes before you choose. Search and keyboard navigation stay available while a short preview tone plays."
      >
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <IconVolume aria-hidden="true" size={20} className="mt-1 shrink-0 text-muted-foreground" />
              <div>
                <p className="mb-1 text-[12px] text-muted-foreground">Current assistant voice</p>
                <h4 className="text-sm font-semibold tracking-[-0.01em]">{voice.name}</h4>
                <VoiceSelectorAttributes className="mt-1 capitalize">
                  <VoiceSelectorGender value={voice.gender} />
                  <VoiceSelectorBullet />
                  <VoiceSelectorAccent value={voice.accent} />
                  <VoiceSelectorBullet />
                  <VoiceSelectorAge className="font-sans">{voice.age}</VoiceSelectorAge>
                </VoiceSelectorAttributes>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <VoiceSelectorPreview
                aria-label={`${preview.playing === voice.id ? "Pause" : "Play"} current voice preview`}
                playing={preview.playing === voice.id}
                onPlay={() => void preview.play(voice)}
              />
              <VoicePicker voice={voice} setVoice={setVoice} preview={preview} />
            </div>
          </div>
          <p className="mt-4 border-t pt-3 text-[13px]">
            “The morning task list is ready. Check the misting nozzles in the propagation house.”
          </p>
          <p role="status" className="mt-2 text-[12px] text-muted-foreground">
            {preview.status}
          </p>
        </div>
      </SpecimenItem>
    </>
  );
}
