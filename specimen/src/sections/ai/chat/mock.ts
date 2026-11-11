import type { UIMessage } from "ai";

export const prompts = [
  "Why is bench 4 drying out faster?",
  "Draft the Hollins Florist order confirmation",
  "What should we restock before Saturday?",
];

export const models = ["Meadowlark 3", "Meadowlark 3 Mini", "Quarry Large", "Quarry Swift", "Tidewater 2"];

type Script = {
  reasoning: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  text: string;
  source: { title: string; url: string; detail: string };
  email?: boolean;
};

export function scriptFor(prompt: string, alternative = false): Script {
  if (/hollins|florist|email/i.test(prompt)) {
    return {
      reasoning:
        "I will check the order quantities and delivery window. I will prepare a draft before requesting approval.",
      input: { order: "HF-1042", include: ["quantities", "delivery"] },
      output: { trays: 40, delivery: "12 November, 09:00–11:00", contact: "Alex Lee" },
      text: `${alternative ? "Here is a shorter confirmation." : "The order record is ready. Here is the draft."}\n\n**To:** orders@hollins.larkspur.example\n\n**Subject:** Your 40-tray order\n\nHello Alex,\n\nWe confirm your order for **40 trays**. Delivery is scheduled for **12 November, 09:00–11:00**. Please tell us if your delivery instructions change.\n\nJane Doe\nFernbrook Greenhouse\n\nReview the draft before you approve the simulated send.`,
      source: {
        title: "Hollins Florist · HF-1042",
        url: "https://larkspur.example/orders/HF-1042",
        detail: "40 trays reserved. Delivery: 12 November, 09:00–11:00. Contact: Alex Lee.",
      },
      email: true,
    };
  }
  if (/restock|saturday|stock/i.test(prompt)) {
    return {
      reasoning:
        "I will compare the bench count with the Saturday order list. I will keep reserved stock separate from available stock.",
      input: { area: "Retail benches", date: "14 November 2026" },
      output: { basil: { available: 18, needed: 36 }, parsley: { available: 22, needed: 30 }, pots9cm: 180 },
      text: `${alternative ? "Start with basil, then parsley." : "Restock the herb bench first."}\n\n| Item | Available | Saturday target |\n| --- | ---: | ---: |\n| Basil | 18 | 36 |\n| Parsley | 22 | 30 |\n\nMove **18 basil pots** and **8 parsley pots** to the retail bench. Keep the wholesale reservation separate.\n\nThere are **180 empty 9 cm pots** left. The supplier order for 2,000 pots is still waiting. Confirm its delivery date before adding another order.`,
      source: {
        title: "Saturday stock sheet",
        url: "https://larkspur.example/stock/saturday",
        detail: "Basil: 18 available, 36 required. Parsley: 22 available, 30 required. Empty 9 cm pots: 180.",
      },
    };
  }
  if (/bench|dry|water/i.test(prompt)) {
    return {
      reasoning:
        "I will compare moisture readings across the benches. I will check the irrigation notes before suggesting a cause.",
      input: { bench: 4, compareWith: [2, 3], window: "last 24 hours" },
      output: {
        moisturePercent: { bench4: 23, bench3: 38 },
        note: "Outer nozzle has reduced flow",
        observedAt: "10 November, 14:20",
      },
      text: `${alternative ? "Check the outer nozzle before changing the watering schedule." : "Bench 4 may have uneven irrigation."} Its moisture reading is **23%**, compared with **38%** on bench 3.\n\nThe inspection note records reduced flow at the outer nozzle. This supports a nozzle fault, but it does not confirm the cause.\n\n1. Check and clear the outer nozzle.\n2. Water the driest trays by hand.\n3. Compare readings after 30 minutes.\n\nAsk John Smith to check the nozzle before increasing watering for the whole bench.`,
      source: {
        title: "Bench 4 inspection log",
        url: "https://larkspur.example/benches/4",
        detail:
          "10 November, 14:20. Bench 4 moisture: 23%. Bench 3: 38%. John Smith recorded reduced flow at the outer nozzle.",
      },
    };
  }
  return {
    reasoning:
      "I will check the available greenhouse notes. I will separate recorded facts from information that still needs confirmation.",
    input: { area: "Fernbrook Greenhouse", records: "today" },
    output: { openItems: ["Bench 4 nozzle", "Hollins Florist order", "Saturday herb stock"] },
    text: `${alternative ? "Here is another way to organise the next steps." : "I found three items in the greenhouse notes."}\n\n- **Growing:** check the outer nozzle on bench 4.\n- **Orders:** review the 40-tray Hollins Florist confirmation.\n- **Market:** restock basil and parsley before Saturday.\n\nThis local demo uses fixed sample records. It cannot inspect attachments or answer from live greenhouse data. Choose an item above, or ask about one of these records.`,
    source: {
      title: "Greenhouse daily notes",
      url: "https://larkspur.example/notes/today",
      detail: "Open items: bench 4 nozzle inspection, Hollins Florist confirmation, and Saturday herb restock.",
    },
  };
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("Stopped", "AbortError"));
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Stopped", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

/** Emits complete UIMessage snapshots. Only local timers and an approval promise are used. */
export async function* mockReply(
  id: string,
  script: Script,
  signal: AbortSignal,
  requestApproval: () => Promise<boolean>,
): AsyncGenerator<UIMessage> {
  let parts: UIMessage["parts"] = [{ type: "reasoning", text: "", state: "streaming" }];
  const snapshot = (): UIMessage => ({ id, role: "assistant", parts: [...parts] });
  yield snapshot();
  const thoughts = script.reasoning.match(/.{1,18}/g) ?? [];
  for (let i = 0; i < thoughts.length; i++) {
    await wait(1200 / thoughts.length, signal);
    parts[0] = { type: "reasoning", text: thoughts.slice(0, i + 1).join(""), state: "streaming" };
    yield snapshot();
  }
  parts[0] = { type: "reasoning", text: script.reasoning, state: "done" };
  parts.push({ type: "tool-greenhouse", toolCallId: `${id}-lookup`, state: "input-streaming", input: {} });
  yield snapshot();
  await wait(450, signal);
  parts[1] = { type: "tool-greenhouse", toolCallId: `${id}-lookup`, state: "input-available", input: script.input };
  yield snapshot();
  await wait(650, signal);
  parts[1] = {
    type: "tool-greenhouse",
    toolCallId: `${id}-lookup`,
    state: "output-available",
    input: script.input,
    output: script.output,
  };
  parts.push({ type: "text", text: "", state: "streaming" });
  yield snapshot();
  const chunks = script.text.match(/.{1,13}|\n/g) ?? [];
  for (let i = 0; i < chunks.length; i++) {
    await wait(4300 / chunks.length, signal);
    parts[2] = { type: "text", text: chunks.slice(0, i + 1).join(""), state: "streaming" };
    yield snapshot();
  }
  parts[2] = { type: "text", text: script.text, state: "done" };
  parts.push({ type: "source-url", sourceId: `${id}-source`, url: script.source.url, title: script.source.title });
  yield snapshot();
  if (script.email) {
    const input = { to: "orders@hollins.larkspur.example", subject: "Your 40-tray order", mode: "simulation" };
    const toolCallId = `${id}-email`;
    const approvalId = `${id}-approval`;
    parts.push({
      type: "tool-sendEmail",
      toolCallId,
      state: "approval-requested",
      input,
      approval: { id: approvalId },
    });
    yield snapshot();
    const approved = await requestApproval();
    if (signal.aborted) throw new DOMException("Stopped", "AbortError");
    parts[4] = approved
      ? {
          type: "tool-sendEmail",
          toolCallId,
          state: "output-available",
          input,
          output: { simulated: true, sent: false },
          approval: { id: approvalId, approved: true },
        }
      : {
          type: "tool-sendEmail",
          toolCallId,
          state: "output-denied",
          input,
          approval: { id: approvalId, approved: false },
        };
    yield snapshot();
    await wait(450, signal);
  }
}
