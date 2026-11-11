// Every AI elements shot. Each group keeps its own list in shots/ai/<group>.mjs.
const groups = [
  "chat-demo",
  "conversation",
  "message",
  "prompt-input",
  "context",
  "attachments",
  "reasoning",
  "tool",
  "sources",
  "task",
  "confirmation",
  "assistant-dock",
  "agent-actions",
  "agent",
  "terminal",
  "file-tree",
  "commit",
  "canvas",
  "audio",
  "voice",
  "persona",
];
const lists = await Promise.all(groups.map((group) => import(`./ai/${group}.mjs`).then((m) => m.default)));
export default lists.flat();
