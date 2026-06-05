/* ════════════════════════════════════════════════
   architecture.js — SVG diagram & tech stack
   ════════════════════════════════════════════════ */

const Architecture = (() => {
  let activeNode = null;

  function _renderSVG() {
    const svg = document.getElementById("arch-svg");
    if (!svg) return;

    // Draw edges
    const edgesSVG = ARCH_EDGES.map(([a, b]) => {
      const na = ARCH_NODES.find(n => n.id === a);
      const nb = ARCH_NODES.find(n => n.id === b);
      return `<line x1="${na.x}" y1="${na.y + 6}" x2="${nb.x}" y2="${nb.y - 6}"
        stroke="#E3D9CC" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    }).join("");

    // Draw nodes
    const nodesSVG = ARCH_NODES.map(n => `
      <g class="arch-node" data-id="${n.id}" style="cursor:pointer">
        <circle cx="${n.x}" cy="${n.y}" r="18" fill="${n.color}" opacity="0.15"/>
        <circle cx="${n.x}" cy="${n.y}" r="11" fill="${n.color}" opacity="0.9"
          class="arch-node-circle" id="nc-${n.id}"/>
        <text x="${n.x}" y="${n.y + 28}" text-anchor="middle"
          font-size="8.5" fill="#2B2B2B" font-weight="600"
          font-family="DM Sans, system-ui, sans-serif">${n.label}</text>
      </g>
    `).join("");

    svg.innerHTML = edgesSVG + nodesSVG;

    // Node click listeners
    svg.querySelectorAll(".arch-node").forEach(el => {
      el.addEventListener("click", () => {
        const nodeId = el.dataset.id;
        activeNode = activeNode === nodeId ? null : nodeId;
        _updateDetail();
        _highlightNode(nodeId);
      });
    });
  }

  function _updateDetail() {
    const box = document.getElementById("arch-detail");
    if (!box) return;
    if (!activeNode) {
      box.style.borderLeftColor = "var(--sand)";
      box.innerHTML = `
        <div class="arch-detail-empty">
          <span class="arch-detail-icon"></span>
          <p>Click a node in the diagram to see details about that layer</p>
        </div>`;
      return;
    }
    const node = ARCH_NODES.find(n => n.id === activeNode);
    box.style.borderLeftColor = node.color;
    box.innerHTML = `
      <div class="arch-detail-title">${node.label}</div>
      <div class="arch-detail-body">${node.desc}</div>
    `;
  }

  function _highlightNode(clickedId) {
    ARCH_NODES.forEach(n => {
      const circle = document.getElementById(`nc-${n.id}`);
      if (!circle) return;
      if (n.id === clickedId && activeNode) {
        circle.setAttribute("r", "14");
        circle.setAttribute("opacity", "1");
      } else {
        circle.setAttribute("r", "11");
        circle.setAttribute("opacity", "0.9");
      }
    });
  }

  function _renderTechStack() {
    const list = document.getElementById("tech-stack-list");
    if (!list) return;
    list.innerHTML = TECH_STACK.map(t => `
      <div class="tech-item">
        <span class="tech-icon">${t.icon}</span>
        <div>
          <span class="tech-name">${t.name}</span>
          <span class="tech-role">${t.role}</span>
        </div>
        <div class="tech-dot" style="background:${t.color}"></div>
      </div>
    `).join("");
  }

  function _renderGQL() {
    const pre = document.getElementById("gql-snippet");
    if (pre) pre.textContent = GQL_SNIPPET;
  }

  function init() {
    _renderSVG();
    _renderTechStack();
    _renderGQL();
  }

  return { init };
})();
