import { useEffect, useRef, useState } from "react";
import { IconHeadphones, IconRefresh, IconVolume2 } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Textarea } from "@sift-design/ui/textarea";
import {
  AudioPlayer,
  AudioPlayerElement,
  AudioPlayerControlBar,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerDurationDisplay,
  AudioPlayerTimeRange,
  AudioPlayerMuteButton,
  AudioPlayerVolumeRange,
} from "@sift-design/ui/ai/audio-player";
import { Transcription, TranscriptionSegment } from "@sift-design/ui/ai/transcription";
import { SpeechInput } from "@sift-design/ui/ai/speech-input";
import { SpecimenItem } from "../../frame";

const segments = [
  { startSecond: 0, endSecond: 3, text: "The propagation house is ready. Open the vents before watering." },
  { startSecond: 3, endSecond: 6, text: "John will check the irrigation line in Polytunnel 2." },
  { startSecond: 6, endSecond: 9, text: "Set aside six trays of herbs for the Saturday market." },
];
const dictatedNote = "Ask John to check the irrigation line before watering the herb trays.";

/** A local, nine-second PCM tone sequence. No files or network requests. */
function makeAudio() {
  const rate = 16000;
  const count = rate * 9;
  const buffer = new ArrayBuffer(44 + count * 2);
  const view = new DataView(buffer);
  const text = (at: number, value: string) =>
    [...value].forEach((letter, index) => view.setUint8(at + index, letter.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + count * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, count * 2, true);
  const notes = [261.63, 329.63, 392, 293.66, 349.23, 440, 329.63, 392, 523.25];
  for (let i = 0; i < count; i += 1) {
    const time = i / rate;
    const beat = time % 1;
    const envelope = Math.min(beat / 0.035, 1) * Math.max(0, 1 - beat / 0.85);
    const tone = Math.sin(2 * Math.PI * notes[Math.floor(time)] * time);
    view.setInt16(44 + i * 2, Math.round(tone * envelope * 0.12 * 32767), true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export default function AudioExamples() {
  const [src, setSrc] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [note, setNote] = useState("");
  const [listening, setListening] = useState(false);
  const [hasDictated, setHasDictated] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(makeAudio());
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  const seek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  const reset = () => {
    audioRef.current?.pause();
    seek(0);
  };

  return (
    <>
      <SpecimenItem
        name="Audio player"
        note="Play a voice note with local audio. Controls show playback and volume without a separate loading animation."
        wide
      >
        <div className="w-full space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-foreground">
              <IconHeadphones aria-hidden size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold tracking-[-0.01em]">Morning walk-through</h4>
              <p className="text-[13px] text-muted-foreground">Jane Doe · Fernbrook Greenhouse</p>
            </div>
            <Button variant="ghost" size="icon-sm" aria-label="Reset playback" title="Reset playback" onClick={reset}>
              <IconRefresh aria-hidden />
            </Button>
          </div>
          <AudioPlayer aria-label="Morning walk-through audio">
            {src && (
              <AudioPlayerElement
                ref={audioRef}
                src={src}
                preload="auto"
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => setAudioError(true)}
              />
            )}
            <AudioPlayerControlBar>
              <AudioPlayerPlayButton />
              <AudioPlayerSeekBackwardButton />
              <AudioPlayerSeekForwardButton />
              <AudioPlayerTimeDisplay />
              <AudioPlayerTimeRange />
              <AudioPlayerDurationDisplay />
              <AudioPlayerMuteButton />
              <AudioPlayerVolumeRange className="hidden sm:inline-block" />
            </AudioPlayerControlBar>
          </AudioPlayer>
          <div className="flex items-start gap-2 border-t pt-3 text-[12px] text-muted-foreground">
            <IconVolume2 className="mt-0.5 shrink-0" size={14} aria-hidden />
            <p>
              {audioError
                ? "Audio could not play. Reload this example to create a new sample."
                : "Local tone sample, not recorded speech. The example transcript follows the nine-second playback."}
            </p>
          </div>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Transcription"
        note="Select a timestamp to seek in the audio above. The active segment changes with a calm color transition."
      >
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-muted-foreground" role="status">
              {playing ? "Following playback" : "Select a segment to seek"}
            </p>
            <Button size="xs" variant="ghost" onClick={() => setEmpty((value) => !value)}>
              {empty ? "Show transcript" : "Show empty state"}
            </Button>
          </div>
          {empty ? (
            <p className="py-8 text-[13px] text-muted-foreground">
              No transcript is available. Select Show transcript to restore this example.
            </p>
          ) : (
            <Transcription
              aria-label="Morning walk-through transcript"
              segments={segments}
              currentTime={currentTime}
              onSeek={seek}
              className="flex-col gap-1"
            >
              {(segment, index) => (
                <TranscriptionSegment key={segment.startSecond} segment={segment} index={index} showTimestamp />
              )}
            </Transcription>
          )}
          <p className="border-t pt-3 text-[12px] text-muted-foreground">
            Timestamps link each segment to the local audio sample.
          </p>
        </div>
      </SpecimenItem>
      <SpecimenItem
        name="Speech input"
        note="Add a note with simulated dictation. The recording ring pulses only while listening and stays still with reduced motion."
      >
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="audio-follow-up-note" className="text-[13px] font-medium">
              Follow-up note
            </label>
            <span className="text-[12px] text-muted-foreground">Simulated microphone</span>
          </div>
          <Textarea
            id="audio-follow-up-note"
            className="min-h-24 text-[13px]"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Type a note or start dictation."
          />
          <div className="flex items-center gap-3 pt-1">
            <SpeechInput
              simulate
              simulatedTranscript={dictatedNote}
              onTranscriptionChange={(text) => {
                setNote(text);
                setHasDictated(true);
              }}
              onListeningChange={setListening}
            />
            <p className="flex-1 text-[12px] text-muted-foreground" role="status">
              {listening
                ? "Listening to the sample…"
                : hasDictated
                  ? "Dictation stopped. You can edit the note."
                  : "Start dictation to fill this note."}
            </p>
            <Button
              size="xs"
              variant="ghost"
              disabled={listening || !note}
              onClick={() => {
                setNote("");
                setHasDictated(false);
              }}
            >
              Clear
            </Button>
          </div>
          <p className="border-t pt-3 text-[12px] text-muted-foreground">
            This example never requests microphone access.
          </p>
        </div>
      </SpecimenItem>
    </>
  );
}
