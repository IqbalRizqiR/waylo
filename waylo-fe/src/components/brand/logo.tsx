import Image from "next/image";
import {cn} from "@/lib/utils";

type LogoProps = {
  className?: string;
};

// The official Waylo wordmark, exported from the Figma file.
export function Logo({className}: LogoProps) {
  return (
    <Image
      src="/assets/images/logo-waylo.png"
      alt="Waylo"
      width={209}
      height={60}
      priority
      className={cn("h-8 w-auto md:h-9 lg:h-10 xl:h-12", className)}
    />
  );
}
