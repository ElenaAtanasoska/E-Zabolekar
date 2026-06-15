import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaTimes, FaVolumeMute, FaSave } from 'react-icons/fa';

const PeriodonticFlow = () => {
    const { id, toothId } = useParams();
    const siteLabels = [
        "Дисто-лингвално (Задно-јазично)", "Лингвално (Јазично)", "Мезио-лингвално (Предно-јазично)",
        "Дисто-букално  (Задно-образно)", "Букално (Образно)", "Мезио-букално (Предно-образно)"
    ];

    const [activeSiteIndex, setActiveSiteIndex] = useState(0);
    const [measurements, setMeasurements] = useState(
        siteLabels.map(() => ({ probing_depth: 0, gingival_margin: 0 }))
    );

    const [bleeding, setBleeding] = useState(false);
    const [plaque, setPlaque] = useState(false);
    const [pus, setPus] = useState(false);
    const [tartar, setTartar] = useState(false);
    const [furcation, setFurcation] = useState(null);
    const [mobility, setMobility] = useState(null);

    useEffect(() => {
        const fetchSavedData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/patients/${id}/tooth/${toothId}/periodontal-measurements`
                );
                const { record_details, measurements: savedMeasurements } = response.data;

                if (savedMeasurements && savedMeasurements.length > 0) {
                    const updatedMeasurements = siteLabels.map((_, index) => {
                        const found = savedMeasurements.find(m => m.site_id === index + 1);
                        return found
                            ? { probing_depth: found.probing_depth, gingival_margin: found.gingival_margin }
                            : { probing_depth: 0, gingival_margin: 0 };
                    });
                    setMeasurements(updatedMeasurements);
                }

                setBleeding(record_details.bleeding || false);
                setPlaque(record_details.plaque || false);
                setPus(record_details.pus || false);
                setTartar(record_details.tartar || false);
                setFurcation(record_details.furcation || null);
                setMobility(record_details.mobility || null);

            } catch (err) {
                console.log("No existing record found for this tooth.");
            }
        };

        if (id && toothId) fetchSavedData();
    }, [id, toothId]);

    const updateActiveValue = (type, value) => {
        const updated = [...measurements];
        updated[activeSiteIndex][type] = value;
        setMeasurements(updated);
    };

    const handleSave = async () => {
        const payload = {
            tooth_id: parseInt(toothId),
            bleeding: bleeding,
            plaque: plaque,
            pus: pus,
            tartar: tartar,
            furcation: furcation,
            mobility: mobility,
            measurements: measurements.map((m, index) => ({
                site_id: index + 1,
                probing_depth: m.probing_depth,
                gingival_margin: m.gingival_margin
            }))
        };

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/patients/${id}/chart/${toothId}/periodontic-flow`, payload);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 bg-white min-h-screen text-slate-600 font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-light text-slate-400">Пародонтологија</h1>
                    <p className="text-xs text-slate-400 uppercase mt-1 tracking-widest">ЗАБ БРОЈ: {toothId || '18'}</p>
                </div>
                <div className="flex gap-4 text-slate-400">
                    <FaTimes size={20} className="cursor-pointer hover:text-slate-600" onClick={() => window.history.back()} />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
                {siteLabels.map((label, index) => (
                    <SummaryCard
                        key={index}
                        label={label}
                        value={measurements[index].probing_depth}
                        subValue={measurements[index].gingival_margin}
                        active={activeSiteIndex === index}
                        onClick={() => setActiveSiteIndex(index)}
                        indicators={{
                            bleeding,
                            plaque,
                            pus,
                            tartar
                        }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Длабочина на сондирање</h3>
                    <div className="grid grid-cols-5 gap-px bg-slate-200 border border-slate-200 rounded shadow-sm overflow-hidden">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, '>12', ''].map((val) => (
                            <GridButton
                                key={val}
                                value={val}
                                active={measurements[activeSiteIndex].probing_depth === val}
                                onClick={() => updateActiveValue('probing_depth', val)}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Гингивален раб (ниво на непцето)</h3>
                    <div className="grid grid-cols-5 gap-px bg-slate-200 border border-slate-200 rounded shadow-sm overflow-hidden">
                        {[0, -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, '<-12', '+/-'].map((val) => (
                            <GridButton
                                key={val}
                                value={val}
                                active={measurements[activeSiteIndex].gingival_margin === val}
                                onClick={() => updateActiveValue('gingival_margin', val)}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                <IndicatorButton label="Крвавење" dotColor="bg-red-500" active={bleeding} onClick={() => setBleeding(!bleeding)} />
                <IndicatorButton label="Забен плак" dotColor="bg-blue-500" active={plaque} onClick={() => setPlaque(!plaque)} />
                <IndicatorButton label="Гној" dotColor="bg-yellow-400" active={pus} onClick={() => setPus(!pus)} />
                <IndicatorButton label="Забен камен" dotColor="bg-slate-400" active={tartar} onClick={() => setTartar(!tartar)} />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Фуркација (зафатеност на коренското разгранување)</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {["Стадиум 1", "Стадиум 2", "Стадиум 3"].map((s, i) => (
                            <SelectionButton
                                key={s}
                                label={s}
                                symbol={["^", "Δ", "▲"][i]}
                                active={furcation === s}
                                onClick={() => setFurcation(furcation === s ? null : s)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">Мобилност на заб</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {["Класа 1", "Класа 2", "Класа 3"].map((c, i) => (
                            <SelectionButton
                                key={c}
                                label={c}
                                symbol={["< >", "« »", "«»"][i]}
                                active={mobility === c}
                                onClick={() => setMobility(mobility === c ? null : c)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-[#0a3d4f] hover:bg-[#0a3d4f] text-white font-bold py-3 px-10 rounded flex items-center gap-2 shadow-lg transition-all transform active:scale-95"
                >
                    <FaSave /> ЗАЧУВАЈ ПОДАТОЦИ
                </button>
            </div>
        </div>
    );
};


const SummaryCard = ({ label, value, subValue, active, onClick, indicators }) => (
    <div
        onClick={onClick}
        className={`bg-white p-4 rounded border-2 transition-all cursor-pointer flex flex-col items-center relative ${active ? 'border-slate-400 shadow-md ring-1 ring-slate-200' : 'border-slate-100 hover:border-slate-200'
            }`}
    >
        <div className="absolute top-2 right-2 flex gap-0.5">
            {indicators?.bleeding && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
            {indicators?.plaque && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
            {indicators?.pus && <span className="w-2 h-2 rounded-full bg-yellow-400"></span>}
            {indicators?.tartar && <span className="w-2 h-2 rounded-full bg-slate-400"></span>}
        </div>
        <span className="text-4xl font-light text-slate-700">{value}</span>
        <div className="w-12 h-px bg-slate-200 my-2 relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] text-slate-400 border border-slate-100 rounded-full">
                {subValue}
            </span>
        </div>

        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center leading-tight">
            {label}
        </span>
    </div>
);

const GridButton = ({ value, active, onClick }) => (
    <button
        onClick={onClick}
        className={`py-4 text-[14px] font-medium transition-all ${active ? 'bg-slate-500 text-white shadow-inner' : 'bg-[#f8fafd] text-[#2b6be6] hover:bg-white'
            }`}
    >
        {value}
    </button>
);

const IndicatorButton = ({ label, dotColor, active, onClick }) => (
    <button
        onClick={onClick}
        className={`py-4 rounded border flex items-center justify-center relative transition-all ${active ? 'bg-white border-slate-300 shadow-sm' : 'bg-[#f8fafd] border-slate-100 opacity-60'
            }`}
    >
        <span className={`${active ? 'text-slate-800' : 'text-[#2b6be6]'} text-sm font-medium`}>{label}</span>
        <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${active ? dotColor : 'bg-slate-200'}`}></span>
    </button>
);

const SelectionButton = ({ label, symbol, active, onClick }) => (
    <button
        onClick={onClick}
        className={`py-4 rounded border flex items-center justify-center relative transition-all ${active ? 'bg-white border-slate-400 shadow-sm' : 'bg-[#f8fafd] border-slate-100'
            }`}
    >
        <span className={`${active ? 'text-slate-800' : 'text-[#2b6be6]'} text-sm font-medium`}>{label}</span>
        <span className="absolute top-1.5 right-2 text-[10px] text-slate-800 font-bold">{symbol}</span>
    </button>
);

export default PeriodonticFlow;