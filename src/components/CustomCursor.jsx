import React, { useState, useEffect, useRef } from 'react';

const CustomCursor = () => {
    const cursorOuterRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const requestRef = useRef();
    const mousePos = useRef({ x: -100, y: -100 });

    useEffect(() => {
        const onMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            if (!isVisible) setIsVisible(true);

            // Smarter hovering detection without getComputedStyle (expensive)
            const target = e.target;
            if (!target) return;

            const isClickable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName) ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('[role="button"]') ||
                target.classList.contains('cursor-pointer');

            setIsHovering(isClickable);
        };

        const updateCursor = () => {
            if (cursorOuterRef.current) {
                cursorOuterRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
            }
            requestRef.current = requestAnimationFrame(updateCursor);
        };

        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);
        const onMouseDown = () => setIsHovering(true);
        const onMouseUp = () => setIsHovering(false);

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseenter', onMouseEnter);
        document.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);

        requestRef.current = requestAnimationFrame(updateCursor);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseenter', onMouseEnter);
            document.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            cancelAnimationFrame(requestRef.current);
        };
    }, [isVisible]);

    // Only show on desktop and non-touch devices
    if (typeof window === 'undefined') return null;

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-[999999] overflow-hidden hidden lg:block transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                ref={cursorOuterRef}
                className="absolute will-change-transform flex items-center justify-center pointer-events-none"
                style={{
                    left: 0,
                    top: 0,
                    transition: 'width 0.3s, height 0.3s, background-color 0.3s, box-shadow 0.3s',
                }}
            >
                {/* Outer Ring */}
                <div
                    className={`rounded-full border-2 border-maroon/40 flex items-center justify-center transition-all duration-300 ease-out ${isHovering ? 'w-14 h-14 bg-maroon/5 scale-110 shadow-[0_0_25px_rgba(139,38,53,0.2)]' : 'w-10 h-10 bg-transparent'}`}
                >
                    {/* Inner Dot */}
                    <div className={`rounded-full bg-maroon shadow-lg transition-all duration-300 ${isHovering ? 'w-2 h-2 opacity-100' : 'w-1.5 h-1.5 opacity-60'}`} />
                </div>

                {/* Precision Center Dot */}
                <div
                    className="absolute w-1 h-1 bg-maroon rounded-full pointer-events-none"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                />
            </div>
        </div>
    );
};

export default CustomCursor;
