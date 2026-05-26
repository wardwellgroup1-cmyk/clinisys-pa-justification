'use client';

import React, { useState, useMemo } from 'react';
import { ClinicalFormData, Severity, TreatmentResponse, OutputMode } from '@/lib/types';
import { PAYER_PROFILES, getPayerProfileById } from '@/lib/payerProfiles';
import { buildJustification } from '@/lib/buildJustification';

const STEPS = [
  'Patient & visit',
  'Diagnosis & severity',
  'Prior treatments',
  'Requested service',
  'Payer & red flags',
  'Preview & export',
];

const EMPTY_FORM: ClinicalFormData = {
  patientInitials: '',
  dob: '',
  visitDate: '',
  diagnosis: '',
  severity: 'MODERATE',
  symptoms: '',
  functionalImpairment: '',
  chronicity: '',
  priorTreatments: [],
  requestedService: '',
  requestedDose: '',
  requestedFrequency: '',
  requestedDuration: '',
  rationale: '',
  riskIfNotApproved: '',
  payerProfileId: '',
  previouslyDenied: false,
  redFlags: '',
};

export default function Page() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ClinicalFormData>(EMPTY_FORM);
  const [outputMode, setOutputMode] = useState<OutputMode>('LETTER');

  const payerProfile = useMemo(
    () => (form.payerProfileId ? getPayerProfileById(form.payerProfileId) : null),
    [form.payerProfileId],
  );

  const result = useMemo(
    () => buildJustification(form, payerProfile || null),
    [form, payerProfile],
  );

  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  const handleChange = <K extends keyof ClinicalFormData>(
    key: K,
    value: ClinicalFormData[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addPriorTreatment = () => {
    setForm(prev => ({
      ...prev,
      priorTreatments: [
        ...prev.priorTreatments,
        {
          name: '',
          dose: '',
          duration: '',
          response: 'NO_BENEFIT',
          reasonForDiscontinuation: '',
        },
      ],
    }));
  };

  const updatePriorTreatment = (index: number, field: string, value: any) => {
    setForm(prev => {
      const copy = [...prev.priorTreatments];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, priorTreatments: copy };
    });
  };

  const removePriorTreatment = (index: number) => {
    setForm(prev => {
      const copy = [...prev.priorTreatments];
      copy.splice(index, 1);
      return { ...prev, priorTreatments: copy };
    });
  };

  const handleCopy = async () => {
    const text =
      outputMode === 'LETTER'
        ? result.letterText
        : outputMode === 'CHART_NOTE'
        ? result.chartNoteText
        : result.appealText;

    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert('Text copied to clipboard.');
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            CliniSys Prior Auth Justification
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Generate payer-ready medical necessity in under 3 minutes.
          </p>
        </header>

        {/* Stepper */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          {STEPS.map((label, idx) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                idx === step
                  ? 'bg-blue-600 text-white'
                  : idx < step
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100'
              }`}
            >
              <span>{idx + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)]">
          {/* Left: Form */}
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            {step === 0 && (
              <StepPatientVisit form={form} onChange={handleChange} />
            )}
            {step === 1 && (
              <StepDiagnosisSeverity form={form} onChange={handleChange} />
            )}
            {step === 2 && (
              <StepPriorTreatments
                form={form}
                addPriorTreatment={addPriorTreatment}
                updatePriorTreatment={updatePriorTreatment}
                removePriorTreatment={removePriorTreatment}
              />
            )}
            {step === 3 && (
              <StepRequestedService form={form} onChange={handleChange} />
            )}
            {step === 4 && (
              <StepPayerRedFlags form={form} onChange={handleChange} />
            )}
            {step === 5 && (
              <StepPreviewControls
                outputMode={outputMode}
                setOutputMode={setOutputMode}
                result={result}
              />
            )}

            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => setStep(s => Math.max(0, s - 1))}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  canGoBack
                    ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'border border-slate-200 text-slate-300'
                }`}
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  canGoNext
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {step === STEPS.length - 2 ? 'Review' : 'Next'}
              </button>
            </div>
          </section>

          {/* Right: Preview */}
          <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Justification preview
                </h2>
                <p className="text-xs text-slate-500">
                  Internal score: {result.score.label} ({result.score.numeric}/100)
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Copy text
              </button>
            </div>

            <div className="mb-3 flex gap-2 text-xs">
              <ModeChip
                label="Letter"
                active={outputMode === 'LETTER'}
                onClick={() => setOutputMode('LETTER')}
              />
              <ModeChip
                label="Chart note"
                active={outputMode === 'CHART_NOTE'}
                onClick={() => setOutputMode('CHART_NOTE')}
              />
              <ModeChip
                label="Appeal draft"
                active={outputMode === 'APPEAL'}
                onClick={() => setOutputMode('APPEAL')}
              />
            </div>

            <div className="relative flex-1 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800">
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px]">
                {outputMode === 'LETTER'
                  ? result.letterText
                  : outputMode === 'CHART_NOTE'
                  ? result.chartNoteText
                  : result.appealText}
              </pre>
            </div>

            {result.suggestions.length > 0 && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                <p className="mb-1 font-semibold">Suggestions to strengthen approval:</p>
                <ul className="list-disc pl-4">
                  {result.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ModeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-slate-800">{label}</label>
        {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        props.className || ''
      }`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        props.className || ''
      }`}
    />
  );
}

/* ---- Step components ---- */

function StepPatientVisit({
  form,
  onChange,
}: {
  form: ClinicalFormData;
  onChange: <K extends keyof ClinicalFormData>(
    key: K,
    value: ClinicalFormData[K],
  ) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">Patient & visit basics</h2>
      <Field label="Patient initials" hint="Use initials only for demo / non-PHI mode.">
        <TextInput
          value={form.patientInitials}
          onChange={e => onChange('patientInitials', e.target.value)}
          placeholder="J.D."
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Date of birth">
          <TextInput
            type="date"
            value={form.dob}
            onChange={e => onChange('dob', e.target.value)}
          />
        </Field>
        <Field label="Visit date">
          <TextInput
            type="date"
            value={form.visitDate}
            onChange={e => onChange('visitDate', e.target.value)}
          />
        </Field>
      </div>
      <Field
        label="Clinically relevant symptoms"
        hint="Focus on symptoms impacting function, safety, or risk."
      >
        <TextArea
          rows={3}
          value={form.symptoms}
          onChange={e => onChange('symptoms', e.target.value)}
          placeholder="Persistent low mood, anhedonia, early morning awakening, impaired concentration, passive SI without plan..."
        />
      </Field>
      <Field
        label="Functional impairment"
        hint="How symptoms affect work, ADLs, relationships, or safety."
      >
        <TextArea
          rows={3}
          value={form.functionalImpairment}
          onChange={e => onChange('functionalImpairment', e.target.value)}
          placeholder="Unable to sustain full-time work, missing >3 days/month, difficulty managing finances and basic household tasks..."
        />
      </Field>
      <Field label="Chronicity / course" hint="Onset, duration, and pattern (episodic, chronic, recurrent).">
        <TextArea
          rows={2}
          value={form.chronicity}
          onChange={e => onChange('chronicity', e.target.value)}
          placeholder="Symptoms present for 18 months with partial response to multiple trials; current episode >12 weeks..."
        />
      </Field>
    </div>
  );
}

function StepDiagnosisSeverity({
  form,
  onChange,
}: {
  form: ClinicalFormData;
  onChange: <K extends keyof ClinicalFormData>(
    key: K,
    value: ClinicalFormData[K],
  ) => void;
}) {
  const severities: { value: Severity; label: string }[] = [
    { value: 'MILD', label: 'Mild' },
    { value: 'MODERATE', label: 'Moderate' },
    { value: 'SEVERE', label: 'Severe' },
    { value: 'REFRACTORY', label: 'Refractory' },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">Diagnosis & severity</h2>
      <Field label="Primary diagnosis" hint="Use DSM/ICD language where possible.">
        <TextInput
          value={form.diagnosis}
          onChange={e => onChange('diagnosis', e.target.value)}
          placeholder="Major depressive disorder, recurrent, severe, without psychotic features"
        />
      </Field>
      <Field label="Severity">
        <div className="flex flex-wrap gap-2">
          {severities.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange('severity', s.value)}
              className={`rounded-full px-3 py-1 text-xs ${
                form.severity === s.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function StepPriorTreatments({
  form,
  addPriorTreatment,
  updatePriorTreatment,
  removePriorTreatment,
}: {
  form: ClinicalFormData;
  addPriorTreatment: () => void;
  updatePriorTreatment: (index: number, field: string, value: any) => void;
  removePriorTreatment: (index: number) => void;
}) {
  const responses: { value: TreatmentResponse; label: string }[] = [
    { value: 'NO_BENEFIT', label: 'No benefit' },
    { value: 'PARTIAL_BENEFIT', label: 'Partial benefit' },
    { value: 'INTOLERABLE_SIDE_EFFECTS', label: 'Intolerable side effects' },
    { value: 'CONTRAINDICATED', label: 'Contraindicated' },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">
        Documented prior treatments and responses
      </h2>
      <p className="text-[11px] text-slate-500">
        Include dose, duration, and reason for discontinuation—this is what payers look for first.
      </p>

      {form.priorTreatments.map((t, idx) => (
        <div
          key={idx}
          className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-2"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-700">Treatment #{idx + 1}</span>
            <button
              type="button"
              onClick={() => removePriorTreatment(idx)}
              className="text-slate-400 hover:text-red-500"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <TextInput
              placeholder="Name (e.g., sertraline)"
              value={t.name}
              onChange={e => updatePriorTreatment(idx, 'name', e.target.value)}
            />
            <TextInput
              placeholder="Dose (e.g., 100 mg daily)"
              value={t.dose}
              onChange={e => updatePriorTreatment(idx, 'dose', e.target.value)}
            />
            <TextInput
              placeholder="Duration (e.g., 8 weeks)"
              value={t.duration}
              onChange={e => updatePriorTreatment(idx, 'duration', e.target.value)}
            />
          </div>
          <div className="grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
            <div className="flex flex-wrap gap-1 text-[11px]">
              {responses.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updatePriorTreatment(idx, 'response', r.value)}
                  className={`rounded-full px-2 py-1 ${
                    t.response === r.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <TextInput
              placeholder="Reason for discontinuation"
              value={t.reasonForDiscontinuation}
              onChange={e =>
                updatePriorTreatment(idx, 'reasonForDiscontinuation', e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addPriorTreatment}
        className="rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        + Add prior treatment
      </button>
    </div>
  );
}

function StepRequestedService({
  form,
  onChange,
}: {
  form: ClinicalFormData;
  onChange: <K extends keyof ClinicalFormData>(
    key: K,
    value: ClinicalFormData[K],
  ) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">
        Requested service / medication
      </h2>
      <Field label="Requested service / medication">
        <TextInput
          value={form.requestedService}
          onChange={e => onChange('requestedService', e.target.value)}
          placeholder="Esketamine (Spravato) 84 mg intranasal"
        />
      </Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Dose">
          <TextInput
            value={form.requestedDose}
            onChange={e => onChange('requestedDose', e.target.value)}
            placeholder="84 mg"
          />
        </Field>
        <Field label="Frequency">
          <TextInput
            value={form.requestedFrequency}
            onChange={e => onChange('requestedFrequency', e.target.value)}
            placeholder="Twice weekly"
          />
        </Field>
        <Field label="Planned duration">
          <TextInput
            value={form.requestedDuration}
            onChange={e => onChange('requestedDuration', e.target.value)}
            placeholder="4 weeks induction, then taper"
          />
        </Field>
      </div>
      <Field
        label="Clinical rationale for requested service at this time"
        hint="Tie to guideline alignment, prior failures, and risk if not approved."
      >
        <TextArea
          rows={4}
          value={form.rationale}
          onChange={e => onChange('rationale', e.target.value)}
          placeholder="Despite adequate trials of sertraline and venlafaxine at therapeutic doses and durations, the patient remains severely symptomatic with marked functional impairment..."
        />
      </Field>
      <Field
        label="Risk if not approved"
        hint="Deterioration, hospitalization, safety, or loss of function."
      >
        <TextArea
          rows={3}
          value={form.riskIfNotApproved}
          onChange={e => onChange('riskIfNotApproved', e.target.value)}
          placeholder="High risk of further functional decline, potential hospitalization, and worsening suicidal ideation if current trajectory continues without escalation of care..."
        />
      </Field>
    </div>
  );
}

function StepPayerRedFlags({
  form,
  onChange,
}: {
  form: ClinicalFormData;
  onChange: <K extends keyof ClinicalFormData>(
    key: K,
    value: ClinicalFormData[K],
  ) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">Payer & red flags</h2>
      <Field label="Payer profile">
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={form.payerProfileId}
          onChange={e => onChange('payerProfileId', e.target.value)}
        >
          <option value="">Select payer</option>
          {PAYER_PROFILES.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.product}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-center gap-2 text-xs">
        <input
          id="previouslyDenied"
          type="checkbox"
          checked={form.previouslyDenied}
          onChange={e => onChange('previouslyDenied', e.target.checked)}
          className="h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="previouslyDenied" className="text-slate-700">
          This request (or similar) was previously denied
        </label>
      </div>
      <Field
        label="Known payer concerns / red flags"
        hint="E.g., prior denial reasons, step therapy requirements, or formulary notes."
      >
        <TextArea
          rows={3}
          value={form.redFlags}
          onChange={e => onChange('redFlags', e.target.value)}
          placeholder="Prior denial citing insufficient documentation of prior antidepressant trials and lack of functional impairment detail..."
        />
      </Field>
    </div>
  );
}

function StepPreviewControls({
  outputMode,
  setOutputMode,
  result,
}: {
  outputMode: OutputMode;
  setOutputMode: (m: OutputMode) => void;
  result: ReturnType<typeof buildJustification>;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-800">Preview & export</h2>
      <p className="text-[11px] text-slate-500">
        Choose the output format you need. You can copy text directly into your EHR, fax cover
        sheet, or payer portal.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <ModeChip
          label="Letter"
          active={outputMode === 'LETTER'}
          onClick={() => setOutputMode('LETTER')}
        />
        <ModeChip
          label="Chart note"
          active={outputMode === 'CHART_NOTE'}
          onClick={() => setOutputMode('CHART_NOTE')}
        />
        <ModeChip
          label="Appeal draft"
          active={outputMode === 'APPEAL'}
          onClick={() => setOutputMode('APPEAL')}
        />
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
        <p>
          Internal score: <strong>{result.score.label}</strong> ({result.score.numeric}/100). Use
          the suggestions on the right to tighten documentation before submitting.
        </p>
      </div>
    </div>
  );
}
