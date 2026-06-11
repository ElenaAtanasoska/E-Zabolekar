import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaUserMd, FaQuestionCircle, FaEnvelope } from "react-icons/fa";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi"; import myLogo from "../assets/logo.png";

export default function Help() {
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

    const faqItems = [
        { q: "Како да пребарам пациент?", a: "Внесете го бројот на картонот во полето за пребарување на почетната страна и притиснете Enter." },
        { q: "Како да додадам нов пациент?", a: "Кликнете на копчето 'НОВ ПАЦИЕНТ' на почетната страна и пополнете ги задолжителните податоци." },
        { q: "Каде можам да ги видам рендген снимките?", a: "Отворете го досието на пациентот, каде што ќе најдете таб со сите прикачени снимки." },
        { q: "Што ако ја заборавам лозинката?", a: "Кликнете на вашето име во горниот десен агол, ќе ви се отвори панел каде во вториот таб може да ја променете лозинката." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
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
            <div className="p-10 md:p-20 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-[#0a3d4f] mb-6 flex justify-center items-center gap-3">
                        <FaQuestionCircle /> Центар за помош
                    </h1>
                    <p className="text-gray-600">Овде можете да најдете одговори на најчестите прашања поврзани со користењето на системот.</p>
                </div>

                <div className="space-y-6">
                    {faqItems.map((item, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-[#0a3d4f] mb-2">{item.q}</h3>
                            <p className="text-gray-600">{item.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-[#0a3d4f] p-10 rounded-2xl text-white text-center">
                    <HiOutlineMail className="text-5xl mx-auto mb-4 text-cyan-300 stroke-[1.5]" />

                    <h2 className="text-2xl font-bold mb-2">Ви треба дополнителна помош?</h2>
                    <p className="mb-4 opacity-90">Нашиот тим за техничка поддршка е достапен на:</p>

                    <div className="flex flex-col gap-2 text-lg font-semibold mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <HiOutlinePhone className="text-xl text-cyan-300" />
                            <span>+389 70 123 456</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <HiOutlineMail className="text-xl text-cyan-300" />
                            <span>support@ezabolekar.com</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}