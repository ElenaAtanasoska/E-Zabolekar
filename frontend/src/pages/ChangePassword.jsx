import React, { useState } from "react";
import axios from "axios";
import { FaLock, FaSave, FaEye, FaEyeSlash, FaRegSave } from "react-icons/fa";

export default function ChangePassword() {
    const token = localStorage.getItem("token");
    console.log("Token што се испраќа:", token); 
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const toggleVisibility = (field) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("Новите лозинки не се совпаѓаат!");
            return;
        }
        const token = localStorage.getItem("token");
        console.log("Токен што се праќа:", token);

        if (!token) {
            alert("Не сте најавени!");
            return;
        }

        try {
            const response = await axios.put("http://127.0.0.1:8000/auth/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                alert("Лозинката е успешно променета!");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (err) {
            console.error("Грешка:", err.response ? err.response.data : err.message);
            alert("Грешка: " + (err.response?.data?.detail || "Неовластен пристап"));
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full animate-fadeIn">
            <div className="flex items-start gap-6">
                <span className="bg-[#0a3d4f] text-white min-w-[32px] h-8 rounded-full flex items-center justify-center font-bold">2</span>

                <div className="flex-1">
                    <h3 className="uppercase font-bold text-gray-700 mb-6 tracking-widest text-sm">Лозинка</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-800 ml-4">Вашата стара лозинка</label>
                                <div className="flex items-center border border-gray-200 focus-within:border-cyan-500 rounded-full px-5 py-3 bg-white transition-all shadow-sm">
                                    <FaLock className="text-gray-400 mr-3" />
                                    <input
                                        type={showPass.current ? "text" : "password"}
                                        name="currentPassword"
                                        placeholder="Вашата лозинка..."
                                        className="w-full outline-none text-sm text-gray-600 placeholder-gray-300 bg-transparent"
                                        onChange={handleChange}
                                        value={passwords.currentPassword}
                                        required
                                    />
                                    <button type="button" onClick={() => toggleVisibility('current')}>
                                        {showPass.current ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="hidden md:block"></div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-800 ml-4">Вашата нова лозинка</label>
                                <div className="flex items-center border border-gray-200 focus-within:border-cyan-500 rounded-full px-5 py-3 bg-white transition-all shadow-sm">
                                    <FaLock className="text-gray-400 mr-3" />
                                    <input
                                        type={showPass.new ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="Вашата лозинка..."
                                        className="w-full outline-none text-sm text-gray-600 placeholder-gray-300 bg-transparent"
                                        onChange={handleChange}
                                        value={passwords.newPassword}
                                        required
                                    />
                                    <button type="button" onClick={() => toggleVisibility('new')}>
                                        {showPass.new ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="hidden md:block"></div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-800 ml-4">Потврдете ја вашата нова лозинка</label>
                                <div className="flex items-center border border-gray-200 focus-within:border-cyan-500 rounded-full px-5 py-3 bg-white transition-all shadow-sm">
                                    <FaLock className="text-gray-400 mr-3" />
                                    <input
                                        type={showPass.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Вашата лозинка..."
                                        className="w-full outline-none text-sm text-gray-600 placeholder-gray-300 bg-transparent"
                                        onChange={handleChange}
                                        value={passwords.confirmPassword}
                                        required
                                    />
                                    <button type="button" onClick={() => toggleVisibility('confirm')}>
                                        {showPass.confirm ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                className="bg-[#0a3d4f] text-white px-10 py-3 rounded-lg flex items-center gap-3 font-medium hover:bg-[#105a66] transition-all shadow-md active:scale-95 text-sm"
                            >
                                <FaRegSave size={18} /> Зачувај Промени
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}