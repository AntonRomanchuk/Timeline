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

  // Compute unread notes
  const unreadNotes = issues.filter(issue => !readNotes[issue.id]);

  // Add "Mark all as read" button above the list if there are unread notes
  if (unreadNotes.length > 0) {
    const markAllBtn = document.createElement("button");
    markAllBtn.textContent = `Mark all as read (${unreadNotes.length})`;
    markAllBtn.style.marginBottom = "1rem";
    markAllBtn.addEventListener("click", () => {
      unreadNotes.forEach(issue => readNotes[issue.id] = true);
      saveReadNotes(readNotes);
      loadNotes(); // refresh
    });
    timeline.appendChild(markAllBtn);
  }

  // Render notes
  for (const issue of issues) {
    const htmlBody = await renderMarkdown(issue.body);
    const isRead = !!readNotes[issue.id]; // normalize to true/false

    const el = document.createElement("div");
    el.className = "note";
    el.style.background = isRead ? "white" : highlightColor;

    const markReadBtnHtml = !isRead ? `<button class="mark-read">Mark as read</button>` : "";

    el.innerHTML = `
      <h3>${issue.title}</h3>
      <div class="body">${htmlBody}</div>
      <small>By <b>${issue.user.login}</b> • ${new Date(issue.created_at).toLocaleDateString()}</small>
      <div style="margin-top:0.5rem">
        ${markReadBtnHtml}
        <a href="${issue.html_url}#new_comment_field" target="_blank">
          <button>Leave a comment</button>
        </a>
      </div>
      <hr/>
    `;

    timeline.appendChild(el);

    // Mark single note as read
    if (!isRead) {
      el.querySelector(".mark-read").addEventListener("click", () => {
        readNotes[issue.id] = true;
        saveReadNotes(readNotes);

        // Trigger smooth background transition
        el.style.background = "white";

        // Hide the button
        el.querySelector(".mark-read").style.display = "none";

        // Update "Mark all as read" counter
        const allBtn = timeline.querySelector("button");
        if (allBtn) {
          const remaining = unreadNotes.length - 1;
          if (remaining > 0) {
            allBtn.textContent = `Mark all as read (${remaining})`;
          } else {
            allBtn.remove();
          }
        }
      });
    }
  }

  // Apply syntax highlighting
  applyHighlighting();
}

// -----------------------------
// Initialize
// -----------------------------
loadNotes();