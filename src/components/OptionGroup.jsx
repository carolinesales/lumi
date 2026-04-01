export default function OptionGroup({ label, options, value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="grid gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all
              ${value === opt
                ? 'border-[#7A8F7B] bg-[#EEF3EE] text-[#5a6e5b] border-2'
                : 'border-gray-200 bg-white hover:border-[#7A8F7B] hover:bg-[#EEF3EE]'
              }`}
          >
            <span className="flex items-center justify-between">
              {opt}
              {value === opt && (
                <svg className="w-4 h-4 text-[#7A8F7B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}