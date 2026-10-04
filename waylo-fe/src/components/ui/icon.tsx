"use client";

import {Icon as IconifyIcon, addCollection} from "@iconify/react";
import mingcuteIcons from "@iconify-json/mingcute/icons.json";

addCollection(mingcuteIcons);

export type IconProps = {
  name: string;
  className?: string;
  "aria-hidden"?: boolean;
};

export function Icon({name, className, ...rest}: IconProps) {
  return (
    <IconifyIcon
      icon={name}
      className={className}
      aria-hidden={rest["aria-hidden"] ?? true}
      inline
    />
  );
}