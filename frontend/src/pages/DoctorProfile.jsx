import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChangePassword from "./ChangePassword";
import { FaUser, FaLock, FaUsers, FaArrowLeft, FaSignOutAlt, FaCog, FaEnvelope, FaHospital, FaIdCard, FaSave } from "react-icons/fa";

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [doctorData, setDoctorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    licenseNumber: "",
    phone: "",
    clinicName: ""
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem("user_id"); 
        const token = localStorage.getItem("token");
        if (!doctorId) return;

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/doctors/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        let formattedPhone = data.phone_number || "";
        if (formattedPhone.startsWith("0")) {
          formattedPhone = formattedPhone.substring(1);
        }

        setDoctorData({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          licenseNumber: data.license_number,
          phone: formattedPhone,
          clinicName: data.clinic_name
        });
      } catch (err) {
        console.error("Грешка:", err);
      }
    };
    fetchDoctorData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const doctorId = localStorage.getItem("user_id");
      const token = localStorage.getItem("token");
      const payload = {
        first_name: doctorData.firstName,
        last_name: doctorData.lastName,
        email: doctorData.email,
        phone_number: doctorData.phone
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/auth/doctors/${doctorId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsEditing(false);
      alert("Податоците се успешно зачувани!");
    } catch (err) {
      alert("Грешка при зачувување.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <div className="w-1/4 bg-[#0a3d4f] text-white flex flex-col items-center py-10 px-6 relative rounded-tr-[15px] rounded-br-[15px] shadow-[10px_0_30px_rgba(0,0,0,0.15)] z-10">
        <div className="mb-10 text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/50">
            <FaUser size={40} />
          </div>
          <h2 className="text-sm opacity-80 tracking-[2px] uppercase">Добредојдовте</h2>
          <h1 className="text-xl font-bold tracking-[1px]">Д-р {doctorData.firstName} {doctorData.lastName}</h1>
        </div>

        <nav className="w-full space-y-2">
          <button 
            onClick={() => setActiveTab("info")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all ${activeTab === "info" ? "bg-white/10" : "hover:bg-white/5 opacity-60"}`}
          >
            <FaIdCard /> Информации
          </button>
          
          <button 
            onClick={() => setActiveTab("password")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-lg transition-all ${activeTab === "password" ? "bg-white/10" : "hover:bg-white/5 opacity-60"}`}
          >
            <FaLock /> Лозинка
          </button>

        
        </nav>

        <div className="mt-auto w-full space-y-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm hover:underline"><FaArrowLeft /> Назад</button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-200 hover:text-red-400"><FaSignOutAlt /> Одјави Се</button>
        </div>
      </div>

      <div className="w-3/4 p-16 overflow-y-auto bg-gray-50/30">
        
        {activeTab === "info" ? (
          <div className="animate-fadeIn">
            <h2 className="text-center text-gray-400 uppercase tracking-[2px] mb-12 text-sm font-medium">Вашите лични информации за профилот</h2>
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex items-start gap-6">
                <span className="bg-[#0a3d4f] text-white min-w-[32px] h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <div className="flex-1">
                  <h3 className="uppercase font-bold text-gray-700 mb-8 tracking-widest text-sm">Профил</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-800 ml-4">Име</label>
                      <div className={`flex items-center border ${isEditing ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-200'} rounded-full px-5 py-3 bg-white`}>
                        <FaUser className="text-gray-400 mr-3" />
                        <input name="firstName" className="w-full outline-none text-sm bg-transparent" value={doctorData.firstName} onChange={handleChange} readOnly={!isEditing} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-800 ml-4">Личен телефонски број</label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center border border-gray-200 rounded-full px-5 py-3 bg-gray-50 text-sm font-bold text-gray-500">+389</div>
                        <div className={`flex-1 flex items-center border ${isEditing ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-200'} rounded-full px-5 py-3 bg-white`}>
                          <input name="phone" className="w-full outline-none text-sm bg-transparent" value={doctorData.phone} onChange={handleChange} readOnly={!isEditing} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-800 ml-4">Презиме</label>
                      <div className={`flex items-center border ${isEditing ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-200'} rounded-full px-5 py-3 bg-white`}>
                        <FaUser className="text-gray-400 mr-3" />
                        <input name="lastName" className="w-full outline-none text-sm bg-transparent" value={doctorData.lastName} onChange={handleChange} readOnly={!isEditing} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-800 ml-4">Корисничко име / Е-маил</label>
                      <div className={`flex items-center border ${isEditing ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-200'} rounded-full px-5 py-3 bg-white`}>
                        <FaEnvelope className="text-gray-400 mr-3" />
                        <input name="email" className="w-full outline-none text-sm bg-transparent" value={doctorData.email} onChange={handleChange} readOnly={!isEditing} />
                      </div>
                    </div>
                    <div className="space-y-2 opacity-70">
                      <label className="text-xs font-bold text-gray-800 ml-4">Ординација</label>
                      <div className="flex items-center border border-gray-100 rounded-full px-5 py-3 bg-gray-50">
                        <FaHospital className="text-gray-400 mr-3" />
                        <input className="w-full outline-none text-sm text-gray-500 bg-transparent cursor-not-allowed" value={doctorData.clinicName} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-10">
                {isEditing ? (
                  <button onClick={handleSave} className="bg-green-600 text-white px-10 py-3 rounded-lg flex items-center gap-3 hover:bg-green-700 shadow-lg transition-all"><FaSave /> Зачувај</button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="bg-[#0a3d4f] text-white px-10 py-3 rounded-lg flex items-center gap-3 hover:bg-[#126876] shadow-lg transition-all"><FaCog /> Уреди</button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn mt-10">
            <h2 className="text-center text-gray-400 uppercase tracking-[2px] mb-12 text-sm font-medium">Промена на лозинка</h2>
            <ChangePassword />
          </div>
        )}
      </div>
    </div>
  );
}