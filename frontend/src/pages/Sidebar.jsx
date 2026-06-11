import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
    FaFileSignature, 
    FaTooth,
    FaXRay,
    FaAddressCard 
} from "react-icons/fa";
import myLogo from "../assets/logo2.png";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); 
    const isActive = (path) => location.pathname === path;
    const menuItems = [
        { id: 1, icon: <FaFileSignature size={20} />, path: `/patient/${id}` },
        { id: 4, icon: <FaAddressCard size={20} />, path: `/patient/${id}/info` },
        { id: 2, icon: <FaTooth size={20} />, path: `/patient/${id}/chart` },
        { id: 3, icon: <FaXRay size={20} />, path: `/patient/${id}/xray` }
    ];

    return (
        <div className="w-20 h-screen bg-[#0a3d4f] flex flex-col items-center py-8 shrink-0 border-r border-white/5 relative">
            <div className="absolute top-8 cursor-pointer" onClick={() => navigate("/dashboard")}>
                <img src={myLogo} alt="Logo" className="w-16 h-16 object-contain" />
            </div>

            <div className="flex-grow flex flex-col justify-center gap-14">
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <div
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`cursor-pointer transition-all duration-300 flex items-center justify-center ${
                                active 
                                ? "text-white scale-125 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
                                : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            {item.icon}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}