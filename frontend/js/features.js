/* ════════════════════════════════════════════════
   features.js — Feature cards & comparison table
   ════════════════════════════════════════════════ */

const Features = (() => {
  function _renderCards() {
    const grid = document.getElementById("features-grid");
    if (!grid) return;
    grid.innerHTML = FEATURES.map(f => `
      <div class="feature-card" style="border-top-color:${f.color}">
        <div class="feature-icon">${f.icon}</div>
        <div class="feature-title">${f.title}</div>
        <div class="feature-body">${f.body}</div>
      </div>
    `).join("");
  }

  function _renderTable() {
    const table = document.getElementById("comparison-table");
    if (!table) return;
    table.innerHTML = `
      <thead>
        <tr>
          <th>Feature</th>
          <th>Traditional Theme</th>
          <th>Headless (This Demo)</th>
        </tr>
      </thead>
      <tbody>
        ${COMPARISON_ROWS.map(([feat, trad, head]) => `
          <tr>
            <td style="font-weight:600;color:var(--charcoal)">${feat}</td>
            <td style="color:var(--mid)">${trad}</td>
            <td class="highlight">${head}</td>
          </tr>
        `).join("")}
      </tbody>
    `;
  }

  function init() {
    _renderCards();
    _renderTable();
  }

  return { init };
})();
