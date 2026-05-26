export type Severity = 'MILD' | 'MODERATE' | 'SEVERE' | 'REFRACTORY';
export type TreatmentResponse = 'NO_BENEFIT' | 'PARTIAL_BENEFIT' | 'INTOLERABLE_SIDE_EFFECTS' | 'CONTRAINDICATED';
export type OutputMode = 'LETTER' | 'CHART_NOTE' | 'APPEAL';

export interface PriorTreatment {
  name: string;
  dose: string;
  duration: string;
  response: TreatmentResponse;
  reasonForDiscontinuation: string;
}

export interface ClinicalFormData {
  patientInitials: string;
  dob: string;
  visitDate: string;
  diagnosis: string;
  severity: Severity;
  symptoms: string;
  functionalImpairment: string;
  chronicity: string;
  priorTreatments: PriorTreatment[];
  requestedService: string;
  requestedDose: string;
  requestedFrequency: string;
  requestedDuration: string;
  rationale: string;
  riskIfNotApproved: string;
  payerProfileId: string;
  previouslyDenied: boolean;
  redFlags: string;
}

export interface PayerProfile {
  id: string;
  name: string;
  product: string;
  stepTherapyRequired: boolean;
  commonDenialReasons: string[];
  approvalRate: number;
}

export interface JustificationResult {
  letterText: string;
  chartNoteText: string;
  appealText: string;
  score: {
    numeric: number;
    label: string;
  };
  suggestions: string[];
}
