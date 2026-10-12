(() => {
  const sourceTimeZone = "Europe/London";
  const visitorTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const firstCourseDate = Date.UTC(2026, 9, 12);
  const lastCourseDate = Date.UTC(2026, 11, 12);
  const hourHeight = 76;
  const formatterCache = new Map();
  const meetings = [
    { day: 1, start: "09:00", end: "11:00", title: "Number Theory" },
    { day: 1, start: "15:00", end: "17:00", title: "Formalising Mathematics" },
    { day: 2, start: "10:00", end: "11:00", title: "Algebraic Curves" },
    { day: 2, start: "12:00", end: "13:00", title: "Commutative Algebra" },
    { day: 3, start: "09:00", end: "10:00", title: "Number Theory" },
    { day: 3, start: "10:00", end: "11:00", title: "Commutative Algebra" },
    { day: 4, start: "12:00", end: "13:00", title: "Algebraic Curves" },
    { day: 4, start: "13:00", end: "14:00", title: "Commutative Algebra" },
    { day: 4, start: "13:00", end: "14:00", title: "Formalising Mathematics" },
    { day: 5, start: "09:00", end: "10:00", title: "Algebraic Curves" }
  ];

  function formatter(timeZone, options) {
    const key = `${timeZone}:${JSON.stringify(options)}`;
    if (!formatterCache.has(key)) {
      formatterCache.set(key, new Intl.DateTimeFormat(undefined, { timeZone, ...options }));
    }
    return formatterCache.get(key);
  }

  function partsAt(instant, timeZone) {
    const values = Object.fromEntries(
      formatter(timeZone, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
      }).formatToParts(instant).map(({ type, value }) => [type, value])
    );
    return {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      weekday: values.weekday,
      hour: Number(values.hour),
      minute: Number(values.minute),
      second: Number(values.second)
    };
  }

  function dateKey(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function keyFromParts(parts) {
    return dateKey(parts.year, parts.month, parts.day);
  }

  function instantForZonedTime(year, month, day, hour, minute, timeZone) {
    const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute);
    let candidate = desiredAsUtc;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const shown = partsAt(new Date(candidate), timeZone);
      const shownAsUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
      const correction = desiredAsUtc - shownAsUtc;
      candidate += correction;
      if (correction === 0) break;
    }

    return new Date(candidate);
  }

  function timeParts(clock) {
    const [hour, minute] = clock.split(":").map(Number);
    return { hour, minute };
  }

  function buildOccurrences() {
    const occurrences = [];
    for (let date = firstCourseDate; date <= lastCourseDate; date += 24 * 60 * 60 * 1000) {
      const londonDate = new Date(date);
      const weekday = londonDate.getUTCDay();
      const year = londonDate.getUTCFullYear();
      const month = londonDate.getUTCMonth() + 1;
      const day = londonDate.getUTCDate();

      for (const meeting of meetings) {
        if (meeting.day !== weekday) continue;
        const startTime = timeParts(meeting.start);
        const endTime = timeParts(meeting.end);
        const start = instantForZonedTime(year, month, day, startTime.hour, startTime.minute, sourceTimeZone);
        const end = instantForZonedTime(year, month, day, endTime.hour, endTime.minute, sourceTimeZone);
        const localStart = partsAt(start, visitorTimeZone);
        const localEnd = partsAt(end, visitorTimeZone);
        const localStartDate = new Date(Date.UTC(localStart.year, localStart.month - 1, localStart.day));

        occurrences.push({
          ...meeting,
          start,
          end,
          startMs: start.getTime(),
          endMs: end.getTime(),
          localStart,
          localEnd,
          localDateKey: keyFromParts(localStart),
          localDay: localStartDate.getUTCDay()
        });
      }
    }
    return occurrences;
  }

  const occurrences = buildOccurrences();
  const weekLabel = document.getElementById("week-label");
  const timezoneLabel = document.getElementById("timezone-label");
  const calendarHead = document.getElementById("calendar-head");
  const calendarBody = document.getElementById("calendar-body");
  const calendarGrid = document.getElementById("calendar-grid");
  const scheduleStatus = document.getElementById("schedule-status");

  timezoneLabel.textContent = `Times shown in ${visitorTimeZone}`;

  function getCurrentWeek(now) {
    const today = partsAt(now, visitorTimeZone);
    const todayDate = new Date(Date.UTC(today.year, today.month - 1, today.day));
    const sunday = new Date(todayDate.getTime() - todayDate.getUTCDay() * 24 * 60 * 60 * 1000);
    const days = Array.from({ length: 7 }, (_, index) => new Date(sunday.getTime() + index * 24 * 60 * 60 * 1000));
    return { today, todayKey: keyFromParts(today), days, sunday };
  }

  function formatDate(date, options) {
    return formatter("UTC", options).format(date);
  }

  function formatClock(hour, minute = 0) {
    const sample = new Date(Date.UTC(2026, 0, 4, hour, minute));
    return formatter("UTC", { hour: "numeric", minute: "2-digit" }).format(sample);
  }

  function formatEventClock(parts) {
    const sample = new Date(Date.UTC(2026, 0, 4, parts.hour, parts.minute));
    return formatter("UTC", { hour: "numeric", minute: "2-digit" }).format(sample);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function arrangeLanes(dayEvents) {
    const sorted = [...dayEvents].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);
    const groups = [];
    let group = [];
    let groupEnd = -Infinity;

    for (const event of sorted) {
      if (group.length && event.startMs >= groupEnd) {
        groups.push(group);
        group = [];
        groupEnd = -Infinity;
      }
      group.push(event);
      groupEnd = Math.max(groupEnd, event.endMs);
    }
    if (group.length) groups.push(group);

    for (const overlappingGroup of groups) {
      const laneEnds = [];
      const assignments = overlappingGroup.map((event) => {
        let lane = laneEnds.findIndex((end) => end <= event.startMs);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = event.endMs;
        return { event, lane };
      });
      for (const assignment of assignments) {
        assignment.event.lane = assignment.lane;
        assignment.event.laneCount = laneEnds.length;
      }
    }
    return sorted;
  }

  function updateCurrentTimeLine(week, startHour, endHour, now) {
    const existing = calendarBody.querySelector(".current-time-indicator");
    if (existing) existing.remove();

    const nowParts = partsAt(now, visitorTimeZone);
    if (keyFromParts(nowParts) !== week.todayKey) return;

    const todayColumn = calendarBody.querySelector(`[data-date="${week.todayKey}"]`);
    if (!todayColumn) return;
    const minutes = nowParts.hour * 60 + nowParts.minute + nowParts.second / 60;
    const top = ((minutes - startHour * 60) / 60) * hourHeight;
    if (top < 0 || top > (endHour - startHour) * hourHeight) return;

    const indicator = createElement("div", "current-time-indicator");
    indicator.setAttribute("aria-label", `Current time, ${formatEventClock(nowParts)}`);
    indicator.style.top = `${top}px`;
    todayColumn.append(indicator);
  }

  function render() {
    const now = new Date();
    const week = getCurrentWeek(now);
    const dates = week.days;
    const weekEnd = dates[6];
    const sameMonth = dates[0].getUTCMonth() === weekEnd.getUTCMonth();
    const rangeLabel = sameMonth
      ? `${formatDate(dates[0], { month: "short", day: "numeric" })}–${formatDate(weekEnd, { day: "numeric", year: "numeric" })}`
      : `${formatDate(dates[0], { month: "short", day: "numeric" })}–${formatDate(weekEnd, { month: "short", day: "numeric", year: "numeric" })}`;
    weekLabel.textContent = `This week · ${rangeLabel}`;

    const weekStartKey = dateKey(dates[0].getUTCFullYear(), dates[0].getUTCMonth() + 1, dates[0].getUTCDate());
    const weekEndKey = dateKey(weekEnd.getUTCFullYear(), weekEnd.getUTCMonth() + 1, weekEnd.getUTCDate());
    const weekEvents = occurrences.filter((event) => event.localDateKey >= weekStartKey && event.localDateKey <= weekEndKey);
    scheduleStatus.textContent = weekEvents.length ? "" : "No course meetings are scheduled for this week.";

    let earliest = 8 * 60;
    let latest = 17 * 60;
    if (weekEvents.length) {
      earliest = Math.min(...weekEvents.map((event) => event.localStart.hour * 60 + event.localStart.minute));
      latest = Math.max(...weekEvents.map((event) => event.localEnd.hour * 60 + event.localEnd.minute));
      earliest = Math.max(0, Math.floor(earliest / 60) * 60 - 60);
      latest = Math.min(24 * 60, Math.ceil(latest / 60) * 60 + 60);
    }

    const nowParts = partsAt(now, visitorTimeZone);
    if (keyFromParts(nowParts) >= weekStartKey && keyFromParts(nowParts) <= weekEndKey) {
      const currentMinutes = nowParts.hour * 60 + nowParts.minute;
      earliest = Math.min(earliest, Math.max(0, Math.floor(currentMinutes / 60) * 60 - 60));
      latest = Math.max(latest, Math.min(24 * 60, (Math.floor(currentMinutes / 60) + 2) * 60));
    }

    const startHour = Math.floor(earliest / 60);
    const endHour = Math.ceil(latest / 60);
    const bodyHeight = (endHour - startHour) * hourHeight;
    calendarGrid.style.setProperty("--hour-height", `${hourHeight}px`);
    calendarGrid.style.setProperty("--half-hour-height", `${hourHeight / 2}px`);

    calendarHead.replaceChildren();
    calendarBody.replaceChildren();
    calendarHead.append(createElement("div", "calendar-head-spacer"));

    for (const date of dates) {
      const key = dateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
      const heading = createElement("div", "calendar-day-heading");
      if (key === week.todayKey) heading.setAttribute("aria-current", "date");
      const dayNumber = createElement("strong", "", String(date.getUTCDate()));
      const dayName = createElement("span", "", formatDate(date, { weekday: "long", month: "short" }));
      heading.append(dayNumber, dayName);
      calendarHead.append(heading);
    }

    const timeColumn = createElement("div", "calendar-times");
    timeColumn.style.height = `${bodyHeight}px`;
    for (let hour = startHour; hour < endHour; hour += 1) {
      const label = createElement("span", "calendar-time-label", formatClock(hour));
      label.style.top = `${(hour - startHour) * hourHeight}px`;
      if (hour === startHour) label.style.transform = "translateY(0)";
      timeColumn.append(label);
    }
    calendarBody.append(timeColumn);

    for (const date of dates) {
      const key = dateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
      const dayColumn = createElement("div", "calendar-day");
      dayColumn.dataset.date = key;
      dayColumn.setAttribute("aria-label", formatDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" }));
      dayColumn.style.height = `${bodyHeight}px`;
      if (key === week.todayKey) dayColumn.classList.add("is-today");

      const dayEvents = arrangeLanes(weekEvents.filter((event) => event.localDateKey === key));
      for (const event of dayEvents) {
        const eventEl = createElement("article", "calendar-event");
        const startMinutes = event.localStart.hour * 60 + event.localStart.minute;
        const durationMinutes = (event.endMs - event.startMs) / 60000;
        const top = ((startMinutes - startHour * 60) / 60) * hourHeight;
        const height = (durationMinutes / 60) * hourHeight;
        const laneWidth = 100 / event.laneCount;
        eventEl.style.top = `${top + 2}px`;
        eventEl.style.height = `${Math.max(26, height - 4)}px`;
        eventEl.style.left = `calc(${laneWidth * event.lane}% + 2px)`;
        eventEl.style.width = `calc(${laneWidth}% - 4px)`;
        eventEl.setAttribute("aria-label", `${event.title}, ${formatEventClock(event.localStart)} to ${formatEventClock(event.localEnd)}`);

        eventEl.append(createElement("span", "calendar-event-title", event.title));
        eventEl.append(createElement("span", "calendar-event-time", `${formatEventClock(event.localStart)}–${formatEventClock(event.localEnd)}`));
        dayColumn.append(eventEl);
      }
      calendarBody.append(dayColumn);
    }

    updateCurrentTimeLine(week, startHour, endHour, now);
  }

  render();
  window.setInterval(render, 60 * 1000);
})();
