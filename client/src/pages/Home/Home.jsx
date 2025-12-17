import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const mainRef = useRef(null);
    const heroTextRef = useRef(null);
    const heroButtonRef = useRef(null);
    const bgGridRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Animations
            const tl = gsap.timeline();

            // 1. Grid Fade In
            tl.fromTo(bgGridRef.current,
                { opacity: 0 },
                { opacity: 0.2, duration: 1.5, ease: "power2.out" }
            );

            // 2. Text Reveal (Staggered words or lines)
            // We'll target the chars or lines if we split them, 
            // but for simplicity, let's animate the main headers
            tl.fromTo(".hero-text-line",
                { y: 100, opacity: 0, rotateX: -20 },
                { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.2, ease: "power4.out" },
                "-=1"
            );

            // 3. Button Reveal
            tl.fromTo(heroButtonRef.current,
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
                "-=0.5"
            );

            // Scroll Animations for sections
            gsap.utils.toArray('.fade-up-section').forEach(section => {
                gsap.fromTo(section,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

            // Parallax Effect for Background Elements
            gsap.to(".parallax-bg", {
                yPercent: 50,
                ease: "none",
                scrollTrigger: {
                    trigger: mainRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={mainRef} className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden relative">

            {/* Background Grid */}
            <div ref={bgGridRef} className="fixed inset-0 z-0 pointer-events-none opacity-0"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Ambient Glows */}
            <div className="fixed top-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-900/40 rounded-full blur-[120px] pointer-events-none parallax-bg" />
            <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-emerald-900/20 to-transparent pointer-events-none" />

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-8 md:px-12 max-w-7xl mx-auto">
                <div className="hero-text-line opacity-0 border border-white/20 px-4 py-1.5 uppercase font-bold tracking-widest text-sm hover:bg-white hover:text-black transition-colors cursor-pointer">
                    GreenGuard
                </div>

                <div className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-widest uppercase text-gray-400">
                    {['Services', 'Work', 'About', 'Blog', 'Careers'].map((item, i) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="hero-text-line opacity-0 hover:text-white transition-colors flex items-center gap-1">
                            {item}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/login" className="hero-text-line opacity-0 text-xs font-bold uppercase tracking-widest hover:text-[#ccff00] transition-colors">
                        Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative z-10 min-h-[85vh] flex flex-col items-center justify-center px-6 max-w-7xl mx-auto text-center perspective-[1000px]">

                <div ref={heroTextRef} className="z-20 transform-gpu">
                    <div className="overflow-hidden">
                        <h1 className="hero-text-line text-6xl md:text-8xl lg:text-[9rem] font-bold leading-[0.85] tracking-tighter mix-blend-screen">
                            Reach
                        </h1>
                    </div>

                    <div className="overflow-hidden">
                        <h1 className="hero-text-line text-6xl md:text-8xl lg:text-[9rem] font-bold leading-[0.85] tracking-tighter">
                            <span className="font-serif italic font-normal text-[#ccff00] relative inline-block px-4 mx-2">
                                New
                                {/* Simple SVG Orbit Ring */}
                                <svg className="absolute inset-0 w-full h-full -scale-y-110 scale-x-125 pointer-events-none" viewBox="0 0 100 50" preserveAspectRatio="none">
                                    <path d="M5,25 C5,5 95,5 95,25 C95,45 5,45 5,25" fill="none" stroke="white" strokeWidth="0.5" className="opacity-60" />
                                </svg>
                                {/* Star icons */}
                                <span className="absolute -top-4 -right-8 text-white text-2xl animate-pulse">✨</span>
                            </span>
                        </h1>
                    </div>

                    <div className="overflow-hidden">
                        <h1 className="hero-text-line text-6xl md:text-8xl lg:text-[9rem] font-bold leading-[0.85] tracking-tighter">
                            Horizons
                        </h1>
                    </div>

                    <div ref={heroButtonRef} className="mt-16 opacity-0">
                        <Link to="/signup" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#ccff00] text-black rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_40px_rgba(204,255,0,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                            Get Started
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Statement Section */}
            <section className="fade-up-section py-32 px-6 max-w-5xl mx-auto text-center relative z-20">
                <p className="text-2xl md:text-4xl leading-tight font-light text-gray-200">
                    GREENGUARD <span className="font-serif italic text-gray-500">is a full-service</span> STRATEGY, DETECTION <br />
                    <span className="font-serif italic text-gray-500">and</span> MONITORING AGENCY <span className="font-serif italic text-gray-500">that helps</span> <br />
                    EMERGING <span className="font-serif italic text-gray-500">and</span> ESTABLISHED BRANDS <br />
                    GROW <span className="font-serif italic text-[#ccff00] font-semibold text-shadow-glow">FASTER.</span>
                </p>
            </section>

            {/* Parallax Earth/Space Image */}
            <div className="fade-up-section relative w-full h-[60vh] md:h-[80vh] overflow-hidden group">
                <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-700"></div>
                <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                    alt="Earth Horizon"
                    className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-[2s] ease-out parallax-img"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505/50] z-20"></div>
            </div>

            {/* Green Section */}
            <section className="fade-up-section bg-[#ccff00] text-black py-32 px-6 relative overflow-hidden">
                {/* Rotating Badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 bg-black rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="text-[#ccff00] text-center text-[8px] font-bold uppercase tracking-widest absolute inset-2">
                        • Optimize • Strategy • Grow • Minimize
                    </div>
                    <div className="w-24 h-24 border border-[#ccff00]/30 rounded-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto text-center mt-12">
                    <p className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-black/10 inline-block pb-2">Let's Orbit</p>
                    <h2 className="text-4xl md:text-7xl font-serif leading-tight">
                        Let us help your company <br />
                        accelerate <span className="italic relative inline-block">
                            years ahead.
                            <svg className="absolute bottom-0 left-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 scale(1, -1)" stroke="black" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h2>
                    <div className="mt-16">
                        <Link to="/contact" className="inline-block px-10 py-4 border-2 border-black rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-[#ccff00] transition-all transform hover:-translate-y-1 hover:shadow-xl">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="fade-up-section bg-[#020202] text-white pt-24 pb-12 px-6 border-t border-gray-900/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">

                    {/* Left: Logo & Input */}
                    <div className="flex-1">
                        <div className="border border-white/20 px-4 py-1.5 uppercase font-bold tracking-widest text-sm inline-block mb-12 hover:border-[#ccff00] transition-colors">
                            GreenGuard
                        </div>
                        <h3 className="text-2xl md:text-4xl font-serif mb-8 leading-snug">
                            Sign up to harness the <br /> power of <span className="text-[#ccff00]">GreenGuard.</span>
                        </h3>
                        <div className="flex gap-4 max-w-md group">
                            <input type="email" placeholder="Email Address" className="flex-1 bg-transparent border-b border-gray-700 px-4 py-3 text-sm focus:border-[#ccff00] outline-none transition-colors placeholder:text-gray-600" />
                            <button className="px-6 border-b border-gray-700 text-gray-400 group-hover:text-[#ccff00] group-hover:border-[#ccff00] transition-colors">
                                →
                            </button>
                        </div>
                    </div>

                    {/* Right: Links */}
                    <div className="flex gap-16 text-sm text-gray-400">
                        <div className="flex flex-col gap-6">
                            <span className="text-white font-bold uppercase tracking-widest text-xs mb-2 text-[#ccff00]">Services</span>
                            <a href="#" className="hover:text-white hover:translate-x-1 transition-all">Real-time Analysis</a>
                            <a href="#" className="hover:text-white hover:translate-x-1 transition-all">Deforestation Alerts</a>
                            <a href="#" className="hover:text-white hover:translate-x-1 transition-all">Carbon Reporting</a>
                        </div>
                        <div className="flex flex-col gap-6">
                            <span className="text-white font-bold uppercase tracking-widest text-xs mb-2 text-[#ccff00]">Company</span>
                            <a href="#" className="hover:text-white hover:translate-x-1 transition-all">Services</a>
                            <a href="#" className="hover:text-white hover:translate-x-1 transition-all">Work</a>
                            <a href="#" className="hover:text-white hover:translate-x-1 transition-all">About</a>
                        </div>
                    </div>
                </div>

                {/* Alien/Icon Centered */}
                <div className="flex justify-center mt-24 mb-10">
                    <div className="w-16 h-16 bg-[#ccff00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:scale-110 transition-transform cursor-pointer">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
                            <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
                            <circle cx="9" cy="10" r="1.5" />
                            <circle cx="15" cy="10" r="1.5" />
                            <path d="M8.5 15c1-1 2.5-1 3.5 0 1-1 2.5-1 3.5 0" />
                        </svg>
                    </div>
                </div>

                <div className="text-center text-[10px] text-gray-700 uppercase tracking-[0.2em] hover:text-gray-500 transition-colors">
                    © 2025 GreenGuard AI. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
