const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

/* ---------------- ON-TIME RATE ---------------- */
const submitted = assignments.filter(a => a.status === "Submitted");
const onTime = submitted.filter(a =>
  new Date(a.deadline) >= new Date(a.submittedAt || a.deadline)
);

const rate = submitted.length
  ? Math.round((onTime.length / submitted.length) * 100)
  : 0;

document.getElementById("onTimeRate").textContent = rate + "%";

/* ---------------- STATUS BREAKDOWN ---------------- */
const statusCount = { Pending: 0, Submitted: 0, Missed: 0 };

assignments.forEach(a => statusCount[a.status]++);

renderBars("statusChart", statusCount, {
  Pending: "#f5b942",
  Submitted: "#3ad17b",
  Missed: "#ff4d4d"
});

/* ---------------- SUBJECT BREAKDOWN ---------------- */
const subjectCount = {};

assignments.forEach(a => {
  subjectCount[a.subject] = (subjectCount[a.subject] || 0) + 1;
});

renderBars("subjectChart", subjectCount, "#4da3ff");

/* ---------------- WEEKLY WORKLOAD ---------------- */
const weekCount = {};

assignments.forEach(a => {
  const d = new Date(a.deadline);
  const week = getWeekNumber(d);
  weekCount["W" + week] = (weekCount["W" + week] || 0) + 1;
});

renderBars("weeklyChart", weekCount, "#facc15");

/* ---------------- HELPERS ---------------- */
function renderBars(containerId, data, colors) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const max = Math.max(...Object.values(data), 1);

  for (let key in data) {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("span");
    label.textContent = key;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = (data[key] / max) * 100 + "%";
    bar.style.background =
      typeof colors === "object" ? colors[key] : colors;

    row.appendChild(label);
    row.appendChild(bar);
    container.appendChild(row);
  }
}

function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
}

