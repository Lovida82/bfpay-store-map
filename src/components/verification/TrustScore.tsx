import { getTrustLevel, TRUST_LEVEL_COLORS, TRUST_LEVEL_LABELS } from '@/types/map';
import { formatTrustScore } from '@/utils/formatters';
import { clsx } from 'clsx';

interface TrustScoreProps {
  score: number;
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TrustScore({ score, count, size = 'md' }: TrustScoreProps) {
  const trustLevel = getTrustLevel(score, count);
  const color = TRUST_LEVEL_COLORS[trustLevel];
  const label = TRUST_LEVEL_LABELS[trustLevel];

  const sizes = {
    sm: {
      container: 'w-12 h-12',
      text: 'text-sm',
      label: 'text-xs',
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-lg',
      label: 'text-xs',
    },
    lg: {
      container: 'w-20 h-20',
      text: 'text-2xl',
      label: 'text-sm',
    },
  };

  const percentage = Math.round(score * 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={clsx('relative', sizes[size].container)}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx('font-bold', sizes[size].text)} style={{ color }}>
            {formatTrustScore(score)}
          </span>
        </div>
      </div>

      <span className={clsx('mt-1 font-medium', sizes[size].label)} style={{ color }}>
        {label}
      </span>

      <span className="text-xs text-gray-500 mt-0.5">검증 {count}회</span>
    </div>
  );
}
