
import { verifyOtp } from 'helper/userManagment_helper';
import { createUserWithOtp } from 'helper/userManagment_helper';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FiUser, FiMail, FiShield, FiPhone } from 'react-icons/fi'; // Accurate outline-style icons
import { MdSecurity } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignUpCard = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [modalOpen, setModalOpen] = useState(true);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate()
  const [activeField, setActiveField] = useState(null);
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


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.fullName || !formData.phone) {
      toast.warn("Fill all the fields")
      return;
    }
    const payload = {
      email: formData.email,
      phone: formData.phone,
      fullName: formData.fullName
    }
    try {
      setIsLoading(true)

      const res = await createUserWithOtp(payload)

      if (res.state === true) {
        toast.success(res.message)
        setTimer(60)
        setModalOpen(false)
      } else {
        toast.error(res.message)
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();


    if (otpValue.some((val) => val === "")) {
      toast.warn("Enter OTP")
      return
    }

    const otpCode = otpValue.join("");

    try {
      setIsLoading(true)
      const res = await verifyOtp({ email: formData.email, otp: otpCode })

      console.log(res)

      if (res.state === true) {
        console.log(res)
        localStorage.setItem("token", res.token)
        const decoded = jwtDecode(res.token);

        console.log("decode", decoded)

        const role = decoded.role;
        const empid = decoded.nameid;
        const phone = decoded.Phone;
        const userName = decoded.unique_name;
        const userEmail = decoded.email;
        const referenceId = decoded.refranceId;

        localStorage.setItem(
          "userData",
          JSON.stringify({
            role,
            empid,
            phone,
            email: userEmail,
            userName,
            referenceId,
          }),
        );
        toast.success(res.message)
        navigate("/app/index")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  };


  return (
    <>
      {modalOpen ?

        <div
          className="card border-0 shadow-sm p-2 "
          style={{
            width: '100%',
            maxWidth: '520px',
            borderRadius: '15px',
            backgroundColor: 'white',
          }}
        >
          <div style={{ backgroundColor: "#F4F7FD", borderRadius: "12px", padding: "20px" }}>
            <div className="text-center">
              <h1
                style={{ color: '#000000', fontSize: '28px', letterSpacing: '-0.5px', fontWeight: "600" }}
              >
                Create Your Account
              </h1>
              <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '500' }}>
                Sign up to continue to{' '}
                <a href="#omr" style={{ color: '#2f62ff', textDecoration: 'none' }}>
                  Image-based OMR
                </a>
              </p>
            </div>

            {/* Form Title */}
            <div className="mt-3 mb-3">
              <h5 style={{ color: '#1e266d', fontSize: '18px', fontWeight: "600" }}>
                Sign Up with OTP
              </h5>
            </div>

            {/* Inputs & Form Wrapper */}
            <form onSubmit={handleSendOtp}>

              {/* Full Name */}
              <div className="form-group mb-3">
                <label className="font-weight-bold mb-1" style={{ fontSize: '13px', color: '#1a1a1a' }}>
                  Full Name <span className="text-danger">*</span>
                </label>
                <div
                  className="input-group"
                  style={{
                    boxShadow: activeField === 'fullName' ? '0 0 0 3px rgba(47, 98, 255, 0.15)' : 'none',
                    borderRadius: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="input-group-prepend">
                    <span
                      className="input-group-text bg-white pr-2 pl-3"
                      style={{
                        borderTopLeftRadius: '10px',
                        borderBottomLeftRadius: '10px',
                        border: activeField === 'fullName' ? '1px solid #2f62ff' : '1px solid #e1e7f5',
                        borderRight: 'none',
                        color: activeField === 'fullName' ? '#2f62ff' : '#b0bac9',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FiUser size={18} />
                    </span>
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control pl-2"
                    placeholder="Enter your full name"
                    style={{
                      borderTopRightRadius: '10px',
                      borderBottomRightRadius: '10px',
                      border: activeField === 'fullName' ? '1px solid #2f62ff' : '1px solid #e1e7f5',
                      borderLeft: 'none',
                      height: '45px',
                      fontSize: '14px',
                      color: '#4a546e',
                      boxShadow: 'none',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    value={formData.fullName}
                    onChange={handleChange}
                    onFocus={() => setActiveField('fullName')}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                </div>
              </div>


              {/* Email Address */}
              <div className="form-group mb-3">
                <label className="font-weight-bold mb-1" style={{ fontSize: '13px', color: '#1a1a1a' }}>
                  Email Address <span className="text-danger">*</span>
                </label>
                <div
                  className="input-group"
                  style={{
                    boxShadow: activeField === 'email' ? '0 0 0 3px rgba(47, 98, 255, 0.15)' : 'none',
                    borderRadius: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="input-group-prepend">
                    <span
                      className="input-group-text bg-white pr-2 pl-3"
                      style={{
                        borderTopLeftRadius: '10px',
                        borderBottomLeftRadius: '10px',
                        border: activeField === 'email' ? '1px solid #2f62ff' : '1px solid #e1e7f5',
                        borderRight: 'none',
                        color: activeField === 'email' ? '#2f62ff' : '#b0bac9',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FiMail size={18} />
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    className="form-control pl-2"
                    placeholder="Enter your email address"
                    style={{
                      borderTopRightRadius: '10px',
                      borderBottomRightRadius: '10px',
                      border: activeField === 'email' ? '1px solid #2f62ff' : '1px solid #e1e7f5',
                      borderLeft: 'none',
                      height: '45px',
                      fontSize: '14px',
                      color: '#4a546e',
                      boxShadow: 'none',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group mb-3">
                <label className="font-weight-bold mb-2" style={{ fontSize: '13px', color: '#1a1a1a' }}>
                  Phone <span className="text-danger">*</span>
                </label>
                <div
                  className="input-group"
                  style={{
                    boxShadow: activeField === 'phone' ? '0 0 0 3px rgba(47, 98, 255, 0.15)' : 'none',
                    borderRadius: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div className="input-group-prepend">
                    <span
                      className="input-group-text bg-white pr-2 pl-3"
                      style={{
                        borderTopLeftRadius: '10px',
                        borderBottomLeftRadius: '10px',
                        border: activeField === 'phone' ? '1px solid #2f62ff' : '1px solid #e1e7f5',
                        borderRight: 'none',
                        color: activeField === 'phone' ? '#2f62ff' : '#b0bac9',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FiPhone size={18} />
                    </span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control pl-2"
                    placeholder="Enter your phone number"
                    style={{
                      borderTopRightRadius: '10px',
                      borderBottomRightRadius: '10px',
                      border: activeField === 'phone' ? '1px solid #2f62ff' : '1px solid #e1e7f5',
                      borderLeft: 'none',
                      height: '45px',
                      fontSize: '14px',
                      color: '#4a546e',
                      boxShadow: 'none',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setActiveField('phone')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                onClick={handleSendOtp}
                className="btn btn-block font-weight-bold text-white shadow-sm"
                style={{ background: "linear-gradient(270deg, #3969FE, #1047D5)", color: "white", fontSize: "15px", height: '48px', borderRadius: '10px', border: 'none' }}
              >
                Send OTP
              </button>
            </form>

            {/* Divider / OR */}
            <div className="d-flex align-items-center my-4">
              <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span className="mx-3 font-weight-bold" style={{ color: '#718096', fontSize: '13px' }}>OR</span>
              <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="btn btn-block text-dark shadow-sm d-flex align-items-center justify-content-center font-weight-bold"
              style={{
                height: '54px',
                borderRadius: '10px',
                border: '1px solid #e1e7f5',
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                fontSize: '15px'
              }}
            >
              <FcGoogle
                style={{ width: '25px', height: '25px', marginRight: '12px' }}
              />
              Continue with Google
            </button>

            {/* Footer Login prompt */}
            <div className="text-center mt-4 mb-4">
              <p className="mb-0" style={{ fontSize: '15px', color: '#656565', fontWeight: '500' }}>
                If you have an account.{' '}
                <span onClick={() => navigate(-1)} className="font-weight-bold" style={{ color: '#2f62ff', textDecoration: 'none', cursor: "pointer" }}>
                  Login
                </span>
              </p>
            </div>

            {/* Security Badge */}
            <div
              className="text-center d-flex align-items-center justify-content-center"
              style={{ color: '#707070', fontSize: '13px', fontWeight: '400' }}
            >
              <FiShield className="mr-2" size={16} style={{ color: '#707070' }} />
              <span>Your information is safe and secure with us.</span>
            </div>
          </div>
        </div>

        :

        <div style={{ border: "", backgroundColor: "white", borderRadius: "12px", padding: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <div className="text-center w-100 py-4 px-4" style={{ backgroundColor: "#F4F7FD", borderRadius: "12px" }}>
            {/* Main Card Headings */}
            <div className="text-center mb-2">
              <h1
                className="font-weight-bold mb-2"
                style={{ color: '#000000', fontSize: '32px', letterSpacing: '-0.5px' }}
              >
                Verify Your OTP!
              </h1>
              <p className="mb-0" style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '500' }}>
                Sign in to continue to{' '}
                <a href="#omr" className="font-weight-bold" style={{ color: '#2f62ff', textDecoration: 'none' }}>
                  Image-based OMR
                </a>
              </p>
            </div>

            {/* Dynamic Notification Subtext */}
            <div className="text-center mt-4 mb-4">
              <p className="mb-0" style={{ fontSize: '18px', color: '#1e266d', fontWeight: '600', lineHeight: '1.4' }}>
                Enter the 6-digit code sent to <br />
                <span style={{ color: '#1e266d' }}>a*****.com</span>
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
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "10px",
                      border: "1px solid #e1e7f5",
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#4a546e",
                      boxShadow: "none",
                      padding: "0",
                    }}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                  />

                  {index === 2 && (
                    <span
                      className="mx-3"
                      style={{
                        width: "18px",
                        height: "2px",
                        backgroundColor: "#b0bac9",
                        display: "inline-block",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Resend Context Section */}
            <div className="text-center mb-4">
              <p className="mb-0" style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '500' }}>
                Don’t receive code?{' '}
                <span onClick={(e) => canResend && handleSendOtp(e)} className={`font-weight-bold ${!canResend && "text-muted cursor-not-allowed"}`} style={{ color: !canResend ? "#" : '#2f62ff', textDecoration: 'none' }}>
                  Resent OTP
                </span>{' '}
                <span style={{ color: '#4a546e' }}>
                  {timer > 0 ? `in 00:${timer.toString().padStart(2, '0')}` : ""}
                </span>
              </p>
            </div>

            <button
              onClick={(e) => handleVerifyOtp(e)}
              type="submit"
              className="btn btn-block font-weight-bold text-white shadow-sm"
              style={{ background: "linear-gradient(270deg, #3969FE, #1047D5)", color: "white", fontSize: "15px", height: '48px', borderRadius: '10px', border: 'none' }}
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <div className="text-center text-muted small d-flex align-items-center justify-content-center mt-4">
              <span className="mr-1" role="img" aria-label="shield"><MdSecurity size={20} color="#94a3b8" /></span> Your information is safe and secure with us.
            </div>

          </div>
        </div>
      }
    </>
  );
};

export default SignUpCard;