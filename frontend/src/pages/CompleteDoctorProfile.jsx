import { useState } from "react";
import { FaTooth, FaLock, FaAddressCard, FaUser, FaCheckCircle, FaPhone, FaIdCard } from "react-icons/fa";
import axios from "axios";
import bgImage from "../assets/bg.png";
import { useNavigate } from "react-router-dom";

export default function CompleteDoctorProfile() {
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        licenseNumber: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (data.password !== data.confirmPassword) {
            setError("Лозинките не се совпаѓаат!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/auth/complete-doctor-setup`, {
                first_name: data.firstName,
                last_name: data.lastName,
                license_number: data.licenseNumber,
                phone_number: data.phoneNumber,
                new_password: data.password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowSuccessModal(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Грешка при зачувување на податоците.");
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
            <div className="w-full max-w-2xl border border-cyan-200/40 bg-white/20 backdrop-blur-md shadow-2xl rounded-sm px-10 py-10 relative z-10">
                
                <div className="flex items-center gap-4 mb-8">
                    <FaTooth className="text-cyan-700 text-5xl" />
                    <div>
                        <h1 className="text-3xl font-bold text-cyan-800 uppercase tracking-tighter">Постави профил</h1>
                        <p className="text-cyan-900/70 text-sm">Ве молиме пополнете ги вашите податоци</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="firstName" placeholder="Име" className="bg-white rounded-full border border-cyan-500 px-6 py-3 text-sm outline-none" onChange={handleChange} required />
                        <input name="lastName" placeholder="Презиме" className="bg-white rounded-full border border-cyan-500 px-6 py-3 text-sm outline-none" onChange={handleChange} required />
                    </div>

                    <div className="flex items-center bg-white rounded-full border border-cyan-500 px-6 py-3 shadow-sm">
                        <FaIdCard className="text-gray-400 mr-3" />
                        <input name="licenseNumber" placeholder="Број на лиценца" className="w-full outline-none text-sm" onChange={handleChange} required />
                    </div>

                    <div className="flex items-center bg-white rounded-full border border-cyan-500 px-6 py-3 shadow-sm">
                        <FaPhone className="text-gray-400 mr-3" />
                        <input name="phoneNumber" placeholder="Телефонски број" className="w-full outline-none text-sm" onChange={handleChange} required />
                    </div>

                    <div className="flex items-center bg-white rounded-full border border-cyan-500 px-6 py-3 shadow-sm">
                        <FaLock className="text-gray-400 mr-3" />
                        <input name="password" type="password" placeholder="Нова лозинка" className="w-full outline-none text-sm" onChange={handleChange} required />
                    </div>

                    <div className="flex items-center bg-white rounded-full border border-cyan-500 px-6 py-3 shadow-sm">
                        <FaLock className="text-gray-400 mr-3" />
                        <input name="confirmPassword" type="password" placeholder="Потврди лозинка" className="w-full outline-none text-sm" onChange={handleChange} required />
                    </div>

                    {error && <p className="text-red-600 text-sm font-bold px-2">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-3 rounded-full transition uppercase tracking-widest text-sm mt-4">
                        {loading ? "СЕ ЗАЧУВУВА..." : "ПОСТАВИ ПРОФИЛ"}
                    </button>
                </form>
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-10 max-w-lg w-full shadow-2xl border border-cyan-200 text-center">
                        <div className="flex justify-center mb-6 text-green-500">
                            <FaCheckCircle size={60} />
                        </div>
                        <h2 className="text-3xl font-bold text-cyan-800 mb-2 uppercase tracking-tighter">Успешно!</h2>
                        <p className="text-gray-600 mb-8 font-medium">Вашиот профил е успешно креиран. Ве молиме најавете се.</p>
                        <button onClick={handleCloseModalAndNavigate} className="w-full bg-cyan-700 hover:bg-cyan-800 text-white font-bold py-4 rounded-full transition uppercase tracking-widest text-sm">
                            Кон најава
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}