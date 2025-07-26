import axios from "axios";
import { useEffect, useState, createContext } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Set base URL from env
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error("Authentication failed");
      console.error(error);
    }
  };

  // Login or Signup
  const login = async (currState, credentials) => {
    const endpoint = currState === "Sign up" ? "signup" : "login";

    try {
      const { data } = await axios.post(`/api/auth/${endpoint}`, credentials);

      if (data.success) {
        setAuthUser(data.user); // <-- use data.user
        connectSocket(data.user);
        if (data.token) {
          axios.defaults.headers.common["token"] = data.token;
          setToken(data.token);
          localStorage.setItem("token", data.token);
        }
        toast.success(data.message || "Success");
        return true; // <-- indicate success
      } else {
        toast.error(data.message || "Login failed");
        return false;
      }
    } catch (error) {
      toast.error("Login error");
      console.error(error);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    socket?.disconnect();
    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  // Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    // Debug log to verify userData and userId
    console.log('connectSocket userData:', userData);
    console.log('connectSocket userId:', userData._id);

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  // Set auth header and check user on first load
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, [token]);

  // Shared context values
  const value = {
    axios,
    authUser,
    setAuthUser,
    onlineUsers,
    setOnlineUsers,
    socket,
    setSocket,
    token,
    setToken,
    checkAuth,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
