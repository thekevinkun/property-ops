import Link from "next/link";

const UnauthorizedPlaceholder = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg-page)">
      <div className="w-full max-w-sm text-center">
        {/* Error code — subtle, not alarming */}
        <p className="text-xs font-mono text-(--color-text-400) uppercase tracking-widest mb-4">
          403
        </p>

        <h1 className="text-xl font-semibold text-(--color-text-900) tracking-tight">
          Access restricted
        </h1>
        <p className="mt-2 text-sm text-(--color-text-600) leading-relaxed">
          You don&apos;t have permission to view this page. Contact your
          administrator if you think this is a mistake.
        </p>

        <div className="mt-8">
          <Link href="/dashboard" className="btn-secondary inline-flex">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPlaceholder;
