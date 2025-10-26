async function loadNotes() {
  const owner = "AntonRomanchuk";
  const repo = "Timeline";
  const label = "timeline-note"; // use your note label

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?labels=${label}`);
  const issues = await res.json();

  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  issues.forEach(issue => {
	const el = document.createElement("div");
	el.className = "note";
	el.innerHTML = `
	  <h3>${issue.title}</h3>
	  <p>${issue.body}</p>
	  <small>By <b>${issue.user.login}</b> • ${new Date(issue.created_at).toLocaleDateString()}</small>
	`;
	timeline.appendChild(el);
  });
}
loadNotes();
