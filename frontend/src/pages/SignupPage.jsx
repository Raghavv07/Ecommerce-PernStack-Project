import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { StoreIcon, UserPlusIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

export default function SignupPage() {
  const { signup, isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup({ email, password, displayName });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-3">
              <StoreIcon className="size-7" />
            </div>
            <h2 className="text-2xl font-bold text-base-content">Create an account</h2>
            <p className="text-sm text-base-content/60 mt-1">
              Start shopping with Northwind today
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-4 text-xs py-2 shadow-sm rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input input-bordered w-full text-sm"
              />
            </div>

            <div>
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full text-sm"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label py-1 text-xs font-semibold text-base-content/80">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pr-10 text-sm"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-base-content/60">
                Must be at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 gap-2 shadow-md"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <UserPlusIcon className="size-4" />
              )}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-base-content/60">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
