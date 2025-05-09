import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: () => {
    const localUser = localStorage.getItem("authUser");
    if (localUser) {
      set({ authUser: JSON.parse(localUser), isCheckingAuth: false });
    } else {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/signup", data);
      console.log("res in signup:", res.data);

      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error in signup:", error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/login", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error in login:", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      set({ authUser: null });
      localStorage.removeItem("authUser");
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("error in logout:", error);
      toast.error("An error occurred while logging out");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      let res = await axiosInstance.put("/user/info", data);
      if (data.profilePic) {
        const formData = new FormData();
        formData.append("profilePic", data.profilePic);
        res = await axiosInstance.put("/user/avatar", formData);
      }
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data));

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("error in updateProfile:", error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
