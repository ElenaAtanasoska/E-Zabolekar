import { useState, useEffect } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTooth, FaShieldAlt, FaClock, FaRegFileAlt, FaArrowRight } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [setupInfo, setSetupInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/auth/initial-status");
        if (response.data.needs_setup) setSetupInfo(response.data);
      } catch (err) { console.log("Системот е веќе конфигуриран."); }
    };
    checkInitialStatus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login", { email, password });
      const {
        access_token,
        user_id,
        role,
        email: userEmail,
        is_first_login,
        first_name,
        last_name,
        is_admin
      } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("role", role);
      localStorage.setItem("email", userEmail);
      localStorage.setItem("is_admin", is_admin);
      localStorage.setItem("first_name", first_name);
      localStorage.setItem("last_name", last_name);

      if (is_first_login) {
        if (role === "admin") {
          navigate("/setup-clinic");
        } else if (role === "doctor") {
          navigate("/complete-doctor-profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError("Погрешен e-mail или лозинка.");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-6 bg-[#f4f9fc] font-sans overflow-hidden">
      <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-gradient-to-r from-[#1a738b] via-[#1a738b] to-[#f4f9fc] rounded-[45px] shadow-2xl flex overflow-hidden">
        <div className="hidden md:flex w-[40%] p-14 flex-col justify-between text-white relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaTooth className="text-4xl" />
              <span className="text-3xl font-bold tracking-tight">Е-Заболекар</span>
            </div>

            <div className="w-12 h-[1.5px] bg-[#4eb2cc] -ml-1 mt-5 mb-10 opacity-60"></div>

            <h1 className="text-4xl font-bold leading-tight mb-6">
              Вашето здравје,<br /><span className="text-[#84e8f1]">на прво место</span>
            </h1>

            <p className="text-blue-50 text-sm max-w-[280px] mb-12 opacity-80 leading-relaxed">
              Електронска платформа за лесен пристап до вашите стоматолошки податоци.
            </p>

            <div className="space-y-6">
              <FeatureItem icon={<FaShieldAlt />} title="Безбедно" desc="Вашите податоци се безбедни и заштитени" />
              <FeatureItem icon={<FaClock />} title="Брзо и лесно" desc="Брз пристап до информациите за пациентите" />
              <FeatureItem icon={<FaRegFileAlt />} title="Сеопфатно" desc="Сите стоматолошки записи на едно место" />
            </div>
          </div>
        </div>

        <div className="w-full md:w-[60%] flex items-center justify-center p-8 relative">
          <div className="bg-white w-full max-w-xl px-12 py-8 lg:py-10 rounded-[40px] shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Најава</h2>
            <p className="text-gray-400 mb-8 text-sm font-medium">Најавете се за да пристапите до вашата сметка</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Корисничко име или e-mail</label>
                <div className="relative">
                  <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Внеси e-mail или корисничко име"
                    className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1a738b]/10 focus:border-[#1a738b] outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Лозинка</label>
                <div className="relative">
                  <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Внеси лозинка"
                    className="w-full pl-14 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#1a738b]/10 focus:border-[#1a738b] outline-none transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-500 font-medium">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1a738b] focus:ring-0" />
                  Запамни ме
                </label>
                <button type="button" className="text-[#1a738b] font-bold">Заборавена лозинка?</button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a738b] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#155e72] transition-all shadow-lg mt-2"
              >
                НАЈАВИ СЕ <FaArrowRight className="text-xs" />
              </button>
            </form>
            <div className="mt-8 text-center">
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 flex flex-col items-center gap-1">
        <p className="text-gray-600 text-[10px] font-medium">Е-Заболекар © 2026. Сите права се задржани.</p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-white/10 p-2.5 rounded-xl text-lg text-blue-50">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-sm mb-0.5">{title}</h4>
        <p className="text-blue-100/50 text-[10px] leading-tight max-w-[180px]">{desc}</p>
      </div>
    </div>
  );
}