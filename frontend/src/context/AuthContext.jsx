/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { apiFetch } from "../lib/api";
import { LogInIcon, LogOutIcon, PackageIcon, SettingsIcon, XIcon, EyeIcon, EyeOffIcon, StoreIcon } from "lucide-react";

const TOKEN_KEY = "ecommerce_jwt_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY) || null;
    }
    return null;
  });
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "signup"

  // Fetch current user if token exists on boot
  useEffect(() => {
    let active = true;

    async function verifyUser() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        if (active) {
          setUser(null);
          setIsLoaded(true);
        }
        return;
      }

      try {
        const data = await apiFetch("/api/auth/me", { getToken: () => savedToken });
        if (active) {
          if (data?.user) {
            setUser(data.user);
            setToken(savedToken);
          } else {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        if (active) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoaded(true);
        }
      }
    }

    verifyUser();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });

    if (data?.token && data?.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    }
    throw new Error(data?.error || "Login failed");
  }, []);

  const signup = useCallback(async ({ email, password, displayName }) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: { email, password, displayName },
    });

    if (data?.token && data?.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    }
    throw new Error(data?.error || "Registration failed");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    try {
      apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const getToken = useCallback(async () => {
    return localStorage.getItem(TOKEN_KEY) || token || null;
  }, [token]);

  const openLoginModal = useCallback(() => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
  }, []);

  const openSignupModal = useCallback(() => {
    setAuthModalMode("signup");
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const value = {
    token,
    user,
    isLoaded,
    isSignedIn: Boolean(token && user),
    userId: user?.id ?? null,
    getToken,
    login,
    signup,
    logout,
    openLoginModal,
    openSignupModal,
    closeAuthModal,
    authModalOpen,
    authModalMode,
    setAuthModalMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {authModalOpen && <AuthModal />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/**
 * Drop-in replacement for Clerk's <Show when="signed-in" | "signed-out">
 */
export function Show({ when, children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (when === "signed-in" && isSignedIn) return <>{children}</>;
  if (when === "signed-out" && !isSignedIn) return <>{children}</>;
  return null;
}

/**
 * Drop-in replacement for Clerk's <SignInButton>
 */
export function SignInButton({ children, className = "", ...props }) {
  const { openLoginModal } = useAuth();

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props?.onClick?.(e);
        openLoginModal();
      },
    });
  }

  return (
    <button
      type="button"
      onClick={openLoginModal}
      className={className || "btn btn-primary btn-sm"}
      {...props}
    >
      {children || "Sign in"}
    </button>
  );
}

/**
 * Drop-in replacement for Clerk's <SignUpButton>
 */
export function SignUpButton({ children, className = "", ...props }) {
  const { openSignupModal } = useAuth();

  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props?.onClick?.(e);
        openSignupModal();
      },
    });
  }

  return (
    <button
      type="button"
      onClick={openSignupModal}
      className={className || "btn btn-outline btn-sm"}
      {...props}
    >
      {children || "Sign up"}
    </button>
  );
}

/**
 * Drop-in replacement for Clerk's <UserButton>
 */
export function UserButton() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  const initials = (user.displayName || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role = user.role;

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        onClick={() => setDropdownOpen((v) => !v)}
        className="btn btn-ghost btn-circle avatar placeholder border border-base-300 shadow-sm"
        aria-label="User profile menu"
      >
        <div className="w-10 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center">
          <span>{initials}</span>
        </div>
      </button>

      {dropdownOpen && (
        <ul
          tabIndex={0}
          className="dropdown-content menu z-50 mt-3 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
          onClick={() => setDropdownOpen(false)}
        >
          <li className="menu-title px-4 py-2 border-b border-base-300/60">
            <div className="font-semibold text-base-content text-sm truncate">
              {user.displayName || "User"}
            </div>
            <div className="text-xs text-base-content/60 truncate font-normal">
              {user.email}
            </div>
            <div className="mt-1">
              <span className="badge badge-primary badge-xs capitalize">
                {role}
              </span>
            </div>
          </li>

          <li className="mt-1">
            <Link to="/orders" className="flex items-center gap-2">
              <PackageIcon className="size-4" />
              <span>My Orders</span>
            </Link>
          </li>

          {role === "admin" && (
            <li>
              <Link to="/admin" className="flex items-center gap-2 text-secondary">
                <SettingsIcon className="size-4" />
                <span>Admin Dashboard</span>
              </Link>
            </li>
          )}

          <div className="divider my-1"></div>

          <li>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-error hover:bg-error/10"
            >
              <LogOutIcon className="size-4" />
              <span>Sign out</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

/**
 * Sleek, interactive Auth Modal with tabs for Sign In & Sign Up
 */
function AuthModal() {
  const { closeAuthModal, authModalMode, setAuthModalMode, login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === "login") {
        await login(email, password);
      } else {
        await signup({ email, password, displayName });
      }
      setEmail("");
      setPassword("");
      setDisplayName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box relative max-w-md border border-base-300 bg-base-100 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/70 hover:text-base-content"
          aria-label="Close dialog"
        >
          <XIcon className="size-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <StoreIcon className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-base-content">
              {authModalMode === "login" ? "Welcome back" : "Create an account"}
            </h3>
            <p className="text-xs text-base-content/60">
              {authModalMode === "login"
                ? "Sign in to access your orders and checkout"
                : "Join Northwind Ecommerce today"}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="tabs tabs-boxed mb-5 grid grid-cols-2 bg-base-200 p-1 rounded-xl">
          <button
            type="button"
            className={`tab ${authModalMode === "login" ? "tab-active font-semibold shadow-sm" : ""}`}
            onClick={() => {
              setAuthModalMode("login");
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab ${authModalMode === "signup" ? "tab-active font-semibold shadow-sm" : ""}`}
            onClick={() => {
              setAuthModalMode("signup");
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
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

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === "signup" && (
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
          )}

          <div>
            <label className="label py-1 text-xs font-semibold text-base-content/80">
              Email Address <span className="text-error">*</span>
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
              Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full pr-10 text-sm"
                autoComplete={authModalMode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {authModalMode === "signup" && (
              <p className="mt-1 text-[11px] text-base-content/60">
                Must be at least 6 characters.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2 gap-2 shadow-md"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <LogInIcon className="size-4" />
            )}
            {loading
              ? authModalMode === "login"
                ? "Signing in…"
                : "Creating account…"
              : authModalMode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Footer helper */}
        <div className="mt-5 text-center text-xs text-base-content/60">
          {authModalMode === "login" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("signup");
                  setError(null);
                }}
                className="link link-primary font-semibold"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("login");
                  setError(null);
                }}
                className="link link-primary font-semibold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={closeAuthModal} />
    </div>
  );
}
