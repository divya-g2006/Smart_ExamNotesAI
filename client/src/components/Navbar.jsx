import React, { useState } from 'react'
import logo from "../assets/logo.png"
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../config.js'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const [showProfile, setShowProfile] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSignOut = async () => {
        try {
            await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            navigate("/auth")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='relative z-20 mx-6 mt-6 rounded-2xl bg-blue-900 border border-white/10 flex items-center justify-between px-8 py-4'>
            <div className='flex items-center gap-3'>
                <img src={logo} alt="smartnotes" className='w-9 h-9' />
                <span className='text-lg hidden md:block font-semibold text-white'>
                    SmartNotes <span className='text-gray-300'>AI</span>
                </span>
            </div>

            <div className='flex items-center gap-6 relative'>
                <div className='relative'>
                    <div
                        onClick={() => setShowProfile(!showProfile)}
                        className='flex items-center justify-center gap-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm shadow-md cursor-pointer'
                    >
                        <span className='text-lg'>{userData?.name?.slice(0, 1)?.toUpperCase() || "U"}</span>
                    </div>

                    {showProfile &&
                        <div className='absolute right-0 mt-4 w-52 rounded-2xl bg-blue-900 border border-white/10 p-4 text-white'>
                            <MenuItem text="History" onClick={() => { setShowProfile(false); navigate("/history") }} />
                            <div className="h-px bg-white/10 mx-3" />
                            <MenuItem text="Sign Out" red onClick={handleSignOut} />
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

function MenuItem({ onClick, text, red }) {
    return (
        <div
            onClick={onClick}
            className={`
            w-full text-left px-5 py-3 text-sm transition-colors rounded-lg
            ${red ? "text-red-400 hover:bg-red-500/10" : "text-gray-200 hover:bg-white/10"}
          `}
        >
            {text}
        </div>
    )
}

export default Navbar
