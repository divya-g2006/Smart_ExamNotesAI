import React from 'react'
import { motion } from "motion/react"
import axios from "axios"
import { serverUrl } from '../config.js';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useState } from "react";

function Auth() {
  void motion;
  const dispatch = useDispatch()
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup" ? { name, email, password } : { email, password };
      const result = await axios.post(serverUrl + url, payload, { withCredentials: true });
      if (result?.data?.token) {
        localStorage.setItem("token", result.data.token);
      }
      dispatch(setUserData(result.data.user));
      setMessage("Success.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen overflow-hidden bg-black text-white px-8'>
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="max-w-7xl mx-auto mt-8 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/30 px-8 py-6"
      >
        <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent'>
          SmartNotes AI
        </h1>

        <p className='text-sm text-blue-300 mt-1'>
          AI-powered exam-oriented notes & revision
        </p>
      </motion.header>

      <main className='max-w-7xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className='text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 bg-clip-text text-transparent'>
            Smart <br /> AI Notes
          </h1>

          <div className="mt-8 rounded-2xl bg-gray-900/60 border border-gray-700/30 p-5 max-w-xl">
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1.5 rounded-xl text-sm border ${mode === "login" ? "bg-blue-700/40 border-blue-500/40" : "bg-transparent border-gray-700/40"}`}
                onClick={() => setMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`px-3 py-1.5 rounded-xl text-sm border ${mode === "signup" ? "bg-blue-700/40 border-blue-500/40" : "bg-transparent border-gray-700/40"}`}
                onClick={() => setMode("signup")}
                type="button"
              >
                Signup
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleManualAuth}>
              {mode === "signup" ? (
                <div>
                  <label className="block text-sm text-blue-200 mb-1">Name</label>
                  <input
                    className="w-full rounded-xl bg-black/40 border border-gray-700/40 px-3 py-2 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-sm text-blue-200 mb-1">Email</label>
                <input
                  className="w-full rounded-xl bg-black/40 border border-gray-700/40 px-3 py-2 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-blue-200 mb-1">Password</label>
                <input
                  className="w-full rounded-xl bg-black/40 border border-gray-700/40 px-3 py-2 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                className="w-full rounded-xl bg-blue-700 hover:bg-blue-600 transition px-3 py-2 font-semibold disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Login"}
              </button>
            </form>

            {message ? (
              <div className="mt-3 text-sm text-amber-200 bg-amber-950/30 border border-amber-900/40 rounded-xl p-3">
                {message}
              </div>
            ) : null}
          </div>

          <p className='mt-6 max-w-xl text-lg bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 bg-clip-text text-transparent'>
            Generate exam notes, project notes, charts, graphs and clean PDFs instantly using AI.
          </p>

          <p className='mt-4 text-sm text-blue-400'>
            Fast signup • Instant access • Start generating right away
          </p>
        </motion.div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
          <Feature icon="🎁" title="Instant Access" des="Start generating notes immediately after login." />
          <Feature icon="📘" title="Exam Notes" des="High-yield, revision-ready exam-oriented notes." />
          <Feature icon="📂" title="Project Notes" des="Well-structured documentation for assignments & projects." />
          <Feature icon="📊" title="Charts & Graphs" des="Auto-generated diagrams, charts and flow graphs." />
          <Feature icon="⬇️" title="Free PDF Download" des="Download clean, printable PDFs instantly." />
        </div>
      </main>
    </div>
  )
}

function Feature({ icon, title, des }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className='relative rounded-2xl p-6 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 backdrop-blur-2xl border border-gray-700/30 text-white'
    >
      <div className='relative z-10'>
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-blue-300 text-sm leading-relaxed">{des}</p>
      </div>
    </motion.div>
  )
}

export default Auth
