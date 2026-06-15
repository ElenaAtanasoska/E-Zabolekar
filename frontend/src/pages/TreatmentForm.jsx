import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/treatments`;
const TreatmentForm = ({ selectedSurfaces = [], onSaveSuccess }) => {
    const { id: patientId, toothId } = useParams();
    const navigate = useNavigate();
    const [formStep, setFormStep] = useState('pathology');
    const [pathologiesLookup, setPathologiesLookup] = useState([]);
    const [restorationTypes, setRestorationTypes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [qualityOptions, setQualityOptions] = useState([]);
    const [detailOptions, setDetailOptions] = useState([]);
    const [selectedMainPathologyType, setSelectedMainPathologyType] = useState('');
    const [selectedPathologyId, setSelectedPathologyId] = useState('');

    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('завршено');
    const [selectedTypeId, setSelectedTypeId] = useState('');
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [selectedQualityId, setSelectedQualityId] = useState(null);
    const [selectedDetailId, setSelectedDetailId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableSurfaces, setAvailableSurfaces] = useState([]);
    const [localSurfaces, setLocalSurfaces] = useState(selectedSurfaces);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [resPathologies, resTypes, resMaterials, resQuality, resDetails] = await Promise.all([
                    axios.get(`${API_BASE_URL}/pathologies-lookup`),
                    axios.get(`${API_BASE_URL}/restoration-types`),
                    axios.get(`${API_BASE_URL}/materials`),
                    axios.get(`${API_BASE_URL}/quality`),
                    axios.get(`${API_BASE_URL}/details`)
                ]);

                setPathologiesLookup(resPathologies.data);
                setRestorationTypes(resTypes.data);
                setMaterials(resMaterials.data);
                setQualityOptions(resQuality.data);
                setDetailOptions(resDetails.data);
                setLoading(false);
            } catch (err) {
                console.error("Грешка при вчитување:", err);
                setError("Грешка при комуникација со базата.");
                setLoading(false);
            }
        };
        axios.get(`${API_BASE_URL}/restoration-types`).then(res => {
            setRestorationTypes(res.data);
            console.log("Што има во restorationTypes:", res.data);
        });
        axios.get(`${API_BASE_URL}/tooth-surfaces`).then(res => setAvailableSurfaces(res.data));
        fetchAllData();
    }, []);

    const currentPathologyGroup = pathologiesLookup.find(p => p.type === selectedMainPathologyType);
    const subTypesAvailable = currentPathologyGroup ? currentPathologyGroup.subtypes : [];

    const selectedTypeName = restorationTypes.find(t => t.id === parseInt(selectedTypeId))?.name || '';
    const isFillingOrInlay = selectedTypeName.includes('Пломба') ||
        selectedTypeName.includes('Инлеј') ||
        selectedTypeName.includes('Онлеј') ||
        selectedTypeName.includes('Делумна круна');
    const isEndodontic = selectedTypeName.includes('Ендодонтски');

    const filteredDetails = detailOptions.filter(detail => {
        if (isEndodontic) return detail.name.includes('живец') || detail.name.includes('канали');
        if (isFillingOrInlay || selectedTypeName.includes('Круна')) {
            return detail.name.includes('раб') || detail.name.includes('Flush') || detail.name.includes('Shortfall');
        }
        return true;
    });

    const toggleSurface = (surfaceId) => {
        setLocalSurfaces(prev => {
            const isSelected = prev.includes(surfaceId);
            const newSelection = isSelected
                ? prev.filter(id => id !== surfaceId)
                : [...prev, surfaceId];

            console.log("Нова селекција:", newSelection); 
            return newSelection;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTypeId) {
            alert("Ве молиме изберете вид на реставрација!");
            return;
        }

        let pathologyArray = [];
        if (selectedPathologyId) {
            pathologyArray = [{
                pathology_id: parseInt(selectedPathologyId),
                surface_ids: localSurfaces 
            }];
        }
        else if (selectedMainPathologyType === 'Кариес') {
            const cariesRoot = pathologiesLookup?.find(p => p.name === 'Кариес');

            pathologyArray = [{
                pathology_id: cariesRoot ? parseInt(cariesRoot.id) : 1,
                surface_ids: localSurfaces
            }];
        }

        const treatmentData = {
            patient_id: parseInt(patientId),
            tooth_id: toothId ? parseInt(toothId) : null,
            title: title || `${selectedMainPathologyType} - Санација со ${selectedTypeName}`,
            status: status,
            notes: notes || null,
            pathologies: pathologyArray,
            restoration: {
                type_id: parseInt(selectedTypeId),
                material_id: isFillingOrInlay ? selectedMaterialId : null,
                quality_id: isFillingOrInlay || selectedTypeName.includes('Круна') ? selectedQualityId : null,
                detail_id: selectedDetailId,
                surface_ids: localSurfaces
            }
        };

        try {
            console.log("ПОДАТОЦИ КОИ СЕ ПРАЌААТ:", JSON.stringify(treatmentData, null, 2));
            const response = await axios.post(`${API_BASE_URL}/`, treatmentData);

            if (response.status === 200 || response.status === 201) {
                navigate(`/patient/${patientId}/chart/${toothId}`);
                if (onSaveSuccess) onSaveSuccess(response.data.treatment_id);
            }
        } catch (err) {
            console.error("Грешка при зачувување:", err.response?.data || err);
            alert("Грешка при зачувување во базата. Провери ја конзолата.");
        }
    };

    if (loading) return <div className="text-center p-6 text-gray-600">Вчитување на стоматолошки картон...</div>;
    if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

    const filteredRestorationTypes = restorationTypes.filter(type => {
        if (selectedMainPathologyType === 'Кариес') {
            return ['Пломба', 'Инлеј', 'Онлеј', 'Делумна круна', 'Круна', 'Ендодонтски третман ']
                .includes(type.name);
        }
        else if (selectedMainPathologyType === 'Фрактура') {
            return ['Пломба', 'Делумна круна', 'Круна', 'Ендодонтски третман ', 'Екстракција']
                .includes(type.name);
        }
        else if (selectedMainPathologyType === 'Трошење') {
            return ['Пломба', 'Инлеј', 'Онлеј', 'Делумна круна', 'Круна', 'Фасети', 'Заштитна гума / Сплинт (Night Guard)']
                .includes(type.name);
        }
        else if (selectedMainPathologyType === 'Апикален процес') {
            return ['Ендодонтски третман ', 'Екстракција']
                .includes(type.name);
        }
        else if (selectedMainPathologyType === 'Дисколорација') {
            return ['Фасети', 'Круна', 'Професионално чистење и полирање', 'Белење на заби', 'Внатрешно белење']
                .includes(type.name);
        }
        else if (selectedMainPathologyType === 'Заостанат корен') {
            return ['Ендодонтски третман ', 'Екстракција', 'Хируршка екстракција']
                .includes(type.name);
        }
        else if (selectedMainPathologyType === 'Развојно нарушување') {
            return ['Пломба', 'Фасети', 'Круна', 'Ортодонтски третман']
                .includes(type.name);
        }
        return true;
    });

    const filteredAvailableSurfaces = availableSurfaces.filter(surf => {
        if (selectedTypeName === 'Инлеј') {
            return ['Мезијално', 'Оклузално', 'Дистално'].includes(surf.name);
        }
        else if (selectedTypeName === 'Онлеј') {
            return ['Мезијално', 'Дистално'].includes(surf.name);
        }
        else if (selectedTypeName === 'Делумна круна') {
            return ['Мезијално', 'Оклузално', 'Дистално', 'Мезио-букално врвче', 'Дисто-букално врвче', 'Мезио-палатално врвче', 'Дисто-палатално врвче'].includes(surf.name);
        }
        else if (selectedTypeName === 'Kруна') {
            return [].includes(surf.name);
        }
        else {
            return true;
        }
    });

    return (
        <div className="w-full p-6 bg-slate-50  ">
            <div className="flex items-center justify-center mb-6 pt-1 space-x-2">
                <span className={`px-4 py-2 rounded-full font-bold text-xs ${formStep === 'pathology' ? 'bg-[#01506D] text-white' : 'bg-slate-200 text-slate-600'}`}>1. Патологија</span>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <span className={`px-4 py-2 rounded-full font-bold text-xs ${formStep === 'restoration' ? 'bg-[#01506D] text-white' : 'bg-slate-200 text-slate-600'}`}>2. Реставрација</span>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <span className={`px-4 py-2 rounded-full font-bold text-xs ${formStep === 'details' ? 'bg-[#01506D] text-white' : 'bg-slate-200 text-slate-600'}`}>3. Квалитет</span>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {formStep === 'pathology' && (
                    <div className="space-y-6 animate-fadeIn h-full flex flex-col min-h-[400px]">
                        <h3 className="text-lg font-bold text-slate-700 border-b pt-1 pb-3">Чекор 1: Што е дијагностицирано на забот?</h3>
                        <div className="flex-grow space-y-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Изберете Главен Наод / Проблем</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {pathologiesLookup.map((p) => (
                                    <button
                                        key={p.type}
                                        type="button"
                                        onClick={() => {
                                            setSelectedMainPathologyType(p.type);
                                            if (!p.subtypes || p.subtypes.length === 0 || p.subtypes.every(sub => sub.subtype === null)) {
                                                setSelectedPathologyId(p.id);
                                            } else {
                                                setSelectedPathologyId(''); 
                                            }
                                        }}
                                        className={`p-3 text-center border rounded-lg font-medium transition-all ${selectedMainPathologyType === p.type
                                            ? 'bg-[#01506D] text-white border-[#013d54] shadow-md'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {p.type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {console.log("Subtypes state:", subTypesAvailable)}
                        {selectedMainPathologyType && subTypesAvailable.some(sub => sub.subtype !== null) && (
                            <div className="space-y-2 pt-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Спецификација за {selectedMainPathologyType}
                                </label>
                                {(() => {
                                    const colorMap = {
                                        "сива": "gray",
                                        "црвена": "red",
                                        "жолта": "yellow",
                                        "кафеава": "brown",
                                        "бела": "white"
                                    };

                                    return (
                                        <div className={`gap-3 grid ${selectedMainPathologyType === "Дисколорација" ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                                            {subTypesAvailable.map((sub) => {
                                                let label = sub.subtype;

                                                if (selectedMainPathologyType === "Фрактура" && sub.line_direction) {
                                                    label = `${sub.subtype} - ${sub.line_direction}`;
                                                }
                                                else if (selectedMainPathologyType === "Дисколорација") {
                                                    label = `${sub.subtype} - ${sub.color_shade}`;
                                                }
                                                const cssColor = colorMap[sub.color_shade?.toLowerCase()] || sub.color_shade;

                                                return (
                                                    <button
                                                        key={sub.pathology_id}
                                                        type="button"
                                                        onClick={() => setSelectedPathologyId(sub.pathology_id)}
                                                        className={`p-3 text-left border rounded-lg font-medium transition-all ${parseInt(selectedPathologyId) === sub.pathology_id
                                                            ? 'bg-slate-500 text-white border-slate-600 shadow-md'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {selectedMainPathologyType === "Дисколорација" && (
                                                            <span
                                                                className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300 align-middle"
                                                                style={{ backgroundColor: cssColor }}
                                                            />
                                                        )}
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        {selectedSurfaces.length > 0 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 font-medium">
                                Локација: Означени се површините <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-300 ml-1">{selectedSurfaces.join(', ')}</span>
                            </div>
                        )}

                        <div className="mt-auto pt-4  flex justify-end">
                            <button
                                type="button"
                                disabled={
                                    !selectedMainPathologyType ||
                                    (subTypesAvailable.some(sub => sub.subtype !== null) && !selectedPathologyId)
                                }
                                onClick={() => setFormStep('restoration')}
                                className="px-6 py-2.5 bg-[#01506D] text-white font-semibold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#013d54]"
                            >
                                Следно &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {formStep === 'restoration' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-bold text-slate-700 border-b pb-2">Чекор 2: План на терапија и Изработка</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-600 mb-2 tracking-wide uppercase text-xs">
                                    Наслов на интервенција
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400"
                                    placeholder="Остави празно за автоматски наслов..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-600 mb-2 tracking-wide uppercase text-xs">
                                    Статус на третман
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white shadow-sm appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 hover:border-slate-300"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="завршено">✅ Завршено</option>
                                        <option value="во тек">⏳ Во тек</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
                                Тип на интервенција
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredRestorationTypes.map((type) => {
                                    const isSelected = parseInt(selectedTypeId) === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTypeId(type.id);
                                                setSelectedMaterialId(null);
                                                setSelectedQualityId(null);
                                                setSelectedDetailId(null);
                                            }}
                                            className={`
                                               p-3 text-center rounded-xl border-2 font-semibold transition-all duration-200 ease-in-out
                                                ${isSelected
                                                    ? 'bg-[#01506d] text-white border-[#01506d] shadow-lg shadow-blue-100 scale-[1.02]'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#01506d]/50 hover:bg-slate-50'
                                                }
                                            `}
                                        >
                                            {type.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {isFillingOrInlay && (
                            <div className="space-y-4 mt-4">
                                <label className="block text-xs font-bold tracking-wide text-slate-700 uppercase">
                                    Засегнати површини
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {filteredAvailableSurfaces.map((surf) => {
                                        const isSelected = localSurfaces.includes(surf.id);

                                        return (
                                            <button
                                                key={surf.id}
                                                type="button"
                                                onClick={() => toggleSurface(surf.id)}
                                                className={`
                            p-3 text-center rounded-xl border-2 font-semibold transition-all duration-200 ease-in-out
                            ${isSelected
                                                        ? 'bg-[#01506d] text-white border-[#01506d] shadow-lg shadow-blue-100 scale-[1.02]'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#01506d]/50 hover:bg-slate-50'
                                                    }
                        `}
                                            >
                                                {surf.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">
                                Дополнителни белешки
                            </label>
                            <textarea
                                rows="3"
                                className="w-full p-4 border-2 border-slate-200 rounded-xl bg-white shadow-sm resize-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#01506d]/10 focus:border-[#01506d] placeholder:text-slate-400"
                                placeholder="Внесете опционален коментар ..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div className="pt-4 border-t flex justify-between">
                            <button
                                type="button"
                                onClick={() => setFormStep('pathology')}
                                className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
                            >
                                &larr; Назад
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormStep('details')}
                                className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
                            >
                                Следно &rarr;
                            </button>
                        </div>
                    </div>
                )
                }

                {
                    formStep === 'details' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-lg font-bold text-slate-700 border-b pb-2">Чекор 3: Материјал и Квалитет</h3>
                            {isFillingOrInlay && (
                                <div className="space-y-3 mt-5">
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700">
                                        Избор на материјал
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {materials.map((mat) => {
                                            const isSelected = selectedMaterialId === mat.id;
                                            return (
                                                <button
                                                    key={mat.id}
                                                    type="button"
                                                    onClick={() => setSelectedMaterialId(mat.id)}
                                                    className={`
                            p-3 text-center text-sm font-medium rounded-xl border-2 transition-all duration-200 ease-in-out
                            ${isSelected
                                                            ? 'bg-[#01506d] text-white border-[#01506d] shadow-lg shadow-blue-100 scale-[1.01]'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#01506d]/50 hover:bg-slate-50'
                                                        }
                        `}
                                                >
                                                    {mat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {(isFillingOrInlay || selectedTypeName.includes('Круна')) && (
                                <div className="space-y-3 mt-5">
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700">
                                        Квалитет / Состојба
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {qualityOptions.map((qual) => {
                                            const isSelected = selectedQualityId === qual.id;
                                            return (
                                                <button
                                                    key={qual.id}
                                                    type="button"
                                                    onClick={() => setSelectedQualityId(qual.id)}
                                                    className={`
                            p-3 text-center text-sm font-medium rounded-xl border-2 transition-all duration-200 ease-in-out
                            ${isSelected
                                                            ? 'bg-[#01506d] text-white border-[#01506d] shadow-lg shadow-blue-100 scale-[1.01]'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#01506d]/50 hover:bg-slate-50'
                                                        }
                        `}
                                                >
                                                    {qual.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedTypeId && filteredDetails.length > 0 && (
                                <div className="space-y-3 mt-5">
                                    <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-700">
                                        Маргинална адаптација
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {filteredDetails.map((det) => {
                                            const isSelected = selectedDetailId === det.id;
                                            return (
                                                <button
                                                    key={det.id}
                                                    type="button"
                                                    onClick={() => setSelectedDetailId(det.id)}
                                                    className={`
                            p-3 text-center text-sm font-medium rounded-xl border-2 transition-all duration-200 ease-in-out
                            ${isSelected
                                                            ? 'bg-[#01506d] text-white border-[#01506d] shadow-lg shadow-blue-100 scale-[1.01]'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#01506d]/50 hover:bg-slate-50'
                                                        }
                        `}
                                                >
                                                    {det.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 border-t flex justify-between">
                                <button type="button" onClick={() => setFormStep('restoration')} className="px-5 py-2.5 bg-slate-200 rounded-lg">&larr; Назад</button>
                                <button type="submit" className="px-6 py-2.5 bg-[#0a3d4f] text-white rounded-lg">Зачувај во Картон</button>
                            </div>
                        </div>
                    )
                }
            </form >
        </div >
    );
};

export default TreatmentForm;