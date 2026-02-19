import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import { useKiosk } from '../kiosk.context'

function KioskWelcomePage() {
  const navigate = useNavigate()
  const { reset } = useKiosk()
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = useMemo(
    () => [
      {
        title: 'Customize every order',
        description: 'Tap to add extras, remove ingredients, and make it yours.',
        icon: 'tune',
        tone: 'cool',
      },
      {
        title: 'Pay at the counter',
        description: 'Get a number first, then pay when you are ready.',
        icon: 'payments',
        tone: 'fresh',
      },
      {
        title: 'Quick pickup flow',
        description: 'Orders go straight to the kitchen once paid.',
        icon: 'restaurant',
        tone: 'warm',
      },
    ],
    [],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const handleStart = () => {
    reset()
    navigate('/kiosk/order-type')
  }

  const currentSlide = slides[activeSlide]

  return (
    <section className="kiosk-page kiosk-hero kiosk-attract">
      <button type="button" className="kiosk-attract-card" onClick={handleStart}>
        <div className="kiosk-attract-badge">
          <span className="material-symbols-rounded" aria-hidden="true">
            touchscreen
          </span>
          Self-order kiosk
        </div>

        <div className="kiosk-attract-gallery">
          <div className="kiosk-attract-column left">
            <img
              className="kiosk-attract-img float-a"
              src="/lumpia.jpg"
              alt="Crispy lumpia"
            />
            <img
              className="kiosk-attract-img float-b"
              src="/shrimp.jpg"
              alt="Garlic butter shrimp"
            />
            <img
              className="kiosk-attract-img float-c"
              src="/rootBeer.jpg"
              alt="Chilled root beer"
            />
          </div>

          <div className="kiosk-attract-center">
            <img
              className="kiosk-attract-img is-large float-b"
              src="/adobo.jpg"
              alt="Chicken adobo"
            />
            <img
              className="kiosk-attract-img is-large float-a"
              src="/carbonara.jpg"
              alt="Carbonara pasta"
            />
            <img
              className="kiosk-attract-img is-large float-c"
              src="/chilliFish.jpg"
              alt="Sweet chili fish"
            />
            <img
              className="kiosk-attract-img is-large float-b"
              src="/pizza.jpg"
              alt="Pizza slice"
            />
          </div>

          <div className="kiosk-attract-column right">
            <img
              className="kiosk-attract-img float-c"
              src="/salmon.jpg"
              alt="Grilled salmon"
            />
            <img
              className="kiosk-attract-img float-a"
              src="/spaghetti.jpg"
              alt="Spaghetti plate"
            />
            <img
              className="kiosk-attract-img float-b"
              src="/burger1.jpg"
              alt="Classic burger"
            />
          </div>
        </div>

        <h1>Tap to start your order</h1>

        <p className="muted">
          Browse the menu, customize items, and get a slip before paying at the counter.
        </p>

        <div className="kiosk-attract-slide" key={activeSlide}>
          <span
            className={`material-symbols-rounded kiosk-attract-icon tone-${currentSlide.tone}`}
            aria-hidden="true"
          >
            {currentSlide.icon}
          </span>
          <div>
            <h3>{currentSlide.title}</h3>
            <p className="muted">{currentSlide.description}</p>
          </div>
        </div>

        <div className="kiosk-hero-actions">
          <Button 
            size="lg" 
            onClick={handleStart} 
            icon="arrow_forward"
            aria-label="Start your order"
          >
            Start Order
          </Button>
        </div>

        <div className="kiosk-hero-foot">
          <div>
            <strong>Touch-friendly</strong>
            <p className="muted">Large buttons, minimal typing.</p>
          </div>
          <div>
            <strong>Order slip</strong>
            <p className="muted">Get a number and proceed to pay.</p>
          </div>
        </div>
      </button>
    </section>
  )
}

export default KioskWelcomePage
