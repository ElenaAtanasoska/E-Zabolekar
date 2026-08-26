import { useState } from "react";
import { FaTooth, FaClinicMedical, FaMapMarkerAlt, FaLock, FaEnvelope, FaAddressCard, FaUser, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import bgImage from "../assets/bg.png";
import { useNavigate } from "react-router-dom";

export default function SetupClinic() {
    const [formData, setFormData] = useState({
        new_email: "",
        new_password: "",
        first_name: "",
        last_name: "",
        license_number: "",
        phone_number: "",
        clinic_name: "",
        clinic_location: "",
        clinic_address: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const token = localStorage.getItem("access_token");
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/auth/complete-setup`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowSuccessModal(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Грешка при зачувување.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModalAndNavigate = () => {
        setShowSuccessModal(false);
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-10" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="w-full max-w-4xl border border-cyan-200/40 bg-white/20 backdrop-blur-md shadow-2xl rounded-sm px-10 py-10">

                <div className="flex items-center gap-4 mb-8">
                    <FaClinicMedical className="text-cyan-700 text-5xl" />
                    <div>
                        <h1 className="text-3xl font-bold text-cyan-800 uppercase tracking-tighter">Конфигурација</h1>
                    </div>
                </div>

                <form onSubmit={handleSetup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-cyan-900 border-b border-cyan-500 pb-1 uppercase text-sm">Администратор</h3>

                        <div className="grid grid-cols-2 gap-2">
                            <input name="first_name" placeholder="Име" className="bg-white rounded-full border border-cyan-500 px-4 py-2 text-sm outline-none" onChange={handleChange} required />
                            <input name="last_name" placeholder="Презиме" className="bg-white rounded-full border border-cyan-500 px-4 py-2 text-sm outline-none" onChange={handleChange} required />
                        </div>

                        <div className="flex items-center bg-white rounded-full border border-cyan-500 px-4 py-2 shadow-sm">
                            <FaAddressCard className="text-gray-400 mr-2" />
                            <input
                                name="license_number"
                                placeholder="Број на лиценца"
                                className="w-full outline-none text-sm"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex items-center bg-white rounded-full border border-cyan-500 px-4 py-2 shadow-sm">
                            <FaAddressCard className="text-gray-400 mr-2" />
                            <input
                                name="phone_number"
                                placeholder="Телефонски број"
                                className="w-full outline-none text-sm"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex items-center bg-white rounded-full border border-cyan-500 px-4 py-2 shadow-sm">
                            <FaEnvelope className="text-gray-400 mr-2" />
                            <input name="new_email" type="email" placeholder="Нов е-маил" className="w-full outline-none text-sm" onChange={handleChange} required />
                        </div>

                        <div className="flex items-center bg-white rounded-full border border-cyan-500 px-4 py-2 shadow-sm">
                            <FaLock className="text-gray-400 mr-2" />
                            <input name="new_password" type="password" placeholder="Нова лозинка" className="w-full outline-none text-sm" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-cyan-900 border-b border-cyan-500 pb-1 uppercase text-sm">Клиника</h3>
                        <input name="clinic_name" placeholder="Име на клиника" className="w-full bg-white rounded-full border border-cyan-500 px-4 py-2 text-sm outline-none" onChange={handleChange} required />
                        <input name="clinic_location" placeholder="Град" className="w-full bg-white rounded-full border border-cyan-500 px-4 py-2 text-sm outline-none" onChange={handleChange} required />
                        <input name="clinic_address" placeholder="Адреса" className="w-full bg-white rounded-full border border-cyan-500 px-4 py-2 text-sm outline-none" onChange={handleChange} required />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        {error && <p className="text-red-600 text-sm mb-3 font-bold">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 rounded-full transition uppercase tracking-widest">
                            {loading ? "СЕ ЗАЧУВУВА..." : "ЗАЧУВАЈ И ФИНАЛИЗИРАЈ"}
                        </button>
                    </div>
                </form>
            </div>
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-10 max-w-lg w-full shadow-2xl border border-cyan-200 text-center animate-pop-in">
                        <div className="flex justify-center mb-6 text-green-500">
                            <FaCheckCircle size={60} />
                        </div>
                        <h2 className="text-3xl font-bold text-cyan-800 mb-2 uppercase tracking-tighter">Успешна конфигурација!</h2>
                        <p className="text-gray-600 mb-8 font-medium">Сега најавете се со вашите нови податоци за да започнете со користење на апликацијата.</p>

                        <button
                            onClick={handleCloseModalAndNavigate}
                            className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-4 rounded-full transition uppercase tracking-widest text-sm"
                        >
                            Продолжи кон најава
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}