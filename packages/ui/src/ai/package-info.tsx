import { Badge } from "@sift-design/ui/badge";
import { cn } from "cn";
import {
  IconArrowRight as ArrowRightIcon,
  IconMinus as MinusIcon,
  IconPackage as PackageIcon,
  IconPlus as PlusIcon,
} from "@tabler/icons-react";
import type { HTMLAttributes } from "react";
import { createContext, useContext, useMemo } from "react";

type ChangeType = "major" | "minor" | "patch" | "added" | "removed";

interface PackageInfoContextType {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: ChangeType;
}

const PackageInfoContext = createContext<PackageInfoContextType>({
  name: "",
});

export type PackageInfoHeaderProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoHeader = ({ className, children, ...props }: PackageInfoHeaderProps) => (
  <div className={cn("flex flex-wrap items-center justify-between gap-2", className)} {...props}>
    {children}
  </div>
);

export type PackageInfoNameProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoName = ({ className, children, ...props }: PackageInfoNameProps) => {
  const { name } = useContext(PackageInfoContext);

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)} {...props}>
      <PackageIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <span className="break-all font-mono text-[13px] font-medium">{children ?? name}</span>
    </div>
  );
};

const changeTypeStyles: Record<ChangeType, string> = {
  // A major version can break callers, so it alone takes the warning color.
  // Danger stays reserved for failures; minor and patch stay neutral.
  added: "bg-accent-soft text-link",
  major: "bg-tint text-warn",
  minor: "bg-tint text-foreground",
  patch: "bg-subtle text-muted-foreground",
  removed: "bg-subtle text-muted-foreground",
};

const changeTypeIcons: Record<ChangeType, React.ReactNode> = {
  added: <PlusIcon aria-hidden="true" className="size-3" />,
  major: null,
  minor: null,
  patch: null,
  removed: <MinusIcon aria-hidden="true" className="size-3" />,
};

export type PackageInfoChangeTypeProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoChangeType = ({ className, children, ...props }: PackageInfoChangeTypeProps) => {
  const { changeType } = useContext(PackageInfoContext);

  if (!changeType) {
    return null;
  }

  return (
    <Badge
      className={cn(
        "shrink-0 gap-1 border-transparent text-[12px] capitalize",
        changeTypeStyles[changeType],
        className,
      )}
      variant="secondary"
      {...props}
    >
      {changeTypeIcons[changeType]}
      {children ?? changeType}
    </Badge>
  );
};

export type PackageInfoVersionProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoVersion = ({ className, children, ...props }: PackageInfoVersionProps) => {
  const { currentVersion, newVersion } = useContext(PackageInfoContext);

  if (!(currentVersion || newVersion)) {
    return null;
  }

  return (
    <div
      className={cn("mt-2 flex flex-wrap items-center gap-2 font-mono text-[13px] text-muted-foreground", className)}
      {...props}
    >
      {children ?? (
        <>
          {currentVersion && (
            <span>
              <span className="sr-only">Current version </span>
              {currentVersion}
            </span>
          )}
          {currentVersion && newVersion && (
            <>
              <ArrowRightIcon aria-hidden="true" className="size-4 text-foreground" />
              <span className="sr-only">to</span>
            </>
          )}
          {newVersion && (
            <span className="font-medium text-foreground">
              <span className="sr-only">New version </span>
              {newVersion}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export type PackageInfoProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  currentVersion?: string;
  newVersion?: string;
  changeType?: ChangeType;
};

export const PackageInfo = ({
  name,
  currentVersion,
  newVersion,
  changeType,
  className,
  children,
  ...props
}: PackageInfoProps) => {
  const contextValue = useMemo(
    () => ({ changeType, currentVersion, name, newVersion }),
    [changeType, currentVersion, name, newVersion],
  );

  return (
    <PackageInfoContext.Provider value={contextValue}>
      <div
        data-slot="package-info"
        data-change-type={changeType}
        className={cn("rounded-lg border bg-card p-4 text-foreground", className)}
        {...props}
      >
        {children ?? (
          <>
            <PackageInfoHeader>
              <PackageInfoName />
              {changeType && <PackageInfoChangeType />}
            </PackageInfoHeader>
            {(currentVersion || newVersion) && <PackageInfoVersion />}
          </>
        )}
      </div>
    </PackageInfoContext.Provider>
  );
};

export type PackageInfoDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const PackageInfoDescription = ({ className, children, ...props }: PackageInfoDescriptionProps) => (
  <p className={cn("mt-2 text-[13px] leading-relaxed text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export type PackageInfoContentProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoContent = ({ className, children, ...props }: PackageInfoContentProps) => (
  <div className={cn("mt-3 border-t pt-3", className)} {...props}>
    {children}
  </div>
);

export type PackageInfoDependenciesProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoDependencies = ({ className, children, ...props }: PackageInfoDependenciesProps) => (
  <div className={cn("space-y-2", className)} {...props}>
    <span className="text-[12px] font-medium text-muted-foreground">Dependencies</span>
    <div className="space-y-1">{children}</div>
  </div>
);

export type PackageInfoDependencyProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  version?: string;
};

export const PackageInfoDependency = ({ name, version, className, children, ...props }: PackageInfoDependencyProps) => (
  <div className={cn("flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12px]", className)} {...props}>
    {children ?? (
      <>
        <span className="break-all font-mono text-muted-foreground">{name}</span>
        {version && <span className="font-mono text-xs">{version}</span>}
      </>
    )}
  </div>
);
