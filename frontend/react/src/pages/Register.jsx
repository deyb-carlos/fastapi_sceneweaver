import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = [];
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.username.trim()) {
      newErrors.push("Username is required.");
    } else if (formData.username.length < 3) {
      newErrors.push("Username must be at least 3 characters long.");
    }

    if (!formData.email.trim()) {
      newErrors.push("Email is required.");
    } else if (!emailPattern.test(formData.email)) {
      newErrors.push("Invalid email format.");
    }

    if (!formData.password) {
      newErrors.push("Password is required.");
    } else if (formData.password.length < 8) {
      newErrors.push("Password must be at least 8 characters long.");
    }

    if (!formData.confirmPassword) {
      newErrors.push("Confirm Password is required.");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match.");
    }

    if (!isChecked) {
      newErrors.push("Privacy policy is unchecked.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        if (response.status === 400) {
          if (responseData.detail === "Username already registered") {
            setErrors((prev) => [
              ...prev,
              "Username is already taken. Please choose another.",
            ]);
          } else if (responseData.detail === "Email already exists") {
            setErrors((prev) => [
              ...prev,
              "Email is already registered. Please use another email.",
            ]);
          } else if (Array.isArray(responseData.detail)) {
            // Handle multiple validation errors from backend
            setErrors(responseData.detail.map((err) => err.msg || err));
          } else {
            // Handle other error messages
            setErrors((prev) => [
              ...prev,
              responseData.detail || "Registration failed",
            ]);
          }
        } else {
          setErrors((prev) => [
            ...prev,
            "Registration failed. Please try again later.",
          ]);
        }
      }
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        "Network error. Please check your connection and try again.",
      ]);
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
              value={formData.username}
              onChange={handleChange}
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
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
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
              value={formData.confirmPassword}
              onChange={handleChange}
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

          <div className="relative w-full ml-3">
            <input
              type="checkbox"
              onChange={(e) => setIsChecked(e.target.checked)}
              id="terms"
              className="mr-2"
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              By signing up, you agree to our{" "}
              <a href="">
                <u>Privacy policy</u>
              </a>
            </label>
          </div>

          <div className="w-full flex flex-col items-center ">
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
