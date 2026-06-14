// client/src/App.jsx
import { useState } from "react";
import VehicleForm from "./components/VehicleForm";
import Dashboard from "./components/Dashboard";
import ReportPage from "./components/ReportPage";
import EmployeePage from "./components/EmployeePage"; // 1. IMPORT HALAMAN KARYAWAN BARU
import VehicleManager from "./components/VehicleManager"; // 🔥 PERUBAHAN: Import halaman kendaraan baru

export default function App() {
  const [role, setRole] = useState("driver"); 
  const [activeTab, setActiveTab] = useState("form");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const ADMIN_PASSWORD = "admin123"; 

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    if (selectedRole === "admin") {
      setIsPasswordModalOpen(true);
      setPasswordInput("");
      setErrorMsg("");
    } else {
      setRole("driver");
      setActiveTab("form");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setRole("admin");
      setActiveTab("dashboard"); 
      setIsPasswordModalOpen(false);
    } else {
      setErrorMsg("❌ Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          
          <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap">
            <button onClick={() => setActiveTab("form")} className={`py-4 px-1 font-bold text-sm border-b-2 ${activeTab === "form" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}>
              📝 Form Checklist
            </button>

            {role === "admin" && (
              <>
                <button onClick={() => setActiveTab("dashboard")} className={`py-4 px-1 font-bold text-sm border-b-2 ${activeTab === "dashboard" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}>
                  📊 Dashboard Monitoring
                </button>
                <button onClick={() => setActiveTab("report")} className={`py-4 px-1 font-bold text-sm border-b-2 ${activeTab === "report" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}>
                  📈 Daily Report
                </button>
                {/* 2. TOMBOL MENU BARU KHUSUS UNTUK DATA KARYAWAN */}
                <button onClick={() => setActiveTab("employees")} className={`py-4 px-1 font-bold text-sm border-b-2 ${activeTab === "employees" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}>
                  👥 Data Karyawan
                </button>
                {/* 🔥 PERUBAHAN: Tambah tombol menu Data Kendaraan khusus Admin */}
                <button onClick={() => setActiveTab("vehicles")} className={`py-4 px-1 font-bold text-sm border-b-2 ${activeTab === "vehicles" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}>
                  🚚 Data Kendaraan
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 py-2 sm:py-0 self-end sm:self-auto">
            <select value={role} onChange={handleRoleChange} className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-gray-50 outline-none cursor-pointer">
              <option value="driver">👤 Driver (Form Saja)</option>
              <option value="admin">🔒 Admin (Butuh Password)</option>
            </select>
          </div>
        </div>
      </nav>

      {/* KONTEN HALAMAN AKTIF */}
      <div className="mt-4">
        {activeTab === "form" && <VehicleForm />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "report" && <ReportPage />}
        {activeTab === "employees" && <EmployeePage />} {/* 3. RENDERING KONTEN KARYAWAN */}
        {activeTab === "vehicles" && <VehicleManager />} {/* 🔥 PERUBAHAN: Rendering halaman kendaraan */}
      </div>

      {/* MODAL PASSWORD ADMIN */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border-t-4 border-red-600">
            <h3 className="text-lg font-bold text-center text-gray-900 mb-4">Verifikasi Akses Admin</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input type="password" placeholder="Password..." value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full border p-3 rounded-xl text-center font-bold tracking-widest outline-none focus:border-red-500" />
              {errorMsg && <p className="text-xs text-red-600 font-semibold text-center">{errorMsg}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setIsPasswordModalOpen(false); setRole("driver"); }} className="w-1/2 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl text-xs">Batal</button>
                <button type="submit" className="w-1/2 bg-red-600 text-white font-bold py-2 rounded-xl text-xs">Konfirmasi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}