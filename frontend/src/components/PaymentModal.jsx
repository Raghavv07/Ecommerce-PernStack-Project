import { useState } from "react";
import { useNavigate } from "react-router";
import { formatPrice } from "../utils/format";
import { useCart } from "../store/cart";
import {
  CreditCardIcon,
  LockIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  BanknoteIcon,
  CheckCircle2Icon,
  XIcon,
  SparklesIcon,
} from "lucide-react";

export function PaymentModal({ isOpen, onClose, subtotal, currency = "usd", onProcessOrder }) {
  const navigate = useNavigate();
  const clearCart = useCart((s) => s.clear);

  const [method, setMethod] = useState("card"); // "card" | "upi" | "cod"
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("Demo Customer");
  const [upiId, setUpiId] = useState("customer@okaxis");

  const [status, setStatus] = useState("idle"); // "idle" | "authorizing" | "success" | "error"
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  async function handlePay(e) {
    e.preventDefault();
    setErrorMessage("");
    setStatus("authorizing");
    setStatusMessage("Connecting to secure payment gateway…");

    // Realistic demo gateway delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    setStatusMessage("Authorizing demo transaction…");

    try {
      const details =
        method === "card"
          ? { cardNumber, expiry, cvv, name }
          : method === "upi"
          ? { upiId }
          : {};

      const result = await onProcessOrder(method, details);

      if (result?.ok && result?.orderId) {
        setStatus("success");
        setStatusMessage("Payment Approved! Creating your order…");

        await new Promise((resolve) => setTimeout(resolve, 800));
        clearCart();
        onClose();
        navigate(result.returnUrl || `/checkout/return?checkout_id=${result.orderId}`);
      } else {
        throw new Error(result?.error || "Payment was declined");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Payment processing failed");
    }
  }

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box relative max-w-lg border border-base-300 bg-base-100 p-0 shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="border-b border-base-300 bg-base-200/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <LockIcon className="size-4" />
            </span>
            <div>
              <h3 className="font-bold text-base text-base-content flex items-center gap-1.5">
                Northwind Checkout
                <span className="badge badge-warning badge-xs uppercase font-mono tracking-wider">
                  Demo Gateway
                </span>
              </h3>
              <p className="text-xs text-base-content/60 flex items-center gap-1">
                <ShieldCheckIcon className="size-3.5 text-success inline" />
                256-bit Simulated Encryption
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={status === "authorizing" || status === "success"}
            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
            aria-label="Close"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Total Box */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Total Payable
              </span>
              <div className="text-2xl font-extrabold text-base-content">
                {formatPrice(subtotal, currency)}
              </div>
            </div>
            <div className="text-right">
              <span className="badge badge-success badge-sm gap-1">
                <SparklesIcon className="size-3" />
                Free Shipping
              </span>
              <p className="text-[11px] text-base-content/60 mt-1">Instant confirmation</p>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="tabs tabs-boxed mb-5 grid grid-cols-3 bg-base-200 p-1 rounded-xl">
            <button
              type="button"
              className={`tab text-xs sm:text-sm gap-1.5 ${
                method === "card" ? "tab-active font-semibold shadow-sm" : ""
              }`}
              onClick={() => setMethod("card")}
            >
              <CreditCardIcon className="size-4" />
              <span>Card</span>
            </button>
            <button
              type="button"
              className={`tab text-xs sm:text-sm gap-1.5 ${
                method === "upi" ? "tab-active font-semibold shadow-sm" : ""
              }`}
              onClick={() => setMethod("upi")}
            >
              <QrCodeIcon className="size-4" />
              <span>UPI / QR</span>
            </button>
            <button
              type="button"
              className={`tab text-xs sm:text-sm gap-1.5 ${
                method === "cod" ? "tab-active font-semibold shadow-sm" : ""
              }`}
              onClick={() => setMethod("cod")}
            >
              <BanknoteIcon className="size-4" />
              <span>COD</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-error mb-4 text-xs py-2 shadow-sm rounded-lg flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          )}

          {/* Method 1: Card */}
          {method === "card" && (
            <form onSubmit={handlePay} className="space-y-3.5">
              <div>
                <label className="label py-1 text-xs font-semibold text-base-content/80">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="input input-bordered w-full text-sm font-mono pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70">
                    <span className="badge badge-sm badge-neutral font-bold text-[10px]">VISA</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label py-1 text-xs font-semibold text-base-content/80">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="input input-bordered w-full text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="label py-1 text-xs font-semibold text-base-content/80">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="input input-bordered w-full text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label py-1 text-xs font-semibold text-base-content/80">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="input input-bordered w-full text-sm"
                />
              </div>

              <p className="text-[11px] text-base-content/60 bg-base-200/50 p-2.5 rounded-lg border border-base-300">
                💡 <strong>Demo Mode:</strong> You can use the default test card details or enter
                any simulated card numbers. No real charge will occur.
              </p>

              <button
                type="submit"
                disabled={status === "authorizing" || status === "success"}
                className="btn btn-primary w-full mt-3 gap-2 shadow-md"
              >
                {status === "authorizing" ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : status === "success" ? (
                  <CheckCircle2Icon className="size-5 text-success-content" />
                ) : (
                  <LockIcon className="size-4" />
                )}
                {status === "authorizing"
                  ? statusMessage
                  : status === "success"
                  ? "Approved!"
                  : `Pay ${formatPrice(subtotal, currency)}`}
              </button>
            </form>
          )}

          {/* Method 2: UPI / QR Code */}
          {method === "upi" && (
            <form onSubmit={handlePay} className="space-y-4 text-center">
              <div className="mx-auto flex flex-col items-center justify-center p-4 border border-base-300 rounded-2xl bg-base-200/40 max-w-xs">
                {/* Simulated QR Code */}
                <div className="size-40 bg-white p-3 rounded-xl border border-gray-300 shadow-sm flex items-center justify-center relative">
                  <svg
                    className="size-full text-black"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                  >
                    <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v10H40zM50 20h10v10H50zM40 40h20v20H40zM70 40h10v10H70zM80 50h10v10H80zM10 40h10v10H10zM20 50h10v10H20zM40 70h10v10H40zM50 80h10v10H50zM70 70h30v30H70zM80 80h10v10H80z" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="badge badge-primary badge-xs font-mono font-bold shadow">
                      UPI DEMO
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-base-content/70 mt-3">
                  Scan to Pay with GPay / PhonePe / Paytm
                </span>
              </div>

              <div className="text-left">
                <label className="label py-1 text-xs font-semibold text-base-content/80">
                  Or enter Virtual Payment Address (UPI ID)
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="input input-bordered w-full text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={status === "authorizing" || status === "success"}
                className="btn btn-primary w-full mt-2 gap-2 shadow-md"
              >
                {status === "authorizing" ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : status === "success" ? (
                  <CheckCircle2Icon className="size-5" />
                ) : (
                  <QrCodeIcon className="size-4" />
                )}
                {status === "authorizing"
                  ? statusMessage
                  : status === "success"
                  ? "Approved!"
                  : `Simulate UPI Payment (${formatPrice(subtotal, currency)})`}
              </button>
            </form>
          )}

          {/* Method 3: Cash on Delivery (COD) */}
          {method === "cod" && (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-base-content font-semibold text-sm">
                  <BanknoteIcon className="size-5 text-primary" />
                  Cash / Pay on Delivery
                </div>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  Pay directly in cash or UPI to the delivery courier when your order arrives.
                </p>
                <ul className="text-xs text-base-content/60 space-y-1 list-disc list-inside pt-1">
                  <li>No upfront payment required</li>
                  <li>Order is confirmed instantly</li>
                  <li>Support Chat & Video Call available immediately</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={status === "authorizing" || status === "success"}
                className="btn btn-primary w-full mt-2 gap-2 shadow-md"
              >
                {status === "authorizing" ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : status === "success" ? (
                  <CheckCircle2Icon className="size-5" />
                ) : (
                  <BanknoteIcon className="size-4" />
                )}
                {status === "authorizing"
                  ? statusMessage
                  : status === "success"
                  ? "Order Placed!"
                  : "Confirm Order (Pay on Delivery)"}
              </button>
            </form>
          )}
        </div>
      </div>
      <div
        className="modal-backdrop bg-black/50"
        onClick={() => {
          if (status !== "authorizing" && status !== "success") {
            onClose();
          }
        }}
      />
    </div>
  );
}
