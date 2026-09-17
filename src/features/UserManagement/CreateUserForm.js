import React, { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateUserbyId } from 'redux/reducers/UserManagementSlice';
import { createNewUser } from 'redux/reducers/UserManagementSlice';

const CreateUserForm = ({ setCreateModal, createModal, userId }) => {

    const dispatch = useDispatch();
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const referenceId = userData?.referenceId || "";

    const allUsers = useSelector((state) => state.UserData?.allUsers)
    const findUserById = allUsers.find((user) => user.empId === userId)


    useEffect(() => {
        if (findUserById) {
            setForm({
                name: findUserById.empName,
                email: findUserById.empEmail,
                pwd: findUserById.password,
                role: findUserById.role,
                cont: findUserById.contact,
                cnfpwd: findUserById.password,
                EmpId: findUserById.empId,
                referenceId: findUserById.refranceId
            })
        }
    }, [findUserById, referenceId])


    // Form States
    const [form, setForm] = useState({
        name: '',
        email: '',
        pwd: '',
        role: '',
        cont: '',
        cnfpwd: '',
        EmpId: '',
        referenceId: referenceId
    })

    const handleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;

        if (name === "cont") {
            if (!/^\d*$/.test(value) || value.length > 10) return;
        }
        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.pwd || !form.role || !form.cont) {
            toast.warning("Please fill all the fields");
            return;
        }

        if (!form.referenceId) {
            toast.warning("Please provide a reference ID");
            return;
        }

        if (form.cnfpwd !== form.pwd) {
            toast.warning("Passwords do not match");
            return;
        }

        if (userId) {
            dispatch(updateUserbyId(form));
        } else {
            dispatch(createNewUser(form));
        }
        setCreateModal(false);
    }


    const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };
    const cardStyle = { fontFamily: "outfit", maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px 28px', };
    const titleStyle = { color: '#0f172a', fontSize: '20px', fontWeight: '600', marginBottom: '5px' };
    const subtitleStyle = { color: '#64748b', fontSize: '14px', marginBottom: '28px' };
    const closeBtnStyle = { color: '#ef4444', background: 'none', border: 'none', fontSize: '20px', lineHeight: '1', cursor: 'pointer', padding: "6px 6px", borderRadius: "5px", marginTop: '-4px' };
    const labelStyle = { color: '#334155', fontSize: '14px', fontWeight: '500', marginBottom: '4px' };
    const inputStyle = { borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: '14px', color: '#334155', height: 'auto', boxShadow: 'none' };
    const readOnlyStyle = { ...inputStyle, backgroundColor: '#f8fafc', color: '#94a3b8' };
    const cancelBtnStyle = { backgroundColor: '#f8fafc', color: '#475569', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' };
    const submitBtnStyle = { background: "linear-gradient(to left, #3969FE, #1047D5)", color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' };
    const selectBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 16px center/16px`;

    return (
        <div style={overlayStyle}>
            <div style={cardStyle} className="w-100 shadow-sm">

                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h2 style={titleStyle}>{userId ? "Update User" : "Create User"}</h2>
                        <p style={subtitleStyle}>Create a new operator or moderator account.</p>
                    </div>
                    <button style={closeBtnStyle}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#FFE3E3"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                        aria-label="Close" onClick={() => setCreateModal(false)}>
                        <RxCross2 />
                    </button>
                </div>

                <form>
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            onChange={(e) => handleChange(e)}
                            name="name"
                            value={form.name}
                            style={inputStyle}
                            placeholder="Enter full name" />
                    </div>

                    {/* Email */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Email <span className="text-danger">*</span>
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            onChange={(e) => handleChange(e)}
                            name="email"
                            value={form.email}
                            style={inputStyle}
                            placeholder="Enter email address"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                            type="tel"
                            maxLength={10}
                            className="form-control"
                            onChange={(e) => handleChange(e)}
                            name="cont"
                            value={form.cont}
                            style={inputStyle}
                            placeholder="Enter 10 digit mobile number"
                        />
                    </div>

                    {/* Role */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Role <span className="text-danger">*</span>
                        </label>
                        <select
                            className="form-control"
                            style={{ ...inputStyle, appearance: 'none', background: selectBg }}
                            defaultValue=""
                            onChange={(e) => handleChange(e)}
                            name="role"
                            value={form.role}>
                            <option value="" disabled hidden>Select Role</option>
                            <option value="operator">Operator</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>

                    {/* Reference Code */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>Reference Code</label>
                        <input
                            type="text"
                            className="form-control"
                            style={readOnlyStyle}
                            value={form.referenceId}
                            placeholder="Auto-generated"
                            readOnly
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            onChange={(e) => handleChange(e)}
                            name="pwd"
                            value={form.pwd}
                            style={inputStyle}
                            placeholder="Enter password" />
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group mb-4">
                        <label style={labelStyle}>Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            onChange={(e) => handleChange(e)}
                            name="cnfpwd"
                            value={form.cnfpwd}
                            style={inputStyle}
                            placeholder="Enter confirm password"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end" style={{ gap: '12px' }}>
                        <button
                            type="button"
                            style={cancelBtnStyle}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#E1E5FA'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
                            onClick={() => setCreateModal(false)}>
                            Cancel
                        </button>
                        <button type="submit"
                            onClick={(e) => handleSubmit(e)}
                            style={submitBtnStyle}>
                            {findUserById ? "Update user" : "Create User"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default CreateUserForm;