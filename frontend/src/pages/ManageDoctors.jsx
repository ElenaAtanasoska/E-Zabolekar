import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserPlus, FaKey, FaArrowLeft, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ManageDoctors() {
  const [email, setEmail] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/doctors/list");
      setDoctors(response.data);
    } catch (err) {
      console.error("Грешка при вчитување на доктори", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedPass(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/add-doctor", {
        email: email
      });

      setGeneratedPass(response.data.temp_password);
      setEmail("");
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.detail || "Грешка при креирање профил.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctor_id) => {
  

    try {
      await axios.delete(`http://127.0.0.1:8000/doctors/${doctor_id}`);
      fetchDoctors(); // Повторно вчитување на листата
    } catch (err) {
      alert(err.response?.data?.detail || "Настана грешка при бришењето.");
    }
  };

  const confirmDelete = (doctor_id) => {
    setDoctorToDelete(doctor_id); // Го зачувуваме ID-то што треба да се брише
    setShowModal(true); // Го покажуваме прозорецот
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-cyan-700 hover:text-cyan-800 mb-6 font-medium max-w-2xl mx-auto"
      >
        <FaArrowLeft /> Назад кон Почетна
      </button>
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-100">
          <div className="bg-cyan-700 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <FaUserPlus /> Додади нов доктор
            </h2>
            <p className="text-cyan-100 text-sm mt-1">Креирајте пристап за нов вработен</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Е-маил адреса</label>
                <input
                  type="email"
                  placeholder="doctor@example.com"
                  className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-cyan-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-md font-bold text-white transition ${loading ? "bg-gray-400" : "bg-cyan-700 hover:bg-cyan-800 shadow-lg"
                  }`}
              >
                {loading ? "СЕ ГЕНЕРИРА..." : "ГЕНЕРИРАЈ ПРИСТАП"}
              </button>
            </form>

            {generatedPass && (
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                  <FaKey /> ПРИВРЕМЕНА ЛОЗИНКА
                </div>
                <div className="bg-white border-2 border-dashed border-amber-300 p-4 text-center">
                  <span className="text-3xl font-mono tracking-[0.3em] font-bold text-gray-800">
                    {generatedPass}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FaUserMd /> Регистрирани доктори
          </h3>
          <div className="space-y-3">
            {doctors.map((doc) => (

              <div key={doc.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-800">{doc.name}</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{doc.email}</span>
                <button
                  onClick={() => confirmDelete(doc.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                >
                  Избриши профил
                </button>
              </div>

            ))}




            {doctors.length === 0 && (
              <p className="text-sm text-gray-400 italic">Нема пронајдено доктори во базата.</p>
            )}
          </div>
        </div>

      </div>
      {
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Потврди бришење</h3>
              <p className="text-gray-600 mb-6">Дали сте сигурни дека сакате да го избришете профилот овој доктор? <br></br>Сите негови пациенти ќе се префрлат кај админ докторот.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Откажи
                </button>
                <button
                  onClick={async () => {
                    await handleDeleteDoctor(doctorToDelete);
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Избриши
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>


  );


}