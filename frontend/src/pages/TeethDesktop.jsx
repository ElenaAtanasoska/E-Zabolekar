import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from "./Sidebar";
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import InteractiveTeeth from './InteractiveTeeth';

const TeethDesktop = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const firstName = localStorage.getItem("first_name") || "Доктор";
  const lastName = localStorage.getItem("last_name") || "";
  const formattedName = lastName ? `${lastName.charAt(0)}.` : "";

  const handleToothClick = (toothId) => {
    navigate(`/patient/${id}/chart/${toothId}`);
  };

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <nav className="h-20 px-8 flex items-center justify-between bg-white border-b border-gray-200 z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-full text-[#01506D]">
              <FaArrowLeft size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div onClick={() => navigate("/profile")} className="flex items-center gap-2 border-l pl-8 cursor-pointer">
              <span className="font-semibold text-gray-800">Д-р {firstName} {formattedName}</span>
              <FaUserCircle className="text-3xl text-gray-400" />
            </div>
          </div>
        </nav>
        <div className="flex-1 overflow-auto p-6 md:p-4 flex items-center justify-center">
          <div className="w-full max-w-[800px] flex items-center justify-center transition-all duration-300">
            <InteractiveTeeth onToothClick={handleToothClick} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeethDesktop;