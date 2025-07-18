import { useState } from "react";

interface SimpleAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleAuth({ isOpen, onClose }: SimpleAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isForgotPassword) {
        // Handle forgot password
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Forgot password response:", data);
          
          if (data.resetLink) {
            // Show direct reset link when email isn't sent
            setMessage(`${data.message}\n\nReset Link: ${data.resetLink}\n\nYou can also reset your password directly below:`);
            setResetToken(data.token);
            setShowResetForm(true);
          } else {
            setMessage(data.message || "Reset request processed.");
          }
        } else {
          const error = await response.json();
          setMessage(error.error || "Failed to send reset email");
        }
      } else {
        // Handle login/register
        const url = isLogin ? "/api/auth/login" : "/api/auth/register";
        const body = isLogin 
          ? { email, password }
          : { email, password, firstName, lastName };

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("auth_token", data.token);
          onClose();
          // Trigger a custom event to update header
          window.dispatchEvent(new CustomEvent('authChanged'));
        } else {
          const error = await response.json();
          setMessage(error.error || "Authentication failed");
        }
      }
    } catch (error) {
      console.error("Auth network error:", error);
      setMessage(`Network error: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });

      if (response.ok) {
        setMessage("Password reset successful! You can now login with your new password.");
        setIsForgotPassword(false);
        setIsLogin(true);
        setShowResetForm(false);
        setResetToken("");
        setNewPassword("");
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to reset password");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        width: "400px",
        maxWidth: "90vw"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
            {isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Sign Up"}
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>

        {message && (
          <div style={{ 
            padding: "0.75rem", 
            marginBottom: "1rem", 
            backgroundColor: message.includes("successful") ? "#d4edda" : "#f8d7da",
            border: `1px solid ${message.includes("successful") ? "#c3e6cb" : "#f5c6cb"}`,
            borderRadius: "4px",
            color: message.includes("successful") ? "#155724" : "#721c24"
          }}>
            {message}
          </div>
        )}

        {showResetForm && resetToken && (
          <form onSubmit={handleResetPassword}>
            <h3 style={{ margin: "0 0 1rem 0" }}>Enter New Password</h3>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginBottom: "1rem",
                boxSizing: "border-box"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setResetToken("");
                setNewPassword("");
                setMessage("");
              }}
              style={{
                width: "100%",
                padding: "0.5rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.9rem",
                cursor: "pointer",
                marginTop: "0.5rem"
              }}
            >
              Back to Login
            </button>
          </form>
        )}

        {!showResetForm && (
          <>
            <form onSubmit={handleSubmit}>
              {!isLogin && !isForgotPassword && (
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px"
                    }}
                  />
                </div>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                  boxSizing: "border-box"
                }}
              />

              {!isForgotPassword && (
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                    boxSizing: "border-box"
                  }}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.75rem",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: "1rem"
                }}
              >
                {loading ? "Please wait..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div>
              {isLogin && !isForgotPassword && (
                <p style={{ textAlign: "center", margin: "0 0 1rem 0" }}>
                  <button
                    onClick={() => setIsForgotPassword(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontSize: "0.9rem"
                    }}
                  >
                    Forgot Password?
                  </button>
                </p>
              )}

              <p style={{ textAlign: "center", margin: 0 }}>
                {isForgotPassword ? (
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setMessage("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setMessage("");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}