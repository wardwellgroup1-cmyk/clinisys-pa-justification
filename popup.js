// Local rules engine
const RULES = {
  MRI_LS: {
    label: "MRI Lumbar Spine w/o contrast",
    cpt: ["72148"],
    baseWeight: 0.55,
    conservativeRequiredWeeks: 6,
    conservativeRequiredTypes: ["PT", "NSAID"],
    chronicWeeksThreshold: 6,
    severeIcd10Prefixes: ["M48.0", "M48.06", "M51.1", "M51.2"],
    moderateIcd10Prefixes: ["M54.1", "M54.16", "M54.5"],
    redFlagsUrgent: ["CAUDA", "PROG_WEAK"],
    redFlagsIncreaseApproval: ["CAUDA", "PROG_WEAK", "CANCER", "TRAUMA"],
    documentationRequired: [
      "Duration of symptoms and functional impact",
      "Focused neurologic exam",
      "Response to conservative therapy",
      "Prior imaging rationale"
    ],
    payerAdjustments: {
      "Medicare Advantage": { weightDelta: 0.05 },
      "Commercial – Aetna": { weightDelta: -0.05 },
      "Commercial – BCBS": { weightDelta: 0.0 },
      "Medicaid Managed Care": { weightDelta: -0.1 }
    }
  },
  MRI_CERV: {
    label: "MRI Cervical Spine w/o contrast",
    cpt: ["72141"],
    baseWeight: 0.52,
    conservativeRequiredWeeks: 6,
    conservativeRequiredTypes: ["PT", "NSAID"],
    chronicWeeksThreshold: 6,
    severeIcd10Prefixes: ["M50.0", "M50.1", "M50.2"],
    moderateIcd10Prefixes: ["M54.2"],
    redFlagsUrgent: ["PROG_WEAK"],
    redFlagsIncreaseApproval: ["PROG_WEAK", "CANCER", "TRAUMA"],
    documentationRequired: [
      "Duration and distribution of neck/arm pain",
      "Objective neurologic deficits",
      "Response to conservative therapy",
      "Prior imaging rationale"
    ],
    payerAdjustments: {
      "Medicare Advantage": { weightDelta: 0.05 },
      "Commercial – Aetna": { weightDelta: -0.05 },
      "Commercial – BCBS": { weightDelta: 0.0 },
      "Medicaid Managed Care": { weightDelta: -0.1 }
    }
  },
  CT_ABD: {
    label: "CT Abdomen/Pelvis w/ contrast",
    cpt: ["74177"],
    baseWeight: 0.6,
    conservativeRequiredWeeks: 0,
    conservativeRequiredTypes: [],
    chronicWeeksThreshold: 0,
    severeIcd10Prefixes: ["C18", "C19", "C20", "K35", "K57"],
    moderateIcd10Prefixes: ["R10", "K59"],
    redFlagsUrgent: ["FEVER_WEIGHT", "CANCER", "TRAUMA"],
    redFlagsIncreaseApproval: ["FEVER_WEIGHT", "CANCER", "TRAUMA"],
    documentationRequired: [
      "Location and character of abdominal pain",
      "Associated symptoms",
      "Exam findings",
      "Prior imaging and labs"
    ],
    payerAdjustments: {
      "Medicare Advantage": { weightDelta: 0.05 },
      "Commercial – Aetna": { weightDelta: 0.0 },
      "Commercial – BCBS": { weightDelta: 0.0 },
      "Medicaid Managed Care": { weightDelta: -0.05 }
    }
  },
  US_PELVIC: {
    label: "Pelvic ultrasound",
    cpt: ["76856"],
    baseWeight: 0.7,
    conservativeRequiredWeeks: 0,
    conservativeRequiredTypes: [],
    chronicWeeksThreshold: 0,
    severeIcd10Prefixes: ["C54", "C56", "N83.2"],
    moderateIcd10Prefixes: ["N93", "N94"],
    redFlagsUrgent: ["FEVER_WEIGHT", "CANCER"],
    redFlagsIncreaseApproval: ["FEVER_WEIGHT", "CANCER"],
    documentationRequired: [
      "Menstrual and bleeding history",
      "Pain characteristics",
      "Pregnancy status",
      "Prior imaging"
    ],
    payerAdjustments: {
      "Medicare Advantage": { weightDelta: 0.05 },
      "Commercial – Aetna": { weightDelta: 0.0 },
      "Commercial – BCBS": { weightDelta: 0.0 },
      "Medicaid Managed Care": { weightDelta: -0.05 }
    }
  },
  KNEE_ARTHRO: {
    label: "Knee arthroscopy",
    cpt: ["29881"],
    baseWeight: 0.45,
    conservativeRequiredWeeks: 6,
    conservativeRequiredTypes: ["PT", "NSAID"],
    chronicWeeksThreshold: 6,
    severeIcd10Prefixes: ["M23.2", "M23.3"],
    moderateIcd10Prefixes: ["M17", "M25.56"],
    redFlagsUrgent: ["TRAUMA"],
    redFlagsIncreaseApproval: ["TRAUMA"],
    documentationRequired: [
      "Duration of knee pain and mechanical symptoms",
      "Exam findings",
      "Response to conservative therapy",
      "Prior imaging correlation"
    ],
    payerAdjustments: {
      "Medicare Advantage": { weightDelta: 0.0 },
      "Commercial – Aetna": { weightDelta: -0.05 },
      "Commercial – BCBS": { weightDelta: 0.0 },
      "Medicaid Managed Care": { weightDelta: -0.1 }
    }
  }
};

const RED_FLAG_LABELS = {
  CAUDA: "Cauda equina / saddle anesthesia",
  PROG_WEAK: "Progressive motor weakness",
  FEVER_WEIGHT: "Fever, weight loss, infection",
  CANCER: "Known malignancy",
  TRAUMA: "Significant trauma / fracture"
};

const CONSERVATIVE_LABELS = {
  PT: "Physical therapy",
  NSAID: "NSAIDs / analgesics",
  INJECTION: "Epidural / joint injection",
  HOME: "Home exercise program"
};

// Utility functions
function getSelectedChips(containerId, attr) {
  const container = document.getElementById(containerId);
  return Array.from(container.querySelectorAll(".chip.active")).map(chip =>
    chip.getAttribute(attr)
  );
}

function toggleChip(e) {
  e.currentTarget.classList.toggle("active");
}

function icdSeverity(icd, rule) {
  if (!icd || !rule) return 0;
  const code = icd.toUpperCase().trim();
  const prefixes = (list) => list.some(p => code.startsWith(p));
  if (prefixes(rule.severeIcd10Prefixes)) return 1;
  if (prefixes(rule.moderateIcd10Prefixes)) return 0.6;
  return 0.3;
}

function computeScore(inputs) {
  const { payer, serviceName, icd10, age, symptomWeeks, conservativeCare, redFlags } = inputs;
  const rule = RULES[serviceName];
  if (!rule) return { score: 0, details: {} };

  let weight = rule.baseWeight;

  // Payer adjustment
  const payerAdj = rule.payerAdjustments[payer] || { weightDelta: 0 };
  weight += payerAdj.weightDelta || 0;

  // ICD severity
  const icdFactor = icdSeverity(icd10, rule);
  weight += 0.15 * (icdFactor - 0.3);

  // Conservative care
  let conservativeScore = 0;
  const requiredTypes = rule.conservativeRequiredTypes || [];
  const hasRequiredTypes = requiredTypes.every(t => conservativeCare.includes(t));
  const weeks = symptomWeeks || 0;
  const meetsWeeks = weeks >= (rule.conservativeRequiredWeeks || 0);

  if (requiredTypes.length === 0) {
    conservativeScore = 0.1;
  } else {
    if (hasRequiredTypes && meetsWeeks) conservativeScore = 0.18;
    else if (hasRequiredTypes || meetsWeeks) conservativeScore = 0.08;
    else conservativeScore = -0.12;
  }
  weight += conservativeScore;

  // Chronicity
  if (rule.chronicWeeksThreshold && weeks >= rule.chronicWeeksThreshold) {
    weight += 0.05;
  }

  // Red flags
  let redFlagImpact = 0;
  if (redFlags.length > 0) {
    const urgentFlags = redFlags.filter(f => rule.redFlagsUrgent.includes(f));
    const approvalFlags = redFlags.filter(f => rule.redFlagsIncreaseApproval.includes(f));
    if (urgentFlags.length > 0) redFlagImpact += 0.12;
    if (approvalFlags.length > 0) redFlagImpact += 0.08;
  }
  weight += redFlagImpact;

  weight = Math.max(0.05, Math.min(0.95, weight));
  const score = Math.round(weight * 100);

  return {
    score,
    details: {
      rule,
      meetsConservativeWeeks: meetsWeeks,
      hasRequiredConservativeTypes: hasRequiredTypes
    }
  };
}

function classifyScore(score) {
  if (score >= 75) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function renderScore(score) {
  const scoreValue = document.getElementById("scoreValue");
  const scoreBadge = document.getElementById("scoreBadge");

  if (score == null) {
    scoreValue.textContent = "–%";
    scoreBadge.className = "score-badge";
    scoreBadge.textContent = "Pending";
    return;
  }

  scoreValue.textContent = score + "%";
  const cls = classifyScore(score);
  scoreBadge.className = "score-badge " + cls;
  scoreBadge.textContent =
    cls === "good" ? "High" : cls === "fair" ? "Fair" : "Low";
}

function renderRedFlags(redFlags, rule) {
  const container = document.getElementById("redFlagList");
  if (!rule || redFlags.length === 0) {
    container.innerHTML = '<div class="list-empty">No red flags</div>';
    return;
  }

  const ul = document.createElement("ul");
  redFlags.forEach(flag => {
    const li = document.createElement("li");
    li.textContent = RED_FLAG_LABELS[flag] || flag;
    ul.appendChild(li);
  });
  container.innerHTML = "";
  container.appendChild(ul);
}

function renderConservativeCare(inputs, details) {
  const container = document.getElementById("conservativeList");
  const { serviceName, symptomWeeks, conservativeCare } = inputs;
  const rule = RULES[serviceName];
  if (!rule) {
    container.innerHTML = '<div class="list-empty">Select service</div>';
    return;
  }

  const requiredWeeks = rule.conservativeRequiredWeeks || 0;
  const meetsWeeks = details.meetsConservativeWeeks;
  const hasTypes = details.hasRequiredConservativeTypes;

  let html = "";
  if (meetsWeeks && hasTypes) {
    html = `<div>✓ Meets thresholds (≥${requiredWeeks}w)</div>`;
  } else if (!meetsWeeks || !hasTypes) {
    html = `<div>⚠ Below thresholds</div>`;
  }

  const listCare = conservativeCare.map(c => CONSERVATIVE_LABELS[c] || c);
  if (listCare.length > 0) {
    html += `<div style="font-size:10px;color:#9ca3af;margin-top:2px;">${listCare.join(", ")}</div>`;
  }

  container.innerHTML = html || '<div class="list-empty">No care documented</div>';
}

function renderGaps(inputs, details) {
  const container = document.getElementById("gapList");
  const { serviceName, icd10 } = inputs;
  const rule = RULES[serviceName];
  if (!rule) {
    container.innerHTML = '<div class="list-empty">Select service</div>';
    return;
  }

  const gaps = [];
  if (!icd10 || icd10.length < 3) gaps.push("Missing/nonspecific ICD-10");
  if (!details.meetsConservativeWeeks) gaps.push("Chronicity below threshold");
  if (!details.hasRequiredConservativeTypes) gaps.push("Incomplete conservative care");

  if (gaps.length === 0) {
    container.innerHTML = '<div style="color:#4ade80;">✓ No major gaps</div>';
  } else {
    const ul = document.createElement("ul");
    gaps.forEach(g => {
      const li = document.createElement("li");
      li.textContent = g;
      ul.appendChild(li);
    });
    container.innerHTML = "";
    container.appendChild(ul);
  }
}

function generateNote(inputs, result) {
  const { payer, serviceName, icd10, age, symptomWeeks, conservativeCare, redFlags, clinicalDetails } = inputs;
  const rule = RULES[serviceName];
  if (!rule) return "Select service and run analysis.";

  const conservativeList = conservativeCare.map(c => CONSERVATIVE_LABELS[c] || c);
  const redFlagList = redFlags.map(r => RED_FLAG_LABELS[r] || r);

  const payerText = payer || "the patient's health plan";
  const ageText = age ? `${age}-year-old` : "patient";
  const weeksText = symptomWeeks ? `${symptomWeeks} weeks` : "clinically significant duration";
  const dxText = icd10 ? `ICD-10 ${icd10.trim()}` : "working diagnosis";

  const conservativeText =
    conservativeList.length > 0
      ? `Conservative care has included ${conservativeList.join(", ")} over ~${weeksText}.`
      : `Conservative care trial: limited to date.`;

  const redFlagText =
    redFlagList.length > 0
      ? `Red flags: ${redFlagList.join(", ")}.`
      : `No major red flags documented.`;

  const clinicalText = clinicalDetails ? clinicalDetails.trim() : "Symptoms impacting function.";

  return [
    `To: Utilization Management, ${payerText}`,
    `Re: Prior Auth – ${rule.label}`,
    "",
    `${ageText} with ${dxText}. ${clinicalText}`,
    "",
    conservativeText,
    redFlagText,
    "",
    `${rule.label} is medically necessary per evidence-based criteria.`,
    "",
    "Clinician: ________________     Date: __________"
  ].join("\n");
}

function analyze() {
  const payer = document.getElementById("payer").value;
  const serviceName = document.getElementById("serviceName").value;
  const icd10 = document.getElementById("icd10").value;
  const age = document.getElementById("age").value ? parseInt(document.getElementById("age").value, 10) : null;
  const symptomWeeks = document.getElementById("symptomWeeks").value ? parseInt(document.getElementById("symptomWeeks").value, 10) : null;
  const conservativeCare = getSelectedChips("conservativeCareChips", "data-care");
  const redFlags = getSelectedChips("redFlagChips", "data-flag");
  const clinicalDetails = document.getElementById("clinicalDetails").value;

  if (!payer || !serviceName || !icd10) {
    alert("Complete: Payer, Service, ICD-10");
    return;
  }

  const inputs = { payer, serviceName, icd10, age, symptomWeeks, conservativeCare, redFlags, clinicalDetails };
  const result = computeScore(inputs);

  renderScore(result.score);
  renderRedFlags(redFlags, RULES[serviceName]);
  renderConservativeCare(inputs, result.details);
  renderGaps(inputs, result.details);

  const note = generateNote(inputs, result);
  document.getElementById("noteText").value = note;

  // Save to storage
  chrome.storage.local.set({ lastCase: inputs });
}

// Event listeners
document.querySelectorAll("#conservativeCareChips .chip, #redFlagChips .chip").forEach(chip => {
  chip.addEventListener("click", toggleChip);
});

document.getElementById("btnAnalyze").addEventListener("click", analyze);

document.getElementById("btnClear").addEventListener("click", () => {
  document.getElementById("payer").value = "";
  document.getElementById("serviceName").value = "";
  document.getElementById("icd10").value = "";
  document.getElementById("age").value = "";
  document.getElementById("symptomWeeks").value = "";
  document.getElementById("clinicalDetails").value = "";
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  document.getElementById("scoreValue").textContent = "–%";
  document.getElementById("scoreBadge").textContent = "Pending";
  document.getElementById("redFlagList").innerHTML = '<div class="list-empty">Run analysis</div>';
  document.getElementById("conservativeList").innerHTML = '<div class="list-empty">Run analysis</div>';
  document.getElementById("gapList").innerHTML = '<div class="list-empty">Run analysis</div>';
  document.getElementById("noteText").value = "";
});

document.getElementById("btnCopyNote").addEventListener("click", () => {
  const text = document.getElementById("noteText").value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("btnCopyNote");
    const orig = btn.textContent;
    btn.textContent = "✓ Copied";
    setTimeout(() => { btn.textContent = orig; }, 1200);
  });
});

document.getElementById("btnDownloadNote").addEventListener("click", () => {
  const text = document.getElementById("noteText").value;
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prior-auth-justification.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("btnExpand").addEventListener("click", () => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 1200,
    height: 900
  });
});

// Load last case from storage
chrome.storage.local.get(["lastCase"], (result) => {
  if (result.lastCase) {
    const data = result.lastCase;
    document.getElementById("payer").value = data.payer || "";
    document.getElementById("serviceName").value = data.serviceName || "";
    document.getElementById("icd10").value = data.icd10 || "";
    if (data.age) document.getElementById("age").value = data.age;
    if (data.symptomWeeks) document.getElementById("symptomWeeks").value = data.symptomWeeks;
    document.getElementById("clinicalDetails").value = data.clinicalDetails || "";

    // Restore chips
    if (data.conservativeCare) {
      document.querySelectorAll("#conservativeCareChips .chip").forEach(chip => {
        if (data.conservativeCare.includes(chip.getAttribute("data-care"))) {
          chip.classList.add("active");
        }
      });
    }
    if (data.redFlags) {
      document.querySelectorAll("#redFlagChips .chip").forEach(chip => {
        if (data.redFlags.includes(chip.getAttribute("data-flag"))) {
          chip.classList.add("active");
        }
      });
    }
  }
});
