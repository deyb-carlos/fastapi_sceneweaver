import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "username":
        setUsername(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateForm = () => {
    const newErrors = [];

    if (!username) newErrors.push("Username is required.");
    if (!email) newErrors.push("Email is required.");
    if (!password) newErrors.push("Password is required.");
    if (!confirmPassword) newErrors.push("Confirm Password is required.");
    if (username.length < 3)
      newErrors.push("Username must be at least 3 characters long.");
    if (password.length < 8)
      newErrors.push("Password must be at least 8 characters long.");

    if (email && !emailPattern.test(email)) {
      newErrors.push("Invalid email format.");
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.push("Passwords do not match.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    const formDetails = {
      username,
      email,
      password,
    };

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDetails),
      });

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Registration failed. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black flex flex-col min-h-screen items-center justify-center text-white">
      <title>Register</title>
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
            Create your account
          </h2>
        </div>
        {success && (
          <div className="w-full bg-green-500/20 text-green-300 p-3 mb-4 rounded-md">
            {success}
          </div>
        )}

        {errors.length > 0 && (
          <div className="w-full bg-red-500/20 text-red-300 p-3 mb-4 rounded-md">
            <ul className="list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <input
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              required
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

          <div className="relative w-full">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-transparent border border-gray-500 text-white placeholder-transparent rounded-md px-3 pt-4 pb-2 focus:outline-none focus:border-white transition-colors"
            />
            <label
              htmlFor="email"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
            >
              Email
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-transparent border border-gray-500 text-white placeholder-transparent rounded-md px-3 pt-4 pb-1 focus:outline-none focus:border-white transition-colors"
            />
            <label
              htmlFor="password"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
            >
              Password
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              autoComplete="off"
              placeholder=" "
              className="peer w-full bg-transparent border border-gray-500 text-white placeholder-transparent rounded-md px-3 pt-4 pb-1 focus:outline-none focus:border-white transition-colors"
            />
            <label
              htmlFor="confirmPassword"
              className="absolute left-3 top-0 -translate-y-1/2 px-1 text-sm bg-black text-gray-500 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:text-sm peer-focus:text-white peer-focus:bg-black"
            >
              Confirm Password
            </label>
          </div>

          <div className="w-full flex flex-col items-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white text-black border-2 border-black py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </button>

            <p className="mt-4 text-white text-sm">
              Already have an account?{" "}
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

export default Register;
