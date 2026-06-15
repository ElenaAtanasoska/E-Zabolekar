import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    FaSyncAlt, FaPlus, FaChevronRight, FaStethoscope,
    FaSnowflake, FaHandPointer, FaThermometerHalf, FaBolt, FaTrash
} from 'react-icons/fa';

const ToothMainInfo = () => {
    const { id, toothId } = useParams();
    const navigate = useNavigate();
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [currentNote, setCurrentNote] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { toothBackendData, setToothBackendData } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [treatments, setTreatments] = useState([]);
    const [showViewTreatmentModal, setShowViewTreatmentModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);

    const handleViewTreatment = async (item) => {
        try {
            if (!item?.treatment_id) return;
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/treatments/${item.treatment_id}/details`);
            if (res.data) {
                setSelectedTreatment(res.data);
                setShowViewTreatmentModal(true);
            }
        } catch (err) {
            console.error("Грешка при влечење детали:", err);
            alert("Не можевме да ги вчитаме деталите за овој третман.");
        }
    };

    const InfoField = ({ label, value }) => (
        <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">{label}</label>
            <p className="text-gray-800 font-medium">{value || "—"}</p>
        </div>
    );

    const [perioData, setPerioData] = useState({
        disto_palatal_pd: 0, disto_palatal_gm: 0,
        palatal_pd: 0, palatal_gm: 0,
        mesio_palatal_pd: 0, mesio_palatal_gm: 0,
        disto_buccal_pd: 0, disto_buccal_gm: 0,
        buccal_pd: 0, buccal_gm: 0,
        mesio_buccal_pd: 0, mesio_buccal_gm: 0
    });

    const [newTreatment, setNewTreatment] = useState({
        title: "",
        description: "",
        status: "завршено",
        notes: "",
        date_performed: new Date().toISOString().split('T')[0]

    });

    const [showColdModal, setShowColdModal] = useState(false);
    const [isMissing, setIsMissing] = useState(false); // Додади го ова
    const [showHeatModal, setShowHeatModal] = useState(false);
    const [showPercussionModal, setShowPercussionModal] = useState(false);
    const [showPalpationModal, setShowPalpationModal] = useState(false);
    const [showElectricModal, setShowElectricModal] = useState(false);
    const [showDeleteTreatmentModal, setShowDeleteTreatmentModal] = useState(false);
    const [treatmentToDelete, setTreatmentToDelete] = useState(null);
    const [coldStep, setColdStep] = useState(1);
    const [coldData, setColdData] = useState({ result: null, detail: null });
    const [heatStep, setHeatStep] = useState(1);
    const [heatData, setHeatData] = useState({ result: null, detail: null });
    const [percussionValue, setPercussionValue] = useState(null);
    const [palpationValue, setPalpationValue] = useState(null);
    const [electricValue, setElectricValue] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/notes?patient_id=${id}`);
                if (res.data && res.data.notes) {
                    setCurrentNote(res.data.notes);
                }
            } catch (err) {
                console.error("Грешка при земање на белешката:", err);
            }
        };

        if (toothId && id) {
            fetchNote();
        }
    }, [toothId, id]);

    const fetchTreatments = async () => {
        try {
            const url = `${import.meta.env.VITE_API_URL}/patients/${id}/tooth/${toothId}/treatments`;
             const res = await axios.get(url);
           
            setTreatments(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Грешка при вчитување на третмани:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && toothId) {
            fetchTreatments();
        }
    }, [id, toothId]);

    useEffect(() => {
        if (toothBackendData?.notes) {
            setCurrentNote(toothBackendData.notes);
        }
    }, [toothBackendData]);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/tests?patient_id=${id}`);
                setElectricValue(res.data.electricity_value);
                setHeatData({ result: res.data.heat_result, detail: res.data.heat_detail });
                setPalpationValue(res.data.palpation);
                setPercussionValue(res.data.percussion);
                setColdData({ result: res.data.cold_result, detail: res.data.cold_detail });
            } catch (err) {
                console.error("Грешка при влечење тестови:", err);
            }
        };
        if (toothId && id) fetchTests();
    }, [toothId, id]);

    useEffect(() => {
        const fetchMissingStatus = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/status`);
                setIsMissing(res.data.is_missing);
            } catch (err) {
                console.error("Грешка при влечење статус:", err);
            }
        };

        if (toothId) fetchMissingStatus();
    }, [toothId]);

    useEffect(() => {
        const fetchPerioData = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/patients/${id}/tooth/${toothId}/periodontal-measurements`);
                if (res.data && res.data.measurements) {
                    const transformed = {};
                    res.data.measurements.forEach(m => {
                        if (m.site_id === 1) {
                            transformed.disto_palatal_pd = m.probing_depth;
                            transformed.disto_palatal_gm = m.gingival_margin;
                        }
                        if (m.site_id === 2) {
                            transformed.palatal_pd = m.probing_depth;
                            transformed.palatal_gm = m.gingival_margin;
                        }
                    });

                    setPerioData(prev => ({ ...prev, ...transformed }));
                }
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        if (toothId && id) fetchPerioData();
    }, [toothId, id]);

    const handleDeleteTreatment = (treatmentId) => {
        setTreatmentToDelete(treatmentId);
        setShowDeleteTreatmentModal(true);
    };

    const confirmDeleteTreatment = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/treatments/${treatmentToDelete}`);
            setTreatments(prev => prev.filter(t => t.treatment_id !== treatmentToDelete));
            setShowDeleteTreatmentModal(false);
            setTreatmentToDelete(null);
        } catch (err) {
            console.error("Грешка при бришење:", err);
            alert("Неуспешно бришење на третманот.");
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'завршено': return 'bg-green-50 text-green-700 border-green-100';
            case 'во тек': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'планирано': return 'bg-gray-50 text-gray-600 border-gray-100';
            default: return 'bg-blue-50 text-[#01506D] border-blue-100';
        }
    };

    const handleDeleteNote = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/notes?patient_id=${id}`, {
                notes: ""
            });
            setCurrentNote("");
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Грешка при бришење:", err);
            alert("Грешка при бришење на белешката");
        }
    };
    const handleMarkMissing = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/missing`);
            alert("Забот е обележан како недостасува");
            window.location.reload();
        } catch (err) {
            console.error("Грешка при ажурирање:", err);
            alert("Неуспешно ажурирање.");
        }
    };

    const handleSaveNotes = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/notes?patient_id=${id}`, {
                notes: currentNote
            });
            setShowNoteModal(false);
        } catch (err) {
            console.error("Грешка при зачувување:", err);
            alert("Грешка при зачувување на белешката");
        }
    };

    const handleSaveElectricity = async (v) => {
        try { await axios.post(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/electricity?patient_id=${id}`, { electricity_value: v }); setElectricValue(v); setShowElectricModal(false); } catch (e) { alert("Грешка"); }
    };

    const handleSaveCold = async (r, d = null) => {
        try { await axios.post(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/cold?patient_id=${id}`, { cold_result: r, cold_detail: d }); setColdData({ result: r, detail: d }); setShowColdModal(false); setColdStep(1); } catch (e) { alert("Грешка"); }
    };

    const handleSaveHeat = async (r, d = null) => {
        try { await axios.post(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/heat?patient_id=${id}`, { heat_result: r, heat_detail: d }); setHeatData({ result: r, detail: d }); setShowHeatModal(false); setHeatStep(1); } catch (e) { alert("Грешка"); }
    };

    const handleSavePalpation = async (v) => {
        try { await axios.post(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/palpation?patient_id=${id}`, { palpation: v }); setPalpationValue(v); setShowPalpationModal(false); } catch (e) { alert("Грешка"); }
    };

    const handleSavePercussion = async (v) => {
        try { await axios.post(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/percussion?patient_id=${id}`, { percussion: v }); setPercussionValue(v); setShowPercussionModal(false); } catch (e) { alert("Грешка"); }
    };

    const displayInfo = {
        title: toothBackendData ? `Заб број ${toothBackendData.tooth_number}` : `Информации за заб ${toothId}`,
        imagePath: toothBackendData?.image ? `/teeth-images/${toothBackendData.image}` : `/teeth-images/default.png`,
        periodontology: { distoPalatal: 0, palatal: 0, mesioPalatal: 2, distoBuccal: 0, buccal: 0, mesioBuccal: 0 }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01506D]"></div>
            </div>
        );
    }

    return (
        <div className="p-10 animate-in fade-in duration-500 relative">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-black text-[#1e293b]">
                    Заб број {toothBackendData?.tooth_number}
                </h1>
                {isMissing && (
                    <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-full">
                        Екстрахиран заб
                    </span>
                )}
                <div className="flex gap-3">
                    <ActionButton
                        label="✕ Недостасува"
                        variant="danger"
                        onClick={handleMarkMissing} // Додади го ова
                    />
                    <ActionButton
                        label="Третман"
                        variant="outline"
                        icon={<FaPlus />}
                        onClick={() => navigate(`/patient/${id}/chart/${toothId}/add-treatment`)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-[#1e293b] flex items-center gap-3">
                        <span className="p-2 bg-blue-50 rounded-lg"><FaStethoscope className="text-[#01506D]" /></span>
                        Историја на третмани
                    </h3>
                    <button
                        onClick={() => navigate(`/patient/${id}/chart/${toothId}/add-treatment`)}
                        className="p-2 bg-[#01506D] text-white rounded-full hover:bg-[#013d54] shadow-lg shadow-blue-100"
                    >
                        <FaPlus size={14} />
                    </button>
                </div>

                <div className="space-y-1 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                    {treatments && treatments.length > 0 ? (
                        treatments.map((item) => (
                            <div
                                key={item.treatment_id}
                                onClick={() => handleViewTreatment(item)}
                                className="flex justify-between items-center py-4 px-4 hover:bg-gray-50 rounded-2xl group cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400 font-bold text-sm w-32">
                                        {new Date(item.date_performed).toLocaleDateString('mk-MK')}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTreatment(item.treatment_id);
                                        }}
                                        className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border uppercase ${getStatusStyles(item.status)}`}>
                                        {item.status}
                                    </span>
                                    <span className="text-[#334155] font-medium">{item.title}</span>
                                </div>

                                <FaChevronRight className="text-gray-200 group-hover:text-gray-400" />
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">Нема евидентирани третмани.</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 h-full">
                    <h3 className="text-lg font-bold text-[#1e293b] mb-6 uppercase tracking-tight">Ендодонтски Тестови</h3>
                    <div className="space-y-2">
                        <TestRow
                            icon={<FaSnowflake className="text-blue-400" />}
                            label="Ладно"
                            value={coldData.result ? (coldData.detail ? `${coldData.result}, ${coldData.detail}` : coldData.result) : "ТЕСТ"}
                            onClick={() => setShowColdModal(true)}
                        />
                        <TestRow
                            icon={<FaHandPointer className="text-gray-400" />}
                            label="Перкусија"
                            value={percussionValue || "ТЕСТ"}
                            onClick={() => setShowPercussionModal(true)}
                        />
                        <TestRow
                            icon={<FaHandPointer className="text-gray-400" />}
                            label="Палпација"
                            value={palpationValue || "ТЕСТ"}
                            onClick={() => setShowPalpationModal(true)}
                        />
                        <TestRow
                            icon={<FaThermometerHalf className="text-orange-400" />}
                            label="Топло"
                            value={heatData.result ? (heatData.detail ? `${heatData.result}, ${heatData.detail}` : heatData.result) : "ТЕСТ"}
                            onClick={() => setShowHeatModal(true)}
                        />
                        <TestRow
                            icon={<FaBolt className="text-yellow-400" />}
                            label="Електричен тест"
                            value={electricValue !== null ? electricValue.toString() : "ТЕСТ"}
                            onClick={() => setShowElectricModal(true)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#1e293b] uppercase tracking-tight">Белешки</h3>

                        <div className="flex gap-2">
                            {currentNote && (
                                <button
                                    onClick={handleDeleteNote}
                                    className="text-red-400 hover:bg-red-50 p-2 rounded-full transition-all"
                                    title="Избриши белешка"
                                >
                                    <FaTrash size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => setShowNoteModal(true)}
                                className="text-[#01506D] hover:bg-blue-50 p-2 rounded-full transition-all"
                            >
                                <FaPlus size={14} />
                            </button>
                        </div>

                    </div>

                    <div className="flex-grow">
                        <p className={`text-sm  whitespace-pre-line leading-relaxed ${currentNote ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                            {currentNote || "Нема внесено белешка. Кликнете на + за да додадете..."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#1e293b]">Пародонтологија</h3>
                    <button
                        onClick={() => navigate(`/patient/${id}/chart/${toothId}/periodontic-flow`)}
                        className="flex items-center gap-2 text-[#00a3e0] font-bold uppercase text-xs hover:opacity-80 transition-all"
                    >
                        <div className="border-2 border-[#00a3e0] rounded-full p-0.5">
                            <FaPlus size={8} />
                        </div>
                        Пародонтално сондирање
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <PocketItem label="Disto Palatal" value={perioData.disto_palatal_pd} subValue={perioData.disto_palatal_gm} />
                    <PocketItem label="Palatal" value={perioData.palatal_pd} subValue={perioData.palatal_gm} />
                    <PocketItem label="Mesio Palatal" value={perioData.mesio_palatal_pd} subValue={perioData.mesio_palatal_gm} />
                    <PocketItem label="Disto Buccal" value={perioData.disto_buccal_pd} subValue={perioData.disto_buccal_gm} />
                    <PocketItem label="Buccal" value={perioData.buccal_pd} subValue={perioData.buccal_gm} />
                    <PocketItem label="Mesio Buccal" value={perioData.mesio_buccal_pd} subValue={perioData.mesio_buccal_gm} />
                </div>
            </div>

            {showElectricModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[320px] shadow-2xl">
                        <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">Електричен тест (1-10)</h3>
                        <div className="grid grid-cols-5 gap-2 mb-6">
                            {[...Array(10)].map((_, i) => (
                                <button key={i + 1} onClick={() => handleSaveElectricity(i + 1)} className={`p-3 rounded-xl font-bold transition-all ${electricValue === i + 1 ? 'bg-[#01506D] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>{i + 1}</button>
                            ))}
                        </div>
                        <button onClick={() => setShowElectricModal(false)} className="w-full py-3 text-gray-400 font-medium hover:text-gray-600">Откажи</button>
                    </div>
                </div>
            )}

            {showViewTreatmentModal && selectedTreatment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[500px] shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-[#01506D] mb-6">Детали за третманот</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoField label="Дијагноза" value={selectedTreatment.diagnosis} />
                            <InfoField label="Тип на интервенција" value={selectedTreatment.intervention_type} />
                            <InfoField label="Засегнати површини" value={selectedTreatment.surfaces} />
                            <InfoField label="Материјал" value={selectedTreatment.material} />
                            <InfoField label="Квалитет / Состојба" value={selectedTreatment.quality_condition} />
                            <InfoField label="Маргинална адаптација" value={selectedTreatment.marginal_adaptation} />
                        </div>
                        <div className="mt-6">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Дополнителни белешки</label>
                            <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-xl mt-1">
                                {selectedTreatment.notes || "Нема белешки."}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowViewTreatmentModal(false)}
                            className="w-full mt-8 py-3 bg-[#01506D] text-white font-bold rounded-2xl hover:bg-[#013d54] transition-all"
                        >
                            Затвори
                        </button>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[350px] shadow-2xl">
                        <h3 className="font-bold text-gray-800 mb-2">Избриши белешка</h3>
                        <p className="text-gray-500 mb-6 text-sm">Дали сте сигурни дека сакате трајно да ја избришете оваа белешка? <br></br>Оваа акција не може да се врати.</p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600"
                            >
                                Откажи
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600"
                            >
                                Избриши
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showColdModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[380px] shadow-2xl">
                        <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">Тест на ладно</h3>
                        {coldStep === 1 ? (
                            <div className="flex flex-col gap-2">
                                {["Позитивно", "Негативно", "Неизвесно", "Не е применливо"].map((option) => (
                                    <button key={option} onClick={() => (option === "Позитивно" || option === "Не е применливо") ? setColdStep(option === "Позитивно" ? 2 : 3) : handleSaveCold(option)} className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 border border-gray-100 transition-all">{option}</button>
                                ))}
                            </div>
                        ) : coldStep === 2 ? (
                            <div className="flex flex-col gap-2 animate-in slide-in-from-right duration-300">
                                <p className="text-[10px] text-blue-500 font-black mb-2 uppercase text-center tracking-widest">Детали:</p>
                                {["Во нормални граници", "Непријатно", "Болен стимул", "Продолжена болка"].map((detail) => (
                                    <button key={detail} onClick={() => handleSaveCold("Позитивно", detail)} className="w-full py-3 bg-blue-50 hover:bg-blue-100 rounded-2xl font-bold text-blue-700 text-sm border border-blue-100 transition-all">{detail}</button>
                                ))}
                                <button onClick={() => setColdStep(1)} className="mt-4 text-gray-400 text-xs font-bold uppercase">← Назад</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 animate-in slide-in-from-right duration-300">
                                {["Постоечки третман на коренски канал", "Претходно започната терапија"].map((detail) => (
                                    <button key={detail} onClick={() => handleSaveCold("Не е применливо", detail)} className="w-full py-3 bg-orange-50 hover:bg-orange-100 rounded-2xl font-bold text-orange-700 text-sm border border-orange-100 transition-all">{detail}</button>
                                ))}
                                <button onClick={() => setColdStep(1)} className="mt-4 text-gray-400 text-xs font-bold uppercase">← Назад</button>
                            </div>
                        )}
                        <button onClick={() => setShowColdModal(false)} className="w-full mt-4 py-2 text-gray-400 text-xs font-bold uppercase">Откажи</button>
                    </div>
                </div>
            )}

            {showNoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[400px] shadow-2xl">
                        <h3 className="font-bold text-gray-800 mb-4">Додај белешка</h3>
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-4 focus:ring-2 focus:ring-[#01506D] outline-none"
                            placeholder="Внесете текст..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="flex-1 py-3 text-gray-400 font-bold"
                            >
                                Откажи
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                className="flex-1 py-3 bg-[#01506D] text-white rounded-2xl font-bold"
                            >
                                Зачувај
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHeatModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[380px] shadow-2xl">
                        <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">Тест на топло</h3>
                        <div className="flex flex-col gap-2">
                            {["Позитивно", "Негативно", "Неизвесно"].map((option) => (
                                <button key={option} onClick={() => handleSaveHeat(option)} className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 border border-gray-100 transition-all">{option}</button>
                            ))}
                        </div>
                        <button onClick={() => setShowHeatModal(false)} className="w-full mt-4 py-2 text-gray-400 text-xs font-bold uppercase">Откажи</button>
                    </div>
                </div>
            )}

            {showPalpationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[380px] shadow-2xl">
                        <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">Палпација</h3>
                        <div className="flex flex-col gap-2">
                            {["Нормално", "Чувствително", "Болно"].map((option) => (
                                <button key={option} onClick={() => handleSavePalpation(option)} className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 border border-gray-100 transition-all">{option}</button>
                            ))}
                        </div>
                        <button onClick={() => setShowPalpationModal(false)} className="w-full mt-4 py-2 text-gray-400 text-xs font-bold uppercase">Откажи</button>
                    </div>
                </div>
            )}

            {showDeleteTreatmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[350px] shadow-2xl">
                        <h3 className="font-bold text-gray-800 mb-2">Избриши третман</h3>
                        <p className="text-gray-500 mb-6 text-sm">Дали сте сигурни дека сакате трајно да го избришете овој третман?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteTreatmentModal(false)}
                                className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600"
                            >
                                Откажи
                            </button>
                            <button
                                onClick={confirmDeleteTreatment}
                                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600"
                            >
                                Избриши
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPercussionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-8 rounded-[32px] w-[380px] shadow-2xl">
                        <h3 className="text-center font-bold text-gray-800 mb-6 text-lg">Перкусија</h3>
                        <div className="flex flex-col gap-2">
                            {["Нормално", "Чувствително", "Болно"].map((option) => (
                                <button key={option} onClick={() => handleSavePercussion(option)} className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700 border border-gray-100 transition-all">{option}</button>
                            ))}
                        </div>
                        <button onClick={() => setShowPercussionModal(false)} className="w-full mt-4 py-2 text-gray-400 text-xs font-bold uppercase">Откажи</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionButton = ({ icon, label, variant, onClick }) => { // 1. Додади onClick тука
    const styles = {
        danger: "border-red-200 text-red-500 hover:bg-red-50",
        outline: "border-[#01506D] text-[#01506D] hover:bg-blue-50",
        default: "border-gray-200 text-gray-600 hover:bg-gray-50"
    };

    return (
        <button
            onClick={onClick} // 2. Додади го onClick тука
            className={`flex items-center gap-2 px-5 py-2.5 border rounded-2xl font-bold text-sm transition-all bg-white ${styles[variant] || styles.default}`}
        >
            {icon} {label}
        </button>
    );
};

const TestRow = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-xl cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="w-5 flex justify-center">{icon}</div>
            <span className="text-gray-600 font-semibold text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[#01506D] text-[10px] font-black uppercase text-right leading-tight max-w-[120px] break-words">
                {value}
            </span>
            <FaChevronRight size={10} className="text-gray-200 group-hover:text-gray-400" />
        </div>
    </div>
);



const PocketItem = ({ label, value, subValue }) => (
    <div className="flex flex-col items-center justify-center border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow group">
        <span className="text-4xl font-light text-gray-400 group-hover:text-[#01506D] transition-colors mb-2">
            {value}
        </span>
        <div className="w-full flex items-center justify-center relative my-2">
            <div className="w-full h-[1px] bg-gray-200"></div>
            <div className="absolute bg-white px-3 py-0.5 rounded-full border border-gray-200">
                <span className="text-xs font-bold text-gray-400">{subValue}</span>
            </div>
        </div>
        <span className="text-[11px] uppercase text-gray-500 font-bold mt-2 tracking-wide text-center">
            {label}
        </span>
    </div>
);

export default ToothMainInfo;