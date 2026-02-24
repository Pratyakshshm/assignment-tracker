const calendarGrid = document.getElementById("calendarGrid");

const assignments = JSON.parse(localStorage.getItem("assignments")) || [];

const today = new Date();
let currentMonth = today.getMonth(); // 0-based
let currentYear = today.getFullYear();

renderCalendar(currentMonth, currentYear);

function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const dateLabel = document.createElement("span");
    dateLabel.textContent = day;
    cell.appendChild(dateLabel);

    // Match assignments for this date
    const dailyAssignments = assignments.filter(a => {
      const d = new Date(a.deadline);
      return (
        d.getDate() === day &&
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

    dailyAssignments.forEach(a => {
      const dot = document.createElement("div");
      dot.className = "dot " + a.priority.toLowerCase();
      dot.textContent = a.title;
      cell.appendChild(dot);
    });

    // Highlight today
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      cell.classList.add("today");
    }

    calendarGrid.appendChild(cell);
  }
}