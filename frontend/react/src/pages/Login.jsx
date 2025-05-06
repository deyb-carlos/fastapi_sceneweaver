import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("username", username);
    formDetails.append("password", password);

    try {
      const response = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDetails,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        navigate("/home");
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setLoading(false);
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-white text-black">
      <title>Login</title>
      <div className="bg-white border-2 border-black shadow-md w-full max-w-md p-8 rounded-lg">
        <div className="flex flex-col items-center pb-6">
          <img
            src="/sw-logo.png"
            alt="Sceneweaver Logo"
            className="w-28 mb-4"
          />
          <h2 className="text-2xl font-bold text-center">Sign in</h2>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-white border border-gray-300 text-gray-800 placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-black transition-colors"
            />
            <label
              htmlFor="username"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-white text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-sm peer-focus:text-black peer-focus:bg-white"
            >
              Username
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-white border border-gray-300 text-gray-800 placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-black transition-colors"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-white text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:text-sm peer-focus:text-black peer-focus:bg-white"
            >
              Password
            </label>
          </div>

          <div className="flex justify-between items-center text-sm">
            <a href="/forgot-password" className="text-black hover:underline">
              <u>
                <b>Forgot Password?</b>
              </u>
            </a>
          </div>
          {error && (
            <div className="text-red-600 p-0  rounded text-left">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-semibold py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            {loading ? "Logging in" : "Login"}
          </button>

          <p className="text-center text-sm">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-black font-medium hover:underline"
            >
              <u>
                <b>Sign Up</b>
              </u>
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
