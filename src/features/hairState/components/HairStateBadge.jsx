export default function HairStateBadge({
  state,
}) {
  if (!state) return null

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black"
      style={{
        background: state.color.bg,
        color: state.color.text,
        borderColor: state.color.border,
      }}
    >
      <span className="size-2 rounded-full bg-current opacity-70" />
      {state.label}
    </div>
  )
}