import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(location);

  useEffect(() => {
    setVisible(false);
    const t1 = setTimeout(() => {
      setKey(location);
      setVisible(true);
    }, 80);
    return () => clearTimeout(t1);
  }, [location]);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      key={key}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 220ms ease, transform 220ms ease",
      }}
    >
      {children}
    </div>
  );
}
