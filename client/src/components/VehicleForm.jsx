// client/src/components/VehicleForm.jsx
import { useState, useEffect } from "react";
import ChecklistItem from "./ChecklistItem";
import { API_URL } from "../config/api";

export default function VehicleForm() {
  const checklistParts = ["Kaca Spion", "Klakson", "Safety Belt", "AC", "Wiper", "Lampu Depan", "Lampu Rem", "Lampu Sein", "Kopling", "Rem Tangan", "Bendera"];

  const jenisKendaraanOptions = ["BUS", "TRUCK", "ELF", "LV"];

  const nomorPolisiOptions = [
    "DP 7554 GZ",
    "DP 7427 GZ",
    "DP 7507 GZ",
    "DP 7438 GZ",
    "DP 7537 GZ",
    "DP 7485 GZ",
    "DP 7429 GZ",
    "DP 7586 GZ",
    "DP 7437 GZ",
    "DP 7439 GZ",
    "DP 7445 GZ",
    "DP 7587 GZ",
    "DP 7260 GA",
    "DP 7597 JA",
    "DP 7407 GZ",
    "DP 7560 GZ",
    "DP 7656 JA",
    "DD 7536 SW",
    "DD 7355 AB",
    "DP 7584 JA",
    "DP 7588 GZ",
    "DP 7594 GZ",
    "DP 7596 GZ",
    "DW 7252 BA",
    "DP 7607 GZ",
    "DP 7580 GZ",
    "DP 7606 GZ",
    "DP 7577 GZ",
    "DP 7358 GA",
    "DP 7364 GA",
    "DP 7210 EA",
    "DP 7343 GA",
    "DP 7609 JA",
    "DP 7212 EA",
    "DP 7330 GA",
    "DD 8297 AK",
    "DP 8803 GJ",
    "DD 8662 UF",
    "DP 8532 GK",
    "DP 8049 GP",
    "DP 8260 GM",
    "DP 1580 GO",
    "DP 1843 TC",
    "DP 1521 GO",
    "DD 1896 DY",
    "DP 8220 GZ",
    "DP 8929 GZ",
    "DP 8068 GL",
    "DD 1523 DW",
  ];

  const nomorCTOptions = [
    "KOSONG",
    "12293",
    "10148",
    "11514",
    "10649",
    "10901",
    "11142",
    "10630",
    "10533",
    "10739",
    "11130",
    "10661",
    "10532",
    "10318",
    "11819",
    "10737",
    "12279",
    "12192",
    "12212",
    "11082",
    "11636",
    "10530",
    "10724",
    "11730",
    "12216",
    "11255",
    "11644",
    "11432",
    "11047",
    "10246",
    "10145",
    "10824",
    "10731",
    "12194",
    "10652",
    "10192",
    "10699",
    "10648",
    "11957",
    "11506",
    "12190",
    "11566",
    "11813",
    "7007",
    "11827",
    "7003",
  ];

  const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    date: getTodayDateString(),
    nomorPolisi: "Pilih Nomor Polisi",
    nomorCT: "Pilih Nomor CT",
    jenisKendaraan: "Pilih Jenis Kendaraan",
    namaDriver: "Pilih Nama Driver",
    badgeNumber: "",
    rute: "Pilih Rute Tujuan",
    beroperasi: "Beroperasi Hari Ini?",
  });

  const [dbEmployees, setDbEmployees] = useState([]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch(`${API_URL}/api/employees`);
        const result = await response.json();
        if (response.ok) {
          setDbEmployees(result.data);
        }
      } catch (error) {
        console.error("Gagal memuat data karyawan:", error);
      }
    };
    loadEmployees();
  }, []);

  const [kondisiKendaraan, setKondisiKendaraan] = useState(checklistParts.map((part) => ({ partName: part, status: "Baik" })));
  const [catatanTambahan, setCatatanTambahan] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDriverChange = (e) => {
    const selectedName = e.target.value;
    const employeeMatch = dbEmployees.find((emp) => emp.name === selectedName);

    setFormData((prev) => ({
      ...prev,
      namaDriver: selectedName,
      badgeNumber: employeeMatch ? employeeMatch.badgeNumber : "",
    }));
  };

  const handlePartStatusChange = (partName, newStatus) => {
    setKondisiKendaraan((prev) => prev.map((item) => (item.partName === partName ? { ...item, status: newStatus } : item)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.nomorPolisi === "Pilih Nomor Polisi") return alert("Silakan pilih Nomor Polisi!");
    if (formData.nomorCT === "Pilih Nomor CT") return alert("Silakan pilih Nomor CT!");
    if (formData.jenisKendaraan === "Pilih Jenis Kendaraan") return alert("Silakan pilih Jenis Kendaraan!");
    if (formData.namaDriver === "Pilih Nama Driver") return alert("Silakan pilih Nama Driver Anda!");
    if (formData.rute === "Pilih Rute Tujuan" || formData.beroperasi === "Beroperasi Hari Ini?") {
      return alert("Silakan lengkapi pilihan Rute dan Status Operasional!");
    }

    const finalKondisi = formData.beroperasi === "Tidak" ? checklistParts.map((part) => ({ partName: part, status: "Baik" })) : kondisiKendaraan;

    const payload = { ...formData, kondisiKendaraan: finalKondisi, catatanTambahan };

    try {
      const response = await fetch(`${API_URL}/api/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        // MENYIMPAN INFORMASI FORM KE DALAM STATE MODAL (TERMASUK TANGGAL)
        setSubmittedData({
          date: formData.date,
          namaDriver: formData.namaDriver,
          badgeNumber: formData.badgeNumber,
          nomorPolisi: formData.nomorPolisi,
        });
        setIsModalOpen(true);

        setFormData({
          date: getTodayDateString(),
          nomorPolisi: "Pilih Nomor Polisi",
          nomorCT: "Pilih Nomor CT",
          jenisKendaraan: "Pilih Jenis Kendaraan",
          namaDriver: "Pilih Nama Driver",
          badgeNumber: "",
          rute: "Pilih Rute Tujuan",
          beroperasi: "Beroperasi Hari Ini?",
        });
        setKondisiKendaraan(checklistParts.map((part) => ({ partName: part, status: "Baik" })));
        setCatatanTambahan("");
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem, pastikan backend menyala!");
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto my-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 p-6 text-white flex items-center gap-4 border-b-4 border-amber-500">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center font-black text-xl border border-white/20 shadow-inner text-amber-400">TJC</div>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300 font-bold">Aplikasi Internal</p>
            <h2 className="text-xl font-black tracking-tight text-white">PT TRUBA JAGA CITA</h2>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Vehicle Checklist System</h1>
            <p className="text-sm text-gray-500">Silakan pilih data unit dan status operasional armada Anda.</p>
          </div>

          {/* GRID INFO UTAMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Tanggal (Terkunci)</label>
              <input name="date" value={formData.date} type="date" readOnly className="border border-gray-200 p-3 rounded-xl bg-gray-100 text-gray-500 font-semibold outline-none cursor-not-allowed text-sm" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Nomor Polisi</label>
              <select
                name="nomorPolisi"
                value={formData.nomorPolisi}
                onChange={handleInputChange}
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer text-sm font-bold uppercase text-gray-700"
              >
                <option disabled>Pilih Nomor Polisi</option>
                {nomorPolisiOptions.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Nomor CT</label>
              <select
                name="nomorCT"
                value={formData.nomorCT}
                onChange={handleInputChange}
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer text-sm font-bold text-gray-700"
              >
                <option disabled>Pilih Nomor CT</option>
                {nomorCTOptions.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Jenis Kendaraan</label>
              <select
                name="jenisKendaraan"
                value={formData.jenisKendaraan}
                onChange={handleInputChange}
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer text-sm font-semibold"
              >
                <option disabled>Pilih Jenis Kendaraan</option>
                {jenisKendaraanOptions.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Nama Driver</label>
              <select
                name="namaDriver"
                value={formData.namaDriver}
                onChange={handleDriverChange}
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer text-sm font-bold uppercase text-gray-700"
              >
                <option disabled>Pilih Nama Driver</option>
                {dbEmployees.map((emp) => (
                  <option key={emp._id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Badge Number (Otomatis)</label>
              <input
                name="badgeNumber"
                value={formData.badgeNumber}
                type="text"
                readOnly
                placeholder="Akan terisi otomatis..."
                className="border border-gray-200 p-3 rounded-xl bg-gray-100 text-gray-500 font-mono font-bold outline-none cursor-not-allowed text-sm select-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Rute</label>
              <select
                name="rute"
                value={formData.rute}
                onChange={handleInputChange}
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer text-sm"
              >
                <option disabled>Pilih Rute Tujuan</option>
                {["Malili", "Wawondula", "Sorowako", "Wasuponda", "Operasional"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Status Operasional</label>
              <select
                name="beroperasi"
                value={formData.beroperasi}
                onChange={handleInputChange}
                className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer text-sm font-bold text-red-700"
              >
                <option disabled>Beroperasi Hari Ini?</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
            </div>
          </div>

          {formData.beroperasi === "Ya" && (
            <div className="space-y-6">
              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📋 Kondisi Kendaraan</h2>
                <div className="grid grid-cols-1 gap-1 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                  {kondisiKendaraan.map((item, index) => (
                    <ChecklistItem key={index} partName={item.partName} status={item.status} onChange={handlePartStatusChange} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider pl-1">Catatan Tambahan</label>
                <textarea
                  value={catatanTambahan}
                  onChange={(e) => setCatatanTambahan(e.target.value)}
                  placeholder="Tulis kondisi abnormal lainnya..."
                  rows="3"
                  className="border border-gray-200 p-3 rounded-xl bg-gray-50/30 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button type="submit" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-3.5 rounded-xl shadow-lg">
              Submit Checklist
            </button>
          </div>
        </div>
      </form>

      {/* MODAL SUCCESS (KINI DISEDIAKAN INFORMASI TANGGAL VALIDASI) */}
      {isModalOpen && submittedData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-t-4 border-red-600">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Checklist Berhasil Dikirim!</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Data laporan telah sukses direkam ke database.</p>

            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
              {/* PENAMBAHAN VISUAL: BARIS TANGGAL PENGISIAN */}
              <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                <span className="text-gray-500">Tanggal Log</span>
                <span className="font-mono font-bold text-gray-800">{submittedData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nama Driver</span>
                <span className="font-bold text-gray-800">{submittedData.namaDriver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Badge Number</span>
                <span className="font-bold font-mono text-gray-800">{submittedData.badgeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nomor Polisi</span>
                <span className="text-red-600 font-black uppercase">{submittedData.nomorPolisi}</span>
              </div>
            </div>

            <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl transition-colors hover:bg-gray-800">
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
