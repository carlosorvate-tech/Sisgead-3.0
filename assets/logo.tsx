import React from 'react';

// FIX: Rewrote component using React.createElement instead of JSX.
// JSX syntax is not valid in a .ts file and causes parsing errors.
// This file should ideally be renamed to logo.tsx.
export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    React.createElement('svg', { className: className, viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement('path', { d: "M20 80C20 46.8629 46.8629 20 80 20", stroke: "#0052CC", strokeWidth: "12", strokeLinecap: "round", strokeLinejoin: "round" }),
        React.createElement('path', { d: "M20 50C20 33.4315 33.4315 20 50 20", stroke: "#4A5568", strokeWidth: "12", strokeLinecap: "round", strokeLinejoin: "round" }),
        React.createElement('circle', { cx: "20", cy: "80", r: "10", fill: "#0052CC" })
    )
);
// bycao (ogrorvatigão) 2025