import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import {
    FaSearch, FaUserCircle, FaArrowLeft, FaChevronRight,
    FaPlus, FaCapsules, FaClock, FaInfoCircle
} from "react-icons/fa";


function ConditionsModal({ isOpen, onClose, patientId, onSaveSuccess }) {
    const [groupedData, setGroupedData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchAll = axios.get(`${import.meta.env.VITE_API_URL}/patients/medical-conditions/grouped`);
            const fetchCurrent = axios.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/conditions`);

            Promise.all([fetchAll, fetchCurrent])
                .then(([resAll, resCurrent]) => {
                    setGroupedData(resAll.data);
                    setSelectedIds(resCurrent.data.map(c => c.condition_id));
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Грешка при вчитување податоци:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, patientId]);

    const handleToggle = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/patients/${patientId}/conditions`, selectedIds);
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Грешка при зачувување на податоците.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/20">
                <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="font-black text-xl text-[#01506d] uppercase tracking-tighter">Медицински картон</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Изберете дијагнози и состојби</p>
                    </div>
                    <button onClick={onClose} className="bg-white shadow-md p-3 rounded-full text-gray-400 hover:text-red-500 transition-all">✕</button>
                </div>

                <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
                    {loading ? (
                        <p className="text-center font-bold text-gray-400">Се вчитува...</p>
                    ) : (
                        groupedData.map((group, idx) => (
                            <div key={idx}>
                                <h3 className="text-[11px] font-black text-[#00A3C1] uppercase mb-5 tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-8 h-[2px] bg-[#00A3C1]"></span> {group.group_name}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {group.conditions.map(c => (
                                        <label
                                            key={c.condition_id}
                                            className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedIds.includes(c.condition_id)
                                                ? 'bg-blue-50 border-[#00A3C1] shadow-sm'
                                                : 'bg-gray-50 border-transparent hover:border-gray-200'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedIds.includes(c.condition_id)}
                                                onChange={() => handleToggle(c.condition_id)}
                                            />
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.includes(c.condition_id) ? 'bg-[#00A3C1] border-[#00A3C1]' : 'bg-white border-gray-300'}`}>
                                                {selectedIds.includes(c.condition_id) && <span className="text-white text-[10px]">✓</span>}
                                            </div>
                                            <span className={`text-xs font-bold ${selectedIds.includes(c.condition_id) ? 'text-[#01506d]' : 'text-gray-600'}`}>
                                                {c.condition_name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 border-t flex justify-end gap-4 bg-gray-50/50">
                    <button onClick={onClose} className="px-8 py-3 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all">Откажи</button>
                    <button onClick={handleSave} className="bg-[#00A3C1] text-white px-10 py-3 rounded-xl font-black uppercase text-xs tracking-[0.15em] shadow-xl shadow-[#00A3C1]/30 hover:bg-[#008ba5] hover:scale-105 transition-all">
                        Зачувај податоци
                    </button>
                </div>
            </div>
        </div>
    );
}

function AllergiesModal({ isOpen, onClose, patientId, onSaveSuccess }) {
    const [allAvailable, setAllAvailable] = useState([]);
    const [selectedNames, setSelectedNames] = useState([]);
    const [newAllergyInput, setNewAllergyInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchAll = axios.get(`${import.meta.env.VITE_API_URL}/patients/allergies/all`);
            const fetchCurrent = axios.get(`${import.meta.env.VITE_API_URL}/patients/${patientId}/allergies`);

            Promise.all([fetchAll, fetchCurrent])
                .then(([resAll, resCurrent]) => {
                    setAllAvailable(resAll.data);
                    setSelectedNames(resCurrent.data.map(a => a.allergy_name));
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Грешка:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, patientId]);

    const handleToggle = (name) => {
        setSelectedNames(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const handleAddNew = () => {
        if (newAllergyInput.trim() && !selectedNames.includes(newAllergyInput.trim())) {
            setSelectedNames([...selectedNames, newAllergyInput.trim()]);
            setNewAllergyInput("");
        }
    };

    const handleSave = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/patients/${patientId}/allergies`, {
                allergies: selectedNames
            });
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert("Грешка при зачувување.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-white/20">
                <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="font-black text-xl text-[#01506d] uppercase tracking-tighter">Уреди Алергии</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Избери или додај нова алергија</p>
                    </div>
                    <button onClick={onClose} className="bg-white shadow-md p-3 rounded-full text-gray-400 hover:text-red-500 transition-all">✕</button>
                </div>
                <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newAllergyInput}
                            onChange={(e) => setNewAllergyInput(e.target.value)}
                            placeholder="Внеси нова алергија..."
                            className="flex-grow bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00A3C1] transition-all"
                        />
                        <button onClick={handleAddNew} className="bg-[#00A3C1] text-white px-4 rounded-xl hover:bg-[#01506d] transition-all shadow-lg shadow-[#00A3C1]/20">
                            <FaPlus />
                        </button>
                    </div>
                    <div className="h-[1px] bg-gray-100"></div>
                    <div className="grid grid-cols-1 gap-2">
                        {loading ? <p className="text-center text-xs font-bold text-gray-400">Се вчитава...</p> :
                            allAvailable.map(a => (
                                <label key={a.allergy_id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedNames.includes(a.allergy_name) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedNames.includes(a.allergy_name)}
                                        onChange={() => handleToggle(a.allergy_name)}
                                        className="accent-red-400 w-4 h-4"
                                    />
                                    <span className={`text-xs font-bold ${selectedNames.includes(a.allergy_name) ? 'text-red-700' : 'text-gray-600'}`}>{a.allergy_name}</span>
                                </label>
                            ))}
                        {selectedNames.filter(name => !allAvailable.find(a => a.allergy_name === name)).map((manual, idx) => (
                            <label key={idx} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                                <input type="checkbox" checked={true} onChange={() => handleToggle(manual)} className="accent-green-500 w-4 h-4" />
                                <span className="text-xs font-bold text-green-700">{manual} (Ново)</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="p-8 border-t flex justify-end gap-3 bg-gray-50/50">
                    <button onClick={onClose} className="px-6 py-2 font-black text-[10px] uppercase text-gray-400">Откажи</button>
                    <button onClick={handleSave} className="bg-red-400 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-400/20 hover:scale-105 transition-all">Зачувај</button>
                </div>
            </div>
        </div>
    );
}

function TherapyModal({ isOpen, onClose, patientId, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        therapy_name: "",
        therapy_type: "Антибиотик",
        dosage: "",
        duration: "",
        start_date: new Date().toISOString().split('T')[0] 
    });

    const handleSave = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/patients/${patientId}/therapies`, formData);
            onSaveSuccess();
            onClose();
            setFormData({
                therapy_name: "",
                therapy_type: "Антибиотик",
                dosage: "",
                duration: "",
                start_date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            alert("Грешка при зачувување терапија");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden">
                <div className="p-8 border-b bg-gray-50/50">
                    <h2 className="font-black text-xl text-[#01506d] uppercase">Нова Терапија</h2>
                </div>
                <div className="p-8 space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Тип на терапија</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00A3C1]"
                            value={formData.therapy_type}
                            onChange={(e) => setFormData({ ...formData, therapy_type: e.target.value })}
                        >
                            <option>Антибиотик</option>
                            <option>Намалување на болка</option>
                            <option>Редовна терапија</option>
                            <option>Локален третман</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Датум на почеток</label>
                        <input
                            type="date"
                            value={formData.start_date}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00A3C1]"
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Име на лек</label>
                        <input
                            type="text"
                            value={formData.therapy_name}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00A3C1]"
                            placeholder="пр. Амоксицилин 500мг"
                            onChange={(e) => setFormData({ ...formData, therapy_name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Дозирање</label>
                            <input
                                type="text"
                                value={formData.dosage}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00A3C1]"
                                placeholder="пр. 3 пати дневно"
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Времетраење</label>
                            <input
                                type="text"
                                value={formData.duration}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-[#00A3C1]"
                                placeholder="пр. 7 дена"
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="text-xs font-black uppercase text-gray-400">Откажи</button>
                    <button onClick={handleSave} className="bg-[#01506D] text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#00A3C1] transition-all">Додај Терапија</button>
                </div>
            </div>
        </div>
    );
}

export default function PatientInfo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
    const [isTherapyModalOpen, setIsTherapyModalOpen] = useState(false);
    const [patientConditions, setPatientConditions] = useState([]);
    const [patientAllergies, setPatientAllergies] = useState([]);
    const [therapies, setTherapies] = useState([]);

    const firstName = localStorage.getItem("first_name") || "Доктор";
    const lastName = localStorage.getItem("last_name") || "";

    const fetchConditions = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/patients/${id}/conditions`)
            .then(res => setPatientConditions(res.data))
            .catch(err => console.error("Грешка при вчитување:", err));
    };

    const fetchAllergies = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/patients/${id}/allergies`)
            .then(res => setPatientAllergies(res.data))
            .catch(err => console.error(err));
    };

    const fetchTherapies = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/patients/${id}/therapies`)
            .then(res => setTherapies(res.data))
            .catch(err => console.error(err));
    };

    const handleDeleteTherapy = async (recordId) => {
        if (window.confirm("Дали сте сигурни дека сакате да ја избришете оваа терапија?")) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/patients/therapies/${recordId}`);
                fetchTherapies();
            } catch (err) {
                alert("Грешка при бришење");
            }
        }
    };

    useEffect(() => {
        fetchConditions();
        fetchAllergies();
        fetchTherapies();
    }, [id]);

    return (
        <div className="flex h-screen w-screen bg-[#F3F4F6] overflow-hidden">
            <Sidebar />
            <div className="flex-grow flex flex-col h-full overflow-hidden">
                <div className="h-20 bg-white shadow-sm flex items-center justify-between px-10 shrink-0">
                    <button onClick={() => navigate("/dashboard")} className="hover:text-[#00A3C1] transition-colors">
                        <FaArrowLeft size={18} />
                    </button>
                    <div className="relative w-1/2">
                        <input type="text" placeholder="Пребарај овде..." className="w-full bg-gray-50 rounded-lg py-2 px-12 outline-none focus:ring-1 focus:ring-gray-200" />
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3 pl-10">
                        <span className="font-medium text-gray-800 text-sm">Д-р {firstName} {lastName.charAt(0)}.</span>
                        <FaUserCircle className="text-4xl text-gray-300" />
                    </div>
                </div>

                <div className="p-8 flex flex-col flex-grow space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-sm text-[#01506d] uppercase tracking-tight border-l-4 border-[#00A3C1] pl-3">Анамнеза</h3>
                                <button onClick={() => setIsModalOpen(true)} className="bg-gray-50 text-[#00A3C1] p-2 px-4 rounded-lg text-[10px] font-black uppercase hover:bg-[#00A3C1] hover:text-white transition-all shadow-sm">
                                    Уреди
                                </button>
                            </div>
                            <div className="space-y-4">
                                {patientConditions.length > 0 ? (
                                    patientConditions.map((cond) => (
                                        <div key={cond.condition_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                                            <div className="bg-[#00A3C1] text-white p-1.5 rounded-lg shadow-md shadow-[#00A3C1]/20">
                                                <FaChevronRight size={8} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm tracking-tight">{cond.condition_name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center py-10 opacity-40">
                                        <FaInfoCircle size={40} className="mb-4 text-gray-300" />
                                        <p className="font-bold text-sm italic">Нема внесени дијагнози за овој пациент.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-sm text-[#01506d] uppercase tracking-[0.2em] border-l-4 border-red-400 pl-4 text-left">Алергии</h3>
                                <button onClick={() => setIsAllergyModalOpen(true)} className="bg-gray-50 text-red-400 p-2 px-4 rounded-lg text-[10px] font-black uppercase hover:bg-red-400 hover:text-white transition-all shadow-sm">
                                    Уреди
                                </button>
                            </div>
                            <div className="space-y-4">
                                {patientAllergies.length > 0 ? (
                                    patientAllergies.map((al) => (
                                        <div key={al.allergy_id} className="flex items-center gap-4 p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                                            <div className="bg-red-400 text-white p-1.5 rounded-lg">
                                                <FaChevronRight size={8} />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm tracking-tight">{al.allergy_name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-6 text-gray-300 font-bold italic text-xs">Нема забележано алергии.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-7 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-7">
                            <h3 className="font-black text-xs text-[#01506D] uppercase tracking-[0.2em] border-l-4 border-[#00A3C1] pl-4">Tерапија</h3>
                            <button onClick={() => setIsTherapyModalOpen(true)} className="flex items-center gap-2 bg-[#01506D] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00A3C1] transition-all shadow-lg">
                                <FaPlus size={10} /> Додај
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {therapies.map((item) => (
                                <div key={item.id} className="relative p-6 rounded-[24px] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-500 flex flex-col justify-between h-full">
                                    <button
                                        onClick={() => handleDeleteTherapy(item.id)}
                                        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm z-10"
                                    >
                                        ✕
                                    </button>

                                    <div>
                                        <div className="mb-6">
                                            <h4 className="font-black text-[10px] text-[#00A3C1] uppercase tracking-widest">
                                                {item.therapy.type}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#01506D] group-hover:bg-[#01506D] group-hover:text-white transition-all duration-500">
                                                <FaCapsules size={20} />
                                            </div>
                                            <span className="font-black text-gray-800 text-base leading-tight">
                                                {item.therapy.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100/50 flex justify-between items-end">
                                        <div className="flex items-center gap-3 opacity-60">
                                            <FaClock className="text-gray-400" size={14} />
                                            <span className="font-bold text-[10px] uppercase text-gray-500 tracking-tight">
                                                {item.duration} / {item.dosage}
                                            </span>
                                        </div>

                                        {item.start_date && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">Почеток</span>
                                                <span className="text-[10px] font-bold text-[#00A3C1]">
                                                    {new Date(item.start_date).toLocaleDateString('mk-MK')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#01506D] rounded-[10px] p-2 flex items-center gap-6 shadow-xl shadow-blue-900/20">
                        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                            <FaInfoCircle size={24} />
                        </div>
                        <p className="text-xs text-blue-100 font-bold leading-relaxed text-left">
                            Внимавајте: Податоците за алергии и медицински состојби се критични за безбедноста на пациентот. <br />
                            <span className="text-white opacity-60">Секогаш потврдувајте ги со пациентот пред почеток на интервенција.</span>
                        </p>
                    </div>
                </div>
            </div>

            <ConditionsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                patientId={id}
                onSaveSuccess={fetchConditions}
            />

            <AllergiesModal
                isOpen={isAllergyModalOpen}
                onClose={() => setIsAllergyModalOpen(false)}
                patientId={id}
                onSaveSuccess={fetchAllergies}
            />

            <TherapyModal
                isOpen={isTherapyModalOpen}
                onClose={() => setIsTherapyModalOpen(false)}
                patientId={id}
                onSaveSuccess={fetchTherapies}
            />
        </div>
    );
}