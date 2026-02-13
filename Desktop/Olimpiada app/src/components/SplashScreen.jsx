import { useEffect, useState } from 'react'
import '../splash.css'

export default function SplashScreen({ onFinish }) {
    const [isVisible, setIsVisible] = useState(true)
    const [animationStep, setAnimationStep] = useState(0)

    useEffect(() => {
        // Timeline:
        // 0s: Start text drawing (handled by CSS)
        // 2.0s: Text drawing done, start fill/glow
        // 3.0s: Start transforming to logo (fade out text, fade in logo)

        const timer1 = setTimeout(() => {
            setAnimationStep(1) // Morph phase
        }, 2500)

        const timer2 = setTimeout(() => {
            setAnimationStep(2) // Exit phase
        }, 4500)

        const timer3 = setTimeout(() => {
            setIsVisible(false)
            onFinish()
        }, 5000)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [onFinish])

    if (!isVisible) return null

    return (
        <div className={`splash-screen ${animationStep === 2 ? 'fade-out' : ''}`}>
            <div className="splash-container">
                {/* SVG Text Animation */}
                <div className={`svg-text-container ${animationStep >= 1 ? 'hidden' : ''}`}>
                    <svg viewBox="0 0 400 100" className="splash-svg">
                        <text x="50%" y="50%" dy=".35em" textAnchor="middle" className="splash-text-path">
                            OLYMPIAD
                        </text>
                    </svg>
                </div>

                {/* Real Logo (Hidden initially, appears in step 1) */}
                <div className={`real-logo-container ${animationStep >= 1 ? 'visible' : ''}`}>
                    <img src="/logo.png" alt="Olympiad" className="real-logo" />
                </div>
            </div>
        </div>
    )
}
