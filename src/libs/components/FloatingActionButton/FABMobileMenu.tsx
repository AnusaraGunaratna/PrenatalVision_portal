import { FC, ReactNode, useState, useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { FloatingActionButton } from "./FloatingActionButton";

interface FABMobileMenuProps {
  children: ReactNode;
}

export const FABMobileMenu: FC<FABMobileMenuProps> = ({ children }) => {
  const isMobile = useIsMobile(768);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="fab-mobile-menu-container" ref={menuRef}>
      {/* Overlay Backdrop when open */}
      {isOpen && <div className="fab-menu-backdrop" onClick={closeMenu} />}
      
      {/* Floating Action Buttons Area */}
      <div className={`fab-mobile-stack ${isOpen ? "fab-mobile-stack--open" : ""}`}>
        {children}
      </div>

      <FloatingActionButton
        variant="default"
        size="md"
        className={`fab-trigger fab-pos-1 ${isOpen ? "fab-trigger--active" : ""}`}
        onClick={toggleMenu}
        aria-label={isOpen ? "Close actions" : "View actions"}
      >
        <span className="fab-trigger-text">{isOpen ? "Close" : "Options"}</span>
      </FloatingActionButton>
    </div>
  );
};
