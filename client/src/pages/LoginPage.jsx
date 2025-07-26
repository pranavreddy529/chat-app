import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const data =
      currState === "Sign up"
        ? { fullName, email, password, bio }
        : { email, password };

    const success = await login(currState, data); // <-- Pass currState directly
    if (success) navigate("/");
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo_big} alt="Logo" className="w-[min(30vw,250px)]" />

      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl">{currState}</h2>

        {currState === "Sign up" && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="p-2 border border-gray-500 rounded-md"
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              rows={3}
              className="p-2 border border-gray-500 rounded-md"
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border border-gray-500 rounded-md"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border border-gray-500 rounded-md"
        />

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md"
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className="text-sm text-gray-300 text-center">
          {currState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setCurrState("Login")}
                className="text-violet-400 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don’t have an account?{" "}
              <span
                onClick={() => setCurrState("Sign up")}
                className="text-violet-400 cursor-pointer"
              >
                Create one
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
