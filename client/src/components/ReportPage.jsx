// client/src/components/ReportPage.jsx
import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function ReportPage() {
  // Master data 49 armada PT Truba Jaga Cita
  const masterVehicles = [
    "DP 7554 GZ", "DP 7427 GZ", "DP 7507 GZ", "DP 7438 GZ", "DP 7537 GZ",
    "DP 7485 GZ", "DP 7429 GZ", "DP 7586 GZ", "DP 7437 GZ", "DP 7439 GZ",
    "DP 7445 GZ", "DP 7587 GZ", "DP 7260 GA", "DP 7597 JA", "DP 7407 GZ",
    "DP 7560 GZ", "DP 7656 JA", "DD 7536 SW", "DD 7355 AB", "DP 7584 JA",
    "DP 7588 GZ", "DP 7594 GZ", "DP 7596 GZ", "DW 7252 BA", "DP 7607 GZ",
    "DP 7580 GZ", "DP 7606 GZ", "DP 7577 GZ", "DP 7358 GA", "DP 7364 GA",
    "DP 7210 EA", "DP 7343 GA", "DP 7609 JA", "DP 7212 EA", "DP 7330 GA",
    "DD 8297 AK", "DP 8803 GJ", "DD 8662 UF", "DP 8532 GK", "DP 8049 GP",
    "DP 8260 GM", "DP 1580 GO", "DP 1843 TC", "DP 1521 GO", "DD 1896 DY",
    "DP 8220 GZ", "DP 8929 GZ", "DP 8068 GL", "DD 1523 DW"
  ];

  const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [filterType, setFilterType] = useState("hari"); // Pilihan: hari, minggu, bulan
  const [dbChecklists, setDbChecklists] = useState([]);
  const [finalReport, setFinalReport] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. FETCH SEMUA DATA CHECKLIST DARI BACKEND
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/checklists`);
      const result = await response.json();
      if (response.ok) {
        setDbChecklists(result.data);
      }
    } catch (error) {
      console.error("Gagal memuat data report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // 2. LOGIKA PENYARINGAN WAKTU & REKONSILIASI DATA MASTER VS DB
  useEffect(() => {
    if (dbChecklists.length === 0 && !loading) {
      const emptyReport = masterVehicles.map((plat, index) => ({
        no: index + 1, nomorPolisi: plat, status: "BELUM CHECKLIST",
        nomorCT: "-", namaDriver: "-", badgeNumber: "-", rute: "-",
        beroperasi: "-", jamLog: "-", tanggalLog: "-", catatan: "-"
      }));
      setFinalReport(emptyReport);
      return;
    }

    // Menggunakan basis tanggal yang dipilih di input kalender
    const baseDate = new Date(selectedDate);
    const startOfSelectedDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const endOfSelectedDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999);
    
    // Hitung Hari Senin terdekat untuk Batas Awal Minggu dari tanggal yang dipilih
    const dayOfWeek = startOfSelectedDay.getDay();
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(startOfSelectedDay.getTime() - distanceToMonday * 24 * 60 * 60 * 1000);
    
    // Batas Awal Bulan dari tanggal yang dipilih (Tanggal 1)
    const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

    // Filter array data dari database berdasarkan pilihan filter aktif
    const filteredDb = dbChecklists.filter((item) => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);

      if (filterType === "hari") {
        // Harus cocok dengan hari tersebut secara spesifik
        return itemDate >= startOfSelectedDay && itemDate <= endOfSelectedDay;
      } else if (filterType === "minggu") {
        // Dari hari senin di minggu tersebut sampai akhir hari yang dipilih
        return itemDate >= startOfWeek && itemDate <= endOfSelectedDay;
      } else if (filterType === "bulan") {
        // Dari tanggal 1 di bulan tersebut sampai akhir hari yang dipilih
        return itemDate >= startOfMonth && itemDate <= endOfSelectedDay;
      }
      return true;
    });

    // Petakan ke 49 Unit Master
    const reportData = masterVehicles.map((plat, index) => {
      const unitLogs = filteredDb
        .filter((item) => item.nomorPolisi?.toUpperCase().trim() === plat.toUpperCase().trim())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Ambil log paling terbaru jika supir mengisi lebih dari 1 kali dalam rentang terfilter
      const match = unitLogs[0];

      let jamLogFormated = "-";
      let tanggalLogFormated = "-";
      if (match && match.createdAt) {
        const dateObj = new Date(match.createdAt);
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        jamLogFormated = `${hours}:${minutes} WITA`;
        tanggalLogFormated = dateObj.toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' });
      }

      return {
        no: index + 1,
        nomorPolisi: plat,
        status: match ? "SUDAH CHECKLIST" : "BELUM CHECKLIST",
        nomorCT: match && match.nomorCT ? match.nomorCT : "-",
        namaDriver: match ? match.namaDriver : "-",
        badgeNumber: match ? match.badgeNumber : "-",
        rute: match ? match.rute : "-",
        beroperasi: match ? match.beroperasi : "-",
        jamLog: jamLogFormated,
        tanggalLog: tanggalLogFormated,
        catatan: match && match.catatanTambahan ? match.catatanTambahan : "-"
      };
    });

    setFinalReport(reportData);
  }, [dbChecklists, filterType, selectedDate]);

  // 3. LOGIKA EXPORT KE EXCEL MENGGUNAKAN EXCELJS
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report Checklist");

    const labelPeriode = filterType === "hari" ? `HARI_${selectedDate}` : filterType === "minggu" ? `MINGGU_INFO_${selectedDate}` : `BULAN_INFO_${selectedDate}`;

    worksheet.columns = [
      { header: "NO", key: "no", width: 6 },
      { header: "TANGGAL LOG", key: "tanggalLog", width: 15 },
      { header: "NOMOR POLISI", key: "nomorPolisi", width: 18 },
      { header: "NOMOR CT", key: "nomorCT", width: 14 },
      { header: "STATUS LAPORAN", key: "status", width: 20 },
      { header: "JAM SUBMIT", key: "jamLog", width: 15 },
      { header: "NAMA DRIVER", key: "namaDriver", width: 24 },
      { header: "BADGE NUMBER", key: "badgeNumber", width: 16 },
      { header: "RUTE", key: "rute", width: 15 },
      { header: "OPERASIONAL", key: "beroperasi", width: 15 },
      { header: "CATATAN LAPANGAN", key: "catatan", width: 35 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" }, name: "Arial", size: 10 };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "B91C1C" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 28;

    finalReport.forEach((item) => {
      const row = worksheet.addRow(item);
      if (item.status === "SUDAH CHECKLIST") {
        row.getCell("status").font = { color: { argb: "047857" }, bold: true, name: "Arial", size: 10 };
      } else {
        row.getCell("status").font = { color: { argb: "B91C1C" }, bold: true, name: "Arial", size: 10 };
      }
      row.getCell("no").alignment = { horizontal: "center" };
      row.getCell("tanggalLog").alignment = { horizontal: "center" };
      row.getCell("nomorCT").alignment = { horizontal: "center" };
      row.getCell("status").alignment = { horizontal: "center" };
      row.getCell("badgeNumber").alignment = { horizontal: "center" };
      row.getCell("jamLog").alignment = { horizontal: "center" };
      row.getCell("beroperasi").alignment = { horizontal: "center" };
    });

    worksheet.eachRow({ includeHeader: true }, (row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "E5E7EB" } },
          left: { style: "thin", color: { argb: "E5E7EB" } },
          bottom: { style: "thin", color: { argb: "E5E7EB" } },
          right: { style: "thin", color: { argb: "E5E7EB" } },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Report_Checklist_TJC_${labelPeriode}.xlsx`);
  };

  const totalKelar = finalReport.filter(i => i.status === "SUDAH CHECKLIST").length;

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 space-y-6">
      
      {/* SEKSI CONTROLLER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-xs gap-4">
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Kalender Pemilih Hari */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Pilih Hari / Tanggal</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="border border-gray-200 p-2 rounded-xl text-xs font-bold bg-gray-50 text-gray-700 focus:outline-none focus:border-red-500 cursor-pointer h-[38px]"
            />
          </div>

          {/* Toggle Jenis Rentang Waktu */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Rentang Laporan</label>
            <div className="bg-gray-100 p-1 rounded-xl flex border border-gray-200 shadow-inner w-fit h-[38px] items-center">
              <button 
                onClick={() => setFilterType("hari")} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "hari" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"}`}
              >
                Hari Terpilih
              </button>
              <button 
                onClick={() => setFilterType("minggu")} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "minggu" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"}`}
              >
                Minggu Ini
              </button>
              <button 
                onClick={() => setFilterType("bulan")} 
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "bulan" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"}`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button 
            onClick={fetchReportData}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-gray-500 transition-all shadow-sm h-[38px]"
            title="Sinkronisasi Ulang Database"
          >
            🔄 Sync
          </button>
          <button 
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs h-[38px]"
          >
            📥 Export Excel
          </button>
        </div>
      </div>

      {/* GRID DATA TABEL */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-bold text-gray-700 text-sm tracking-wide">
              📋 Absensi Kontrol Kepatuhan Checklist Driver
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Menampilkan status 49 unit komparasi berdasarkan parameter filter aktif.
            </p>
          </div>
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-lg self-start sm:self-auto">
            Kepatuhan: {totalKelar} / {masterVehicles.length} Unit ({Math.round((totalKelar / masterVehicles.length) * 100)}%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white font-bold uppercase tracking-wider">
                <th className="py-3 px-4 text-center">No</th>
                <th className="py-3 px-4">Nomor Polisi</th>
                <th className="py-3 px-4 text-center">No CT</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tanggal Log</th>
                <th className="py-3 px-4 text-center">Jam Log</th>
                <th className="py-3 px-4">Nama Driver</th>
                <th className="py-3 px-4 text-center">Badge No</th>
                <th className="py-3 px-4 text-center">Rute</th>
                <th className="py-3 px-4 text-center">Ops</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {finalReport.map((item) => (
                <tr key={item.no} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-center text-gray-400 font-medium">{item.no}</td>
                  <td className="py-3 px-4 font-black text-gray-900 uppercase whitespace-nowrap">{item.nomorPolisi}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-gray-500">{item.nomorCT}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      item.status === "SUDAH CHECKLIST" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {item.status === "SUDAH CHECKLIST" ? "✔ KELAR" : "❌ ABSEN"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-gray-600 font-medium whitespace-nowrap">
                    {item.tanggalLog}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 whitespace-nowrap">
                    {item.jamLog}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-bold uppercase whitespace-nowrap">{item.namaDriver}</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-500 font-bold">{item.badgeNumber}</td>
                  <td className="py-3 px-4 text-center font-semibold text-gray-600">{item.rute}</td>
                  <td className="py-3 px-4 text-center">
                    {item.beroperasi !== "-" ? (
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        item.beroperasi === "Ya" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                      }`}>
                        {item.beroperasi === "Ya" ? "Jalan" : "Standby"}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-gray-400 italic" title={item.catatan}>
                    {item.catatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}