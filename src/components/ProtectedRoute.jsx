import { usePrivy } from "@privy-io/react-auth";
import { Navigate } from "react-router-dom";
import { useStateContext } from "../context";

const ProtectedRoute = ({ children }) => {
  const { authenticated, ready } = usePrivy();
  const { currentUser } = useStateContext();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#13131a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute; 