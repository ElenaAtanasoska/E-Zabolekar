import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Outlet } from 'react-router-dom';
import Sidebar from "./Sidebar";
import ToothAnatomyView from "./ToothAnatomyView";

const ToothDetail = () => {
    const { id, toothId } = useParams();
    const [toothBackendData, setToothBackendData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [treatments, setTreatments] = useState([]);
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTreatmentId, setCurrentTreatmentId] = useState(null);
    const [newTreatment, setNewTreatment] = useState({
        title: "",
        description: "",
        status: "завршено",
        notes: "",
        date_performed: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchToothInfo = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/teeth/${toothId}/image?patient_id=${id}`);
                setToothBackendData(response.data);
            } catch (error) {
                console.error("Грешка при влечење на податоците:", error);
            } finally {
                setLoading(false);
            }
        };
        if (toothId && id) fetchToothInfo();
    }, [toothId, id]);

    const fetchTreatments = async () => {
        try {
            // Додади го "/treatments" бидејќи тоа е префиксот на рутерот
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

    const handleSaveTreatment = async () => {
        try {
            if (isEditing) {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/patients/treatments/${currentTreatmentId}`, newTreatment);
                setTreatments(prev => prev.map(t => t.treatment_id === currentTreatmentId ? response.data : t));
            } else {
                const toothNum = toothBackendData?.tooth_number;
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/patients/${id}/teeth-number/${toothNum}/treatments`, newTreatment);
                setTreatments(prev => [response.data, ...prev]);
            }
            setShowTreatmentModal(false);
            setIsEditing(false);
            setNewTreatment({
                title: "", description: "", status: "завршено", notes: "",
                date_performed: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            alert("Грешка при зачувување на третманот");
        }
    };

    const displayInfo = {
        imagePath: toothBackendData?.image ? `/teeth-images/${toothBackendData.image}` : `/teeth-images/default.png`,
        toothNumber: toothBackendData?.tooth_number || toothId
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01506D]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex overflow-hidden">
                <ToothAnatomyView
                    imagePath={displayInfo.imagePath}
                    toothNumber={displayInfo.toothNumber}
                />
                <div className="flex-1 overflow-y-auto">
                    <Outlet context={{
                        toothBackendData,
                        treatments,
                        setTreatments,
                        setShowTreatmentModal
                    }} />
                </div>
            </main>

            {showTreatmentModal && (
                <div className="fixed inset-0 bg-[#1e293b]/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white p-8 rounded-[35px] w-full max-w-[600px] shadow-2xl">
                        <h3 className="text-2xl font-black text-[#1e293b] mb-6">
                            {isEditing ? "Измени третман" : "Додај третман"}
                        </h3>
                        <div className="space-y-4">
                            <input
                                className="w-full p-3.5 bg-gray-50/80 rounded-2xl border-2 border-transparent focus:border-[#01506D] outline-none font-semibold"
                                value={newTreatment.title}
                                onChange={(e) => setNewTreatment({ ...newTreatment, title: e.target.value })}
                                placeholder="Наслов на интервенција..."
                            />
                            <textarea
                                className="w-full p-3.5 bg-gray-50/80 rounded-2xl border-2 border-transparent focus:border-[#01506D] outline-none font-semibold resize-none"
                                rows="3"
                                value={newTreatment.description}
                                onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                                placeholder="Опис на третманот..."
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="p-3.5 bg-gray-50/80 rounded-2xl border-2 border-transparent focus:border-[#01506D] font-bold"
                                    value={newTreatment.status}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, status: e.target.value })}
                                >
                                    <option value="завршено">Завршено</option>
                                    <option value="во тек">Во тек</option>
                                    <option value="планирано">Планирано</option>
                                </select>
                                <input
                                    type="date"
                                    className="p-3.5 bg-gray-50/80 rounded-2xl border-2 border-transparent focus:border-[#01506D] font-bold"
                                    value={newTreatment.date_performed}
                                    onChange={(e) => setNewTreatment({ ...newTreatment, date_performed: e.target.value })}
                                />
                            </div>
                            <button
                                onClick={handleSaveTreatment}
                                className="w-full py-4 bg-[#01506D] text-white rounded-2xl font-black hover:bg-[#013d54] transition-all"
                            >
                                Зачувај
                            </button>
                            <button
                                onClick={() => {
                                    setShowTreatmentModal(false);
                                    setIsEditing(false);
                                }}
                                className="w-full py-2 text-gray-400 font-bold"
                            >
                                Откажи
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToothDetail;