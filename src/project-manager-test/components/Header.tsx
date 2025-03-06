interface HeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, onBack, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Back
          </button>
        )}
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>
      {actions && (
        <div>
          {actions}
        </div>
      )}
    </div>
  );
} 