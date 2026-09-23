/* MLA Evidence Integration Lab
   Vanilla JS, no build step, no external dependencies.
   Progress persists to localStorage so students can leave and come back. */

(function () {
  "use strict";

  var STORAGE_KEY = "mlaEvidenceLabState_v1";

  var MODULES = [
    { id: "welcome", label: "Welcome" },
    { id: "parts", label: "1. Parts of an Argument" },
    { id: "roadmap", label: "2. Essay Roadmap" },
    { id: "evidence", label: "3. Integrating Evidence (MLA)" },
    { id: "pagenum", label: "4. Finding the Right Page Number" },
    { id: "counterclaim", label: "5. Counterclaim & Rebuttal" },
    { id: "coach1", label: "6. Coach: Body Paragraph 1" },
    { id: "coach2", label: "7. Coach: Body Paragraph 2" },
    { id: "coach3", label: "8. Coach: Counterclaim/Rebuttal" },
    { id: "checklist", label: "9. Final Checklist" },
    { id: "certificate", label: "10. Certificate" }
  ];

  var CHECKLIST_ITEMS = [
    "My thesis statement is the last sentence of my introduction and makes a clear, arguable claim.",
    "Each body paragraph opens with a topic sentence that states one reason supporting my thesis.",
    "Every quotation is introduced with a signal phrase and a present-tense reporting verb (argues, explains, notes—not \u201cwas saying\u201d).",
    "Every in-text citation follows MLA format: (Author Page#) with no comma and no \u201cp.\u201d before the number.",
    "Every source I quote or paraphrase has a matching entry on my Works Cited page.",
    "Each piece of evidence is followed by my own analysis explaining why it matters—not just a quote left to speak for itself.",
    "My counterclaim/rebuttal paragraph states the opposing view fairly before I rebut it.",
    "I avoided \u201cquote bombs\u201d (dropping a quotation into the paragraph with no introduction or follow-up).",
    "I proofread my paragraphs one more time before submitting."
  ];

  var defaultState = function () {
    return {
      currentModule: "welcome",
      completed: {},
      quiz: { partsAnswer: null, partsCorrect: false },
      verb: { answer: null, correct: false },
      pagenum: { answer: null, correct: false },
      order: { arrangement: null, correct: false },
      coach: {
        coach1: { text: "", checked: false, markedDone: false },
        coach2: { text: "", checked: false, markedDone: false },
        coach3: { text: "", checked: false, markedDone: false }
      },
      checklist: {},
      studentName: ""
    };
  };

  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      var merged = defaultState();
      for (var k in parsed) if (Object.prototype.hasOwnProperty.call(parsed, k)) merged[k] = parsed[k];
      return merged;
    } catch (err) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* localStorage unavailable; progress just won't persist across visits */
    }
  }

  function moduleIndex(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return i;
    return -1;
  }

  function isUnlocked(id) {
    var idx = moduleIndex(id);
    if (idx <= 0) return true;
    var prev = MODULES[idx - 1];
    return !!state.completed[prev.id];
  }

  function markComplete(id) {
    state.completed[id] = true;
    saveState();
    renderSidebar();
    renderProgress();
  }

  function goTo(id) {
    if (!isUnlocked(id)) return;
    state.currentModule = id;
    saveState();
    renderSidebar();
    renderModule();
    document.getElementById("main").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderProgress() {
    var total = MODULES.length;
    var done = 0;
    MODULES.forEach(function (m) { if (state.completed[m.id]) done++; });
    var pct = Math.round((done / total) * 100);
    document.getElementById("progress-percent").textContent = pct + "%";
    document.getElementById("progress-bar-fill").style.width = pct + "%";
  }

  function renderSidebar() {
    var list = document.getElementById("module-list");
    list.innerHTML = "";
    MODULES.forEach(function (m) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      var unlocked = isUnlocked(m.id);
      var complete = !!state.completed[m.id];
      btn.className = "module-nav-btn" +
        (m.id === state.currentModule ? " active" : "") +
        (complete ? " complete" : "");
      btn.disabled = !unlocked;
      btn.innerHTML =
        '<span class="module-status">' + (complete ? "\u2713" : "") + "</span>" +
        '<span class="module-label">' + m.label + "</span>";
      btn.addEventListener("click", function () { goTo(m.id); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function h(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div;
  }

  function container() { return document.getElementById("module-container"); }

  function renderModule() {
    var id = state.currentModule;
    var renderers = {
      welcome: renderWelcome,
      parts: renderParts,
      roadmap: renderRoadmap,
      evidence: renderEvidence,
      pagenum: renderPageNum,
      counterclaim: renderCounterclaim,
      coach1: function () {
        renderCoachGeneric("coach1", "6. Coach: Body Paragraph 1",
          "your first body paragraph (your first reason supporting your thesis).",
          { checkFirstPerson: true }, "coach2");
      },
      coach2: function () {
        renderCoachGeneric("coach2", "7. Coach: Body Paragraph 2",
          "your second body paragraph (your second reason supporting your thesis).",
          { checkFirstPerson: true }, "coach3");
      },
      coach3: function () {
        renderCoachGeneric("coach3", "8. Coach: Counterclaim/Rebuttal Paragraph",
          "your counterclaim/rebuttal paragraph.",
          { checkCounterclaim: true }, "checklist");
      },
      checklist: renderChecklist,
      certificate: renderCertificate
    };
    (renderers[id] || renderWelcome)();
  }

  function nextButton(nextId, label) {
    return '<div class="btn-row"><button class="btn" id="next-btn">' + (label || "Continue") + "</button></div>";
  }

  function wireNext(nextId) {
    var btn = document.getElementById("next-btn");
    if (btn) btn.addEventListener("click", function () { goTo(nextId); });
  }

  /* ---------------- Module: Welcome ---------------- */
  function renderWelcome() {
    container().innerHTML =
      '<section class="card">' +
      "<h2>Welcome</h2>" +
      "<p>This lab walks you through building persuasive body paragraphs where your <strong>reason</strong>, your <strong>evidence</strong>, and your <strong>analysis</strong> all work together—and where every quotation is cited correctly in MLA style.</p>" +
      '<div class="callout"><strong>The formula:</strong> Reason &rarr; Evidence &rarr; Analysis. A paragraph that only quotes a source, without explaining it, isn\u2019t doing its job yet.</div>' +
      "<p>By the end, you\u2019ll revise and submit:</p>" +
      "<ul><li>Body Paragraph 1 (your first supporting reason)</li><li>Body Paragraph 2 (your second supporting reason)</li><li>One Counterclaim/Rebuttal paragraph</li></ul>" +
      "<p>Along the way you\u2019ll practice MLA in-text citation format, learn how to track down the right page number, and get feedback on your own paragraphs before you submit them.</p>" +
      nextButton("parts", "Begin") +
      "</section>";
    var btn = document.getElementById("next-btn");
    btn.addEventListener("click", function () {
      markComplete("welcome");
      goTo("parts");
    });
  }

  /* ---------------- Module: Parts of an Argument ---------------- */
  function renderParts() {
    var options = [
      { text: "\u201cAssigned seating in college classrooms helps students perform better because it reduces distractions.\u201d", key: "topic" },
      { text: "Chen states that \u201cstudents seated away from friends showed a twelve percent increase in quiz scores over one semester\u201d (118).", key: "evidence" },
      { text: "This increase suggests that seating placement, not effort alone, plays a measurable role in how well students focus during a lecture.", key: "analysis", correct: true },
      { text: "Assigned seating should therefore be standard practice in large lecture courses.", key: "thesis-ish" }
    ];

    var html =
      '<section class="card">' +
      "<h2>1. Parts of an Argument</h2>" +
      "<p>Every body paragraph is built from four moving parts:</p>" +
      "<ul>" +
      "<li><strong>Thesis statement</strong> &mdash; your paper\u2019s main claim, usually the last sentence of your introduction.</li>" +
      "<li><strong>Topic sentence</strong> &mdash; the first sentence of a body paragraph; introduces the one reason that paragraph is about.</li>" +
      "<li><strong>Evidence</strong> &mdash; a quotation or paraphrase from an outside source that supports the reason.</li>" +
      "<li><strong>Analysis</strong> &mdash; your own explanation of what the evidence means and why it matters. This is the part students most often skip.</li>" +
      "</ul>" +
      '<div class="example-box"><span class="label">Example paragraph</span>' +
      "Assigned seating in college classrooms helps students perform better because it reduces distractions. Chen states that \u201cstudents seated away from friends showed a twelve percent increase in quiz scores over one semester\u201d (118). This increase suggests that seating placement, not effort alone, plays a measurable role in how well students focus during a lecture. Assigned seating should therefore be standard practice in large lecture courses." +
      "</div>" +
      "<h3>Quick check</h3>" +
      "<p>Which sentence in the example above is the <strong>analysis</strong>?</p>" +
      '<div class="choice-group" id="parts-choices"></div>' +
      '<div id="parts-feedback"></div>' +
      "</section>";
    container().innerHTML = html;

    var group = document.getElementById("parts-choices");
    options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = opt.text;
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(group.children, function (c) { c.disabled = true; });
        var fb = document.getElementById("parts-feedback");
        if (opt.correct) {
          btn.classList.add("correct");
          fb.innerHTML = '<div class="feedback-msg good">Right. That sentence doesn\u2019t restate the quote or add new evidence—it explains what the quote proves. That\u2019s analysis.</div>' + nextButton("roadmap");
          state.quiz.partsCorrect = true;
          markComplete("parts");
        } else {
          btn.classList.add("incorrect");
          fb.innerHTML = '<div class="feedback-msg bad">Not quite. Look for the sentence that explains the meaning or significance of the quotation, rather than stating the claim, giving the quote itself, or extending the argument further.</div>';
          Array.prototype.forEach.call(group.children, function (c) { c.disabled = false; });
        }
        saveState();
        wireNext("roadmap");
      });
      group.appendChild(btn);
    });

    if (state.completed.parts) {
      document.getElementById("parts-feedback").innerHTML =
        '<div class="feedback-msg good">Already completed.</div>' + nextButton("roadmap");
      wireNext("roadmap");
    }
  }

  /* ---------------- Module: Roadmap ---------------- */
  function renderRoadmap() {
    container().innerHTML =
      '<section class="card">' +
      "<h2>2. Essay Roadmap</h2>" +
      "<p>Here\u2019s where your paragraphs fit in the whole essay:</p>" +
      '<div class="roadmap">' +
      '<div class="roadmap-step">Introduction<br><small>+ Thesis</small></div>' +
      '<div class="roadmap-arrow">&rarr;</div>' +
      '<div class="roadmap-step">Body Paragraph 1<br><small>Reason 1</small></div>' +
      '<div class="roadmap-arrow">&rarr;</div>' +
      '<div class="roadmap-step">Body Paragraph 2<br><small>Reason 2</small></div>' +
      '<div class="roadmap-arrow">&rarr;</div>' +
      '<div class="roadmap-step counterclaim">Counterclaim<br>&amp; Rebuttal</div>' +
      '<div class="roadmap-arrow">&rarr;</div>' +
      '<div class="roadmap-step">Conclusion</div>' +
      "</div>" +
      '<div class="callout gold"><strong>Note:</strong> the counterclaim/rebuttal paragraph comes near the end, after you\u2019ve made your own case—not at the start. You want your reasons on the record before you address the other side.</div>' +
      nextButton("evidence", "I understand the roadmap") +
      "</section>";
    var btn = document.getElementById("next-btn");
    btn.addEventListener("click", function () {
      markComplete("roadmap");
      goTo("evidence");
    });
  }

  /* ---------------- Module: Evidence Integration (MLA) ---------------- */
  function renderEvidence() {
    var html =
      '<section class="card">' +
      "<h2>3. Integrating Evidence (MLA)</h2>" +
      "<p>MLA in-text citations are simpler than you might expect once you know the pattern:</p>" +
      '<div class="example-box"><span class="label">Signal phrase + quotation + parenthetical</span>' +
      "Rivera argues, \u201cstructured peer review strengthens revision decisions\u201d (42)." +
      "</div>" +
      "<p>Because the author\u2019s name (Rivera) already appears in the sentence, only the page number goes in parentheses. If you leave the author\u2019s name out of your sentence, both the author and the page go inside the parentheses, with no comma between them:</p>" +
      '<div class="example-box"><span class="label">No signal-phrase name</span>' +
      "Structured peer review \u201cstrengthens revision decisions\u201d (Rivera 42)." +
      "</div>" +
      '<div class="callout"><strong>Two common APA habits to unlearn:</strong> MLA does not use \u201cp.\u201d before the page number, and MLA does not put a comma between the author\u2019s name and the page number. <code>(Rivera, p. 42)</code> is APA style, not MLA.</div>' +
      "<h3>Reporting verbs</h3>" +
      "<p>Use a present-tense verb to introduce a quotation—it signals how the source relates to your point.</p>" +
      "<p>Which verb best fits this sentence?</p>" +
      '<div class="example-box">Rivera ______ , \u201cstructured peer review strengthens revision decisions\u201d (42).</div>' +
      '<div class="choice-group" id="verb-choices"></div>' +
      '<div id="verb-feedback"></div>' +
      "</section>";
    container().innerHTML = html;

    var choices = [
      { text: "said", correct: false, note: "Not wrong, but vague and informal for academic writing. Try a more precise verb." },
      { text: "was saying", correct: false, note: "Wrong tense for MLA—stick to simple present tense (argues, explains, notes), not the past progressive." },
      { text: "argues", correct: true, note: "Present tense, and precise about how Rivera is using the claim (as an argument, not just a comment)." }
    ];

    var group = document.getElementById("verb-choices");
    choices.forEach(function (c) {
      var btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = c.text;
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(group.children, function (el) { el.disabled = true; });
        var fb = document.getElementById("verb-feedback");
        if (c.correct) {
          btn.classList.add("correct");
          fb.innerHTML = '<div class="feedback-msg good">' + c.note + "</div>" + nextButton("pagenum");
          state.verb.correct = true;
          markComplete("evidence");
        } else {
          btn.classList.add("incorrect");
          fb.innerHTML = '<div class="feedback-msg bad">' + c.note + "</div>";
          Array.prototype.forEach.call(group.children, function (el) { el.disabled = false; });
        }
        saveState();
        wireNext("pagenum");
      });
      group.appendChild(btn);
    });

    if (state.completed.evidence) {
      document.getElementById("verb-feedback").innerHTML =
        '<div class="feedback-msg good">Already completed.</div>' + nextButton("pagenum");
      wireNext("pagenum");
    }
  }

  /* ---------------- Module: Page Number ---------------- */
  function renderPageNum() {
    var html =
      '<section class="card">' +
      "<h2>4. Finding the Right Page Number</h2>" +
      "<p>An in-text citation is only useful if the page number is accurate. Never guess.</p>" +
      '<div class="callout"><strong>Rule:</strong> cite the page number printed on the page itself—not the PDF viewer\u2019s page count, and not the page number of the file.</div>' +
      "<h3>Scenario</h3>" +
      "<p>You open a PDF of a book chapter. Your PDF viewer says you\u2019re looking at \u201cpage 9 of 14.\u201d At the bottom corner of that page, printed as part of the scanned book page, you see the number <strong>112</strong>. Your quotation comes from this page. What page number do you cite?</p>" +
      '<div class="choice-group" id="pagenum-choices"></div>' +
      '<div id="pagenum-feedback"></div>' +
      "</section>";
    container().innerHTML = html;

    var choices = [
      { text: "Page 9 (the PDF viewer\u2019s page count)", correct: false },
      { text: "Page 112 (the page number printed on the scanned page)", correct: true },
      { text: "Page 14 (the total number of pages in the PDF)", correct: false }
    ];

    var group = document.getElementById("pagenum-choices");
    choices.forEach(function (c) {
      var btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = c.text;
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(group.children, function (el) { el.disabled = true; });
        var fb = document.getElementById("pagenum-feedback");
        if (c.correct) {
          btn.classList.add("correct");
          fb.innerHTML = '<div class="feedback-msg good">Correct—cite the page number that\u2019s actually printed on the page, since that\u2019s the number your reader would use to find the same passage in the original book.</div>' + nextButton("counterclaim");
          state.pagenum.correct = true;
          markComplete("pagenum");
        } else {
          btn.classList.add("incorrect");
          fb.innerHTML = '<div class="feedback-msg bad">Not quite—the PDF viewer\u2019s page count almost never matches the book\u2019s own printed page numbers. Look for the number printed on the page itself.</div>';
          Array.prototype.forEach.call(group.children, function (el) { el.disabled = false; });
        }
        saveState();
        wireNext("counterclaim");
      });
      group.appendChild(btn);
    });

    if (state.completed.pagenum) {
      document.getElementById("pagenum-feedback").innerHTML =
        '<div class="feedback-msg good">Already completed.</div>' + nextButton("counterclaim");
      wireNext("counterclaim");
    }
  }

  /* ---------------- Module: Counterclaim & Rebuttal (ordering activity) ---------------- */
  var CC_STEPS = [
    { id: "state", text: "State the opposing view fairly: \u201cSome readers may argue that\u2026\u201d" },
    { id: "acknowledge", text: "Briefly acknowledge what\u2019s reasonable about that view." },
    { id: "pivot", text: "Pivot with a rebuttal transition: \u201cHowever, this view overlooks\u2026\u201d" },
    { id: "rebut", text: "Give your rebuttal—reasoning or evidence that answers the opposing view." }
  ];

  function renderCounterclaim() {
    var order = state.order.arrangement || shuffledIds();
    state.order.arrangement = order;
    saveState();

    var html =
      '<section class="card">' +
      "<h2>5. Counterclaim &amp; Rebuttal</h2>" +
      "<p>A strong counterclaim/rebuttal paragraph follows a predictable order. Use the arrows to put these four steps in the correct order.</p>" +
      '<ul class="order-list" id="order-list"></ul>' +
      '<div class="btn-row"><button class="btn secondary" id="check-order-btn">Check Order</button></div>' +
      '<div id="order-feedback"></div>' +
      "</section>";
    container().innerHTML = html;

    renderOrderList();

    document.getElementById("check-order-btn").addEventListener("click", function () {
      var correctOrder = CC_STEPS.map(function (s) { return s.id; });
      var isCorrect = JSON.stringify(state.order.arrangement) === JSON.stringify(correctOrder);
      var fb = document.getElementById("order-feedback");
      markOrderPositions(isCorrect);
      if (isCorrect) {
        fb.innerHTML = '<div class="feedback-msg good">That\u2019s the order: state the view fairly, acknowledge its merit, pivot, then rebut.</div>' + nextButton("coach1");
        state.order.correct = true;
        markComplete("counterclaim");
        saveState();
        wireNext("coach1");
      } else {
        fb.innerHTML = '<div class="feedback-msg bad">Not quite yet—remember you acknowledge the opposing view fairly before you pivot into your rebuttal. Try again.</div>';
      }
    });

    if (state.completed.counterclaim) {
      document.getElementById("order-feedback").innerHTML =
        '<div class="feedback-msg good">Already completed.</div>' + nextButton("coach1");
      wireNext("coach1");
    }
  }

  function shuffledIds() {
    var ids = CC_STEPS.map(function (s) { return s.id; });
    var shuffled = ids.slice();
    var correctOrder = ids.join(",");
    var tries = 0;
    do {
      for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
      }
      tries++;
    } while (shuffled.join(",") === correctOrder && tries < 10);
    return shuffled;
  }

  function renderOrderList() {
    var list = document.getElementById("order-list");
    list.innerHTML = "";
    state.order.arrangement.forEach(function (id, idx) {
      var step = CC_STEPS.filter(function (s) { return s.id === id; })[0];
      var li = document.createElement("li");
      li.className = "order-item";
      li.innerHTML =
        '<span class="order-handle">\u2261</span><span>' + step.text + "</span>" +
        '<span class="order-move-btns">' +
        '<button type="button" data-dir="up" aria-label="Move up">\u2191</button>' +
        '<button type="button" data-dir="down" aria-label="Move down">\u2193</button>' +
        "</span>";
      var upBtn = li.querySelector('[data-dir="up"]');
      var downBtn = li.querySelector('[data-dir="down"]');
      upBtn.addEventListener("click", function () { moveOrderItem(idx, -1); });
      downBtn.addEventListener("click", function () { moveOrderItem(idx, 1); });
      list.appendChild(li);
    });
  }

  function moveOrderItem(idx, dir) {
    var arr = state.order.arrangement;
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= arr.length) return;
    var tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp;
    saveState();
    renderOrderList();
    document.getElementById("order-feedback").innerHTML = "";
  }

  function markOrderPositions(isCorrect) {
    var items = document.querySelectorAll("#order-list .order-item");
    var correctOrder = CC_STEPS.map(function (s) { return s.id; });
    state.order.arrangement.forEach(function (id, i) {
      if (isCorrect || id === correctOrder[i]) {
        items[i].classList.add("correct-position");
      } else {
        items[i].classList.remove("correct-position");
      }
    });
  }

  /* ---------------- Modules: Writing Coach ---------------- */
  function analyzeParagraph(text, opts) {
    opts = opts || {};
    var issues = [];
    var good = [];
    var trimmed = text.trim();

    if (trimmed.length < 40) {
      issues.push("This looks very short for a body paragraph—paste your full paragraph.");
      return { issues: issues, good: good };
    }

    if (!/["\u201c\u201d]/.test(trimmed)) {
      issues.push("No quotation marks found. Make sure you\u2019ve included at least one direct quotation from a source.");
    } else {
      good.push("Found a quotation.");
    }

    var apaComma = /\([A-Z][a-zA-Z'-]*,\s*\d+\)/.test(trimmed) || /\([A-Z][a-zA-Z'-]*,\s*p\.?\s*\d+\)/.test(trimmed);
    if (apaComma) {
      issues.push("Found a comma between the author\u2019s name and the page number in a citation—that\u2019s APA style. MLA uses no comma: (Author Page), e.g. (Rivera 42).");
    }

    var hasPeriodP = /\(p\.?\s*\d+\)/i.test(trimmed);
    if (hasPeriodP) {
      issues.push("Found \u201cp.\u201d before a page number—MLA doesn\u2019t use \u201cp.\u201d Just the number in parentheses: (42) or (Rivera 42).");
    }

    var mlaCitation = /\([A-Z][a-zA-Z'-]*\s+\d+\)/.test(trimmed) || /\(\d+\)/.test(trimmed);
    if (mlaCitation && !apaComma && !hasPeriodP) {
      good.push("Found what looks like a correctly formatted MLA in-text citation.");
    } else if (!mlaCitation) {
      issues.push("No MLA-style parenthetical citation found—double check you have (Author Page#) or (Page#) somewhere near your quotation.");
    }

    var reportingVerbs = /\b(argues?|explains?|notes?|states?|claims?|suggests?|contends?|observes?|writes?|points out|shows?)\b/i;
    if (!reportingVerbs.test(trimmed)) {
      issues.push("Consider introducing your quotation with a present-tense reporting verb (argues, explains, notes\u2026) so it\u2019s clear how the source relates to your point.");
    } else {
      good.push("Found a reporting verb introducing your evidence.");
    }

    if (opts.checkFirstPerson) {
      if (/\b(I think|I believe|I feel|in my opinion)\b/i.test(trimmed)) {
        issues.push("Try cutting phrases like \u201cI think\u201d or \u201cin my opinion.\u201d State your analysis directly—your reader already knows it\u2019s your interpretation.");
      }
    }

    var sentenceCount = trimmed.split(/[.!?]+\s/).filter(function (s) { return s.trim().length > 0; }).length;
    if (sentenceCount < 4) {
      issues.push("This paragraph only has about " + sentenceCount + " sentence(s). Make sure you have a topic sentence, your evidence, and at least one full sentence of analysis after it.");
    } else {
      good.push("Paragraph length looks reasonable for topic sentence + evidence + analysis.");
    }

    if (opts.checkCounterclaim) {
      var concessionWords = /\b(some (readers|critics|people) (may|might|could) argue|one could argue|it could be argued|opponents (of|argue))\b/i;
      var rebuttalWords = /\b(however|yet|but|nevertheless|still|in fact|on the contrary|overlooks?|fails? to)\b/i;
      if (!concessionWords.test(trimmed)) {
        issues.push("Make sure you clearly state the opposing view (try a starter like \u201cSome readers may argue that\u2026\u201d).");
      } else {
        good.push("Found language that states an opposing view.");
      }
      if (!rebuttalWords.test(trimmed)) {
        issues.push("Make sure you pivot into your rebuttal with a clear transition (try \u201cHowever, this view overlooks\u2026\u201d).");
      } else {
        good.push("Found a rebuttal transition.");
      }
    }

    return { issues: issues, good: good };
  }

  // Shared implementation for all three writing-coach modules (the two body
  // paragraph coaches and the counterclaim/rebuttal coach). analysisOpts is
  // passed straight through to analyzeParagraph(); nextId is where the
  // "Continue" link goes once this paragraph is marked done.
  function renderCoachGeneric(id, title, description, analysisOpts, nextId) {
    var data = state.coach[id];
    var html =
      '<section class="card">' +
      "<h2>" + title + "</h2>" +
      "<p>Paste " + description + " Then click <strong>Check My Paragraph</strong> for feedback before you mark it done.</p>" +
      '<textarea class="coach-input" id="coach-textarea" placeholder="Paste your paragraph here...">' + escapeHtml(data.text) + "</textarea>" +
      '<div class="btn-row">' +
      '<button class="btn secondary" id="check-btn">Check My Paragraph</button>' +
      '<button class="btn" id="done-btn"' + (data.checked ? "" : " disabled") + ">Mark This Paragraph Done</button>" +
      "</div>" +
      '<div id="coach-feedback"></div>' +
      "</section>";
    container().innerHTML = html;

    function runCheck() {
      var result = analyzeParagraph(document.getElementById("coach-textarea").value, analysisOpts);
      var fb = document.getElementById("coach-feedback");
      var parts = "";
      if (result.good.length) {
        parts += '<div class="feedback-msg good"><strong>Looking good:</strong><ul>' +
          result.good.map(function (g) { return "<li>" + g + "</li>"; }).join("") + "</ul></div>";
      }
      if (result.issues.length) {
        parts += '<div class="feedback-msg bad"><strong>Worth a look:</strong><ul>' +
          result.issues.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul></div>";
      } else {
        parts += '<div class="feedback-msg good">No issues flagged—nice work.</div>';
      }
      fb.innerHTML = parts;
      if (data.markedDone) fb.innerHTML += nextButton(nextId);
      wireNext(nextId);
    }

    if (data.checked) runCheck();

    var textarea = document.getElementById("coach-textarea");
    textarea.addEventListener("input", function () { data.text = textarea.value; saveState(); });

    document.getElementById("check-btn").addEventListener("click", function () {
      data.text = textarea.value;
      data.checked = true;
      saveState();
      document.getElementById("done-btn").disabled = false;
      runCheck();
    });

    document.getElementById("done-btn").addEventListener("click", function () {
      data.markedDone = true;
      saveState();
      markComplete(id);
      runCheck();
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ---------------- Module: Checklist ---------------- */
  function renderChecklist() {
    var html =
      '<section class="card">' +
      "<h2>9. Final Checklist</h2>" +
      "<p>Go through this list before you submit. Check off each item honestly.</p>" +
      '<ul class="checklist" id="checklist-items"></ul>' +
      '<div class="btn-row"><button class="btn" id="checklist-done-btn" disabled>All Set&mdash;Continue</button></div>' +
      "</section>";
    container().innerHTML = html;

    var list = document.getElementById("checklist-items");
    CHECKLIST_ITEMS.forEach(function (text, i) {
      var key = "item" + i;
      var li = document.createElement("li");
      var checked = !!state.checklist[key];
      li.innerHTML =
        '<input type="checkbox" id="' + key + '"' + (checked ? " checked" : "") + " />" +
        '<label for="' + key + '">' + text + "</label>";
      var input = li.querySelector("input");
      input.addEventListener("change", function () {
        state.checklist[key] = input.checked;
        saveState();
        updateChecklistButton();
      });
      list.appendChild(li);
    });

    function updateChecklistButton() {
      var allChecked = CHECKLIST_ITEMS.every(function (_, i) { return !!state.checklist["item" + i]; });
      var btn = document.getElementById("checklist-done-btn");
      btn.disabled = !allChecked;
      if (allChecked) {
        markComplete("checklist");
      }
    }
    updateChecklistButton();

    document.getElementById("checklist-done-btn").addEventListener("click", function () {
      goTo("certificate");
    });
  }

  /* ---------------- Module: Certificate ---------------- */
  function renderCertificate() {
    var unlocked = isUnlocked("certificate");
    if (!unlocked) {
      container().innerHTML = '<section class="card"><h2>10. Certificate</h2><p>Finish the final checklist first.</p></section>';
      return;
    }

    var html =
      '<section class="card certificate-panel">' +
      "<h2>10. Submission Readiness</h2>" +
      "<p>Enter your name exactly as you\u2019d like it to appear, then generate your certificate.</p>" +
      '<input type="text" class="name-input" id="name-input" placeholder="Full name" value="' + escapeHtml(state.studentName) + '" />' +
      '<div class="btn-row"><button class="btn" id="generate-btn">Generate My Certificate</button></div>' +
      '<div id="certificate-output"></div>' +
      "</section>";
    container().innerHTML = html;

    var nameInput = document.getElementById("name-input");
    nameInput.addEventListener("input", function () {
      state.studentName = nameInput.value;
      saveState();
    });

    document.getElementById("generate-btn").addEventListener("click", function () {
      if (!nameInput.value.trim()) {
        nameInput.focus();
        return;
      }
      state.studentName = nameInput.value.trim();
      markComplete("certificate");
      saveState();
      showCertificate();
    });

    if (state.completed.certificate && state.studentName) {
      showCertificate();
    }
  }

  function showCertificate() {
    var today = new Date();
    var dateStr = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    var out = document.getElementById("certificate-output");
    out.innerHTML =
      '<div class="certificate">' +
      "<h2>Certificate of Completion</h2>" +
      '<p class="cert-detail">MLA Evidence Integration Lab</p>' +
      '<div class="cert-name">' + escapeHtml(state.studentName) + "</div>" +
      '<p class="cert-detail">' + dateStr + "</p>" +
      "<p>This certifies mastery of:</p>" +
      "<ul>" +
      "<li>Building reason &rarr; evidence &rarr; analysis paragraphs</li>" +
      "<li>Integrating quotations with MLA signal phrases and present-tense reporting verbs</li>" +
      "<li>Formatting MLA in-text citations: (Author Page#)</li>" +
      "<li>Locating accurate page numbers for citations</li>" +
      "<li>Writing a fair counterclaim and an effective rebuttal</li>" +
      "</ul>" +
      "</div>" +
      '<div class="btn-row" style="justify-content:center"><button class="btn" id="print-btn">Print / Save as PDF</button></div>';
    document.getElementById("print-btn").addEventListener("click", function () { window.print(); });
  }

  /* ---------------- Init ---------------- */
  function init() {
    renderSidebar();
    renderProgress();
    renderModule();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
