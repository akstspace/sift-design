// Every chart shot. Each chart type keeps its own list in shots/charts/<group>.mjs.
const groups = ["area", "bar", "line", "pie", "radar", "radial", "tooltip"];
const lists = await Promise.all(groups.map((group) => import(`./charts/${group}.mjs`).then((m) => m.default)));
export default lists.flat();
