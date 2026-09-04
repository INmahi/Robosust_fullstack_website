"use client";

import { useEffect } from "react";

export function PageEffects({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((element) => observer.observe(element));

    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const handleScroll = () => {
      let current = "top";
      sections.forEach((section) => {
        if (window.scrollY >= (section as HTMLElement).offsetTop - 180) current = section.id;
      });
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${current}`;
        link.classList.toggle("text-white", isActive);
        link.querySelector("span")?.classList.toggle("after:w-full", isActive);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return <>{children}</>;
}
