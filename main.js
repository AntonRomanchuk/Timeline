async function renderMarkdown(markdown) {
  const res = await fetch("https://api.github.com/markdown", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ text: markdown, mode: "gfm" })
  });
  return await res.text(); // returns HTML
}

async function loadNotes() {
  const owner = "AntonRomanchuk";
  const repo = "Timeline";
  const label = "timeline-note"; // use your note label

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?labels=${label}`);
  const issues = await res.json();

  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

 for (const issue of issues) {
	 const htmlBody = await renderMarkdown(issue.body);
 
	 const el = document.createElement("div");
	 el.className = "note";
	 el.innerHTML = `
	   <h3>${issue.title}</h3>
	   <div class="body">${htmlBody}</div>
	   <small>By <b>${issue.user.login}</b> • ${new Date(issue.created_at).toLocaleDateString()}</small>
	 `;
	 timeline.appendChild(el);
   }
 }

loadNotes();
