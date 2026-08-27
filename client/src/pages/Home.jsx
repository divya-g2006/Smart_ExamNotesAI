
import React from 'react'
import Navbar from '../components/Navbar'
import { motion } from "motion/react"
import img from "../assets/img1.png"
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

function Home() {
  void motion;
  const navigate = useNavigate()
  return (
    <div className='min-h-screen overflow-hidden bg-white text-blue-900'>
      <Navbar />

      {/* top section */}
      <section className='max-w-7xl mx-auto px-8 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
        <div>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-5xl lg:text-6xl font-extrabold leading-tight text-blue-900"
              whileHover={{ y: -4 }}
            >
              Create Smart <br /> AI Notes in Seconds
            </motion.h1>

            <motion.p
              whileHover={{ y: -2 }}
              className='mt-6 max-w-xl text-lg text-gray-700'
            >
              Generate exam-focused notes, project documentation,
              flow diagrams and revision-ready content using AI —
              faster, cleaner and smarter.
            </motion.p>
          </motion.div>

          {/* Dark Blue Button */}
          <motion.button
            onClick={() => navigate("/notes")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className='mt-10 px-10 py-3 rounded-xl bg-blue-900 text-white font-semibold text-lg'
          >
            Get Started
          </motion.button>
        </div>

        {/* Right image */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img src={img} alt="AI Notes Illustration" className='w-full' />
        </motion.div>
      </section>

      {/* bottom section: features */}
      <section className='max-w-6xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-4 gap-10'>
        <Feature icon="📘" title="Exam Notes" des="High-yield exam-oriented notes with revision points." />
        <Feature icon="📂" title="Project Notes" des="Well-structured content for assignments and projects." />
        <Feature icon="📊" title="Diagrams" des="Auto-generated visual diagrams for clarity." />
        <Feature icon="⬇️" title="PDF Download" des="Download clean, printable PDFs instantly." />
      </section>

      <Footer />
    </div>
  )
}

function Feature({ icon, title, des }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className='rounded-2xl p-6 bg-blue-900 text-white'
    >
      <div>
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{des}</p>
      </div>
    </motion.div>
  )
}

export default Home



// import React from 'react'
// import Navbar from '../components/Navbar'
// import { motion } from "motion/react"
// import img from "../assets/img1.png"
// import Footer from '../components/Footer'
// import { useNavigate } from 'react-router-dom'

// function Home() {
//   const navigate = useNavigate()
//   return (
//     <div className='min-h-screen overflow-hidden bg-white text-blue-900'>
//       <Navbar />

//       {/* top section */}
//       <section className='max-w-7xl mx-auto px-8 pt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center bg-blue-900 text-white rounded-b-3xl'>
//         <div>
//           <motion.div
//             initial={{ opacity: 0, x: -60 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7 }}
//           >
//             <motion.h1
//               className="text-5xl lg:text-6xl font-extrabold leading-tight"
//               whileHover={{ y: -4 }}
//             >
//               Create Smart <br /> AI Notes in Seconds
//             </motion.h1>

//             <motion.p
//               whileHover={{ y: -2 }}
//               className='mt-6 max-w-xl text-lg text-gray-200'
//             >
//               Generate exam-focused notes, project documentation,
//               flow diagrams and revision-ready content using AI —
//               faster, cleaner and smarter.
//             </motion.p>
//           </motion.div>

//           {/* Dark Blue Button */}
//           <motion.button
//             onClick={() => navigate("/notes")}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.97 }}
//             className='mt-10 px-10 py-3 rounded-xl bg-white text-blue-900 font-semibold text-lg'
//           >
//             Get Started
//           </motion.button>
//         </div>

//         {/* Right image */}
//         <motion.div
//           initial={{ opacity: 0, x: 60 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.7 }}
//         >
//           <img src={img} alt="AI Notes Illustration" className='w-full' />
//         </motion.div>
//       </section>

//       {/* bottom section: features */}
//       <section className='max-w-6xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-4 gap-10'>
//         <Feature icon="📘" title="Exam Notes" des="High-yield exam-oriented notes with revision points." />
//         <Feature icon="📂" title="Project Notes" des="Well-structured content for assignments and projects." />
//         <Feature icon="📊" title="Diagrams" des="Auto-generated visual diagrams for clarity." />
//         <Feature icon="⬇️" title="PDF Download" des="Download clean, printable PDFs instantly." />
//       </section>

//       <Footer />
//     </div>
//   )
// }

// function Feature({ icon, title, des }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       transition={{ type: "spring", stiffness: 200, damping: 18 }}
//       className='rounded-2xl p-6 bg-blue-900 text-white'
//     >
//       <div>
//         <div className="text-4xl mb-3">{icon}</div>
//         <h3 className="text-lg font-semibold mb-2">{title}</h3>
//         <p className="text-gray-300 text-sm leading-relaxed">{des}</p>
//       </div>
//     </motion.div>
//   )
// }

// export default Home
