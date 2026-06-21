// client/src/components/EmployeePage.jsx
import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // State Input Form CRUD
  const [inputName, setInputName] = useState("");
  const [inputBadge, setInputBadge] = useState("");
  const [inputUnit, setInputUnit] = useState("");
  const [inputTujuan, setInputTujuan] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Opsi dropdown Unit dan Tujuan
  const UNIT_OPTIONS = ["BUS", "TRUCK", "ELF", "LV"];
  const TUJUAN_OPTIONS = ["MALILI", "SOROWAKO", "WASUPONDA", "WAWONDULA", "OPERASIONAL"];

  // 1. AMBIL DATA KARYAWAN DARI DATABASE MONGODB
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/employees`);
      const result = await response.json();
      if (response.ok) {
        setEmployees(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data karyawan:", error);
      alert("Gagal menyambungkan ke server database backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. FITUR: TAMBAH (ADD) & UBAH (UPDATE) KE DATABASE
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!inputName.trim() || !inputBadge.trim()) return alert("Semua kolom harus diisi!");

    if (!inputUnit) return alert("Unit kendaraan harus dipilih!");
    if (!inputTujuan) return alert("Rute tujuan harus dipilih!");

    const payload = {
      name: inputName.toUpperCase().trim(),
      badgeNumber: inputBadge.trim(),
      unit: inputUnit,
      tujuan: inputTujuan,
    };

    try {
      if (editingId) {
        // PROSES UPDATE (PUT)
        const response = await fetch(`${API_URL}/api/employees/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
          setEditingId(null);
          fetchEmployees(); // Ambil data terbaru dari DB
        } else {
          alert("Gagal memperbarui: " + result.message);
        }
      } else {
        // PROSES TAMBAH BARU (POST)
        const response = await fetch(`${API_URL}/api/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
          fetchEmployees(); // Ambil data terbaru dari DB
        } else {
          alert("Gagal menambahkan: " + result.message);
        }
      }

      // Reset form input
      setInputName("");
      setInputBadge("");
      setInputUnit("");
      setInputTujuan("");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Terjadi kesalahan sistem!");
    }
  };

  // Trigger klik tombol Ubah
  const handleEditTrigger = (emp) => {
    setEditingId(emp._id);
    setInputName(emp.name);
    setInputBadge(emp.badgeNumber);
    setInputUnit(emp.unit || "");
    setInputTujuan(emp.tujuan || "");
  };

  // 3. FITUR: HAPUS (DELETE) DARI DATABASE
  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Hapus karyawan "${name}" dari database permanen?`)) {
      try {
        const response = await fetch(`${API_URL}/api/employees/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (response.ok) {
          fetchEmployees(); // Muat ulang data dari DB
          if (editingId === id) handleCancelEdit();
        } else {
          alert("Gagal menghapus: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInputName("");
    setInputBadge("");
    setInputUnit("");
    setInputTujuan("");
  };

  // Logika Filter Pencarian Realtime
  const filteredEmployees = employees.filter((emp) => emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.badgeNumber.includes(searchQuery));

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORM INPUT TEMA TRUBA (MERAH & EMAS) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-gray-800 mb-1">{editingId ? "🛠️ Edit Data Karyawan" : "👥 Tambah Karyawan Baru"}</h2>
        <p className="text-xs text-gray-400 mb-4">Pengelolaan data registrasi personil lapangan langsung ke Database.</p>

        <form onSubmit={handleSaveEmployee} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Nama Driver</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap..."
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-semibold uppercase"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Badge Number</label>
            <input
              type="text"
              placeholder="Contoh: 14949"
              value={inputBadge}
              onChange={(e) => setInputBadge(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-mono font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Unit Kendaraan</label>
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-bold text-gray-700 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Pilih jenis unit --
              </option>
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Rute / Tujuan</label>
            <select
              value={inputTujuan}
              onChange={(e) => setInputTujuan(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-semibold text-gray-700 appearance-none cursor-pointer"
            >
              <option value="" disabled>
                -- Pilih rute tujuan --
              </option>
              {TUJUAN_OPTIONS.map((tujuan) => (
                <option key={tujuan} value={tujuan}>
                  {tujuan}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs">
                Batal
              </button>
            )}
            <button
              type="submit"
              className={`font-bold py-2.5 rounded-xl text-xs text-white shadow-md transition-all ${editingId ? "w-1/2 bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "w-full bg-red-600 hover:bg-red-700 shadow-red-100"}`}
            >
              {editingId ? "Simpan Perubahan" : "Simpan ke Database"}
            </button>
          </div>
        </form>
      </div>

      {/* VIEW LIST KARYAWAN DARI DB */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Master Data Driver (Database)</h2>
            <p className="text-xs text-gray-400">Total terdaftar di cluster DB: {employees.length} Driver</p>
          </div>

          <input
            type="text"
            placeholder="🔍 Cari nama atau badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 border border-gray-200 px-3 py-2 rounded-xl bg-gray-50/50 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Nama Driver</th>
                <th className="py-3 px-4">Badge Number</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Rute / Tujuan</th>
                <th className="py-3 px-4 text-center w-36">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400 animate-pulse font-medium">
                    Sinkronisasi data database...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400 italic font-medium">
                    Data driver tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-800 uppercase">{emp.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600 tracking-wider">{emp.badgeNumber}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-gray-100 text-gray-700 font-bold text-[10px] px-2 py-1 rounded-md uppercase tracking-wider border border-gray-200">{emp.unit || "-"}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium text-[11px]">{emp.tujuan || "-"}</td>
                    <td className="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                      <button onClick={() => handleEditTrigger(emp)} className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100">
                        Ubah
                      </button>
                      <button onClick={() => handleDeleteEmployee(emp._id, emp.name)} className="text-[10px] font-bold px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
