// client/src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../config/api";

export default function Dashboard() {
  const [checklists, setChecklists] = useState([]);
  const [filteredChecklists, setFilteredChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("hari"); // default filter: hari (Hari Ini)
  
  const [stats, setStats] = useState({ total: 0, aman: 0, perhatian: 0 });
  const [vehicleTypes, setVehicleTypes] = useState({ bus: 0, truck: 0, elf: 0, lv: 0 });

  // 1. AMBIL DATA DARI BACKEND API
  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/checklists`);
      const result = await response.json();
      if (response.ok) {
        setChecklists(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  // 2. PROSES FILTERING DATA BERDASARKAN FILTER SELECTION
  useEffect(() => {
    if (checklists.length === 0) return;

    const now = new Date();
    
    // Setup batas waktu lokal awal hari ini (00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Setup batas waktu awal minggu ini (Senin)
    const dayOfWeek = startOfToday.getDay();
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(startOfToday.getTime() - distanceToMonday * 24 * 60 * 60 * 1000);
    
    // Setup batas waktu awal bulan ini (Tanggal 1)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = checklists.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);

      if (filterType === "hari") {
        return itemDate >= startOfToday;
      } else if (filterType === "minggu") {
        return itemDate >= startOfWeek;
      } else if (filterType === "bulan") {
        return itemDate >= startOfMonth;
      }
      return true;
    });

    setFilteredChecklists(filtered);
    calculateStats(filtered);
    calculateVehicleTypes(filtered);
  }, [checklists, filterType]);

  // 3. KALKULASI UTAMA KARTU STATISTIK KONDISI
  const calculateStats = (data) => {
    let total = data.length;
    let aman = 0;
    let perhatian = 0;

    data.forEach((item) => {
      const adaMasalah = item.kondisiKendaraan?.some(
        (p) => p.status === "Rusak" || p.status === "Dalam Perbaikan"
      );
      if (adaMasalah) perhatian++;
      else aman++;
    });

    setStats({ total, aman, perhatian });
  };

  // 4. KALKULASI REAL-TIME JENIS KENDARAAN TERFILTER
  const calculateVehicleTypes = (data) => {
    let busCount = 0;
    let truckCount = 0;
    let elfCount = 0;
    let lvCount = 0;

    data.forEach((item) => {
      const jenis = item.jenisKendaraan ? item.jenisKendaraan.toUpperCase().trim() : "";
      if (jenis === "BUS" || jenis.includes("BUS")) busCount++;
      else if (jenis === "TRUCK" || jenis.includes("TRUCK")) truckCount++;
      else if (jenis === "ELF" || jenis.includes("ELF")) elfCount++;
      else if (jenis === "LV" || jenis.includes("LV")) lvCount++;
    });

    setVehicleTypes({ bus: busCount, truck: truckCount, elf: elfCount, lv: lvCount });
  };

  const totalFiltered = vehicleTypes.bus + vehicleTypes.truck + vehicleTypes.elf + vehicleTypes.lv;

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 space-y-6">
      
      {/* HEADER DASHBOARD & TOGGLE FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-red-600 font-black">PT TRUBA JAGA CITA</p>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Monitoring Dashboard</h1>
          <p className="text-sm text-gray-500">
            Data terfilter: <span className="font-bold text-red-600 uppercase">{filterType === "hari" ? "Hari Ini" : filterType === "minggu" ? "Minggu Ini" : "Bulan Ini"}</span>
          </p>
        </div>
        
        {/* BUTTON CONTROLLER FILTER & REFRESH */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-xl flex border border-gray-200 shadow-inner">
            <button 
              onClick={() => setFilterType("hari")} 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === "hari" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setFilterType("minggu")} 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === "minggu" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Minggu Ini
            </button>
            <button 
              onClick={() => setFilterType("bulan")} 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterType === "bulan" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
            >
              Bulan Ini
            </button>
          </div>

          <button 
            onClick={fetchChecklists}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-all text-xs active:scale-95"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* METRIKS UTAMA KONDISI UNIT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-red-600 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Form Masuk</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{stats.total} <span className="text-sm font-normal text-gray-400">Log</span></h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xl font-bold">📊</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-emerald-500 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Unit Kondisi Aman</p>
            <h3 className="text-3xl font-black text-emerald-700 mt-1">{stats.aman} <span className="text-sm font-normal text-gray-400">Lolos</span></h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl font-bold">Ready</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-l-4 border-amber-500 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Temuan Kendala Alat</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.perhatian} <span className="text-sm font-normal text-gray-400">Temuan</span></h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl text-xl font-bold">⚠️</div>
        </div>
      </div>

      {/* COMPONENT SUMMARY PROGRESS BAR KAPASITAS ARMADA (5 GRID TERMASUK LV & TOTAL) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          🚍 Distribusi Berdasarkan Data Masuk ({totalFiltered} Form)
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* PROGRESS BUS */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-400 block uppercase">BUS</span>
            <span className="text-2xl font-black text-gray-800 block mt-1">
              {vehicleTypes.bus} <span className="text-xs text-gray-400 font-medium">Log</span>
            </span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-red-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (vehicleTypes.bus / totalFiltered) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* PROGRESS TRUCK */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-400 block uppercase">TRUCK</span>
            <span className="text-2xl font-black text-gray-800 block mt-1">
              {vehicleTypes.truck} <span className="text-xs text-gray-400 font-medium">Log</span>
            </span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-red-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (vehicleTypes.truck / totalFiltered) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* PROGRESS ELF */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-400 block uppercase">ELF</span>
            <span className="text-2xl font-black text-gray-800 block mt-1">
              {vehicleTypes.elf} <span className="text-xs text-gray-400 font-medium">Log</span>
            </span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-red-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (vehicleTypes.elf / totalFiltered) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* PERUBAHAN: PROGRESS LV (DISEDIAKAN SEKARANG) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-400 block uppercase">LV</span>
            <span className="text-2xl font-black text-gray-800 block mt-1">
              {vehicleTypes.lv} <span className="text-xs text-gray-400 font-medium">Log</span>
            </span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-red-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${totalFiltered > 0 ? (vehicleTypes.lv / totalFiltered) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* TOTAL AKUMULASI */}
          <div className="bg-gray-900 p-4 rounded-xl text-center text-white flex flex-col justify-center col-span-2 sm:col-span-1">
            <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">TOTAL SUBMIT</span>
            <span className="text-2xl font-black block mt-1">
              {totalFiltered} <span className="text-xs text-gray-400 font-bold text-amber-300">Unit</span>
            </span>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-amber-400 h-1.5 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE TRACKING TABLE RECORD */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 text-sm tracking-wide">📋 Live Activity Log Tracker ({filteredChecklists.length} Record)</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 font-bold animate-pulse">Menghubungkan ke server database...</div>
        ) : filteredChecklists.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400 italic">Tidak ada data checklist masuk dalam periode filter ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-6">Tanggal</th>
                  <th className="py-3 px-6">Plat Unit</th>
                  <th className="py-3 px-4 text-center">Jenis Unit</th>
                  <th className="py-3 px-4">Nama Driver</th>
                  <th className="py-3 px-6 text-center">No CT</th>
                  <th className="py-3 px-6 text-center">Rute</th>
                  <th className="py-3 px-6 text-center">Ops</th>
                  <th className="py-3 px-6">Status Komponen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {filteredChecklists.map((item) => {
                  const komponenBermasalah = item.kondisiKendaraan?.filter(
                    (p) => p.status === "Rusak" || p.status === "Dalam Perbaikan"
                  ) || [];

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-gray-500 whitespace-nowrap">
                        {item.date ? item.date.substring(0, 10) : "-"}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-gray-900 uppercase whitespace-nowrap">{item.nomorPolisi}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                          item.jenisKendaraan?.toUpperCase() === "BUS" ? "bg-purple-100 text-purple-800" :
                          item.jenisKendaraan?.toUpperCase() === "TRUCK" ? "bg-amber-100 text-amber-800" :
                          item.jenisKendaraan?.toUpperCase() === "ELF" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {item.jenisKendaraan ? item.jenisKendaraan.toUpperCase() : "-"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-600 uppercase whitespace-nowrap">{item.namaDriver}</td>
                      <td className="py-3.5 px-6 text-center font-mono font-bold text-gray-500">{item.nomorCT}</td>
                      <td className="py-3.5 px-6 text-center font-semibold text-gray-600 whitespace-nowrap">{item.rute}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
                          item.beroperasi === "Ya" ? "text-emerald-700 bg-emerald-50" : "text-rose-600 bg-rose-50"
                        }`}>
                          {item.beroperasi === "Ya" ? "Jalan" : "Standby"}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {komponenBermasalah.length === 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md whitespace-nowrap">
                            🟢 Semua Aman
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {komponenBermasalah.map((p, idx) => (
                              <span 
                                key={idx} 
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                                  p.status === "Rusak" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                }`}
                              >
                                {p.partName}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}