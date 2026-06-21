const data = window.PROJECT_DATA;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderMeta() {
  $("#meta-label").textContent = data.meta.label;
  $("#hero-title").textContent = data.meta.title;
  $("#hero-summary").textContent = data.meta.summary;
  $("#stack-list").innerHTML = data.meta.stack.map((item) => `<span>${item}</span>`).join("");

  $("#decision-value").textContent = data.decision.value;
  $("#decision-value").dataset.count = data.decision.value;
  $("#decision-heading").textContent = data.decision.label;
  $("#decision-context").textContent = data.decision.context;
  $("#decision-counts").innerHTML = data.decision.counts
    .map((item) => `<div><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");

  $("#highlight-grid").innerHTML = data.highlights
    .map(
      (item) => `
        <article class="highlight">
          <strong data-count="${item.value}">${item.value}</strong>
          <span>${item.label}</span>
          <small>${item.note}</small>
        </article>`,
    )
    .join("");
}


function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderDataPreview(activeId = "source") {
  const preview = window.SAMPLE_PREVIEW;
  if (!preview) return;
  const active = preview.datasets.find((dataset) => dataset.id === activeId) || preview.datasets[0];

  $("#data-preview-tabs").innerHTML = preview.datasets
    .map(
      (dataset) => `<button type="button" role="tab" data-preview-id="${dataset.id}"
        aria-selected="${dataset.id === active.id}" class="${dataset.id === active.id ? "is-active" : ""}">
        <span>${escapeHtml(dataset.label)}</span><small>10 rows</small>
      </button>`,
    )
    .join("");

  $("#data-preview-meta").innerHTML = `
    <div><span>LOCAL FILE</span><strong>${escapeHtml(active.file)}</strong></div>
    <p>${escapeHtml(active.description)}</p>`;

  const header = active.columns
    .map((column) => `<th scope="col">${escapeHtml(column)}</th>`)
    .join("");
  const rows = active.rows
    .map(
      (row, index) => `<tr><td class="row-index">${String(index + 1).padStart(2, "0")}</td>${active.columns
        .map((column) => `<td>${escapeHtml(row[column])}</td>`)
        .join("")}</tr>`,
    )
    .join("");

  $("#data-preview-table").innerHTML = `
    <thead><tr><th scope="col">ROW</th>${header}</tr></thead>
    <tbody>${rows}</tbody>`;

  $$("#data-preview-tabs button").forEach((button) => {
    button.addEventListener("click", () => renderDataPreview(button.dataset.previewId));
  });
}

function stageVisualMarkup(index) {
  const visuals = [
    `<div class="visual-frame raw-visual" data-mode="raw">
      <div class="visual-toolbar"><div><span class="live-dot"></span>DATA PREPARATION</div><div class="visual-controls"><button class="is-active" data-action="raw" type="button">Raw</button><button data-action="clean" type="button">Cleaned</button></div></div>
      <div class="interactive-stat"><strong data-clean-count>5,819,470</strong><span data-clean-label>input rows</span></div>
      <div class="raw-flow">
        <div class="comment-stack"><div><i></i><span style="--line:72%"></span></div><div class="duplicate"><i></i><span style="--line:66%"></span></div><div class="null-row"><i></i><span style="--line:54%"></span></div><div><i></i><span style="--line:60%"></span></div><div><i></i><span style="--line:48%"></span></div></div>
        <div class="flow-arrow">&rarr;</div>
        <div class="mini-table"><div class="table-row table-head"><span>creator</span><span>user_id</span><span>comment</span></div><div class="table-row"><span>channel_01</span><span>u_1842</span><span>my dog...</span></div><div class="table-row duplicate"><span>channel_01</span><span>u_1842</span><span>my dog...</span></div><div class="table-row null-row"><span>channel_14</span><span>u_9301</span><span>null</span></div></div>
      </div>
      <div class="interaction-note" data-clean-note>Switch views to inspect null filtering and de-duplication.</div>
    </div>`,
    `<div class="visual-frame label-visual" data-mode="preview">
      <div class="visual-toolbar"><div><span class="live-dot"></span>WEAK SUPERVISION</div><div class="visual-controls"><button class="is-active" data-action="preview" type="button">Preview</button><button data-action="apply" type="button">Apply rules</button></div></div>
      <div class="label-example"><div class="token-row"><span>I</span><span>love</span><b>my dog</b><span>so much</span></div><em data-rule-label>?</em></div>
      <div class="label-example"><div class="token-row"><span>We</span><b>have a puppy</b><span>at home</span></div><em data-rule-label>?</em></div>
      <div class="rule-line"><span>ownership phrase</span><i>&rarr;</i><strong data-rule-result>pending rule match</strong></div>
      <div class="interaction-note">Apply the phrase rules to create positive training signals.</div>
    </div>`,
    `<div class="visual-frame protect-visual" data-mode="before">
      <div class="visual-toolbar"><div><span class="live-dot"></span>LEAKAGE CONTROL</div><div class="visual-controls"><button class="is-active" data-action="before" type="button">Before mask</button><button data-action="after" type="button">Leakage-safe</button></div></div>
      <div class="mask-sequence"><span>I</span><span>love</span><del class="trigger-token">my</del><del class="trigger-token">dog</del><span>after</span><span>training</span></div>
      <div class="pipeline-arrow"><span data-mask-status>trigger tokens still visible</span><i>&darr;</i><span>feature views</span></div>
      <div class="matrix-pair feature-output"><div><strong>TF-IDF</strong><div class="matrix blue-matrix">${Array.from({length:20},(_,i)=>`<i style="--alpha:${(i%5+1)/6}"></i>`).join("")}</div></div><div><strong>Word2Vec</strong><div class="matrix teal-matrix">${Array.from({length:20},(_,i)=>`<i style="--alpha:${((i*3)%5+1)/6}"></i>`).join("")}</div></div></div>
      <div class="interaction-note">Mask rule tokens before learning either feature representation.</div>
    </div>`,
    `<div class="visual-frame compare-visual" data-metric="aucPr">
      <div class="visual-toolbar"><div><span class="live-dot"></span>3-FOLD CROSS-VALIDATION</div><div class="visual-controls"><button class="is-active" data-action="aucPr" type="button">AUC-PR</button><button data-action="f1" type="button">F1</button></div></div>
      <div class="mini-model-chart">${data.models.slice(0, 4).map((model) => `<div data-auc="${model.aucPr}" data-f1="${model.f1}"><span>${model.name.replace(" + Logistic Regression", " + LR")}</span><i><b style="width:${model.aucPr * 100}%"></b></i><strong>${model.aucPr.toFixed(3)}</strong></div>`).join("")}</div>
      <div class="selection-note"><span>current leader</span><strong data-model-leader>TF-IDF + LR / 0.821</strong></div>
      <div class="interaction-note">Switch metrics to see how the preferred trade-off changes.</div>
    </div>`,
    `<div class="visual-frame validate-visual" data-view="gold">
      <div class="visual-toolbar"><div><span class="live-dot amber-dot"></span>EVALUATION LAYERS</div><div class="visual-controls"><button data-action="weak" type="button">Weak-label test</button><button class="is-active" data-action="gold" type="button">Human gold set</button></div></div>
      <div class="validation-context"><span data-validation-label>human reviewed</span><strong data-validation-n>n = 300</strong></div>
      <div class="validation-metrics"><div><span>AUC-PR</span><strong data-validation-auc>0.704</strong></div><div><span>F1</span><strong data-validation-f1>0.655</strong></div></div>
      <div class="mini-confusion"><span>TP <b>76</b></span><span>FP <b>42</b></span><span>FN <b>38</b></span><span>TN <b>144</b></span></div>
      <div class="interaction-note" data-validation-note>Human review benchmarks the real classification task.</div>
    </div>`,
    `<div class="visual-frame aggregate-visual" data-mode="users">
      <div class="visual-toolbar"><div><span class="live-dot"></span>UNIT OF ANALYSIS</div><div class="visual-controls"><button data-action="comments" type="button">Comments</button><button class="is-active" data-action="users" type="button">By user</button></div></div>
      <div class="aggregate-flow"><div class="dot-cluster comments">${Array.from({length:18},()=>"<i></i>").join("")}</div><div class="aggregate-rule"><span>average probability</span><b>&rarr;</b><span>de-duplicate user_id</span></div><div class="dot-cluster users">${Array.from({length:8},()=>"<i></i>").join("")}</div><div class="outcome-ring"><strong>6.1%</strong><span>identified</span></div></div>
      <div class="interaction-note" data-aggregate-note>One decision per distinct user, not one count per comment.</div>
    </div>`,
  ];
  return visuals[index];
}

function setVisualControl(root, action) {
  root.querySelectorAll("[data-action]").forEach((button) => {
    const active = button.dataset.action === action;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function initStageInteraction(index, detail) {
  const visual = detail.querySelector(".visual-frame");
  if (!visual) return;
  visual.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      setVisualControl(visual, action);

      if (index === 0) {
        visual.dataset.mode = action;
        visual.querySelector("[data-clean-count]").textContent = action === "clean" ? "5,757,213" : "5,819,470";
        visual.querySelector("[data-clean-label]").textContent = action === "clean" ? "rows after cleaning" : "input rows";
        visual.querySelector("[data-clean-note]").textContent = action === "clean" ? "Null comments and duplicate records removed." : "Switch views to inspect null filtering and de-duplication.";
      }

      if (index === 1) {
        visual.dataset.mode = action;
        visual.querySelectorAll("[data-rule-label]").forEach((label) => (label.textContent = action === "apply" ? "1" : "?"));
        visual.querySelector("[data-rule-result]").textContent = action === "apply" ? "positive weak label" : "pending rule match";
      }

      if (index === 2) {
        visual.dataset.mode = action;
        visual.querySelector("[data-mask-status]").textContent = action === "after" ? "trigger tokens removed" : "trigger tokens still visible";
      }

      if (index === 3) {
        visual.dataset.metric = action;
        const rows = [...visual.querySelectorAll(".mini-model-chart > div")];
        let best = { value: -1, name: "" };
        rows.forEach((row) => {
          const value = Number(row.dataset[action]);
          row.querySelector("b").style.width = `${value * 100}%`;
          row.querySelector("strong").textContent = value.toFixed(3);
          row.classList.toggle("is-leading", value > best.value);
          if (value > best.value) best = { value, name: row.querySelector("span").textContent };
        });
        rows.forEach((row) => row.classList.toggle("is-leading", Number(row.dataset[action]) === best.value));
        visual.querySelector("[data-model-leader]").textContent = `${best.name} / ${best.value.toFixed(3)}`;
      }

      if (index === 4) {
        visual.dataset.view = action;
        const gold = action === "gold";
        visual.querySelector("[data-validation-label]").textContent = gold ? "human reviewed" : "rule-derived labels";
        visual.querySelector("[data-validation-n]").textContent = gold ? "n = 300" : "held-out test";
        visual.querySelector("[data-validation-auc]").textContent = gold ? "0.704" : "0.770";
        visual.querySelector("[data-validation-f1]").textContent = gold ? "0.655" : "0.705";
        visual.querySelector("[data-validation-note]").textContent = gold ? "Human review benchmarks the real classification task." : "Weak-label metrics support model selection before human validation.";
      }

      if (index === 5) {
        visual.dataset.mode = action;
        visual.querySelector("[data-aggregate-note]").textContent = action === "users" ? "One decision per distinct user, not one count per comment." : "Comment-level probabilities are the model's raw output.";
      }
    });
  });
}

function workflowMarkup(item, index) {
  return `
    <div class="detail-copy">
      <div class="detail-heading">
        <div class="detail-number">${item.number}</div>
        <div><h3>${item.title}</h3><p>${item.summary}</p></div>
      </div>
      <div class="detail-meta">
        <div><span>Implementation</span><strong>${item.implementation}</strong></div>
        <div><span>Analytical judgment</span><strong>${item.judgment}</strong></div>
      </div>
    </div>
    <div class="step-visual" aria-label="Technical diagram for ${item.title}">${stageVisualMarkup(index)}</div>`;
}

function selectWorkflow(index, focusPanel = false) {
  const item = data.story[index];
  $$(".workflow-tab").forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  const detail = $("#workflow-detail");
  detail.innerHTML = workflowMarkup(item, index);
  initStageInteraction(index, detail);
  detail.setAttribute("aria-label", `${item.number} ${item.title}`);
  if (focusPanel) detail.focus({ preventScroll: true });
}

function renderWorkflow() {
  $("#workflow-rail").innerHTML = data.story
    .map(
      (item, index) => `
        <button class="workflow-tab${index === 0 ? " is-active" : ""}"
          type="button" role="tab" aria-selected="${index === 0}" data-index="${index}">
          <span>${item.number}</span><span>${item.short}</span>
        </button>`,
    )
    .join("");

  $$(".workflow-tab").forEach((tab) => {
    tab.addEventListener("click", () => selectWorkflow(Number(tab.dataset.index)));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const current = Number(tab.dataset.index);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (current + direction + data.story.length) % data.story.length;
      selectWorkflow(next);
      $$(".workflow-tab")[next].focus();
    });
  });

  selectWorkflow(0);
}

function renderModels(metric = "aucPr") {
  const metricLabel = metric === "aucPr" ? "AUC-PR" : "F1";
  const bestValue = Math.max(...data.models.map((model) => model[metric]));
  $("#model-chart").innerHTML = data.models
    .map((model) => {
      const value = model[metric];
      const isBest = value === bestValue;
      return `
        <div class="model-row${isBest ? " is-selected" : ""}">
          <div class="model-name">${model.name}${isBest ? `<small>best ${metricLabel}</small>` : ""}</div>
          <div class="bar-track" aria-label="${model.name} ${metricLabel} ${value.toFixed(3)}">
            <div class="bar-fill" data-width="${value * 100}"></div>
          </div>
          <div class="model-value">${value.toFixed(3)}</div>
        </div>`;
    })
    .join("");

  requestAnimationFrame(() => {
    $$(".bar-fill").forEach((bar) => {
      bar.style.width = `${bar.dataset.width}%`;
    });
  });
}

function renderEvidence() {
  renderModels();
  $$(".metric-switch button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".metric-switch button").forEach((candidate) => candidate.classList.remove("is-active"));
      button.classList.add("is-active");
      renderModels(button.dataset.metric);
    });
  });

  $("#gold-metrics").innerHTML = data.gold.metrics
    .map((metric) => `<div class="gold-metric"><span>${metric.label}</span><strong>${metric.value}</strong></div>`)
    .join("");

  $("#confusion-matrix").innerHTML = data.gold.confusion
    .map(
      (cell) => `
        <div class="confusion-cell ${cell.key}">
          <span>${cell.label}</span><strong>${cell.value}</strong>
        </div>`,
    )
    .join("");
}

function renderGuardrails() {
  $("#guardrail-grid").innerHTML = data.guardrails
    .map(
      (item, index) => `
        <article class="guardrail-card reveal">
          <span class="guardrail-index">0${index + 1}</span>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>`,
    )
    .join("");

  $("#roadmap-list").innerHTML = data.roadmap.map((item) => `<li>${item}</li>`).join("");
}

function initReveal() {
  const elements = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  elements.forEach((element) => observer.observe(element));
}

function initProgress() {
  const bar = $("#page-progress-bar");
  const header = $(".site-header");
  const hero = $(".hero");
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    header.classList.toggle("is-light", window.scrollY > hero.offsetHeight - header.offsetHeight * 1.5);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMetricCounters() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const counters = $$("[data-count]");
  const animate = (element) => {
    if (element.dataset.animated) return;
    element.dataset.animated = "true";
    const label = element.dataset.count;
    const match = label.match(/^([0-9.]+)(.*)$/);
    if (!match || reduceMotion) {
      element.textContent = label;
      return;
    }

    const target = Number(match[1]);
    const suffix = match[2];
    const decimals = (match[1].split(".")[1] || "").length;
    const start = performance.now();
    const duration = 950;
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.55 });

  counters.forEach((counter) => observer.observe(counter));
}

function initHeroMotion() {
  const hero = $(".hero");
  const atmosphere = $(".hero-atmosphere");
  const card = $(".decision-card");
  const canMove = window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canMove) return;

  hero.addEventListener("pointermove", (event) => {
    const box = hero.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width * 2 - 1;
    const y = (event.clientY - box.top) / box.height * 2 - 1;
    atmosphere.style.setProperty("--mx", x.toFixed(3));
    atmosphere.style.setProperty("--my", y.toFixed(3));
    if (event.clientX > box.left + box.width * 0.5) {
      card.style.transform = `perspective(900px) rotateX(${(-y * 2.4).toFixed(2)}deg) rotateY(${(x * 3.2).toFixed(2)}deg)`;
    }
  });

  hero.addEventListener("pointerleave", () => {
    atmosphere.style.setProperty("--mx", 0);
    atmosphere.style.setProperty("--my", 0);
    card.style.transform = "";
  });
}

renderMeta();
renderDataPreview();
renderWorkflow();
renderEvidence();
renderGuardrails();
initReveal();
initProgress();
initMetricCounters();
initHeroMotion();
