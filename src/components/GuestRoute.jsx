import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const GuestRoute = function ({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/portfolio" replace />;
  }

  return children;
};

export default GuestRoute;
