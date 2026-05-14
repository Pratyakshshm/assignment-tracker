const token = localStorage.getItem('adt_token');
const userEmail = localStorage.getItem('adt_email');
if (!token) window.location.href = 'login.html';

const API_URL = "http://localhost:5000/api/assignments";
const authHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};

let assignments = [];
let editId = null;

function setGreeting() {
  const h = new Date().getHours();
  const name = userEmail ? userEmail.split('@')[0] : '';
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${time} — let's get things done.`;
}
setGreeting();

if (userEmail) {
  const el = document.getElementById("userEmail");
  if (el) el.textContent = userEmail;
}

document.getElementById("logoutBtn")?.addEventListener("click", logout);

function logout() {
  localStorage.removeItem("adt_token");
  localStorage.removeItem("adt_email");
  window.location.href = "login.html";
}

flatpickr("#deadline", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  minDate: "today"
});

const modal = document.getElementById("modal");
const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");
const descriptionInput = document.getElementById("description");
const tagsInput = document.getElementById("tags");
const professorInput = document.getElementById("professor");
const roomInput = document.getElementById("room");

document.getElementById("addBtn").onclick = () => {
  editId = null;
  clearForm();
  document.getElementById("modalTitle").textContent = "New Assignment";
  modal.style.display = "flex";
};

document.getElementById("closeModal").onclick = () => { modal.style.display = "none"; };

document.getElementById("saveAssignment").onclick = async () => {
  const title = titleInput.value.trim();
  const subject = subjectInput.value.trim();
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;
  const description = descriptionInput.value.trim();
  const professor = professorInput.value.trim();
const room = roomInput.value.trim();

  const tags = tagsInput.value
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  if (!title || !subject || !deadline) {
    return alert("Please fill all required fields");
  }

  const data = {
    title,
    subject,
    description,
    deadline,
    priority,
    status: "Pending",
    tags,
    details: {
    professor,
    room
  }
  };

  console.log("Sending data:", data); // 🔍 debug

  if (editId) {
    await updateAssignment(editId, data);
  } else {
    await addAssignment(data);
  }

  modal.style.display = "none";
  clearForm();
  renderAll();
};

document.getElementById("searchInput")?.addEventListener("input", renderList);
document.getElementById("filterPriority")?.addEventListener("change", renderList);
document.getElementById("filterStatus")?.addEventListener("change", renderList);

function clearForm() {
  titleInput.value = "";
  subjectInput.value = "";
  deadlineInput.value = "";
  priorityInput.value = "Medium";
  descriptionInput.value = "";
  tagsInput.value = ""; 
  professorInput.value = "";
  roomInput.value = "";
}

async function getAssignments() {
  const res = await fetch(API_URL, { headers: authHeaders });
  if (res.status === 401) { logout(); return []; }
  return await res.json();
}

async function addAssignment(data) {
  const res = await fetch(API_URL, { method: "POST", headers: authHeaders, body: JSON.stringify(data) });
  if (res.status === 401) { logout(); return; }
  return await res.json();
}

async function updateAssignment(id, data) {
  const res = await fetch(`${API_URL}/${id}`, { method: "PUT", headers: authHeaders, body: JSON.stringify(data) });
  if (res.status === 401) { logout(); return; }
  return await res.json();
}

async function deleteAssignmentAPI(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: authHeaders });
  if (res.status === 401) logout();
}

async function renderAll() {
  assignments = await getAssignments();
  renderStats();
  renderList();
  renderDonut();
  renderDueSoon();
  renderCritical();
}

function renderStats() {
  const total = assignments.length;
  const submitted = assignments.filter(a => a.status === "Submitted").length;
  const pending = assignments.filter(a => a.status === "Pending").length;
  const missed = assignments.filter(a => a.status === "Missed").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("submittedCount").textContent = submitted;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("missedCount").textContent = missed;

  const submittedDates = assignments
    .filter(a => a.status === "Submitted")
    .map(a => new Date(a.deadline).toDateString());
  const uniqueDates = [...new Set(submittedDates)];
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (uniqueDates.includes(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  document.getElementById("streakCount").textContent = streak;
}

function renderList() {
  const list = document.getElementById("assignmentList");
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const filterP = document.getElementById("filterPriority")?.value || "All";
  const filterS = document.getElementById("filterStatus")?.value || "All";

  const filtered = assignments.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search) || a.subject.toLowerCase().includes(search);
    const matchP = filterP === "All" || a.priority === filterP;
    const matchS = filterS === "All" || a.status === filterS;
    return matchSearch && matchP && matchS;
  });

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div>No assignments found</div>
      </div>`;
    return;
  }

  list.innerHTML = "";
  const now = new Date();

  filtered.forEach(a => {
    const deadline = new Date(a.deadline);
    const isOverdue = deadline < now && a.status !== "Submitted";

    const date = deadline.toLocaleDateString();
    const time = deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement("div");
    card.className = `assignment-card ${a.priority.toLowerCase()}-card`;

    card.innerHTML = `
      <div class="card-row1">
        <div class="card-title">${a.title}</div>
        <div class="card-badges">
          <span class="badge ${a.priority.toLowerCase()}">${a.priority}</span>
          <span class="status-pill ${a.status}">${a.status}</span>
        </div>
      </div>

      <div class="card-row2">
        <div class="card-meta">
          <span class="meta-item subject">📚 ${a.subject}</span>
          <span class="dot">•</span>
          <span class="meta-item ${isOverdue ? 'overdue' : ''}">📅 ${date}</span>
          <span class="dot">•</span>
          <span class="meta-item ${isOverdue ? 'overdue' : ''}">⏰ ${time}</span>
        </div>
      </div>

      <div class="card-actions-row">
        <select class="status-select-sm" onchange="changeStatus('${a._id}', this.value)">
          <option value="Pending"   ${a.status === "Pending"   ? "selected" : ""}>Pending</option>
          <option value="Submitted" ${a.status === "Submitted" ? "selected" : ""}>Submitted</option>
          <option value="Missed"    ${a.status === "Missed"    ? "selected" : ""}>Missed</option>
        </select>
        <button class="btn-sm edit-btn" onclick="editAssignment('${a._id}')">✏️ Edit</button>
        <button class="btn-sm delete-btn" onclick="removeTask('${a._id}')">🗑 Delete</button>
      </div>
    `;

    list.appendChild(card);
  });
}

function renderDonut() {
  const canvas = document.getElementById("donutChart");
  const ctx = canvas.getContext("2d");
  const total = assignments.length;
  const submitted = assignments.filter(a => a.status === "Submitted").length;
  const pct = total ? Math.round((submitted / total) * 100) : 0;

  document.getElementById("completionPct").textContent = pct + "%";

  ctx.clearRect(0, 0, 100, 100);
  const cx = 50, cy = 50, r = 38, lw = 10;
  const start = -Math.PI / 2;
  const end = start + (pct / 100) * Math.PI * 2;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = lw;
  ctx.stroke();

  // Fill
  if (pct > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = "#4f8fff";
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

function renderDueSoon() {
  const el = document.getElementById("dueSoonList");
  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const soon = assignments
    .filter(a => {
      const d = new Date(a.deadline);
      return d >= now && d <= in48h && a.status !== "Submitted";
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (soon.length === 0) {
    el.innerHTML = `<div class="side-empty">No assignments due in the next 48 hours 🎉</div>`;
    return;
  }

  el.innerHTML = "";
  soon.forEach(a => {
    const d = new Date(a.deadline);
    const hoursLeft = Math.round((d - now) / 36e5);
    const urgent = hoursLeft < 12;
    el.innerHTML += `
      <div class="side-item">
        <div class="side-item-left">
          <div class="side-item-title">${a.title}</div>
          <div class="side-item-sub">📚 ${a.subject}</div>
        </div>
        <div class="side-item-right">
          <span class="due-chip ${urgent ? 'urgent' : ''}">${hoursLeft}h left</span>
        </div>
      </div>`;
  });
}

function renderCritical() {
  const el = document.getElementById("criticalList");
  const critical = assignments.filter(a => a.priority === "High" && a.status !== "Submitted");

  if (critical.length === 0) {
    el.innerHTML = `<div class="side-empty">No high priority assignments 👍</div>`;
    return;
  }

  el.innerHTML = "";
  critical.forEach(a => {
    const d = new Date(a.deadline);
    el.innerHTML += `
      <div class="side-item">
        <div class="side-item-left">
          <div class="side-item-title">${a.title}</div>
          <div class="side-item-sub">📚 ${a.subject} · ${d.toLocaleDateString()}</div>
        </div>
        <div class="side-item-right">
          <span class="status-pill ${a.status}">${a.status}</span>
        </div>
      </div>`;
  });
}

async function changeStatus(id, status) {
  await updateAssignment(id, { status });
  renderAll();
}

async function removeTask(id) {
  if (!confirm("Delete this assignment?")) return;
  await deleteAssignmentAPI(id);
  renderAll();
}

function editAssignment(id) {
  const a = assignments.find(x => x._id === id);

  titleInput.value = a.title;
  subjectInput.value = a.subject;
  deadlineInput.value = a.deadline.slice(0, 16);
  priorityInput.value = a.priority;

  descriptionInput.value = a.description || "";
  tagsInput.value = a.tags ? a.tags.join(", ") : "";

  professorInput.value = a.details?.professor || "";
  roomInput.value = a.details?.room || "";
  editId = id;
  document.getElementById("modalTitle").textContent = "Edit Assignment";
  modal.style.display = "flex";
}
renderAll();