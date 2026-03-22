function Onboarding() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F3] px-6 text-center">
      <h1 className="mb-4 text-5xl font-semibold tracking-tight text-gray-900">
        Lumi
      </h1>

      <p className="mb-8 max-w-sm text-base leading-7 text-gray-600">
        Simplifique sua rotina capilar com cuidado personalizado.
      </p>

      <button className="w-full max-w-xs rounded-2xl bg-[#7A8F7B] px-6 py-3 text-base font-medium text-white shadow-sm transition hover:opacity-90">
        Começar diagnóstico
      </button>

      <button className="mt-4 text-sm font-medium text-gray-500 transition hover:text-gray-700">
        Já tenho conta
      </button>
    </div>
  )
}

export default Onboarding