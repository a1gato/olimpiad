import { useEffect, useState } from 'react'
import '../splash.css'

export default function SplashScreen({ onFinish }) {
    const [isVisible, setIsVisible] = useState(true)
    const [animationStep, setAnimationStep] = useState(0) // 0: start, 1: logo in, 2: fade out

    useEffect(() => {
        // Step 1: Logo enters immediately
        const timer1 = setTimeout(() => setAnimationStep(1), 100)

        // Step 2: Start fading out after 2.5 seconds
        const timer2 = setTimeout(() => {
            setAnimationStep(2)
        }, 2500)

        // Step 3: Remove component from DOM after fade out completes (e.g. 500ms transition)
        const timer3 = setTimeout(() => {
            setIsVisible(false)
            onFinish()
        }, 3000)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [onFinish])

    if (!isVisible) return null

    return (
        <div className={`splash-screen ${animationStep === 2 ? 'fade-out' : ''}`}>
            <div className={`splash-content ${animationStep >= 1 ? 'visible' : ''}`}>
                <div className="logo-container">
                    <img src="/logo.png" alt="Olympiad" className="splash-logo" />
                    <div className="shine-effect"></div>
                </div>
                <h1 className="splash-title">Olympiad App</h1>
            </div>
        </div>
    )
}
