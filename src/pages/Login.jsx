import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useStateContext } from "../context";

const Login = () => {
  const { login, authenticated, ready } = usePrivy();
  const { currentUser } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated && ready) {
      if (!currentUser) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    }
  }, [authenticated, ready, currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#13131a]">
      <div className="bg-white dark:bg-[#1a1a24] p-8 rounded-lg shadow-md w-96 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Welcome to Cancer Treatment Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Please login to access the application and get personalized cancer treatment assistance.
        </p>
        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login with Privy
        </button>
      </div>
    </div>
  );
};

export default Login; 