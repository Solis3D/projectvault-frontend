import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const useAuth = function () {
  return useContext(AuthContext);
};

export default useAuth;
