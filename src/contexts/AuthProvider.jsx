import { useState } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = function ({ children }) {
  const [token, setToken] = useState(localStorage.getItem("projectvault_token"));
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("projectvault_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = function (newToken, userData) {
    localStorage.setItem("projectvault_token", newToken);
    localStorage.setItem("projectvault_user", JSON.stringify(userData));

    setToken(newToken);
    setCurrentUser(userData);
  };

  const logout = function () {
    localStorage.removeItem("projectvault_token");
    localStorage.removeItem("projectvault_user");

    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
