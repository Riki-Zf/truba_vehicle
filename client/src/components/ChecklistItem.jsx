// client/src/components/ChecklistItem.jsx
export default function ChecklistItem({ partName, status, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 mb-1 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-gray-50 transition-colors">
      <span className="font-semibold text-gray-700 text-sm md:text-base pl-2">{partName}</span>
      <div className="w-44">
        <select
          value={status}
          onChange={(e) => onChange(partName, e.target.value)}
          className="w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg text-sm font-bold shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer transition-all"
        >
          <option value="Baik" className="text-emerald-600 font-bold">
            🟢 Baik
          </option>
          <option value="Rusak" className="text-rose-600 font-bold">
            🔴 Rusak
          </option>
          <option value="Dalam Perbaikan" className="text-amber-600 font-bold">
            🟡 Dalam Perbaikan
          </option>
        </select>
      </div>
    </div>
  );
}
