import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import "../styles/auth.css";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const email = location.state?.email || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef([]);

  useEffect(() => {
    // If someone lands here directly without an email in state, send them
    // back to register instead of showing a broken form.
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const focusInput = (index) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    // Support pasting the whole code into a single box.
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, OTP_LENGTH - index).split("");
      const next = [...digits];
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      setDigits(next);
      const lastFilled = Math.min(index + chars.length, OTP_LENGTH - 1);
      focusInput(lastFilled);
      return;
    }
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Please enter the full ${OTP_LENGTH}-digit code`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        toast.success("Email verified! Welcome to ShopNest.");
        navigate("/");
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("A new OTP has been sent to your email.");
        setCooldown(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(""));
        focusInput(0);
      } else {
        toast.error(data.message || "Could not resend OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="auth-container">
      <form onSubmit={handleVerify} className="auth-form">
        <h2>Verify Your Email</h2>
        <p
          style={{ textAlign: "center", color: "#a1a1aa", marginTop: "-10px" }}
        >
          We sent a {OTP_LENGTH}-digit code to <br />
          <strong style={{ color: "#fff" }}>{email}</strong>
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            margin: "10px 0",
          }}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoFocus={index === 0}
              style={{
                width: "48px",
                height: "56px",
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                padding: 0,
              }}
            />
          ))}
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <p>
          Didn't get the code?{" "}
          {cooldown > 0 ? (
            <span style={{ color: "#71717a" }}>Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none",
                border: "none",
                color: "#f97316",
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </p>
        <p>
          Wrong email? <Link to="/register">Start over</Link>
        </p>
      </form>
    </div>
  );
};

export default VerifyOtp;
