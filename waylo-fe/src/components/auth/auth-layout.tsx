import Image from "next/image";
import {Link} from "@/i18n/navigation";
import {Logo} from "@/components/brand/logo";
import {AuthQuote} from "@/components/auth/auth-quote";

type AuthLayoutProps = {
  children: React.ReactNode;
  aside?: React.ReactNode;
  greeting?: {title: React.ReactNode; body: string};
  quote?: string;
};

export function AuthLayout({children, aside, greeting, quote}: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-white">
      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6 lg:hidden">
        <Link href="/" aria-label="Waylo" className="rounded-md">
          <Logo />
        </Link>
      </div>

      <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="hidden lg:flex lg:flex-col lg:justify-center lg:py-8 lg:pl-12 lg:pr-4 xl:pl-[130px]">
          <Link href="/" aria-label="Waylo" className="mb-6 inline-block w-fit rounded-md xl:mb-8">
            <Logo />
          </Link>

          {greeting ? (
            <div className="max-w-[420px]">
              <h2 className="text-2xl font-medium leading-[1.15] tracking-[-0.025em] text-black xl:text-[32px]">
                {greeting.title}
              </h2>
              <p className="mt-2 text-base font-light leading-snug tracking-[-0.025em] text-[#757575] xl:text-lg">
                {greeting.body}
              </p>
            </div>
          ) : null}

          <div className="relative mt-6 w-full max-w-[460px] xl:mt-8 xl:max-w-[520px]">
            <div
              className="relative aspect-square w-full"
              style={{
                maskImage:
                  "radial-gradient(circle at 50% 50%, #000 38%, transparent 68%)",
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 50%, #000 38%, transparent 68%)",
              }}
            >
              <Image
                src="/assets/images/login-hero.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 520px, 40vw"
                className="object-cover"
              />
            </div>
            {quote ? (
              <div className="absolute -bottom-4 left-6 xl:-bottom-6 xl:left-[50px]">
                <AuthQuote>{quote}</AuthQuote>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 md:px-10 lg:px-6 lg:py-8">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-[0_0_55px_0_rgba(0,30,192,0.15)] sm:p-6 md:max-w-lg md:rounded-3xl lg:max-w-[620px] lg:p-8 xl:max-w-[680px] xl:rounded-[35px] xl:p-10">
            {children}
            {aside ? <div className="mt-4 lg:mt-5">{aside}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
