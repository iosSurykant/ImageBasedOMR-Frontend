import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useScan } from "context/ScanningContext";
import { logout } from "helper/userManagment_helper";

const LOGIN_PATH = "/auth/login";

/** One logout flow for both sidebars (scan guard, confirm, redirect). */
export const useLogout = () => {
  const { isScanning } = useScan();
  const navigate = useNavigate();

  return useCallback(async () => {
    if (isScanning) {
      toast.warning("Cannot logout while scanning is in progress.");
      return;
    }
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      const res = await logout();
      if (res?.state) {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate(LOGIN_PATH);
      } else {
        toast.error(res?.message || "Logout failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    }
  }, [isScanning, navigate]);
};