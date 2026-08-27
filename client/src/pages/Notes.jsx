
import React, { useState } from 'react'
import { motion } from "motion/react"
import { useNavigate } from 'react-router-dom'
import TopicForm from '../components/TopicForm'
import Sidebar from '../components/Sidebar'
import FinalResult from '../components/FinalResult'

function Notes() {
  void motion;
  const navigate = useNavigate()
  const [loading,setLoading]= useState(false)
  const [result , setResult] = useState(null)
  const [error,setError] = useState("")

  return (
    <div className='min-h-screen bg-gray-100 px-6 py-8'>

      {/* Header Block */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 rounded-2xl bg-blue-900 px-8 py-6 flex md:items-center justify-between gap-4 flex-col md:flex-row shadow-lg"
      >
        <div onClick={() => navigate("/")} className='cursor-pointer'>
          <h1 className='text-2xl font-bold text-white'>SmartNotes AI</h1>
          <p className='text-sm text-gray-300 mt-1'>AI-powered exam-oriented notes & revision</p>
        </div>

        <div className='flex items-center gap-4 flex-wrap'>
          <button 
            onClick={()=>navigate("/history")} 
            className='px-4 py-3 rounded-full text-sm font-medium bg-blue-700 text-white flex items-center gap-2 hover:bg-blue-600 transition'
          >
            📚 Your Notes
          </button>
        </div>
      </motion.header>

      {/* Topic Form Section */}
      <motion.div className="mb-12">
        <TopicForm 
          loading={loading} 
          setResult={setResult} 
          setLoading={setLoading} 
          setError={setError} 
        />
      </motion.div>

      {/* Loading */}
      {loading && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-center text-gray-900 font-medium mb-6"
        >
          Generating exam-focused notes…
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 text-center text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Placeholder for result */}
      {!result && (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="h-64 rounded-2xl flex flex-col items-center justify-center bg-white border border-gray-300 text-gray-500 shadow"
        >
          <span className="text-4xl mb-3">📘</span>
          <p className="text-sm">Generated notes will appear here</p>
        </motion.div>
      )}

      {/* Result Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='flex flex-col lg:grid lg:grid-cols-4 gap-6 mt-6'
        >
          <div className='lg:col-span-1'>
            <Sidebar result={result}/>
          </div>

          <div className='lg:col-span-3 rounded-2xl bg-white p-6 shadow'>
            <FinalResult result={result}/>
          </div>
        </motion.div>
      )}

    </div>
  )
}

export default Notes
