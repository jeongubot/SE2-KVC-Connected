import Navbar from "../components/Navbar"
import { useState, useEffect } from "react"
import { Button } from "../components/Button"
import FormGroup from "../components/FormGroup"
import "../css/Forms.css"

function LoginForm() {
  const [currentStep, setCurrentStep] = useState("login")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha: "",
    accessCode: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [captcha, setCaptcha] = useState({ image: "", captchaKey: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/captcha", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("CAPTCHA loaded:", data);  
      setCaptcha({ image: data.image, captchaKey: data.captchaKey });
    } catch (error) {
      console.error("Failed to load CAPTCHA:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted");
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
          },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      const token = response.headers.get("Authorization")?.split(" ")[1] || data.token;
      if (token) {
        localStorage.setItem("jwt", token);
      }

      setMessage(data.message);
      window.location.replace(data.redirectUrl)
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    setCurrentStep("forgotPassword")
  }

  const handleSendCode = async (e) => {
  e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reset code");

      console.log(data.message); // "Reset code sent to your email."
      setMessage(data.message);
      setCurrentStep("enterCode"); // Move to the next step
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setMessage(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log("Email:", formData.email);
    console.log("Access Code:", formData.accessCode);
    try {
      const response = await fetch("http://localhost:5000/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, accessCode: formData.accessCode }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid or expired reset code");

      console.log(data.message); // "Code verified. Proceed to reset your password."
      setMessage(data.message);
      setCurrentStep("newPassword"); // Move to the next step
    } catch (error) {
      console.error("Error verifying reset code:", error);
      setMessage(error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          accessCode: formData.accessCode,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset password");

      setMessage(data.message);
      setCurrentStep("login");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleResendCode = (e) => {
    e.preventDefault()
    console.log("Resending code to:", formData.email)
  }

  const renderForm = () => {
    switch (currentStep) {
      case "forgotPassword":
        return (
          <>
            <h2>Forgot Password</h2>
            <p>Enter your email address and we'll send you an access code</p>
            <form onSubmit={handleSendCode}>
              <FormGroup
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Button buttonStyle='btn--secondary' onClick={() => setCurrentStep("login")} className="form-btn-3">BACK TO LOGIN</Button>
              <Button
                buttonStyle="btn--primary"
                type="submit"
                className="form-btn-1"
                onClick={handleSendCode} 
              >
                SEND
              </Button>
            </form>
          </>
        )

      case "enterCode":
        return (
          <>
            <h2>Forgot Password</h2>
            <p>Enter access code (6 digits) that was sent to your email</p>
            <form onSubmit={handleResetPassword}>
              <FormGroup
                label="Access Code"
                type="text"
                name="accessCode"
                value={formData.accessCode}
                onChange={handleChange}
                required
              />
              <div className="resend-code">
                <a href="#" onClick={handleResendCode}>
                  Resend code
                </a>
              </div>
              <Button
                buttonStyle="btn--primary"
                type="submit"
                className="form-btn-1"
                onClick={handleResetPassword}
              >
                RESET PASSWORD
              </Button>
            </form>
          </>
        )

      case "newPassword":
        return (
          <>
            <h2>Forgot Password</h2>
            <p>Reset Password</p>
            <form onSubmit={handleChangePassword}>
              <FormGroup
                label="New Password"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <FormGroup
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <Button
                buttonStyle="btn--primary"
                type="submit"
                className="form-btn-1"
                onClick={handleChangePassword} 
              >
                CHANGE PASSWORD
              </Button>
            </form>
          </>
        )

      default:
        return (
          <>
            <h2>Welcome Back!</h2>
            <p>Login to your account</p>
            <form onSubmit={handleSubmit}>
              <FormGroup
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FormGroup
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="forgot">
                <a href="#" onClick={handleForgotPassword}>
                  Forgot Password?
                </a>
              </div>
              <div className="forms-group captcha">
                <label htmlFor="captcha">Enter Captcha</label>
                <div className="captcha-container">
                  <img src={`${captcha.image}`} className="generated" alt="CAPTCHA" />
                  <input
                    type="text"
                    id="captcha"
                    name="captchaInput"
                    value={formData.captchaInput}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <Button buttonStyle="btn--primary" to="/patients" className="form-btn-1">
                LOGIN
              </Button>
            </form>
          </>
        )
    }
  }

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="left-section">
          <h1 className="login-h1">
            KHO
            <br /> VETERINARY
            <br /> CLINIC
          </h1>
        </div>
        <div className="right-section">{renderForm()}</div>
      </div>
    </>
  )
}

export default LoginForm
