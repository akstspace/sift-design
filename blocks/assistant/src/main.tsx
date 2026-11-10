import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTheme } from "@sift-design/ui/lib/theme";
import "./styles.css";
import App from "./App";

initTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
