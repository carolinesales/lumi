export default function PageContainer({ children, className = '' }) {
  return (
    <main
      className={[
        'mx-auto w-full max-w-[1440px] px-5 py-8 pb-28 lg:px-16 lg:py-10 lg:pb-12',
        className,
      ].join(' ')}
    >
      {children}
    </main>
  )
}