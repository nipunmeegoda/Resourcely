import React, { useEffect, useRef, useState } from "react";

const WelcomeCard = () => {
    const [headerCollapsed, setHeaderCollapsed] = useState(false);
    const collapsibleRef = useRef<HTMLDivElement | null>(null);
    const [contentMaxHeight, setContentMaxHeight] = useState<number>(0);

    useEffect(() => {
        const t = setTimeout(() => setHeaderCollapsed(true), 5000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const el = collapsibleRef.current;
        if (!el) return;

        const measure = () => setContentMaxHeight(el.scrollHeight);
        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div>
            <div
                className={[
                    "mb-10 bg-white rounded-lg shadow-sm overflow-hidden",
                    "transition-[padding] duration-500 ease-in-out",
                    headerCollapsed ? "py-2 px-4" : "p-6",
                ].join(" ")}
                aria-live="polite"
            >
                {/* smoothly collapsing + fading block */}
                <div
                    ref={collapsibleRef}
                    style={{
                        maxHeight: headerCollapsed ? 0 : contentMaxHeight,
                        opacity: headerCollapsed ? 0 : 1,
                        transition: "max-height 600ms ease-in-out, opacity 600ms ease-in-out",
                        willChange: "max-height, opacity",
                    }}
                    className="overflow-hidden"
                    aria-hidden={headerCollapsed}
                >
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
                            Welcome Back!
                        </h1>
                        <div className="w-20 h-1 bg-blue-500 mx-auto mb-4" />
                        <p className="text-base md:text-lg text-blue-700 mb-2">
                            Manage your bookings and discover available spaces
                        </p>
                    </div>
                </div>

                {/* always-visible date row */}
                <p
                    className={[
                        "text-center text-blue-700",
                        headerCollapsed ? "text-md font-medium opacity-90" : "text-sm  opacity-80",
                    ].join(" ")}
                >
                    Today is{" "}
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>
        </div>
    );
};

export default WelcomeCard;
