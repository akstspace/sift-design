import { useId, useState } from "react";
import { IconPackage, IconRotateClockwise } from "@tabler/icons-react";
import { Button } from "@sift-design/ui/button";
import { Switch } from "@sift-design/ui/switch";
import {
  Commit,
  CommitActions,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitContent,
  CommitCopyButton,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileInfo,
  CommitFilePath,
  CommitFiles,
  CommitFileStatus,
  CommitHash,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitTimestamp,
} from "@sift-design/ui/ai/commit";
import {
  PackageInfo,
  PackageInfoChangeType,
  PackageInfoContent,
  PackageInfoDependencies,
  PackageInfoDependency,
  PackageInfoDescription,
  PackageInfoHeader,
  PackageInfoName,
  PackageInfoVersion,
} from "@sift-design/ui/ai/package-info";
import { SpecimenItem } from "../../frame";

const today = new Date("2026-11-10T12:00:00Z");
const hash = "e4b7a92cd13f6058a947bd21c8d6e0a2f5b31970";
const files = [
  { path: "src/climate/misting.ts", status: "modified", additions: 18, deletions: 6 },
  { path: "tests/misting-threshold.test.ts", status: "added", additions: 42, deletions: 0 },
  { path: "config/bench-defaults.json", status: "renamed", additions: 3, deletions: 3 },
  { path: "config/legacy-misting.json", status: "deleted", additions: 0, deletions: 12 },
] as const;

const packages = [
  {
    name: "@larkspur/sensors",
    currentVersion: "2.8.1",
    newVersion: "3.0.0",
    changeType: "major",
    description: "Read soil moisture for each bench. The new version requires a probe identifier.",
    dependency: { name: "@larkspur/probe-types", version: "^2.0.0" },
  },
  {
    name: "bench-scheduler",
    currentVersion: "1.4.2",
    newVersion: "1.5.0",
    changeType: "minor",
    description: "Add separate misting schedules for seedlings and established plants.",
    dependency: { name: "greenhouse-clock", version: "^1.2.0" },
  },
  {
    name: "greenhouse-clock",
    currentVersion: "1.2.0",
    newVersion: "1.2.1",
    changeType: "patch",
    description: "Keep scheduled checks accurate when the greenhouse clock changes.",
  },
  {
    name: "bench-alerts",
    newVersion: "1.0.0",
    changeType: "added",
    description: "Notify growers when a bench needs a manual moisture check.",
  },
] as const;

function CommitDemo() {
  const [open, setOpen] = useState(true);
  const [copyError, setCopyError] = useState("");
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-foreground">
        <span>Fernbrook Greenhouse · Climate controls</span>
        <span className="font-mono">10 Nov 2026</span>
      </div>
      <Commit open={open} onOpenChange={setOpen}>
        <CommitHeader aria-label="Raise the misting threshold on bench 4">
          <CommitAuthorAvatar initials="JS" aria-label="John Smith" />
          <CommitInfo>
            <CommitMessage>Raise the misting threshold on bench 4</CommitMessage>
            <CommitMetadata>
              <CommitHash>{hash.slice(0, 7)}</CommitHash>
              <CommitSeparator />
              <CommitAuthor>John Smith</CommitAuthor>
              <CommitSeparator />
              <CommitTimestamp date={new Date("2026-11-10T09:42:00Z")} now={today} />
              <CommitSeparator />
              <span>
                <span className="font-mono">4</span> files changed
              </span>
            </CommitMetadata>
          </CommitInfo>
          <CommitActions aria-label="Commit actions">
            <CommitCopyButton
              hash={hash}
              onCopy={() => setCopyError("")}
              onError={() => setCopyError("The hash could not be copied. Select the full hash below.")}
            />
          </CommitActions>
        </CommitHeader>
        <CommitContent>
          <div className="px-2 pb-2 pt-1 text-[12px] text-muted-foreground">
            Start misting below <span className="font-mono">38%</span> soil moisture instead of{" "}
            <span className="font-mono">32%</span>.
          </div>
          <CommitFiles>
            {files.map((file) => (
              <CommitFile key={file.path}>
                <CommitFileInfo className="flex-1 flex-wrap gap-x-3 gap-y-1">
                  <CommitFilePath className="w-full sm:w-auto sm:flex-1">{file.path}</CommitFilePath>
                  <CommitFileStatus status={file.status} />
                </CommitFileInfo>
                <CommitFileChanges>
                  <CommitFileAdditions count={file.additions} />
                  <CommitFileDeletions count={file.deletions} />
                </CommitFileChanges>
              </CommitFile>
            ))}
          </CommitFiles>
        </CommitContent>
      </Commit>
      {copyError && (
        <div role="alert" className="space-y-1 text-[12px] text-danger">
          <p>{copyError}</p>
          <code className="break-all font-mono select-all">{hash}</code>
        </div>
      )}
      <p className="text-[12px] text-muted-foreground">
        Expand the commit to inspect each file. Copy the hash to refer to this change.
      </p>
    </div>
  );
}

function PackageDemo() {
  const id = useId();
  const [selected, setSelected] = useState<string[]>(["bench-scheduler", "greenhouse-clock"]);
  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-[14px] font-medium">
            <IconPackage aria-hidden="true" className="size-4 text-muted-foreground" />
            Larkspur app upgrade
          </p>
          <p className="text-[12px] text-muted-foreground">
            Choose package changes for the next release. This is a local preview.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelected([])} disabled={selected.length === 0}>
          <IconRotateClockwise aria-hidden="true" className="size-3.5" />
          Clear selection
        </Button>
      </div>
      <div className="space-y-3">
        {packages.map((pkg, index) => {
          const apply = selected.includes(pkg.name);
          const switchId = `${id}-${index}`;
          const dependency = "dependency" in pkg ? pkg.dependency : null;
          return (
            <PackageInfo key={pkg.name} {...pkg} data-apply={apply} className="package-demo-choice">
              <PackageInfoHeader>
                <PackageInfoName />
                <div className="flex items-center gap-3">
                  <PackageInfoChangeType />
                  <Switch
                    id={switchId}
                    aria-label={`Apply ${pkg.name}`}
                    checked={apply}
                    onCheckedChange={(checked) =>
                      setSelected((current) =>
                        checked ? [...current, pkg.name] : current.filter((name) => name !== pkg.name),
                      )
                    }
                  />
                </div>
              </PackageInfoHeader>
              <PackageInfoVersion />
              <PackageInfoDescription>{pkg.description}</PackageInfoDescription>
              {dependency && (
                <PackageInfoContent>
                  <PackageInfoDependencies>
                    <PackageInfoDependency {...dependency} />
                  </PackageInfoDependencies>
                </PackageInfoContent>
              )}
            </PackageInfo>
          );
        })}
      </div>
      <p role="status" className="text-[12px] text-muted-foreground">
        <span className="font-mono">{selected.length}</span> of <span className="font-mono">{packages.length}</span>{" "}
        package changes selected. No packages will be installed.
      </p>
    </div>
  );
}

export default function CommitExamples() {
  return (
    <>
      <SpecimenItem
        name="Commit"
        note="Inspect a code change before you use it. The file list opens smoothly, and copying confirms the hash."
      >
        <CommitDemo />
      </SpecimenItem>
      <SpecimenItem
        name="Package info"
        note="Review version changes and dependencies. A chosen change takes the accent outline, and its switch slides on a spring."
      >
        <PackageDemo />
      </SpecimenItem>
    </>
  );
}
