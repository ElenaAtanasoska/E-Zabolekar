import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaPlus, FaUserCircle, FaFolder, FaTooth, FaFileMedical, FaUserMd } from "react-icons/fa";
import mainIllustration from "../assets/logod.png";
import myLogo from "../assets/logo.png";

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const firstName = localStorage.getItem("first_name") || "Доктор";
    const lastName = localStorage.getItem("last_name") || "";
    const [errorMessage, setErrorMessage] = useState("");
    const formattedName = lastName ? `${lastName.charAt(0)}.` : "";
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const userRole = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("is_admin") === "true";
    const handleSearch = async (e) => {
        if (e.key === "Enter" && searchTerm.trim() !== "") {
            try {
                setErrorMessage("");
                const token = localStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/patients/search/${searchTerm}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data && response.data.patient_id) navigate(`/patient/${response.data.patient_id}`);
            } catch (error) {
                setErrorMessage("Пациент со тој број на картон не е пронајден!");
            }
        }
    };

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-gray-900">
            <nav className="flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100">
                <img src={myLogo} alt="Logo" className="h-12" />
                <div className="flex items-center gap-8 text-sm text-gray-600">
                    <ul className="flex gap-10 text-gray-600 font-medium text-sm">
                        <li onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-cyan-700">Дома</li>
                        <li onClick={() => navigate("/aboutUs")} className="cursor-pointer hover:text-cyan-700">За Нас</li>
                        <li onClick={() => navigate("/help")} className="cursor-pointer hover:text-cyan-700">Помош</li>
                        {(userRole === "admin" || isAdmin) && (
                            <li
                                onClick={() => navigate("/manage-doctors")}
                                className="cursor-pointer text-[#146E7D] font-bold border-b-2 border-[#146E7D] flex items-center gap-2 uppercase text-xs tracking-wider"
                            >
                                <FaUserMd /> АДМИНИСТРАЦИЈА
                            </li>
                        )}
                        <li
                            onClick={handleLogout}
                            className="cursor-pointer text-gray-400 hover:text-red-600 flex items-center gap-2 transition-colors duration-200"
                        >
                            Одјави Се
                        </li>
                    </ul>
                    <div onClick={() => navigate("/profile")} className="flex items-center gap-2 border-l pl-8 cursor-pointer">
                        <span className="font-semibold text-gray-800">Д-р {firstName} {formattedName}</span>
                        <FaUserCircle className="text-3xl text-gray-400" />
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-between overflow-hidden">
                <div className="w-1/2 pl-32 pr-20 z-10">
                    <div className="space-y-8">
                        <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                            ПРЕБАРАЈ ПАЦИЕНТ <br /> ЗА ПРИСТАП ДО ДОСИЕ
                        </h2>
                        <p className="text-gray-500">Внесете број за пристап до историја на интервенции, рендген снимки, дијагнози и регистрирани алергии. <br></br>Евидентирајте тековен преглед и нова дијагноза.</p>
                        <div className="relative max-w-2xl">
                            <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 pointer-events-none">
                                <FaSearch size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Пр. 1001..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full bg-white border rounded-none py-4 pl-14 pr-6 text-lg shadow-md focus:outline-none focus:border-[#146E7D] transition-all placeholder:text-gray-400"
                            />
                            {errorMessage && (
                                <div className="mt-2 text-black-600 text-sm font-medium flex items-center gap-2">
                                    <span>⚠️ {errorMessage}</span>
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate("/add-patient")} className="flex items-center gap-2 bg-[#0a3d4f] text-white px-6 py-3 rounded-lg">
                            <FaPlus /> НОВ ПАЦИЕНТ
                        </button>
                    </div>
                </div>

                <div className="w-1/2 h-full relative">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
                    <img
                        src={mainIllustration}
                        alt="Tooth"
                        className="w-full h-full object-cover"
                    />
                </div>
            </main>

            <div className="px-20 pb-5 mt-5 ">
                <div className="flex items-center">
                    {[
                        { icon: FaFolder, text: "Историја на интервенции" },
                        { icon: FaTooth, text: "Рендген снимки" },
                        { icon: FaFileMedical, text: "Дијагнози и алергии" },
                        { icon: FaUserCircle, text: "Тековен преглед" }
                    ].map((item, i) => (
                        <div key={i} className="flex-1 flex items-center justify-center gap-4 p-4 relative">
                            {i > 0 && (
                                <div className="absolute left-0 h-8 w-[1px] bg-gray-300"></div>
                            )}

                            <div className="text-2xl text-[#0a3d4f]">
                                <item.icon />
                            </div>
                            <span className="text-sm font-semibold text-gray-800 leading-tight">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}