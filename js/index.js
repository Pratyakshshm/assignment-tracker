/***********************
 * STORAGE HELPERS
 ***********************/
function getAssignments() {
  return JSON.parse(localStorage.getItem("assignments")) || [];
}

function saveAssignments(data) {
  localStorage.setItem("assignments", JSON.stringify(data));
}

/***********************
 * DOM REFERENCES
 ***********************/
const list = document.getElementById("assignmentList");
const modal = document.getElementById("modal");

const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const priorityInput = document.getElementById("priority");

/***********************
 * STATE
 ***********************/
let assignments = getAssignments();

/***********************
 * INIT
 ***********************/
autoMarkMissed();
render();

/***********************
 * RENDER
 ***********************/
function render() {
  list.innerHTML = "";
  assignments = getAssignments();

  assignments.forEach(a => {
    const card = document.createElement("div");
    card.className = `card ${a.priority.toLowerCase()}`;

    card.innerHTML = `
      <div>
        <h3>${a.title}</h3>
        <small>${a.subject}</small><br />
        <small>${new Date(a.deadline).toLocaleString()}</small>
      </div>

      <select onchange="changeStatus(${a.id}, this.value)">
        <option value="Pending" ${a.status === "Pending" ? "selected" : ""}>Pending</option>
        <option value="Submitted" ${a.status === "Submitted" ? "selected" : ""}>Submitted</option>
        <option value="Missed" ${a.status === "Missed" ? "selected" : ""}>Missed</option>
      </select>
    `;

    list.appendChild(card);
  });

  updateStats();
}

/***********************
 * STATUS CHANGE
 ***********************/
function changeStatus(id, status) {
  assignments = assignments.map(a =>
    a.id === id
      ? { ...a, status, submittedAt: status === "Submitted" ? new Date().toISOString() : a.submittedAt }
      : a
  );

  saveAssignments(assignments);
  render();
}

/***********************
 * AUTO MARK MISSED
 ***********************/
function autoMarkMissed() {
  const now = new Date();

  assignments = assignments.map(a =>
    a.status !== "Submitted" && new Date(a.deadline) < now
      ? { ...a, status: "Missed" }
      : a
  );

  saveAssignments(assignments);
}

/***********************
 * STATS
 ***********************/
function updateStats() {
  const total = assignments.length;
  const pending = assignments.filter(a => a.status === "Pending").length;
  const submitted = assignments.filter(a => a.status === "Submitted").length;
  const missed = assignments.filter(a => a.status === "Missed").length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("submittedCount").textContent = submitted;
  document.getElementById("missedCount").textContent = missed;
  document.getElementById("completion").textContent =
    total ? Math.round((submitted / total) * 100) + "%" : "0%";
}

/***********************
 * MODAL CONTROLS
 ***********************/
document.getElementById("addBtn").onclick = () => {
  modal.style.display = "flex";
};

document.getElementById("closeModal").onclick = () => {
  modal.style.display = "none";
};

/***********************
 * ADD ASSIGNMENT
 ***********************/
document.getElementById("saveAssignment").onclick = () => {
  if (!titleInput.value || !subjectInput.value || !deadlineInput.value) {
    alert("Please fill all required fields");
    return;
  }

  const assignment = {
    id: Date.now(),
    title: titleInput.value.trim(),
    subject: subjectInput.value.trim(),
    deadline: deadlineInput.value,
    priority: priorityInput.value,
    status: "Pending",
    createdAt: new Date().toISOString(),
    submittedAt: null
  };

  assignments.push(assignment);
  saveAssignments(assignments);

  modal.style.display = "none";

  titleInput.value = "";
  subjectInput.value = "";
  deadlineInput.value = "";

  render();
};