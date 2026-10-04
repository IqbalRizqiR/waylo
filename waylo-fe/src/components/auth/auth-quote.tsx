export function AuthQuote({children}: {children: React.ReactNode}) {
  return (
    <div className="relative max-w-[300px] xl:max-w-[340px]">
      <div className="relative rounded-3xl bg-[var(--primary)] px-5 py-4 xl:rounded-[36px] xl:px-7 xl:py-5">
        <p className="text-center text-sm font-light leading-snug tracking-[-0.025em] text-white xl:text-base">
          {children}
        </p>
        <span
          aria-hidden
          className="absolute -top-1.5 right-8 size-5 rotate-45 rounded bg-[var(--primary)] xl:-top-2 xl:right-10 xl:size-7 xl:rounded-[5px]"
        />
      </div>
    </div>
  );
}
