import { Progress } from '@/components/ui/progress'

export default function ReavaliacaoSteps({
  current = 1,
  steps = [],
  progress = 0,
}) {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#9A958E]">
          Como funciona
        </span>

        <div className="mt-4">
          <Progress
            value={progress}
            className="h-1.5 bg-[#ECE8E1]"
          />
        </div>
      </div>

      <div className="space-y-5">
        {steps.map(step => {
          const active = current === step.n
          const done = current > step.n

          return (
            <div
              key={step.n}
              className="flex items-start gap-3"
            >
              <div
                className={[
                  'mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black transition-all',
                  active || done
                    ? 'bg-[#181714] text-white'
                    : 'bg-[#F3F1ED] text-[#9A958E]',
                ].join(' ')}
              >
                {step.n}
              </div>

              <div>
                <strong
                  className={[
                    'block text-[13px] font-black',
                    active
                      ? 'text-[#181714]'
                      : 'text-[#5F5B55]',
                  ].join(' ')}
                >
                  {step.title}
                </strong>

                <p className="mt-1 text-[12px] leading-5 text-[#8A847D]">
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}