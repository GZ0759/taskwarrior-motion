import { ref } from 'vue'
import { gsap } from 'gsap'

export function useAnimation() {
  const isAnimating = ref(false)

  async function animateComplete(element: HTMLElement): Promise<void> {
    isAnimating.value = true

    // Checkmark animation
    await gsap.to(element, {
      scale: 1.1,
      duration: 0.1,
      ease: 'power2.out',
    })

    await gsap.to(element, {
      scale: 1,
      duration: 0.1,
      ease: 'power2.in',
    })

    // Particle explosion effect
    const rect = element.getBoundingClientRect()
    const particles: HTMLElement[] = []

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: #22c55e;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
      `
      document.body.appendChild(particle)
      particles.push(particle)

      const angle = i * 30 * (Math.PI / 180)
      const distance = 30 + Math.random() * 20

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          particle.remove()
        },
      })
    }

    // Fade out the task item
    await gsap.to(element, {
      x: 100,
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: 'power2.out',
    })

    isAnimating.value = false
  }

  async function animateDelete(element: HTMLElement): Promise<void> {
    isAnimating.value = true

    await gsap.to(element, {
      x: -100,
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: 'power2.out',
    })

    isAnimating.value = false
  }

  async function animateAdd(element: HTMLElement): Promise<void> {
    isAnimating.value = true

    gsap.set(element, {
      x: 100,
      opacity: 0,
      scale: 0.8,
    })

    await gsap.to(element, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
    })

    isAnimating.value = false
  }

  function resetElement(element: HTMLElement) {
    gsap.set(element, {
      x: 0,
      opacity: 1,
      scale: 1,
    })
  }

  return {
    isAnimating,
    animateComplete,
    animateDelete,
    animateAdd,
    resetElement,
  }
}
