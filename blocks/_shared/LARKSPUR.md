# Larkspur: content for the optional app examples

Larkspur is a fictional workspace for small growers, used by the existing apps
in `blocks/` and several component demonstrations. Screens, data, and names here
are invented. This file keeps those fixtures consistent; it does not define the
features, storage, navigation, or content of products using Sift Design.

Use these names when maintaining or capturing the Larkspur examples. Other
examples can use other fictional domains, and real products keep their own
approved content. Never expose private records, credentials, or internal systems
in public reference material.

## The workspace

- **Workspace:** Fernbrook Greenhouse, a small nursery that grows bedding plants, herbs and perennials and sells at a Saturday market and to a few florists.
- **Signed-in person:** Jane Doe (owner). Initials JD.
- **People:** John Smith (grower), Alex Lee (orders and deliveries), Sam Taylor (part-time, weekends).
- **Timezone:** Europe/London. Dates in examples sit in the week of Monday 9 November 2026; "today" is Tuesday 10 November.
- **Areas** (projects): Propagation house, Polytunnel 2, Retail benches, Wholesale orders, Maintenance.
- **Tags:** seedlings, irrigation, pests, delivery, market, supplier.
- **Statuses:** Open, In progress, Waiting on supplier (a custom column), Done. Exactly one completion column: Done.
- **Priority:** Urgent, High, Normal, Low. Normal is the default and is never badged.

## Helpers (automations that file and update work)

Helpers run on a schedule, read something, and file or update tasks with a
short reason. They are attributed like people, with a small helper badge.

| Helper | Schedule | Reads | Typical output |
|---|---|---|---|
| Climate watch | Every 30 min, 06:00–20:00 | Greenhouse sensor hub | "Propagation house hit 31°C at 14:10. Vents were closed." |
| Order sweep | Weekdays 07:00 and 13:00 | The orders inbox | New task per order, updates when a florist changes quantities |
| Stock count | Mondays 06:30 | Bench inventory sheet | Low-stock tasks: "9cm pots: 180 left, about 4 days" |
| Market prep | Fridays 16:00 | Saturday order list | A checklist task for crates |

Helper states: running now, next run at a time, paused by Larkspur with a reason
("Climate watch couldn't reach the sensor hub three times in a row. Resume it
when the hub is back."), paused by a person, failed (the schedule continues),
needs action (sign-in expired; the helper waits).

## Sample tasks for these fixtures

- Pot on 120 lavender plugs (Propagation house, High, due today, John)
- Aphids on the pepper starts, bench 4 (Polytunnel 2, Urgent, John, tag pests)
- Check misting nozzles in the propagation house (irrigation, filed by Climate watch)
- Reply to Hollins Florist about the 40-tray order (Wholesale orders, Alex, filed by Order sweep)
- Restock the herb bench before Saturday (Retail benches, tag market)
- Calibrate soil-moisture probe 3 (Maintenance)
- Order 2,000 9cm pots (Waiting on supplier, tag supplier, filed by Stock count)
- Prepare Saturday market crates (checklist: 6 crates, price cards, card reader charged, float)
- Repair the polytunnel door runner (Maintenance, Low)
- Sow the second batch of sweet peas (Propagation house, done yesterday)

## Time categories in the Timeline example

1. Growing (sowing, potting, pricking out)
2. Inspection (pest and quality checks)
3. Meetings and calls
4. Messages (email, the orders inbox)
5. Admin (invoices, accounts)
6. Research (variety trials, reading)
7. Writing (labels, care cards, the newsletter)
8. Other

In this fixture, category n uses `--cat-n`. Keep those assignments when a filter
hides a category. Other products choose their own categories and appropriate
presentation; they do not need eight categories or an Other group.

## Voice

Plain, specific, calm. Sentence case everywhere. Name the thing and the next
step: "Climate watch is paused. The sensor hub stopped answering at 14:20.
Resume it when the hub is back." No exclamation marks, no "Oops", no emoji, no
filler like "Seamlessly manage your greenhouse". Numbers are exact and use
IBM Plex Mono when they are counts, times or durations in dense UI.
