import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLaptopCode, FaUserMd, FaShieldAlt, FaChartLine, FaUserCircle } from "react-icons/fa"; 
import myLogo from "../assets/logo.png"; 

export default function AboutUs() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem("first_name") || "Доктор";
    const lastName = localStorage.getItem("last_name") || "";
    const formattedName = lastName ? `${lastName.charAt(0)}.` : "";
    const userRole = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("is_admin") === "true";
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <nav className="flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100">
                <img src={myLogo} alt="Logo" className="h-12" />
                <div className="flex items-center gap-8 text-sm text-gray-600">
                    <ul className="flex gap-10 text-gray-600 font-medium text-sm">
                        <li onClick={() => navigate("/dashboard")}  className="cursor-pointer hover:text-cyan-700">Дома</li>
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
                        <span className="font-bold text-gray-800">Д-р {firstName} {formattedName}</span>
                        <FaUserCircle className="text-3xl text-gray-400" />
                    </div>
                </div>
            </nav>

            <div className="p-10 md:p-20">
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h1 className="text-4xl font-bold text-[#0a3d4f] mb-6">За Е-Заболекар</h1>
                    <p className="text-lg text-gray-600">
                        Специјализирана платформа за дигитална трансформација на стоматолошките клиники, дизајнирана за максимална ефикасност и прецизност во секојдневната работа.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <FaLaptopCode className="text-3xl text-[#0a3d4f] mb-4" />
                        <h3 className="text-xl font-bold mb-2">Дигитална прецизност</h3>
                        <p className="text-gray-500">Систем кој ги интегрира сите аспекти од водењето на една клиника, администрација до сложена клиничка дијагностика.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <FaShieldAlt className="text-3xl text-[#0a3d4f] mb-4" />
                        <h3 className="text-xl font-bold mb-2">Безбедност и доверба</h3>
                        <p className="text-gray-500">Вашите податоци и досиејата на пациентите се чуваат со највисоки стандарди за приватност и достапност.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <FaChartLine className="text-3xl text-[#0a3d4f] mb-4" />
                        <h3 className="text-xl font-bold mb-2">Максимална ефикасност</h3>
                        <p className="text-gray-500">Намалување на административниот товар и оптимизација на работните процеси за целосен фокус кон пациентот.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <FaUserMd className="text-3xl text-[#0a3d4f] mb-4" />
                        <h3 className="text-xl font-bold mb-2">Партнер во праксата</h3>
                        <p className="text-gray-500">Алатка која ги следи најновите технолошки трендови за да ви овозможи конкурентна предност на пазарот.</p>
                    </div>
                </div>
                
                <div className="max-w-4xl mx-auto mt-20 text-center border-t pt-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Спремни за дигитализација?</h2>
                    <p className="text-gray-500 mb-6">Контактирајте нè за демо презентација на системот.</p>
                    <button className="bg-[#0a3d4f] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0d4f66] transition">
                        Контакт
                    </button>
                </div>
            </div>
        </div>
    );
}