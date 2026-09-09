import { Card, CardBody, Form, Label, Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdSecurity } from "react-icons/md";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

import { jwtDecode } from "jwt-decode";
import { sendLoginOtp } from "helper/userManagment_helper";
import { verifyOtp } from "helper/userManagment_helper";
import { FiMail } from "react-icons/fi";
import { createQREndpoint } from "helper/userManagment_helper";

const Login = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [activeField, setActiveField] = useState(null);

  const [qrData, setQrData] = useState("");

  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otpValue];
    newOtp[index] = element.value;
    setOtpValue(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);

    const counter = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(counter);
  }, [timer]);

  // Sending THe OTP
  const sendOtp = async (e) => {
    e.preventDefault();

    if (!otpEmail) {
      toast.warn("Enter your email address");
      return;
    }

    try {
      setIsOtpLoading(true);

      const res = await sendLoginOtp({ email: otpEmail });

      if (res.state === true) {
        setTimer(60);
        toast.success(res.message);
        setModalOpen(false);
      }

      if (res.state === false) {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otpValue.some((val) => val === "")) {
      toast.warn("Enter OTP");
      return;
    }

    const otpCode = otpValue.join("");

    try {
      setIsOtpLoading(true);
      const res = await verifyOtp({ email: otpEmail, otp: otpCode });

      console.log(res);

      if (res.state === true) {
        console.log(res);
        localStorage.setItem("token", res.token);
        const decoded = jwtDecode(res.token);

        console.log("decode", decoded);

        const role = decoded.role;
        const empid = decoded.nameid;
        const phone = decoded.Phone;
        const userName = decoded.unique_name;
        const userEmail = decoded.email;
        const referenceId = decoded.refranceId;
        const lastName = decoded.LastName;
        const address = decoded.address;
        const city = decoded.city;
        const country = decoded.contory;
        const profileImage = decoded.profileImage;
        const state = decoded.state;
        const dob = decoded.DateOfBirth;
        const gender = decoded.gender
        const zip = decoded?.pin

        localStorage.setItem(
          "userData",
          JSON.stringify({
            role,
            empid,
            phone,
            email: userEmail,
            userName,
            referenceId,
            lastName,
            address,
            city,
            country,
            profileImage,
            state,
            dob,
            gender,
            zip
          }),
        );
        toast.success(res.message);
        navigate("/app/index");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Add these state hooks inside your existing component
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const pollQR = async () => {
      const oldSessionId = localStorage.getItem("sessionId");

      try {
        const response = await createQREndpoint(oldSessionId);

        if (!isMounted) return;

        const { status, data } = response || {};

        if (status === true && data) {
          setQrData(data);
          setIsLoading(false);

          if (data?.sessionId) {
            localStorage.setItem("sessionId", data.sessionId);
          }

          if (data?.token) {
            setIsVerifying(true);

            localStorage.setItem("token", data.token);
            const decoded = jwtDecode(data.token);

            const role = decoded?.role;
            const empid = decoded?.nameid;
            const phone = decoded?.Phone;
            const userName = decoded?.unique_name;
            const userEmail = decoded?.email;
            const referenceId = decoded?.refranceId;

            localStorage.setItem(
              "userData",
              JSON.stringify({
                role,
                empid,
                phone,
                email: userEmail,
                userName,
                referenceId,
              })
            );

            toast.success("Login Successful");
            navigate("/app/index");
            return;
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("QR Scan Error:", error?.message);
          setIsLoading(false);
        }
      }

      if (isMounted) {
        timeoutId = setTimeout(pollQR, 2000);
      }
    };

    pollQR();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <>
      {modalOpen ? (
        <Card
          className="login-card border-0 p-2 shadow-lg bg-white"
          style={{ borderRadius: "15px" }}
        >
          <CardBody
            className="p-4 py-md-5 text-center"
            style={{ backgroundColor: "#F4F7FD", borderRadius: "12px" }}
          >
            {/* Card Header Titles */}
            <h2 className="font-weight-bold text-dark mb-2 h1">
              Welcome Back!
            </h2>
            <p className="text-dark font-weight-bold mb-3">
              Sign in to continue to{" "}
              <span className="text-primary-blue font-weight-bold">
                Image-based OMR
              </span>
            </p>

            {/* Login Form */}
            <Form className="text-left">
              <Label
                for="emailAddress"
                className="text-dark mb-2"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                Login with OTP
              </Label>

              <div className="form-group mb-3">
                <label
                  className="font-weight-bold mb-1"
                  style={{ fontSize: "13px", color: "#1a1a1a" }}
                >
                  Email Address <span className="text-danger">*</span>
                </label>
                <div
                  className="input-group"
                  style={{
                    boxShadow:
                      activeField === "otpEmail"
                        ? "0 0 0 3px rgba(47, 98, 255, 0.15)"
                        : "none",
                    borderRadius: "10px",
                    transition: "all 0.2s",
                  }}
                >
                  <div className="input-group-prepend">
                    <span
                      className="input-group-text bg-white pr-2 pl-3"
                      style={{
                        borderTopLeftRadius: "10px",
                        borderBottomLeftRadius: "10px",
                        border:
                          activeField === "otpEmail"
                            ? "1px solid #2f62ff"
                            : "1px solid #e1e7f5",
                        borderRight: "none",
                        color:
                          activeField === "otpEmail" ? "#2f62ff" : "#b0bac9",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <FiMail size={18} />
                    </span>
                  </div>
                  <input
                    type="email"
                    name="otpEmail"
                    className="form-control pl-2"
                    placeholder="Enter your email address"
                    style={{
                      borderTopRightRadius: "10px",
                      borderBottomRightRadius: "10px",
                      border:
                        activeField === "otpEmail"
                          ? "1px solid #2f62ff"
                          : "1px solid #e1e7f5",
                      borderLeft: "none",
                      height: "45px",
                      fontSize: "14px",
                      color: "#4a546e",
                      boxShadow: "none",
                      outline: "none",
                      transition: "all 0.2s",
                    }}
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    onFocus={() => setActiveField("otpEmail")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                onClick={(e) => sendOtp(e)}
                className="btn btn-block font-weight-bold text-white mb-4 shadow-sm"
                style={{
                  background: "linear-gradient(270deg, #3969FE, #1047D5)",
                  color: "white",
                  fontSize: "15px",
                  height: "48px",
                  borderRadius: "10px",
                  border: "none",
                }}
              >
                {isOtpLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              {/* Login with QR Code Sub-Section */}
              <Card className="border rounded-lg mb-3 p-3 bg-white">
                <Row className="align-items-center">
                  <Col xs={7}>
                    <h6
                      className="text-dark"
                      style={{ fontSize: "15px", fontWeight: "700" }}
                    >
                      Login with QR Code
                    </h6>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "0",
                        lineHeight: "1.5",
                      }}
                    >
                      Scan QR code using your mobile to login
                    </p>
                  </Col>
                  <Col
                    xs={5}
                    className="text-right d-flex align-items-center justify-content-end"
                  >
                    <span
                      style={{
                        border: "2px solid #2563eb",
                        padding: 8,
                        borderRadius: 12,
                      }}
                    >
                      {/* <img src={QR} alt="QR Code" width={75} height={75} /> */}
                      <QRCode value={qrData?.sessionId} size={100} />
                    </span>
                  </Col>
                </Row>
              </Card>

              {/* Horizontal Text Divider */}
              <div className="or-divider d-flex align-items-center text-center my-4">
                <div className="flex-grow-1 border-top"></div>
                <span
                  className="mx-3 text-muted small font-weight-bold text-uppercase"
                  style={{ letterSpacing: "1px", fontSize: "0.75rem" }}
                >
                  OR
                </span>
                <div className="flex-grow-1 border-top"></div>
              </div>

              {/* Google Single Sign-On Button */}
              <button
                type="button"
                className="btn btn-block text-dark shadow-sm d-flex align-items-center justify-content-center font-weight-bold"
                style={{
                  height: "54px",
                  borderRadius: "10px",
                  border: "1px solid #e1e7f5",
                  backgroundColor: "#ffffff",
                  color: "#1a1a1a",
                  fontSize: "15px",
                }}
              >
                <FcGoogle
                  style={{ width: "25px", height: "25px", marginRight: "12px" }}
                />
                Continue with Google
              </button>

              {/* Footer Registration Redirect */}
              <p
                className="text-center text-muted my-4"
                style={{ fontSize: "14px", fontWeight: "600" }}
              >
                Don't have an account?{" "}
                <Link
                  to="/auth/signup"
                  className="text-primary-blue font-weight-bold"
                >
                  Sign Up
                </Link>
              </p>

              {/* Secure Information Flag */}
              <div className="text-center text-muted small d-flex align-items-center justify-content-center">
                <span className="mr-1" role="img" aria-label="shield">
                  <MdSecurity size={20} color="#94a3b8" />
                </span>{" "}
                Your information is safe and secure with us.
              </div>
            </Form>
          </CardBody>
        </Card>
      ) : (
        <div
          style={{border: "", backgroundColor: "white",borderRadius: "12px", padding: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", }} >
          <div className="text-center w-100 py-4 px-4" style={{ backgroundColor: "#F4F7FD", borderRadius: "12px" }} >
            {/* Main Card Headings */}
            <div className="text-center mb-2">
              <h1 className="font-weight-bold mb-2"
                style={{color: "#000000", fontSize: "32px", letterSpacing: "-0.5px", }}>
                Verify Your OTP!
              </h1>
              <p className="mb-0" style={{fontSize: "15px", color: "#1a1a1a", fontWeight: "500", }} >
                Sign in to continue to{" "}
                <a href="#omr" className="font-weight-bold" style={{ color: "#2f62ff", textDecoration: "none" }} >
                  Image-based OMR
                </a>
              </p>
            </div>

            {/* Dynamic Notification Subtext */}
            <div className="text-center mt-4 mb-4">
              <p className="mb-0" style={{fontSize: "18px", color: "#1e266d", fontWeight: "600", lineHeight: "1.4", }} >
                Enter the 6-digit code sent to <br />
                <span style={{ color: "#1e266d" }}>{otpEmail}</span>
              </p>
            </div>

            {/* 6-Digit Code Inputs Section */}
            <div className="d-flex justify-content-center align-items-center mb-4">
              {otpValue.map((data, index) => (
                <React.Fragment key={index}>
                  <input
                    type="text"
                    maxLength="1"
                    className="text-center form-control bg-white mx-1"
                    placeholder="0"
                    style={{width: "46px", height: "46px", borderRadius: "10px", border: "1px solid #e1e7f5", fontSize: "15px", fontWeight: "500", color: "#4a546e", boxShadow: "none",padding: "0"}}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
                      setOtpValue(prev => prev.map((val, i) => pasted[i] || val));
                      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
                    }}/>

                  {index === 2 && (
                    <span
                      className="mx-3"
                      style={{ width: "18px", height: "2px", backgroundColor: "#b0bac9", display: "inline-block",}}/>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Resend Context Section */}
            <div className="text-center mb-4">
              <p className="mb-0" style={{fontSize: "15px", color: "#1a1a1a", fontWeight: "500", }}>
                Don’t receive code?{" "}
                <span onClick={(e) => canResend && sendOtp(e)} className={`font-weight-bold ${!canResend && "text-muted cursor-not-allowed"}`} style={{color: !canResend ? "#" : "#2f62ff",textDecoration: "none",cursor: "pointer",}}>
                  Resent OTP
                </span>{" "}
                <span style={{ color: "#4a546e" }}>
                  {timer > 0
                    ? `in 00:${timer.toString().padStart(2, "0")}`
                    : ""}
                </span>
              </p>
            </div>

            <button onClick={(e) => handleVerifyOtp(e)} type="submit" className="btn btn-block font-weight-bold text-white shadow-sm" style={{background: "linear-gradient(270deg, #3969FE, #1047D5)", color: "white", fontSize: "15px", height: "48px", borderRadius: "10px", border: "none",}} >
              {isOtpLoading ? "Verify & Sign In" : "Verifying..."}
            </button>

            <div className="text-center text-muted small d-flex align-items-center justify-content-center mt-4">
              <span className="mr-1" role="img" aria-label="shield">
                <MdSecurity size={20} color="#94a3b8" />
              </span>{" "}
              Your information is safe and secure with us.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
