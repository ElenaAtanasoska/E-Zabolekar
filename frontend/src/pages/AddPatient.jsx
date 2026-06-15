import React, { useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaUserCircle, FaHome, FaQuestionCircle, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import myLogo from "../assets/logo.png";
import headerIcon from "../assets/header-icon.png";

export default function AddPatient() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem("first_name") || "Доктор";
    const lastName = localStorage.getItem("last_name") || "";
    const formattedName = lastName ? `${lastName.charAt(0)}.` : "";
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const userRole = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("is_admin") === "true";
    const [patientData, setPatientData] = useState({
        first_name: "", last_name: "", birth_date: "", file_number: "",
        gender: "Женски", phone_number: "", email: "", blood_type: "A+",
        emergency_name: "", emergency_surname: "", emergency_phone: ""
    });

    const [showModal, setShowModal] = useState(false);
    const [tempPassword, setTempPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setPatientData({ ...patientData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/patients/register`, patientData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTempPassword(response.data.temp_password);
            setShowModal(true);
        } catch (error) {
            alert(error.response?.data?.detail || "Грешка при регистрација");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate("/Dashboard");
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col">
            <nav className="flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100">
                <img src={myLogo} alt="Logo" className="h-12" />
                <div className="flex items-center gap-8 text-sm text-gray-600">
                    <ul className="flex gap-10 text-gray-600 font-medium text-sm">
                        <li className="cursor-pointer hover:text-cyan-700">Дома</li>
                        <li onClick={() => navigate("/aboutUs")} className="cursor-pointer hover:text-cyan-700">За Нас</li>
                        <li className="cursor-pointer hover:text-cyan-700">Помош</li>
                        {(userRole === "admin" || isAdmin) && (
                            <li
                                onClick={() => navigate("/manage-doctors")}
                                className="cursor-pointer text-[#146E7D] font-bold border-b-2 border-[#146E7D] flex items-center gap-2 uppercase text-xs tracking-wider"
                            >
                                <FaUserMd /> УПРАВУВАЈ СО ДОКТОРИ
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

            <div className="flex-grow p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-800">Регистрација на нов пациент</h1>
                                <p className="text-gray-500 mt-2 text-lg">Внесете ги податоците за пациентот</p>
                            </div>
                            <div className="flex-shrink-0">
                                <img src={headerIcon} className="h-[128px] w-auto object-contain" alt="Икона" />
                            </div>
                        </div>
                        <hr className="border-t-2 border-gray-100" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <section>
                            <h2 className="text-[#0a3d4f] font-semibold mb-4 flex items-center gap-2"><FaUserCircle /> Лични податоци</h2>
                            <div className="grid grid-cols-3 gap-6">
                                <input name="first_name" placeholder="Внесете име" required className="input-field" onChange={handleChange} />
                                <input name="last_name" placeholder="Внесете презиме" required className="input-field" onChange={handleChange} />
                                <input name="file_number" placeholder="Внесете матичен број" required className="input-field" onChange={handleChange} />
                                <div className="relative">
                                    <input name="birth_date" placeholder="ДД.ММ.ГГГГ" required className="input-field" onChange={handleChange} />
                                    <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                                </div>
                                <select name="gender" className="input-field" onChange={handleChange}>
                                    <option>Изберете пол</option>
                                    <option>Женски</option><option>Машки</option>
                                </select>
                                <select name="blood_type" className="input-field" onChange={handleChange}>
                                    <option>Изберете крвна група</option>
                                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                    <option>0+</option><option>0-</option><option>AB+</option><option>AB-</option>
                                </select>
                                <input name="phone_number" placeholder="Внесете број за контакт" className="input-field col-span-2" onChange={handleChange} />
                                <input name="email" placeholder="Внесете емаил" className="input-field" onChange={handleChange} />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-[#0a3d4f] font-semibold mb-4">Контакт за итни случаи</h2>
                            <div className="grid grid-cols-3 gap-6">
                                <input name="emergency_name" placeholder="Име" className="input-field" onChange={handleChange} />
                                <input name="emergency_surname" placeholder="Презиме" className="input-field" onChange={handleChange} />
                                <input name="emergency_phone" placeholder="Број за контакт" className="input-field" onChange={handleChange} />
                            </div>
                        </section>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button type="button" className="px-8 py-2 border rounded-lg text-gray-600">Откажи</button>
                            <button type="submit" className="px-8 py-2 bg-[#0a3d4f] text-white rounded-lg hover:bg-teal-800">Зачувај пациент</button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx="true">{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    outline: none;
                }
                .input-field:focus { border-color: #0f766e; }
            `}</style>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl text-center">
                        <div className="flex justify-center mb-6 text-[#146E7D]">
                            <FaCheckCircle size={60} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">Успешна регистрација!</h2>
                        <p className="text-gray-500 mb-8 font-medium">Споделете ја привремената лозинка со пациентот за првата најава:</p>

                        <div className="bg-gray-50 border-2 border-dashed border-[#146E7D]/30 rounded-2xl p-6 mb-8 relative group">
                            <span className="text-3xl font-black text-[#146E7D] tracking-widest">{tempPassword}</span>
                        </div>

                        <button
                            onClick={handleCloseModal}
                            className="w-full bg-[#146E7D] hover:bg-gray-800 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
                        >
                            Продолжи кон Табла
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}