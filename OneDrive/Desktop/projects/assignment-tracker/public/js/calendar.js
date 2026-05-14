const token = localStorage.getItem('adt_token');
if (!token) window.location.href = 'login.html';

const authHeaders = { "Authorization": `Bearer ${token}` };

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("adt_token");
  localStorage.removeItem("adt_email");
  window.location.href = "login.html";
});

const userEmail = localStorage.getItem('adt_email');
if (userEmail) {
  const el = document.getElementById("userEmail");
  if (el) el.textContent = userEmail;
}

const calendarGrid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

const API_URL = "http://localhost:5000/api/assignments";

let assignments = [];
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

init();

async function init() {
  assignments = await getAssignments();
  renderCalendar(currentMonth, currentYear);
}

async function getAssignments() {
  try {
    const res = await fetch(API_URL, { headers: authHeaders });
    if (res.status === 401) {
      localStorage.removeItem("adt_token");
      window.location.href = "login.html";
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching assignments:", err);
    return [];
  }
}

function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";

  monthYear.textContent = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const dateLabel = document.createElement("span");
    dateLabel.className = "date-number";
    dateLabel.textContent = day;
    cell.appendChild(dateLabel);

    assignments
      .filter(a => {
        const d = new Date(a.deadline);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      })
      const dayAssignments = assignments.filter(a => {
  const d = new Date(a.deadline);
  return d.getDate() === day &&
         d.getMonth() === month &&
         d.getFullYear() === year;
});

if (dayAssignments.length > 0) {
  const a = dayAssignments[0];

  cell.classList.add(a.priority.toLowerCase());

  const tag = document.createElement("div");
  tag.className = `calendar-tag ${a.priority.toLowerCase()}`;
  tag.textContent = a.subject;
  tag.title = a.title;

  cell.appendChild(tag);
}

    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add("today");
    }

    calendarGrid.appendChild(cell);
  }
}

prevBtn.addEventListener("click", async () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  assignments = await getAssignments();
  renderCalendar(currentMonth, currentYear);
});

nextBtn.addEventListener("click", async () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  assignments = await getAssignments();
  renderCalendar(currentMonth, currentYear);
});
