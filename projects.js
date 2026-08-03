const statusFiles = [
  "data/lenovo-gimps.json",
  "data/hpomen-gimps.json",
];

const statusRoot = document.querySelector("#gimps-status");
const completedRoot = document.querySelector("#gimps-completed");

function asText(value, fallback = "Unknown") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function asNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatInteger(value) {
  const number = asNumber(value);
  if (number === null) {
    return asText(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(number);
}

function formatPercent(value) {
  const number = asNumber(value);
  if (number === null) {
    return asText(value);
  }

  return `${number.toLocaleString("en-US", {
    maximumFractionDigits: number < 1 ? 4 : 2,
  })}%`;
}

function formatTimestamp(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return asText(value);
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMachineName(value) {
  const machineName = asText(value);
  const displayNames = {
    hpomen: "HP Omen",
    lenovo: "Lenovo",
  };

  if (displayNames[machineName.toLowerCase()]) {
    return displayNames[machineName.toLowerCase()];
  }

  return machineName
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function makeDetail(label, value) {
  const item = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");

  term.textContent = label;
  description.textContent = value;
  item.append(term, description);

  return item;
}

function makeProgress(percent) {
  const progress = document.createElement("div");
  const track = document.createElement("div");
  const bar = document.createElement("span");

  progress.className = "gimps-progress";
  track.className = "gimps-progress-track";
  bar.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;

  track.append(bar);
  progress.append(track);

  return progress;
}

function renderMachine(data) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const title = document.createElement("h3");
  const state = document.createElement("span");
  const assignment = document.createElement("p");
  const details = document.createElement("dl");
  const percent = asNumber(data.percent_complete);
  const isRunning = data.mprime_running === true;
  const hasRunningState = typeof data.mprime_running === "boolean";

  card.className = "gimps-card";
  header.className = "gimps-card-header";
  state.className = isRunning ? "status-pill status-pill-running" : "status-pill";
  details.className = "gimps-details";

  title.textContent = formatMachineName(data.machine);
  state.textContent = hasRunningState
    ? isRunning
      ? "mprime running"
      : "mprime not running"
    : "mprime unknown";
  assignment.textContent = `Assignment: ${asText(data.current_assignment)}`;

  header.append(title, state);
  card.append(header, assignment);

  if (percent !== null) {
    card.append(makeProgress(percent));
  }

  details.append(
    makeDetail("Complete", formatPercent(data.percent_complete)),
    makeDetail(
      "Iteration",
      `${formatInteger(data.current_iteration)} / ${formatInteger(data.total_iterations)}`,
    ),
    makeDetail("mprime", hasRunningState ? String(data.mprime_running) : "Unknown"),
    makeDetail("Last result", asText(data.last_result)),
    makeDetail("Updated", formatTimestamp(data.updated)),
  );

  card.append(details);

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
  if (!completedRoot) {
    return;
  }

  const results = completedResultsFrom(machines);
  if (results.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No completed tests have been published yet.";
    completedRoot.replaceChildren(empty);
    return;
  }

  const cards = results.map((result) => {
    const card = document.createElement("article");
    const header = document.createElement("div");
    const title = document.createElement("h4");
    const state = document.createElement("span");
    const details = document.createElement("dl");

    card.className = "gimps-completed-result";
    header.className = "gimps-card-header";
    state.className = result.verified
      ? "status-pill status-pill-running"
      : "status-pill";
    details.className = "gimps-details";
    title.textContent = `${asText(result.assignment)} — ${asText(result.outcome)}`;
    state.textContent = result.verified ? "verified" : "completed";

    header.append(title, state);
    details.append(
      makeDetail("Completed", formatTimestamp(result.completed_at)),
      makeDetail("Proof uploaded", result.proof_uploaded === true ? "Yes" : "No"),
      makeDetail("RES64", asText(result.res64)),
    );
    card.append(header, details);
    return card;
  });

  completedRoot.replaceChildren(...cards);
}

function renderError() {
  statusRoot.replaceChildren();

  const card = document.createElement("article");
  const title = document.createElement("h3");
  const copy = document.createElement("p");

  card.className = "gimps-card gimps-card-loading";
  title.textContent = "Status temporarily unavailable";
  copy.textContent = "The GIMPS JSON files could not be read just now.";

  card.append(title, copy);
  statusRoot.append(card);
}

async function loadStatuses() {
  if (!statusRoot) {
    return;
  }

  const cacheBust = Date.now();

  try {
    const machines = await Promise.all(
      statusFiles.map(async (file) => {
        const response = await fetch(`${file}?v=${cacheBust}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Could not load ${file}`);
        }

        return response.json();
      }),
    );

    statusRoot.replaceChildren(...machines.map(renderMachine));
    renderCompletedResults(machines);
  } catch (error) {
    renderError();
  }
}

loadStatuses();
