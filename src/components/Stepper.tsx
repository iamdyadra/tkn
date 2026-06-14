// Stepper — timeline tracking status pesanan
import { Check } from 'lucide-react';
import type { PesananStatus } from '@/types';
import { cn } from '@/lib/utils';

const STEPS: { status: PesananStatus; label: string; desc: string }[] = [
  { status: 'draft', label: 'Draft', desc: 'Pesanan dibuat' },
  { status: 'diproses', label: 'Diproses', desc: 'Pesanan sedang diproses' },
  { status: 'dikirim', label: 'Dikirim', desc: 'Pesanan dalam pengiriman' },
  { status: 'diterima', label: 'Diterima', desc: 'Pesanan telah diterima' },
];

const STATUS_INDEX: Record<PesananStatus, number> = {
  draft: 0,
  diproses: 1,
  dikirim: 2,
  diterima: 3,
  dibatalkan: -1,
};

interface Props {
  currentStatus: PesananStatus;
}

export default function Stepper({ currentStatus }: Props) {
  if (currentStatus === 'dibatalkan') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg font-bold leading-none">✕</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Pesanan Dibatalkan</p>
          <p className="text-xs text-red-500">Pesanan ini telah dibatalkan</p>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_INDEX[currentStatus];

  return (
    <div className="w-full">
      <div className="flex items-start">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.status} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="absolute left-1/2 top-4 h-0.5 w-full z-0">
                  <div className={cn('h-full transition-all', isDone ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-gray-200')} />
                </div>
              )}

              {/* Circle */}
              <div
                className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  isDone ? 'border-orange-500' :
                  isCurrent ? 'bg-white border-orange-500 ring-4 ring-orange-100' :
                  'bg-white border-gray-300'
                )}
                style={isDone ? { background: 'linear-gradient(135deg, #F5A623, #F97316)' } : undefined}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span className={cn('text-xs font-bold', isCurrent ? 'text-orange-600' : 'text-gray-400')}>
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center px-1">
                <p className={cn('text-xs font-semibold leading-none', isDone || isCurrent ? 'text-orange-700' : 'text-gray-400')}>
                  {step.label}
                </p>
                <p className={cn('text-xs mt-0.5 hidden sm:block', isPending ? 'text-gray-300' : 'text-gray-500')}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
