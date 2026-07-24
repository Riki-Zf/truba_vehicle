import React, { useState, useEffect } from "react";
import { API_URL as API_BASE_URL } from "../config/api";

const VehicleManager = ({ role }) => {
  const isSuperAdmin = role === "superadmin"; // Flag penanda privilege

  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nomorPolisi: "",
    nomorCT: "",
    jenisUnit: "",
    ruteTujuan: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const API_URL = `${API_BASE_URL}/api/vehicles`;

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.success) {
        setVehicles(result.data);
      } else {
        showAlert("error", result.message);
      }
    } catch (error) {
      showAlert("error", "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const showAlert = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return; // Guard proteksi

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const payload = {
      nomorPolisi: formData.nomorPolisi.toUpperCase().trim(),
      nomorCT: formData.nomorCT.toUpperCase().trim(),
      jenisUnit: formData.jenisUnit.toUpperCase().trim(),
      ruteTujuan: formData.ruteTujuan.toUpperCase().trim(),
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        showAlert("success", editingId ? "Data unit berhasil diperbarui!" : "Unit baru berhasil ditambahkan!");
        clearForm();
        fetchVehicles();
      } else {
        showAlert("error", result.message);
      }
    } catch (error) {
      showAlert("error", "Terjadi kesalahan sistem");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setFormData({
      nomorPolisi: vehicle.nomorPolisi,
      nomorCT: vehicle.nomorCT,
      jenisUnit: vehicle.jenisUnit,
      ruteTujuan: vehicle.ruteTujuan,
    });
  };

  const handleDelete = async (id, nomorPolisi) => {
    if (!isSuperAdmin) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus unit "${nomorPolisi}" dari database?`)) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const result = await response.json();

        if (result.success) {
          showAlert("success", "Unit berhasil dihapus!");
          fetchVehicles();
          if (editingId === id) clearForm();
        } else {
          showAlert("error", result.message);
        }
      } catch (error) {
        showAlert("error", "Gagal menghapus data");
      }
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setFormData({ nomorPolisi: "", nomorCT: "", jenisUnit: "", ruteTujuan: "" });
  };

  const filteredVehicles = vehicles.filter(
    (v) => v.nomorPolisi.toLowerCase().includes(searchQuery.toLowerCase()) || v.nomorCT.toLowerCase().includes(searchQuery.toLowerCase()) || v.jenisUnit.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = vehicles.reduce(
    (acc, v) => {
      const unit = (v.jenisUnit || "").toUpperCase();
      if (unit.includes("LV")) acc.lv += 1;
      else if (unit.includes("ELF")) acc.elf += 1;
      else if (unit.includes("BUS")) acc.bus += 1;
      else if (unit.includes("TRUCK") || unit.includes("WINGBOX")) acc.truck += 1;
      else acc.lainnya += 1;
      return acc;
    },
    { lv: 0, elf: 0, bus: 0, truck: 0, lainnya: 0 },
  );

  return (
    <div className={`max-w-7xl mx-auto my-6 px-4 grid grid-cols-1 ${isSuperAdmin ? "lg:grid-cols-3" : "grid-cols-1"} gap-6 font-sans`}>
      {/* FORM INPUT HANYA DITAMPILKAN JIKA SUPER ADMIN */}
      {isSuperAdmin && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{editingId ? "🛠️ Edit Data Kendaraan" : "🚗 Tambah Unit Baru"}</h2>
          <p className="text-xs text-gray-400 mb-4">Pengelolaan data registrasi unit kendaraan langsung ke Database.</p>

          {message.text && <div className={`p-3 mb-4 rounded-xl text-xs text-white font-medium text-center shadow-md ${message.type === "success" ? "bg-green-600 shadow-green-100" : "bg-red-600 shadow-red-100"}`}>{message.text}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Nomor Polisi</label>
              <input
                type="text"
                name="nomorPolisi"
                placeholder="Contoh: B 1234 ABC"
                value={formData.nomorPolisi}
                onChange={handleInputChange}
                required
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-bold uppercase"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Nomor CT</label>
              <input
                type="text"
                name="nomorCT"
                placeholder="Contoh: CT-09"
                value={formData.nomorCT}
                onChange={handleInputChange}
                required
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-mono font-bold uppercase"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Jenis Unit</label>
              <select
                name="jenisUnit"
                value={formData.jenisUnit}
                onChange={handleInputChange}
                required
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-semibold uppercase"
              >
                <option value="" disabled>
                  -- Pilih Jenis Unit --
                </option>
                <option value="LV">LV</option>
                <option value="ELF">ELF</option>
                <option value="BUS">BUS</option>
                <option value="TRUCK">TRUCK</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Rute Tujuan</label>
              <input
                type="text"
                name="ruteTujuan"
                placeholder="Contoh: JAKARTA - SURABAYA"
                value={formData.ruteTujuan}
                onChange={handleInputChange}
                required
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-semibold uppercase"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button type="button" onClick={clearForm} className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs transition-all">
                  Batal
                </button>
              )}
              <button
                type="submit"
                className={`font-bold py-2.5 rounded-xl text-xs text-white shadow-md transition-all ${
                  editingId ? `${editingId ? "w-1/2" : "w-full"} bg-amber-500 hover:bg-amber-600 shadow-amber-100` : "w-full bg-red-600 hover:bg-red-700 shadow-red-100"
                }`}
              >
                {editingId ? "Simpan Perubahan" : "Simpan ke Database"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW LIST KENDARAAN */}
      <div className={`${isSuperAdmin ? "lg:col-span-2" : "w-full"} bg-white p-6 rounded-2xl border border-gray-200 shadow-sm`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Master Data Kendaraan (Database)</h2>
            <p className="text-xs text-gray-500 font-medium mb-2">
              Total Terdaftar: <span className="font-bold text-gray-800">{vehicles.length} Unit</span>
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold">
                LV: <strong className="font-bold">{stats.lv}</strong>
              </span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold">
                ELF: <strong className="font-bold">{stats.elf}</strong>
              </span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-semibold">
                BUS: <strong className="font-bold">{stats.bus}</strong>
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                TRUCK: <strong className="font-bold">{stats.truck}</strong>
              </span>
              {stats.lainnya > 0 && (
                <span className="bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg font-semibold">
                  Lainnya: <strong className="font-bold">{stats.lainnya}</strong>
                </span>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="🔍 Cari no. polisi, CT, atau unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 border border-gray-200 px-3 py-2 rounded-xl bg-gray-50/50 text-xs font-semibold outline-none focus:bg-white focus:border-red-500 transition-all self-start sm:self-auto"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">No. Polisi</th>
                <th className="py-3 px-4">No. CT</th>
                <th className="py-3 px-4">Jenis Unit</th>
                <th className="py-3 px-4">Rute Tujuan</th>
                {/* Sembunyikan Header Aksi Kontrol jika bukan Super Admin */}
                {isSuperAdmin && <th className="py-3 px-4 text-center w-36">Aksi Kontrol</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? "6" : "5"} className="text-center py-10 text-gray-400 animate-pulse font-medium">
                    Sinkronisasi data database...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? "6" : "5"} className="text-center py-10 text-gray-400 italic font-medium">
                    Data kendaraan tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v, index) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-center text-gray-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-800 uppercase">{v.nomorPolisi}</td>
                    <td className="py-3 px-4 font-mono font-bold text-red-600 tracking-wider">{v.nomorCT}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-gray-100 text-gray-700 font-bold text-[10px] px-2 py-1 rounded-md uppercase tracking-wider border border-gray-200">{v.jenisUnit || "-"}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium text-[11px] uppercase">{v.ruteTujuan || "-"}</td>

                    {/* Sembunyikan Tombol Ubah dan Hapus jika bukan Super Admin */}
                    {isSuperAdmin && (
                      <td className="py-3 px-4 text-center space-x-1.5 whitespace-nowrap">
                        <button onClick={() => handleEdit(v)} className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all">
                          Ubah
                        </button>
                        <button onClick={() => handleDelete(v._id, v.nomorPolisi)} className="text-[10px] font-bold px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all">
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VehicleManager;
