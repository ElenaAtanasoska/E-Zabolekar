import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from "./Sidebar";
import axios from 'axios';
import {
  FaSearch as Search,
  FaThLarge as Grid,
  FaRegFolder as Folder,
  FaEye as Eye,
  FaDownload as Download,
  FaEllipsisH as MoreHorizontal,
  FaPlus as Plus,
  FaCloudUploadAlt as UploadCloud,
  FaChevronDown as ChevronDown,
  FaTimes as CloseIcon,
  FaExchangeAlt as Compare,
  FaArrowLeft,
  FaUserCircle,
  FaRegStickyNote as NotesIcon, 
  FaSave as Save
} from 'react-icons/fa';
import { MdList as ListIcon } from 'react-icons/md';

const XRayView = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [xrays, setXrays] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedXrayForNotes, setSelectedXrayForNotes] = useState(null);
  const [editingNotes, setEditingNotes] = useState(''); 
  const [isSavingNotes, setIsSavingNotes] = useState(false); 
  const [isXrayModalOpen, setIsXrayModalOpen] = useState(false);
  const [xrayData, setXrayData] = useState({
    title: '',
    type_id: '',
    scan_date: new Date().toISOString().split('T')[0],
    notes: '',
    file: null,
    preview: null
  });

  const [compareMode, setCompareMode] = useState(false);
  const [firstImage, setFirstImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [isSelectingSecond, setIsSelectingSecond] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const notesModalRef = useRef(null); 
  const { id } = useParams();
  const patientId = id;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const firstName = localStorage.getItem("first_name") || "Доктор";
  const lastName = localStorage.getItem("last_name") || "";

  useEffect(() => {
    fetchFolders();
    fetchXrays();
  }, [selectedFolder, patientId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/xrays/types');
      setFolders(response.data);
    } catch (error) {
      console.error("Грешка при преземање на папките:", error);
    }
  };

  const fetchXrays = async () => {
    try {
      let url = `http://localhost:8000/xrays/?patient_id=${patientId}`;
      if (selectedFolder !== 'all') {
        url += `&type_id=${selectedFolder}`;
      }
      const response = await axios.get(url);
      setXrays(response.data);
    } catch (error) {
      console.error("Грешка при вчитување на снимките:", error);
    }
  };

  const startCompare = (xray) => {
    setFirstImage(xray);
    setIsSelectingSecond(true);
    setOpenDropdownId(null);
  };
  const selectSecondImage = (xray) => {
    if (xray.id === firstImage.id) {
      alert("Изберете различна снимка за споредба!");
      return;
    }
    setSecondImage(xray);
    setCompareMode(true);
    setIsSelectingSecond(false);
  };
  const closeCompare = () => {
    setCompareMode(false);
    setFirstImage(null);
    setSecondImage(null);
    setIsSelectingSecond(false);
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await axios.post('http://localhost:8000/xrays/types', { name: newFolderName });
      setNewFolderName('');
      setIsFolderModalOpen(false);
      fetchFolders();
    } catch (error) {
      alert("Грешка при зачувување на папката");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setXrayData({
        ...xrayData,
        file: file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleSaveXray = async (e) => {
    e.preventDefault();
    if (!xrayData.file || !xrayData.title || !xrayData.type_id) {
      alert("Ве молиме пополнете ги сите задолжителни полиња!");
      return;
    }

    const formData = new FormData();
    formData.append('file', xrayData.file);
    formData.append('title', xrayData.title);
    formData.append('type_id', xrayData.type_id);
    formData.append('scan_date', xrayData.scan_date);
    formData.append('notes', xrayData.notes);
    formData.append('patient_id', patientId);

    try {
      await axios.post('http://localhost:8000/xrays/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsXrayModalOpen(false);
      setXrayData({ title: '', type_id: '', scan_date: new Date().toISOString().split('T')[0], notes: '', file: null, preview: null });
      fetchXrays(); 
      
    } catch (error) {
      console.error("Грешка при зачувување на снимката:", error);
      alert("Настана грешка при зачувување.");
    }
  };

  const handleDownload = (imageUrl, title) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const fileName = `${title.replace(/\s+/g, '_')}_snimka.jpg`;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDropdown = (id) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(id);
    }
  };

  const openNotesModal = (xray) => {
    setSelectedXrayForNotes(xray);
    setEditingNotes(xray.notes || ''); 
    setIsNotesModalOpen(true);
    setOpenDropdownId(null); 
  };

  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedXrayForNotes(null);
    setEditingNotes('');
  };

  const sortedXrays = [...xrays].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.scan_date) - new Date(a.scan_date);
    if (sortBy === 'oldest') return new Date(a.scan_date) - new Date(b.scan_date);
    if (sortBy === 'alpha_asc') return a.title.localeCompare(b.title);
    return 0;
  });

  const handleUpdateNotes = async () => {
    if (!selectedXrayForNotes) return;
    setIsSavingNotes(true);

    try {
      const response = await axios.put(`http://localhost:8000/xrays/${selectedXrayForNotes.id}/notes`, {
        notes: editingNotes
      });
      setXrays(prevXrays =>
        prevXrays.map(x =>
          x.id === selectedXrayForNotes.id ? { ...x, notes: editingNotes } : x
        )
      );

      closeNotesModal();
    } catch (error) {
      console.error("Грешка при ажурирање на белешките:", error);
      alert("Настана грешка при зачувување на белешките.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-[#01506D]">
      <Sidebar />
      <div className="w-72 bg-white border-r border-gray-100 p-6 flex flex-col">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Папки</h2>
        <div className="space-y-2 flex-grow overflow-y-auto">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedFolder === 'all' ? 'bg-[#E6F6F9] text-[#00A3C1]' : 'hover:bg-gray-50 text-gray-500'}`}
          >
            <div className="flex items-center gap-3">
              <Grid size={18} />
              <span className="text-sm font-bold">Сите снимки</span>
            </div>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedFolder === folder.id ? 'bg-[#E6F6F9] text-[#00A3C1]' : 'hover:bg-gray-50 text-gray-500'}`}
            >
              <div className="flex items-center gap-3">
                <Folder size={18} />
                <span className="text-sm font-bold">{folder.name}</span>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsFolderModalOpen(true)}
          className="mt-auto flex items-center justify-center gap-2 bg-[#01506D] text-white p-3 rounded-xl font-bold text-sm hover:bg-[#013D54] transition-all"
        >
          <Plus size={18} /> Додај нова папка
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-[#01506D] hover:text-[#00A3C1]"
            >
              <FaArrowLeft size={18} />
            </button>

            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пребарај овде..."
                className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-10px shadow-sm focus:ring-2 focus:ring-[#00A3C1]/20 outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black">Д-р {firstName} {lastName.charAt(0)}.</p>
            </div>
            <div className="w-10 h-10  rounded-full border-2 border-white overflow-hidden">
              <FaUserCircle className="text-4xl text-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black">
                {selectedFolder === 'all' ? 'Сите снимки' : folders.find(f => f.id === selectedFolder)?.name}
              </h1>
              <span className="bg-gray-200/50 px-3 py-1 rounded-full text-[11px] font-black text-gray-500">
                {xrays.length} {xrays.length === 1 ? 'снимка' : 'снимки'}
              </span>
            </div>
            <div className="flex items-center gap-3">

              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white px-4 py-2 pr-10 rounded-xl shadow-sm text-sm font-bold border border-gray-50 outline-none cursor-pointer hover:bg-gray-50 transition-all text-[#01506D]"
                >
                  <option value="newest">Најнови прво</option>
                  <option value="oldest">Најстари прво</option>
                  <option value="alpha_asc">Име (А-Ш)</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 pointer-events-none text-[#01506D]"
                />
              </div>
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-50">
                <button className="p-2 bg-[#E6F6F9] text-[#00A3C1] rounded-lg"><Grid size={18} /></button>
                <button className="p-2 text-gray-300 hover:text-gray-500"><ListIcon size={18} /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedXrays.length === 0 ? (
              <p className="text-gray-400 font-bold italic col-span-full text-center py-10">
                Нема пронајдено снимки во оваа категорија.
              </p>
            ) : (
              sortedXrays.map((xray) => (
                <div key={xray.id} onClick={() => isSelectingSecond && selectSecondImage(xray)} className={`bg-white rounded-[24px] p-4 shadow-sm border transition-all flex flex-col hover:shadow-md cursor-pointer
                  ${isSelectingSecond ? 'border-[#00A3C1] ring-4 ring-[#00A3C1]/10 scale-[1.02]' : 'border-gray-50'}`}>
                  <div className="relative aspect-video rounded-[18px] overflow-hidden mb-4 bg-gray-100 flex-shrink-0">
                    <img src={xray.image_url} alt={xray.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-grow px-1">
                    <h3 className="font-black text-sm mb-1 text-[#01506D]">{xray.title}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] text-gray-400 font-bold">
                        {(() => {
                          const date = new Date(xray.scan_date);
                          const day = String(date.getDate()).padStart(2, '0');
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}.${month}.${year}`;
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center pt-3 border-t border-gray-100 mt-auto justify-between">
                      <div className="flex items-center gap-6 justify-center flex-grow text-[#00A3C1]">
                        <button onClick={() => setFullscreenImage(xray.image_url)} className="flex items-center gap-2 hover:text-[#01506D] transition-colors">
                          <Eye size={16} />
                          <span className="text-xs font-black">Прегледај</span>
                        </button>
                        <div className="w-[1px] h-4 bg-gray-100"></div>
                        <button onClick={() => handleDownload(xray.image_url, xray.title)} className="flex items-center tracking-wider gap-2 text-[#a2a4ab] hover:text-[#757679] transition-colors">
                          <Download size={16} />
                          <span className="text-xs font-black">Преземи</span>
                        </button>
                      </div>

                      <div className="relative ml-2 flex-shrink-0" ref={openDropdownId === xray.id ? dropdownRef : null}>
                        <button onClick={() => toggleDropdown(xray.id)} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                          <MoreHorizontal size={18} />
                        </button>
                        {openDropdownId === xray.id && (
                          <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 overflow-hidden py-2 animate-fadeIn">
                            <button onClick={() => startCompare(xray)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#F8FAFC] hover:text-[#00A3C1] transition-colors">
                              <Compare size={14} className="opacity-70" />
                              Спореди
                            </button>
                            {/* ПОПРАВЕНО: Клик на Белешки го отвора модалот */}
                            <button onClick={() => openNotesModal(xray)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#F8FAFC] hover:text-[#00A3C1] transition-colors">
                              <NotesIcon size={14} className="opacity-70" />
                              Белешки
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div onClick={() => setIsXrayModalOpen(true)} className="mb-2 mt-10 border-2 border-dashed border-gray-200 rounded-[24px] p-6 bg-white/50 group hover:border-[#00A3C1] transition-all cursor-pointer">
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 bg-[#E6F6F9] rounded-xl flex items-center justify-center group-hover:bg-[#00A3C1] transition-all">
                <Plus size={20} className="text-[#00A3C1] group-hover:text-white transition-colors" />
              </div>
              <p className="text-lg font-bold tracking-wide">Додади нова снимка</p>
            </div>
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setFullscreenImage(null)}>
          <button onClick={() => setFullscreenImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-3 rounded-full">
            <CloseIcon size={24} />
          </button>
          <img src={fullscreenImage} alt="Fullscreen Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {isNotesModalOpen && selectedXrayForNotes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fadeIn" onClick={closeNotesModal}>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-xl shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeNotesModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-[#E6F6F9] rounded-xl flex items-center justify-center text-[#00A3C1]">
                <NotesIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#01506D]">Белешки за снимка</h3>
                <p className="text-sm text-gray-400 font-bold">{selectedXrayForNotes.title}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Ваши белешки</label>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Внесете белешки за оваа снимка..."
                rows="8"
                className="w-full p-5 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A3C1]/20 outline-none font-bold resize-none text-sm text-[#01506D]"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2 font-medium">Овие белешки се приватни и видливи само за докторите.</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={closeNotesModal}
                className="flex-1 p-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-50 transition-all text-sm"
              >
                Откажи
              </button>
              <button
                type="button"
                onClick={handleUpdateNotes}
                disabled={isSavingNotes}
                className={`flex-1 p-4 rounded-2xl font-black shadow-lg transition-all text-sm flex items-center justify-center gap-2 
                  ${isSavingNotes
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-[#01506D] text-white hover:bg-[#013D54] shadow-[#01506D]/20'
                  }`}
              >
                {isSavingNotes ? (
                  <>Се зачувува...</>
                ) : (
                  <><Save size={16} /> Зачувај промени</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Нова папка</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFolder}>
              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Име на папка</label>
                <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="на пр. Ортопан (3D)" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#00A3C1]/20 outline-none font-bold" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsFolderModalOpen(false)} className="flex-1 p-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all">Откажи</button>
                <button type="submit" className="flex-1 p-4 bg-[#01506D] text-white rounded-2xl font-bold hover:bg-[#013D54] transition-all">Зачувај</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isXrayModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-4xl shadow-2xl relative">
            <button onClick={() => setIsXrayModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon size={24} />
            </button>
            <form onSubmit={handleSaveXray} className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/2">
                <div onClick={() => fileInputRef.current.click()} className="w-full aspect-[4/3] bg-[#f0f9fa] border-2 border-dashed border-[#00A3C1]/30 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#e6f6f9] transition-all overflow-hidden relative group">
                  {xrayData.preview ? (
                    <img src={xrayData.preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={32} className="text-[#01506D]" />
                      </div>
                      <p className="text-xl font-black text-[#01506D]">Прикачи фотографија</p>
                      <p className="text-sm text-gray-400 font-bold mt-1">или повлечете овде</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Име на снимка</label>
                  <input type="text" placeholder="Внесете име (пр. RVG Заб 36)" className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A3C1]/20 outline-none font-bold" value={xrayData.title} onChange={(e) => setXrayData({ ...xrayData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Тип на снимка</label>
                  <div className="relative">
                    <select className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A3C1]/20 outline-none font-bold appearance-none cursor-pointer" value={xrayData.type_id} onChange={(e) => setXrayData({ ...xrayData, type_id: e.target.value })}>
                      <option value="">Изберете тип</option>
                      {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Датум</label>
                  <input type="date" className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A3C1]/20 outline-none font-bold cursor-pointer" value={xrayData.scan_date} onChange={(e) => setXrayData({ ...xrayData, scan_date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Белешки</label>
                  <textarea placeholder="Опционални белешки" rows="3" className="w-full p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00A3C1]/20 outline-none font-bold resize-none" value={xrayData.notes} onChange={(e) => setXrayData({ ...xrayData, notes: e.target.value })} />
                </div>
                <div className="flex gap-4 mt-2">
                  <button type="submit" className="flex-[2] p-4 bg-[#01506D] text-white rounded-2xl font-black hover:bg-[#013D54] shadow-lg shadow-[#01506D]/20 transition-all">Сочувај снимка</button>
                  <button type="button" onClick={() => setIsXrayModalOpen(false)} className="flex-1 p-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black hover:bg-gray-50 transition-all">Откажи</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {compareMode && firstImage && secondImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] flex flex-col p-6 animate-fadeIn">
          {/* Header на модалот */}
          <div className="flex justify-between items-center mb-6 px-4">
            <div className="text-white">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Compare size={24} className="text-[#00A3C1]" />
                Споредба на снимки
              </h2>
              <p className="text-sm text-gray-400 font-bold">
                {firstImage.title} (лево) vs {secondImage.title} (десно)
              </p>
            </div>
            <button
              onClick={closeCompare}
              className="text-white/70 hover:text-white transition-colors bg-white/10 p-4 rounded-2xl flex items-center gap-2 font-black"
            >
              <CloseIcon size={20} /> Затвори споредба
            </button>
          </div>
          <div className="flex-1 flex gap-4 overflow-hidden items-center justify-center">
            <div className="flex-1 h-full flex flex-col items-center group">
              <span className="text-white/40 text-[10px] font-black uppercase mb-2 group-hover:text-[#00A3C1] transition-colors tracking-widest">Прва снимка ({new Date(firstImage.scan_date).toLocaleDateString('mk-MK')})</span>
              <img
                src={firstImage.image_url}
                className="w-full h-full object-contain rounded-3xl border border-white/10 shadow-2xl"
                alt="First"
              />
            </div>
            <div className="w-[2px] h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent self-center"></div>
            <div className="flex-1 h-full flex flex-col items-center group">
              <span className="text-white/40 text-[10px] font-black uppercase mb-2 group-hover:text-[#00A3C1] transition-colors tracking-widest">Втора снимка ({new Date(secondImage.scan_date).toLocaleDateString('mk-MK')})</span>
              <img
                src={firstImage.image_url}
                className="w-full h-full object-contain rounded-3xl border border-white/10 shadow-2xl"
                alt="Second"
              />
            </div>
          </div>
        </div>
      )}

      {isSelectingSecond && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#01506D] text-white px-8 py-4 rounded-3xl shadow-2xl z-[150] flex items-center gap-6 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
              <Plus size={18} />
            </div>
            <span className="font-black text-sm tracking-wide">Кликнете на друга снимка за да ја споредите...</span>
          </div>
          <button
            onClick={() => setIsSelectingSecond(false)}
            className="text-[11px] font-black uppercase bg-red-500/20 hover:bg-red-500 text-red-200 px-4 py-2 rounded-xl transition-all"
          >
            Откажи
          </button>
        </div>
      )}
    </div>
  );
};

export default XRayView;