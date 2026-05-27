import { PayerProfile } from './types';

export const PAYER_PROFILES: PayerProfile[] = [
  {
    id: 'anthem',
    name: 'Anthem',
    product: 'Blue Cross Blue Shield',
    stepTherapyRequired: true,
    commonDenialReasons: ['Insufficient prior treatment documentation', 'Lack of FDA approval for indication', 'Off-label use without justification'],
    approvalRate: 78,
  },
  {
    id: 'aetna',
    name: 'Aetna',
    product: 'Aetna Health',
    stepTherapyRequired: true,
    commonDenialReasons: ['Step therapy not completed', 'Diagnosis code insufficiency', 'Missing functional impairment documentation'],
    approvalRate: 72,
  },
  {
    id: 'cigna',
    name: 'Cigna',
    product: 'Cigna HealthCare',
    stepTherapyRequired: true,
    commonDenialReasons: ['Formulary non-compliance', 'Age restrictions not met', 'Prior authorization not submitted timely'],
    approvalRate: 75,
  },
  {
    id: 'united',
    name: 'United Healthcare',
    product: 'UnitedHealthcare',
    stepTherapyRequired: true,
    commonDenialReasons: ['Clinical criteria not met', 'Dose exceeds guidelines', 'Prior medication trial insufficient'],
    approvalRate: 76,
  },
  {
    id: 'humana',
    name: 'Humana',
    product: 'Humana Health',
    stepTherapyRequired: true,
    commonDenialReasons: ['Generic equivalent available', 'Step therapy requirement not fulfilled', 'Inadequate clinical justification'],
    approvalRate: 70,
  },
  {
    id: 'medicare',
    name: 'Medicare',
    product: 'Original Medicare / Advantage',
    stepTherapyRequired: false,
    commonDenialReasons: ['Not medically necessary per LCD', 'Coverage limits exceeded', 'Service not covered under benefit category'],
    approvalRate: 80,
  },
  {
    id: 'medicaid',
    name: 'Medicaid',
    product: 'State Medicaid',
    stepTherapyRequired: true,
    commonDenialReasons: ['Formulary exclusion', 'Income/asset limits exceeded', 'Prior authorization missing'],
    approvalRate: 65,
  },
];

export function getPayerProfileById(id: string): PayerProfile | undefined {
  return PAYER_PROFILES.find(p => p.id === id);
}
