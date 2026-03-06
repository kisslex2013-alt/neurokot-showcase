import type { CaseV1 } from '@/lib/cases';

type ConfidenceLevel = CaseV1['impact']['confidence'];

const confidenceMeta: Record<
  ConfidenceLevel,
  { label: string; className: string; help: string }
> = {
  draft: {
    label: 'Draft',
    className: 'border-amber-300 bg-amber-50 text-amber-800',
    help: 'Draft: early estimate based on assumptions or pilot expectations.',
  },
  measured: {
    label: 'Measured',
    className: 'border-blue-300 bg-blue-50 text-blue-800',
    help: 'Measured: based on observed data from a real usage period.',
  },
  verified: {
    label: 'Verified',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-800',
    help: 'Verified: validated with stable measurements and stakeholder sign-off.',
  },
};

export default function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const meta = confidenceMeta[confidence];

  return (
    <span
      title={meta.help}
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
