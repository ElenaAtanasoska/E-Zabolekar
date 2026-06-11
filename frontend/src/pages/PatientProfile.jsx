import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import { FaSearch, FaUserCircle, FaArrowLeft, FaMinusCircle } from "react-icons/fa";
import maleAvatar from "../assets/male.png";
import femaleAvatar from "../assets/female.png";

export default function PatientProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingIndices, setIsEditingIndices] = useState(false);
    const [tempPlaque, setTempPlaque] = useState(0);
    const [tempBleeding, setTempBleeding] = useState(0);
    const [isEditingEmergency, setIsEditingEmergency] = useState(false);
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencySurname, setEmergencySurname] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");

    const [isEditingVisit, setIsEditingVisit] = useState(false);
    const [nextVisitDate, setNextVisitDate] = useState("");
    const [nextVisitDesc, setNextVisitDesc] = useState("");

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editGender, setEditGender] = useState("");
    const [editBirthDate, setEditBirthDate] = useState("");
    const [editBloodType, setEditBloodType] = useState("");

    const firstName = localStorage.getItem("first_name") || "Доктор";
    const lastName = localStorage.getItem("last_name") || "";
    const formattedName = lastName ? `${lastName.charAt(0)}.` : "";

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8000/patients/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data;
                setPatient(data);

                setTempPlaque(data.plaque_index || 0);
                setTempBleeding(data.bleeding_index || 0);
                setEmergencyName(data.emergency_contact_name || "");
                setEmergencySurname(data.emergency_contact_surname || "");
                setEmergencyPhone(data.emergency_contact_phone || "");
                setNextVisitDate(data.next_visit || "");
                setNextVisitDesc(data.next_visit_description || "");
                setEditFirstName(data.first_name || "");
                setEditLastName(data.last_name || "");
                setEditGender(data.gender || "");
                setEditBirthDate(data.birth_date || "");
                setEditBloodType(data.blood_type || "");
            } catch (error) {
                console.error("Грешка при влечење податоци:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatientData();
    }, [id]);

    const handleSaveIndices = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/patients/${id}/indices`, null, {
                params: { plaque_index: tempPlaque, bleeding_index: tempBleeding },
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatient({ ...patient, plaque_index: tempPlaque, bleeding_index: tempBleeding });
            setIsEditingIndices(false);
        } catch (error) {
            alert("Грешка при зачувување на индексите.");
        }
    };

    const handleSaveEmergency = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/patients/${id}/emergency-contact`, {
                name: emergencyName,
                surname: emergencySurname,
                phone: emergencyPhone
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPatient({
                ...patient,
                emergency_contact_name: emergencyName,
                emergency_contact_surname: emergencySurname,
                emergency_contact_phone: emergencyPhone
            });
            setIsEditingEmergency(false);
        } catch (error) {
            alert("Грешка при ажурирање на контактот.");
        }
    };

    const handleSaveVisit = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/patients/${id}/next-visit`, {
                next_visit: nextVisitDate,
                next_visit_description: nextVisitDesc
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPatient({
                ...patient,
                next_visit: nextVisitDate,
                next_visit_description: nextVisitDesc
            });
            setIsEditingVisit(false);
        } catch (error) {
            alert("Грешка при зачувување на посетата.");
        }
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:8000/patients/${id}`, {
                first_name: editFirstName,
                last_name: editLastName,
                gender: editGender,
                birth_date: editBirthDate,
                blood_type: editBloodType
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPatient({
                ...patient,
                first_name: editFirstName,
                last_name: editLastName,
                gender: editGender,
                birth_date: editBirthDate,
                blood_type: editBloodType
            });
            setIsEditingProfile(false);
        } catch (error) {
            alert("Грешка при ажурирање на профилот.");
        }
    };

    const getIndexColor = (value, currentStep) => {
        if (currentStep > value) return "bg-gray-100";
        if (value <= 2) return "bg-[#9ACD32]";
        if (value === 3) return "bg-[#00A3C1]";
        if (value === 4) return "bg-[#FFD700]";
        if (value === 5) return "bg-[#FF4500]";
        return "bg-gray-100";
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Се вчитува...</div>;
    if (!patient) return <div className="p-10">Пациентот не е пронајден.</div>;

    const age = new Date().getFullYear() - new Date(patient.birth_date).getFullYear();

    return (
        <div className="flex h-screen w-screen bg-[#F3F4F6] overflow-hidden">
            <Sidebar />
            <div className="flex-grow flex flex-col h-full overflow-hidden">
                <div className="h-20 bg-white shadow-sm flex items-center justify-between px-10 shrink-0">
                    <button onClick={() => navigate("/dashboard")} className="hover:text-[#00A3C1] transition-colors">
                        <FaArrowLeft size={18} />
                    </button>
                    <div className="relative w-1/2">
                        <input type="text" placeholder="Пребарај..." className="w-full bg-gray-50 rounded-lg py-2 px-12 outline-none focus:ring-1 focus:ring-gray-200" />
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3 pl-10">
                        <span className="font-medium text-gray-800 text-sm">Д-р {firstName} {formattedName}</span>
                        <FaUserCircle className="text-4xl text-gray-300" />
                    </div>
                </div>

                <div className="p-8 flex flex-col flex-grow space-y-6 overflow-y-auto">
                    <h1 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase">Податоци за пациент</h1>
                    <div className="bg-white rounded-2xl p-8 shadow-md flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-8">
                            <img
                                src={patient.image || (patient.gender === "Машки" ? maleAvatar : femaleAvatar)}
                                className="w-28 h-28 rounded-full object-cover border-4 border-gray-50 shadow-sm" alt="Patient"
                            />
                            <div className="flex flex-col space-y-2">
                                <h2 className="text-xl font-black tracking-tight text-gray-800">{patient.first_name} {patient.last_name}</h2>
                                <div className="space-y-1">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Број на досие: <span className="text-black ml-2 font-black">{patient.file_number}</span></p>
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Години: <span className="text-black ml-2 font-black">{age}</span></p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setEditFirstName(patient.first_name || "");
                                setEditLastName(patient.last_name || "");
                                setEditGender(patient.gender || "");
                                setEditBirthDate(patient.birth_date || "");
                                setEditBloodType(patient.blood_type || "");
                                setIsEditingProfile(true);
                            }}
                            className="bg-[#01506d] text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#008ba5] transition-all shadow-lg shadow-[#01506d]/20"
                        >
                            Измени Профил
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-6 flex-grow pb-4">
                        <div className="col-span-3 bg-white rounded-2xl p-7 shadow-md border border-gray-50 flex flex-col">
                            <h3 className="font-black text-[11px] tracking-widest uppercase mb-8 text-gray-400 border-b pb-3">Информации</h3>
                            <div className="space-y-6 text-[13px] font-bold flex-grow">
                                <p className="text-gray-400 uppercase tracking-tight">Пол: <span className="text-black ml-2">{patient.gender}</span></p>
                                <p className="text-gray-400 uppercase tracking-tight">Датум на раѓање: <span className="text-black ml-2">{patient.birth_date}</span></p>
                                <p className="text-gray-400 uppercase tracking-tight">Крвна група: <span className=" ml-2 text-red-600">{patient.blood_type}</span></p>
                                <p className="text-gray-400 uppercase tracking-tight">Матичен доктор: <span className="text-black">д-р {patient.doctor?.first_name} {patient.doctor?.last_name}</span></p>
                            </div>
                        </div>

                        <div className="col-span-3 bg-white rounded-2xl p-7 shadow-md border border-gray-50 flex flex-col">
                            <div className="flex justify-between items-center mb-8 border-b pb-3">
                                <h3 className="font-black text-[11px] tracking-widest uppercase text-gray-400">Орално здравје</h3>
                                <button onClick={() => setIsEditingIndices(true)} className="text-[#00A3C1] text-[10px] font-black uppercase hover:underline tracking-tighter">Уреди</button>
                            </div>
                            <div className="space-y-12 flex-grow">
                                <div>
                                    <p className="text-[11px] font-black mb-4 text-gray-500 uppercase tracking-widest">Индекс на плак</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <div key={num} className={`h-2 w-full rounded-full transition-all duration-500 ${getIndexColor(patient.plaque_index, num)}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black mb-4 text-gray-500 uppercase tracking-widest">Индекс на крварење</p>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <div key={num} className={`h-2 w-full rounded-full transition-all duration-500 ${getIndexColor(patient.bleeding_index, num)}`}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 bg-white rounded-2xl p-7 shadow-md border border-gray-50 flex flex-col">
                            <div className="flex justify-between items-center mb-8 border-b pb-3">
                                <h3 className="font-black text-[11px] tracking-widest uppercase text-gray-400">Контакт за итни случаи</h3>
                                <button onClick={() => setIsEditingEmergency(true)} className="text-[#00A3C1] text-[10px] font-black uppercase hover:underline tracking-tighter">Уреди</button>
                            </div>
                            <div className="flex-grow flex flex-col justify-center text-center space-y-3">
                                <p className="text-lg font-black text-gray-800">
                                    {patient.emergency_contact_name || "Нема"} {patient.emergency_contact_surname || ""}
                                </p>
                                <p className="text-sm font-bold text-[#00A3C1] bg-[#00A3C1]/5 py-2 rounded-lg italic">
                                    {patient.emergency_contact_phone || "Нема број"}
                                </p>
                            </div>
                        </div>

                        <div className="col-span-3 flex flex-col gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-50 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-black text-[10px] tracking-widest uppercase text-gray-400">Последна посета</h3>
                                    <button className="text-[#00A3C1] text-[10px] font-black uppercase">Детали</button>
                                </div>
                                <p className="text-xl font-black italic text-gray-800">15.01.2026</p>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">Пломбирање</p>
                            </div>
                            <div className="bg-[#01506d] rounded-2xl p-6 shadow-lg flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-black text-[10px] tracking-widest uppercase text-white/70">Наредна посета</h3>
                                    <button
                                        onClick={() => setIsEditingVisit(true)}
                                        className="text-white text-[10px] font-black uppercase border border-white/30 px-2 py-0.5 rounded shadow-sm hover:bg-white/10 transition"
                                    >
                                        Уреди
                                    </button>
                                </div>
                                <p className="text-xl font-black italic text-white">
                                    {patient.next_visit ? (() => {
                                        const d = new Date(patient.next_visit);
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const year = d.getFullYear();
                                        return `${day}.${month}.${year}`;
                                    })() : "Нема датум"}
                                </p>
                                <p className="text-[10px] text-white/80 font-black uppercase tracking-tighter mt-1">
                                    {patient.next_visit_description || "Без опис"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditingIndices && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-black text-[#2D3748] mb-8 border-b pb-4 uppercase tracking-tight">Уреди орално здравје</h2>
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#718096] uppercase tracking-widest">Индекс на плак</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-1 gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button key={num} onClick={() => setTempPlaque(num)}
                                                className={`h-12 flex-1 rounded-xl font-bold text-lg transition-all transform active:scale-95
                                                    ${tempPlaque === num ? getIndexColor(tempPlaque, num) + ' text-white shadow-lg scale-105' : 'bg-[#EDF2F7] text-[#A0AEC0] hover:bg-gray-200'}
                                                `}> {num} </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setTempPlaque(0)} className="text-[#E53E3E] hover:scale-110 transition-transform"><FaMinusCircle size={22} /></button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#718096] uppercase tracking-widest">Индекс на крвавење</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-1 gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button key={num} onClick={() => setTempBleeding(num)}
                                                className={`h-12 flex-1 rounded-xl font-bold text-lg transition-all transform active:scale-95
                                                    ${tempBleeding === num ? getIndexColor(tempBleeding, num) + ' text-white shadow-lg scale-105' : 'bg-[#EDF2F7] text-[#A0AEC0] hover:bg-gray-200'}
                                                `}> {num} </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setTempBleeding(0)} className="text-[#E53E3E] hover:scale-110 transition-transform"><FaMinusCircle size={22} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-12">
                            <button onClick={() => setIsEditingIndices(false)} className="flex-1 py-4 bg-[#F7FAFC] text-[#4A5568] font-bold rounded-xl hover:bg-[#EDF2F7]">Откажи</button>
                            <button onClick={handleSaveIndices} className="flex-1 py-4 bg-[#00A3C1] text-white font-bold rounded-xl hover:bg-[#008ba5] shadow-lg shadow-[#00A3C1]/30">Зачувај промени</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingEmergency && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-black text-[#2D3748] mb-6 border-b pb-4 uppercase tracking-tight">Уреди контакт</h2>
                        <div className="space-y-5">
                            <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none" placeholder="Име" />
                            <input type="text" value={emergencySurname} onChange={(e) => setEmergencySurname(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none" placeholder="Презиме" />
                            <input type="text" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none" placeholder="Телефон" />
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={() => setIsEditingEmergency(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl">Откажи</button>
                            <button onClick={handleSaveEmergency} className="flex-1 py-3 bg-[#00A3C1] text-white font-bold rounded-xl shadow-lg shadow-[#00A3C1]/30">Зачувај</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingVisit && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-black text-[#2D3748] mb-6 border-b pb-4 uppercase tracking-tight">Закажи наредна посета</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-black text-[#718096] uppercase tracking-widest block mb-2">Датум на посета</label>
                                <input
                                    type="date"
                                    value={nextVisitDate}
                                    onChange={(e) => setNextVisitDate(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-[#00A3C1] font-bold text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-black text-[#718096] uppercase tracking-widest block mb-2">Опис на интервенција</label>
                                <textarea
                                    value={nextVisitDesc}
                                    onChange={(e) => setNextVisitDesc(e.target.value)}
                                    placeholder="Пр: Пломбирање на 36..."
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-[#00A3C1] font-bold text-gray-700 h-28 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setIsEditingVisit(false)}
                                className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-gray-500 hover:bg-gray-200 transition"
                            >
                                Откажи
                            </button>
                            <button
                                onClick={handleSaveVisit}
                                className="flex-1 py-3 bg-[#00A3C1] text-white font-bold rounded-xl shadow-lg shadow-[#00A3C1]/30 hover:bg-[#008ba5] transition"
                            >
                                Зачувај
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingProfile && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-black text-[#2D3748] mb-6 border-b pb-4 uppercase tracking-tight">Измени податоци на пациент</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Име</label>
                                <input type="text" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-[#00A3C1]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Презиме</label>
                                <input type="text" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-[#00A3C1]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Пол</label>
                                <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-[#00A3C1] font-bold">
                                    <option value="Машки">Машки</option>
                                    <option value="Женски">Женски</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Крвна група</label>
                                <select
                                    value={editBloodType}
                                    onChange={(e) => setEditBloodType(e.target.value)}
                                    className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-[#00A3C1] font-bold"
                                >
                                    
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="0+">0+</option>
                                    <option value="0-">0-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Датум на раѓање</label>
                                <input type="date" value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-[#00A3C1]" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl text-gray-500 hover:bg-gray-200 transition">Откажи</button>
                            <button onClick={handleSaveProfile} className="flex-1 py-3 bg-[#0a3d4f] text-white font-bold rounded-xl shadow-lg shadow-[#0a3d4f]/30 hover:bg-[#072b38] transition">Зачувај</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}