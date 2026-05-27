import { ClinicalFormData, PayerProfile, JustificationResult } from './types';

export function buildJustification(
  form: ClinicalFormData,
  payer: PayerProfile | null,
): JustificationResult {
  const score = calculateScore(form, payer);
  const letterText = generateLetter(form, payer);
  const chartNoteText = generateChartNote(form, payer);
  const appealText = generateAppeal(form, payer);
  const suggestions = generateSuggestions(form, payer);

  return {
    letterText,
    chartNoteText,
    appealText,
    score,
    suggestions,
  };
}

function calculateScore(form: ClinicalFormData, payer: PayerProfile | null): { numeric: number; label: string } {
  let score = 0;

  // Core documentation (50 points)
  if (form.diagnosis) score += 10;
  if (form.symptoms) score += 10;
  if (form.functionalImpairment) score += 10;
  if (form.chronicity) score += 10;
  if (form.priorTreatments.length > 0) score += 10;

  // Requested service details (30 points)
  if (form.requestedService) score += 10;
  if (form.rationale) score += 10;
  if (form.riskIfNotApproved) score += 10;

  // Payer alignment (20 points)
  if (payer) score += 10;
  if (form.previouslyDenied && form.redFlags) score += 10;

  let label = 'Insufficient';
  if (score >= 80) label = 'Strong';
  else if (score >= 60) label = 'Moderate';
  else if (score >= 40) label = 'Weak';

  return { numeric: Math.min(100, score), label };
}

function generateLetter(form: ClinicalFormData, payer: PayerProfile | null): string {
  const payerName = payer?.name || 'Prior Authorization Department';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `[MEDICAL LETTERHEAD]

${today}

${payerName}
Prior Authorization Department

Re: Prior Authorization Request for ${form.requestedService}
    Patient: ${form.patientInitials}
    DOB: ${form.dob}

Dear Prior Authorization Review Team,

I am writing to request prior authorization for ${form.requestedService} for my patient ${form.patientInitials} (DOB: ${form.dob}).

CLINICAL PRESENTATION AND DIAGNOSIS:
${form.diagnosis}

SEVERITY: ${form.severity}

CLINICAL SYMPTOMS AND PRESENTATION:
${form.symptoms}

FUNCTIONAL IMPAIRMENT:
${form.functionalImpairment}

CHRONICITY AND COURSE:
${form.chronicity}

PRIOR TREATMENTS AND RESPONSES:
${form.priorTreatments.length > 0 ? form.priorTreatments.map(t => `• ${t.name} (${t.dose}, ${t.duration}): ${t.response.replace(/_/g, ' ')} - ${t.reasonForDiscontinuation}`).join('\n') : 'Multiple prior treatment trials with inadequate response.'}

REQUESTED SERVICE:
Service/Medication: ${form.requestedService}
Dose: ${form.requestedDose}
Frequency: ${form.requestedFrequency}
Duration: ${form.requestedDuration}

CLINICAL RATIONALE:
${form.rationale}

RISK IF NOT APPROVED:
${form.riskIfNotApproved}

${form.redFlags ? `PAYER CONSIDERATIONS:\n${form.redFlags}\n` : ''}

This request aligns with current clinical guidelines and evidence-based practice. I respectfully request approval to provide this medically necessary treatment.

Please contact me if you require additional information.

Sincerely,

[Provider Name]
[License/NPI]
[Contact Information]`;
}

function generateChartNote(form: ClinicalFormData, payer: PayerProfile | null): string {
  return `PRIOR AUTHORIZATION CHART NOTE

Date of Visit: ${form.visitDate}
Patient: ${form.patientInitials}
DOB: ${form.dob}

CHIEF COMPLAINT/REASON FOR VISIT:
Request for prior authorization

HISTORY OF PRESENT ILLNESS:
Patient presents with ${form.diagnosis}. Severity: ${form.severity}.

Current symptoms: ${form.symptoms}

Functional impact: ${form.functionalImpairment}

Timeline: ${form.chronicity}

PAST MEDICAL TREATMENT:
${form.priorTreatments.length > 0 ? form.priorTreatments.map(t => `${t.name} at ${t.dose} for ${t.duration} - ${t.response} (${t.reasonForDiscontinuation})`).join('\n') : 'Multiple prior adequate trials of standard treatment options.'}

ASSESSMENT:
${form.diagnosis}
Severity: ${form.severity}

PLAN:
Initiate ${form.requestedService} at ${form.requestedDose} ${form.requestedFrequency} for ${form.requestedDuration}.

Rationale: ${form.rationale}

Risk mitigation: ${form.riskIfNotApproved}

Prior authorization has been requested from ${payer?.name || 'the patient's insurance plan'}.`;
}

function generateAppeal(form: ClinicalFormData, payer: PayerProfile | null): string {
  return `PRIOR AUTHORIZATION APPEAL LETTER

[DATE]

${payer?.name || 'Payer Name'}
Appeals Department

Re: Appeal of Prior Authorization Denial
    Patient: ${form.patientInitials}
    DOB: ${form.dob}
    Service: ${form.requestedService}

Dear Appeals Team,

I am writing to appeal the recent denial of prior authorization for ${form.requestedService} for my patient ${form.patientInitials}.

PATIENT SUMMARY:
${form.diagnosis} (Severity: ${form.severity})

CLINICAL JUSTIFICATION FOR APPEAL:

1. DIAGNOSIS AND SEVERITY CONFIRMATION
${form.diagnosis}. The severity of this condition is ${form.severity.toLowerCase()}, with significant functional impairment.

2. CLINICAL SYMPTOMS AND FUNCTIONAL IMPACT
Symptoms: ${form.symptoms}
Functional impairment: ${form.functionalImpairment}
Duration: ${form.chronicity}

3. PRIOR TREATMENT DOCUMENTATION
${form.priorTreatments.length > 0 ? form.priorTreatments.map(t => `• ${t.name} (${t.dose} × ${t.duration}): ${t.response.replace(/_/g, ' ')} — ${t.reasonForDiscontinuation}`).join('\n') : 'Multiple adequate trials of first- and second-line treatments.'}

4. MEDICAL NECESSITY AND EVIDENCE
${form.rationale}

5. CONSEQUENCES OF CONTINUED DENIAL
${form.riskIfNotApproved}

${form.redFlags ? `6. RESPONSE TO PRIOR DENIAL REASON\n${form.redFlags}\n` : ''}

I respectfully request reconsideration and approval of this medically necessary treatment.

Sincerely,
[Provider Name]
[License/NPI]`;
}

function generateSuggestions(form: ClinicalFormData, payer: PayerProfile | null): string[] {
  const suggestions: string[] = [];

  if (!form.functionalImpairment) {
    suggestions.push('Add specific functional impairment details (work impact, ADLs, safety concerns).');
  }

  if (form.priorTreatments.length === 0) {
    suggestions.push('Document prior treatment attempts with doses, durations, and reasons for discontinuation.');
  } else if (form.priorTreatments.some(t => !t.reasonForDiscontinuation)) {
    suggestions.push('Clarify reason for discontinuation for each prior treatment.');
  }

  if (!form.rationale) {
    suggestions.push('Strengthen clinical rationale by explaining why this specific service is needed now.');
  }

  if (!form.riskIfNotApproval) {
    suggestions.push('Articulate the clinical and functional risk if this request is not approved.');
  }

  if (payer?.stepTherapyRequired && form.priorTreatments.length < 2) {
    suggestions.push(`${payer.name} requires step therapy documentation. Document at least 2 prior medication trials.`);
  }

  if (form.previouslyDenied && !form.redFlags) {
    suggestions.push('Prior denial noted—address the specific reason for the previous denial in your documentation.');
  }

  if (!form.chronicity) {
    suggestions.push('Document the timeline and course of illness (onset, duration, progression).');
  }

  return suggestions;
}
