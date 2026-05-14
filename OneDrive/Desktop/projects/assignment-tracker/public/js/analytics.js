const token = localStorage.getItem('adt_token');
if (!token) window.location.href = 'login.html';

const API_URL = "http://localhost:5000/api/assignments";
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

document.addEventListener("DOMContentLoaded", async () => {
  const assignments = await getAssignments();
  drawPieChart(assignments);
  drawBarChart(assignments);
});

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

function drawPieChart(assignments) {
  const canvas = document.getElementById("pieChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const counts = { Pending: 0, Submitted: 0, Missed: 0 };
  assignments.forEach(a => {
    if (counts[a.status] !== undefined) counts[a.status]++;
  });

  const values = Object.values(counts);
  const labels = Object.keys(counts);
  const colors = ["#facc15", "#22c55e", "#ef4444"];

  const total = values.reduce((a, b) => a + b, 0);

  if (total === 0) {
    ctx.fillStyle = "#666";
    ctx.font = "14px Manrope, Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data yet", canvas.width / 2, canvas.height / 2);
    return;
  }

  let startAngle = -Math.PI / 2;

  values.forEach((value, i) => {
    const slice = (value / total) * Math.PI * 2;

    // Create subtle gradient (depth)
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, "#000000");

    ctx.beginPath();
    ctx.arc(150, 150, 110, startAngle, startAngle + slice);
    ctx.arc(150, 150, 65, startAngle + slice, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.fill();

    // subtle separator
    ctx.strokeStyle = "#0f1623";
    ctx.lineWidth = 3;
    ctx.stroke();

    startAngle += slice;
  });

  // center text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px Manrope";
  ctx.textAlign = "center";
  ctx.fillText(total, 150, 145);

  ctx.font = "12px Manrope";
  ctx.fillStyle = "#6b7a99";
  ctx.fillText("Total", 150, 165);


  const legend = document.getElementById("pieLegend");
legend.innerHTML = "";

labels.forEach((label, i) => {
  const item = document.createElement("div");
  item.className = "legend-item";

  item.innerHTML = `
    <span class="legend-dot" style="background:${colors[i]}"></span>
    ${label} (${values[i]})
  `;

  legend.appendChild(item);
});
}

function drawBarChart(assignments) {
  const canvas = document.getElementById("barChart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const counts = { Low: 0, Medium: 0, High: 0 };
  assignments.forEach(a => { if (counts[a.priority] !== undefined) counts[a.priority]++; });

  const values = Object.values(counts);
  const labels = Object.keys(counts);
  const colors = ["#22c55e", "#facc15", "#ef4444"];

  const max = Math.max(...values, 1);
  const barWidth = 70;
  const gap = 40;
  const baseY = 240;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = baseY - (i / 4) * 180;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(380, y);
    ctx.stroke();
    ctx.fillStyle = "#555";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.fillText(Math.round((i / 4) * max), 24, y + 4);
  }

  values.forEach((value, i) => {
    const height = (value / max) * 180;
    const x = 55 + i * (barWidth + gap);

    // Bar
    const grad = ctx.createLinearGradient(0, baseY - height, 0, baseY);
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, colors[i] + "55");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, baseY - height, barWidth, height, [6, 6, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = "#bbb";
    ctx.font = "13px Space Grotesk, Arial";
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x + barWidth / 2, baseY + 18);

    // Value on top
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Space Grotesk, Arial";
    ctx.fillText(value, x + barWidth / 2, baseY - height - 8);
  });
}
