import Link from "next/link";

const RegisterForm = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg-page)">
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 w-12 h-12 rounded-(--radius-lg) border border-(--color-border) flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--color-text-600)"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-(--color-text-900) tracking-tight">
          Accounts are by invitation
        </h1>
        <p className="mt-2 text-sm text-(--color-text-600) leading-relaxed">
          Property Ops accounts are provisioned by an Administrator. Contact
          your platform admin to get access.
        </p>

        <div className="mt-8">
          <Link href="/login" className="btn-secondary inline-flex">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
