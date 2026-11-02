export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-rose-600 font-medium">{message}</p>
      {onRetry && (
        <button className="btn-primary mt-4" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
