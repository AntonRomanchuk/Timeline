// -----------------------------
// Config
// -----------------------------
const owner = "AntonRomanchuk";     // Replace with repo owner
const repo = "Timeline";     // Replace with repo name
const label = "timeline-note";     // GitHub label for notes
const highlightColor = "#fff8dc";  // Background for unread notes

// -----------------------------
// Markdown rendering via GitHub API
// -----------------------------
async function renderMarkdown(markdown) {
  const res = await fetch("https://api.github.com/markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: markdown, mode: "gfm" })
  });
  return await res.text();
}

// -----------------------------
// LocalStorage helpers
// -----------------------------
function getReadNotes() {
  return JSON.parse(localStorage.getItem("readNotes") || "{}");
}

function saveReadNotes(readNotes) {
  localStorage.setItem("readNotes", JSON.stringify(readNotes));
}

// -----------------------------
// Highlight.js setup
// -----------------------------
function applyHighlighting() {
  document.querySelectorAll('pre code').forEach(el => {
    hljs.highlightElement(el);
  });
}

// -----------------------------
// Load and render notes
// -----------------------------
async function loadNotes() {
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?labels=${label}`);
  const issues = await res.json();

  let readNotes = getReadNotes();
  const isFirstVisit = Object.keys(readNotes).length === 0;

  // On first visit, mark all existing notes as read
  if (isFirstVisit) {
    issues.forEach(issue => readNotes[issue.id] = true);
    saveReadNotes(readNotes);
  }

  // Compute unread notes
  const unreadNotes = issues.filter(issue => !readNotes[issue.id]);

  // Add "Mark all as read" button if more than 1 unread
  if (unreadNotes.length > 1) {
    const markAllBtn = document.createElement("button");
    markAllBtn.textContent = "Mark all as read";
    markAllBtn.style.marginBottom = "1rem";
    markAllBtn.addEventListener("click", () => {
      unreadNotes.forEach(issue => readNotes[issue.id] = true);
      saveReadNotes(readNotes);
      loadNotes(); // refresh
    });
    timeline.appendChild(markAllBtn);
  }

  for (const issue of issues) {
    const htmlBody = await renderMarkdown(issue.body);
    const isRead = readNotes[issue.id];

    const el = document.createElement("div");
    el.className = "note";
    el.style.background = isRead ? "white" : highlightColor;

    el.innerHTML = `
      <h3>${issue.title}</h3>
      <div class="body">${htmlBody}</div>
      <small>By <b>${issue.user.login}</b> • ${new Date(issue.created_at).toLocaleDateString()}</small>
      <div style="margin-top:0.5rem">
        <button class="mark-read">Mark as read</button>
        <a href="${issue.html_url}#new_comment_field" target="_blank">
          <button>Leave a comment</button>
        </a>
      </div>
      <hr/>
    `;

    timeline.appendChild(el);

    // Mark single note as read
    el.querySelector(".mark-read").addEventListener("click", () => {
      readNotes[issue.id] = true;
      saveReadNotes(readNotes);
      el.style.background = "white";
    });
  }

  // Apply syntax highlighting
  applyHighlighting();
}

// -----------------------------
// Initialize
// -----------------------------
loadNotes();