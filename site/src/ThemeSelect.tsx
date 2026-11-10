import { useEffect, useState } from "react";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@sift-design/ui/select";
import { setTheme, storedTheme, type ThemeChoice } from "@sift-design/ui/lib/theme";

const choices = [
  { value: "light", label: "Light", Icon: IconSun },
  { value: "dark", label: "Dark", Icon: IconMoon },
  { value: "system", label: "System", Icon: IconDeviceDesktop },
] as const;

/** The color theme picker in the site header: the kit's Select, opening from its trigger. */
export default function ThemeSelect() {
  const [theme, chooseTheme] = useState<ThemeChoice>(storedTheme);
  useEffect(() => {
    const update = () => chooseTheme(storedTheme());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  return (
    <Select
      value={theme}
      onValueChange={(value) => {
        const choice = value as ThemeChoice;
        const url = new URL(location.href);
        url.searchParams.delete("theme");
        history.replaceState(history.state, "", url);
        chooseTheme(choice);
        setTheme(choice);
      }}
    >
      <SelectTrigger aria-label="Color theme" className="theme-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {choices.map(({ value, label, Icon }) => (
          <SelectItem key={value} value={value}>
            <Icon aria-hidden />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
