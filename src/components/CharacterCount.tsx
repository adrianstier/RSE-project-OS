interface CharacterCountProps {
  current: number;
  max: number;
  className?: string;
}

export default function CharacterCount({ current, max, className = '' }: CharacterCountProps) {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const isOver = percentage >= 100;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`text-xs ${
          isOver
            ? 'text-red-600'
            : isWarning
            ? 'text-amber-600'
            : 'text-text-muted'
        }`}
      >
        {current}/{max}
      </span>
      {isOver && (
        <span className="text-xs text-red-600">
          ({current - max} over limit)
        </span>
      )}
    </div>
  );
}
