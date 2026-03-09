import { FC } from "react";

type BadgeVariant = "crl" | "nt" | "unacceptable" | "mode" | "info" | "default";

interface Props {
  variant: BadgeVariant;
  children: string;
}

export const Badge: FC<Props> = ({ variant, children }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);
