import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {

    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formDetails = new URLSearchParams();
        formDetails.append("username", username);

        try {
            const response = await fetch("http://localhost:8000/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formDetails,
            });

            if (response.ok) {
                alert("Password reset link sent to your email.");
            } else {
                alert("Failed to send password reset link. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please try again later.");
        }
    }

    


    return (
      <div className="bg-black flex flex-col min-h-screen items-center justify-center text-white">
        <title>Forgot Password</title>
        <div className="bg-black/90 w-full max-w-md flex flex-col items-center justify-center p-6 md:p-8 rounded-[10px]">
          <div className="w-full flex flex-col items-center justify-center pb-8">
            <h1 className="pb-3">
              <img
                src="/sw-logo.png"
                alt="Sceneweaver Logo"
                className="w-32 md:w-40"
                draggable="false"
              />
            </h1>
            <h2
              className="text-2xl md:text-3xl font-bold text-white mt-2 text-center"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              Forgot your password?
            </h2>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-sm">
              Enter your username and we will send you a link to your registered email to reset your password.
            </p>
          </div>
  
          <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="relative w-full">
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                placeholder=" "
                className="peer w-full bg-transparent border border-gray-500 text-white placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-white transition-colors"
              />
              <label
                htmlFor="username"
                className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
              >
                Username
              </label>
            </div>
  
            <div className="w-full flex flex-col items-center">
              <button
                type="submit"
                className="w-full bg-white text-black border-2 border-black py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors"
              >
                Send Reset Link
              </button>
  
              <p className="mt-4 text-white text-sm">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="text-redOrange underline hover:text-redOrange-dark"
                >
                  <b>Login</b>
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  export default ForgotPassword;
  