const statusFiles = ["data/lenovo-gimps.json", "data/hpomen-gimps.json"];

const statusRoot = document.querySelector("#gimps-status");
const completedRoot = document.querySelector("#gimps-completed");

function asText(value, fallback = "unknown") {
  return value === null || value === undefined || value === ""
    ? fallback
    : String(value);
}

function asNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatPercent(value) {
  const number = asNumber(value);
  if (number === null) return asText(value);
  return `${number.toLocaleString("en-US", { maximumFractionDigits: number < 1 ? 4 : 2 })}%`;
}

function formatTimestamp(value) {
  if (!value) return "unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return asText(value);
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatMachineName(value) {
  const machineName = asText(value);
  const displayNames = { hpomen: "HP Omen", lenovo: "Lenovo" };
  return displayNames[machineName.toLowerCase()] || machineName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderMachine(data) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const title = document.createElement("h4");
  const state = document.createElement("span");
  const assignment = document.createElement("p");
  const update = document.createElement("p");
  const running = data.mprime_running === true;

  card.className = "gimps-card";
  header.className = "gimps-card-header";
  state.className = running ? "status-pill status-pill-running" : "status-pill";
  title.textContent = formatMachineName(data.machine);
  state.textContent = running ? "* running" : "idle";
  assignment.textContent = `${asText(data.current_assignment)} — ${formatPercent(data.percent_complete)} complete`;
  update.textContent = `updated ${formatTimestamp(data.updated)}`;

  header.append(title, state);
  card.append(header, assignment, update);
  return card;
}

function completedResultsFrom(machines) {
  const resultsByAssignment = new Map();

  machines.forEach((machine) => {
    const results = Array.isArray(machine.completed_assignments)
      ? machine.completed_assignments
      : machine.latest_completed
        ? [machine.latest_completed]
        : [];

    results.forEach((result) => {
      if (result && typeof result === "object" && result.assignment) {
        resultsByAssignment.set(result.assignment, result);
      }
    });
  });

  return [...resultsByAssignment.values()].sort((left, right) =>
    asText(right.completed_at, "").localeCompare(asText(left.completed_at, "")),
  );
}

function renderCompletedResults(machines) {
  if (!completedRoot) return;

  const results = completedResultsFrom(machines);
  if (results.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No completed tests published yet.";
    completedRoot.replaceChildren(empty);
    return;
  }

  completedRoot.replaceChildren(...results.map((result) => {
    const item = document.createElement("article");
    const copy = document.createElement("p");
    const proof = result.verified ? "verified" : "completed";
    item.className = "gimps-completed-result";
    copy.textContent = `${asText(result.assignment)} — ${asText(result.outcome)} / ${proof} / ${formatTimestamp(result.completed_at)}`;
    item.append(copy);
    return item;
  }));
}

function renderError() {
  const item = document.createElement("article");
  const copy = document.createElement("p");
  item.className = "gimps-card";
  copy.textContent = "Status temporarily unavailable.";
  item.append(copy);
  statusRoot.replaceChildren(item);
}

async function loadStatuses() {
  if (!statusRoot) return;

  try {
    const machines = await Promise.all(statusFiles.map(async (file) => {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load ${file}`);
      return response.json();
    }));

    statusRoot.replaceChildren(...machines.map(renderMachine));
    renderCompletedResults(machines);
  } catch (error) {
    renderError();
  }
}

loadStatuses();
