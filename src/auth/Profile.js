import { updateProfile } from 'helper/userManagment_helper';
import React, { useEffect, useRef, useState } from 'react';
import { FiUser, FiCamera, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';

import getBaseUrl from 'services/BackendApi';

const countryList = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' }
];

const EditProfile = () => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    stateProvince: "",
    zipCode: "",
    country: "",
    profilePicture: null
  });

  // Local Storage
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const baseUrl = getBaseUrl();

  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      setFormData({
        firstName: userData.userName || userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        dob: userData.dob || "",
        gender: userData.gender || "",
        address: userData.address || "",
        city: userData.city || "",
        stateProvince: userData.state || "",
        zipCode: userData.zip || "",
        country: userData.country || "",
        profileImage: `${baseUrl}wwwroot\\ProfilePicture\\${userData.empid}\\${userData.profileImage}`
      });
      if (userData.profileImage) {
        setImagePreview(`${baseUrl}wwwroot\\ProfilePicture\\${userData.empid}\\${userData.profileImage}`);
      }
    }
  }, []);

  const handleChange = (e) => {
    let { name, value, type } = e.target;

    if (name === 'phone') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    
    if (name === 'zipCode') {
      value = value.replace(/[^0-9]/g, '').slice(0, 6);
    }

    if (name === 'city') {
      value = value.replace(/[0-9]/g, ''); 
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (type === 'select-one') {
      e.target.blur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email || !formData.dob || !formData.gender) {
      toast.warning("Fill all the required fields");
      return;
    }

    try {
      const res = await updateProfile(formData);
      console.log(res);

      if (res.status === true) {
        const hadImage = !!userData.profileImage;
        const nowHasImage = !!imagePreview;
        const imageDeleted = hadImage && !nowHasImage;

        const updatedUserData = {
          ...userData,
          userName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.stateProvince,
          zip: formData.zipCode,
          country: formData.country,
          profileImage: imageDeleted ? null : (formData.profilePicture ? formData.profilePicture.name : userData.profileImage)
        };

        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        toast.success(res.message || "Profile updated successfully");

      } else {
        toast.error(res.message || "Failed to update profile");
      }

    } catch (error) {
      toast.error(error.message || "Error saving data");
      console.error("Profile update error:", error);
    }
  };

  const handleFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      profilePicture: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setIsHover(false);
  };

  // REUSEABLE Style
  const inputStyle = { padding: '1.35rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '1rem', outline: 'none', transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out' };
  const selectStyle = { height: '45px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569', cursor: 'pointer', fontSize: '1rem', outline: 'none', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', backgroundImage: 'none', transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out' };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#123EFF';
    e.target.style.boxShadow = '0 0 0 0.2rem rgba(239, 68, 68, 0.25)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#cbd5e1';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="container-fluid"
      style={{ backgroundColor: '#ffffff', fontFamily: 'Outfit, sans-serif', overflowY: "auto" }}>
      <div
        className="w-100"
        style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', height: 'fit-content' }}>
        
        {/* Header Section */}
        <div className="mb pb-2">
          <h2 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.75rem', margin: '0 0 0rem 0' }}>
            Edit Profile
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>
            Update your personal details and profile picture.
          </p>
        </div>

        <div className="row">
          {/* Profile Picture Upload Section (Left Column) */}
          <div className="col-12 col-md-4 col-lg-3 mb-md-0" style={{ alignSelf: 'flex-start' }}>
            <div
              className="d-flex flex-column align-items-center justify-content-center text-center p-4"
              style={{
                border: `2px dashed ${isDragging ? '#123EFF' : '#cbd5e1'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                backgroundColor: isDragging ? '#f0f7ff' : (isHover ? '#f8fafc' : '#ffffff'),
                transition: 'background-color 0.2s, border-color 0.2s'
              }}
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onMouseEnter={() => !isDragging && setIsHover(true)}
              onMouseLeave={() => !isDragging && setIsHover(false)}
            >
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg"
              />

              {imagePreview ? (
                <>
                  <div className="position-relative mb-3" style={{ width: '120px', height: '120px' }}>
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage();
                      }}
                      aria-label="Remove picture"
                      className="d-flex align-items-center justify-content-center p-0 border-0"
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                    >
                      <FiTrash2 size={18} color="#475569" />
                    </button>
                  </div>
                  <span className='text-sm md-text-normal' style={{ fontWeight: '600', color: '#0f172a', fontSize: '1rem', marginBottom: '0.25rem' }}>
                    Profile Picture
                  </span>
                </>
              ) : (
                <>
                  <div className="position-relative mb-3" style={{ width: '120px', height: '120px' }}>
                    <div
                      className="d-flex align-items-center justify-content-center w-100 h-100"
                      style={{ backgroundColor: '#f8fafc', borderRadius: '50%' }}
                    >
                      <FiUser size={48} color="#94a3b8" strokeWidth={1.5} />
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '36px',
                        height: '36px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <FiCamera size={18} color="#475569" />
                    </div>
                  </div>
                  <style>
                    {`
                      .profile-upload-title {
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: #0f172a;
                        margin-bottom: 0.25rem;
                        line-height: 1rem;
                        transition: font-size 0.2s ease-in-out;
                      }

                      @media (min-width: 1024px) {
                        .profile-upload-title {
                          font-size: 0.81rem;
                          font-weight: 700;
                        }
                      }
                    `}
                  </style>
                  <span className="profile-upload-title">
                    Drag & drop or click to upload
                  </span>
                  <span className="profile-upload-title" style={{fontSize:"12px", fontWeight:"500", color:"#6E6E6E"}}>
                    Upload Up to 5 MB
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Form Section (Right Column) */}
          <div className="col-12 col-md-8 col-lg-9 px-md-4">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    First Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    placeholder="Enter first name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    placeholder="Enter last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control shadow-none"
                    placeholder="name@example.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control shadow-none"
                    placeholder="+1 (555) 000-0000"
                    name="phone"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Date Of Birth <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control shadow-none"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]} 
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Gender <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  <div className='position-relative'>
                    <select
                      className="form-control custom-select shadow-none"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      style={selectStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>

                    <FiChevronDown className="select-arrow" style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none'
                    }} size={20} color="#94a3b8" />
                  </div>
                </div>
              </div>

              <div className="form-group mb-3">
                <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  Address
                </label>
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="street address, apartment, suite, etc."
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div className="form-row">
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    placeholder="City name"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    State/Province
                  </label>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    placeholder="State/Province"
                    name="stateProvince"
                    value={formData.stateProvince}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Zip/Postal Code
                  </label>
                  <input
                    type="number"
                    className="form-control shadow-none"
                    placeholder="00000"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="form-group col-12 col-sm-6 mb-3">
                  <label style={{ color: '#334155', fontWeight: '500', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    Country
                  </label>

                  <style>
                    {`
                      .select-arrow {
                        transition: transform 0.2s ease-in-out;
                      }

                      .custom-select:focus + .select-arrow {
                        transform: translateY(-50%) rotate(180deg) !important;
                      }
                    `}
                  </style>

                  <div className='position-relative'>
                    <select
                      className="form-control custom-select shadow-none"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      style={selectStyle}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    >
                      <option value="" disabled>Select country</option>
                      {countryList.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>

                    <FiChevronDown
                      className="select-arrow"
                      size={20}
                      color="#94a3b8"
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex w-100 justify-content-end mt-2">
                <button
                  type="button"
                  className="btn mr-3"
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', padding: '0.65rem 2rem', borderRadius: '8px', border: 'none', fontSize: '1rem', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', padding: '0.65rem 2.5rem', borderRadius: '8px', border: 'none', fontSize: '1rem', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  Save <span className="d-none d-lg-inline">Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;