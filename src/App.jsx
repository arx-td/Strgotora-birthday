import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { notifyWishViewed } from './lib/email'
import ReplyForm from './components/ReplyForm'

const BALLOON_COLORS = [
  '#e5e5ea',
  '#c7c7cc',
  '#aeaeb4',
  '#8e8e93',
  '#d6d3dc',
  '#e3cdd2',
]

const CONFETTI_COLORS = ['#f2f2f5', '#d1d1d6', '#aeaeb4', '#8e8e93', '#e3cdd2', '#cfc9dc']

function random(min, max) {
  return Math.random() * (max - min) + min
}

function makeBalloons(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: random(2, 96),
    size: random(46, 78),
    duration: random(14, 24),
    delay: random(0, 18),
    sway: random(20, 60) * (Math.random() > 0.5 ? 1 : -1),
    color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
  }))
}

function makeParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: random(0, 100),
    top: random(0, 100),
    size: random(2, 5),
    duration: random(2.5, 6),
    delay: random(0, 5),
    drift: random(10, 26) * (Math.random() > 0.5 ? 1 : -1),
  }))
}

function makeConfetti(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: random(0, 100),
    size: random(6, 12),
    duration: random(3.2, 6),
    delay: random(0, 1.2),
    rotate: random(0, 360),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    round: Math.random() > 0.5,
  }))
}

const HEART_EMOJI = ['❤️', '💕', '✨']

function makeHeartBits(count) {
  return Array.from({ length: count }, (_, i) => {
    const angle = random(0, 360)
    const distance = random(70, 200)
    const rad = (angle * Math.PI) / 180
    return {
      id: i,
      dx: Math.cos(rad) * distance,
      dy: Math.sin(rad) * distance,
      size: random(12, 22),
      delay: random(0, 0.2),
      emoji: HEART_EMOJI[Math.floor(Math.random() * HEART_EMOJI.length)],
    }
  })
}

function nextMidnight() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function App() {
  const [phase, setPhase] = useState('countdown') // countdown -> heart -> reveal
  const [remaining, setRemaining] = useState(() => nextMidnight() - new Date())
  const notifiedRef = useRef(false)

  const balloons = useMemo(() => makeBalloons(14), [])
  const particles = useMemo(() => makeParticles(40), [])
  const heartBits = useMemo(
    () => (phase === 'heart' ? makeHeartBits(16) : []),
    [phase],
  )
  const confetti = useMemo(
    () => (phase === 'reveal' ? makeConfetti(70) : []),
    [phase],
  )

  useEffect(() => {
    if (phase !== 'countdown') return
    const target = nextMidnight()
    const tick = () => {
      const diff = target - new Date()
      if (diff <= 0) {
        setRemaining(0)
        setPhase('heart')
        return
      }
      setRemaining(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'heart') return
    const id = setTimeout(() => setPhase('reveal'), 1700)
    return () => clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'reveal' && !notifiedRef.current) {
      notifiedRef.current = true
      notifyWishViewed()
    }
  }, [phase])

  const totalSeconds = Math.max(0, Math.floor(remaining / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="stage">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      <div className="particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="balloons" aria-hidden="true">
        {balloons.map((b) => (
          <span
            key={b.id}
            className="balloon"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size * 1.2,
              background: `linear-gradient(160deg, ${b.color}, #6c6c72)`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              '--sway': `${b.sway}px`,
            }}
          />
        ))}
      </div>

      {phase === 'reveal' && (
        <div className="confetti" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className={`confetti-piece ${c.round ? 'round' : ''}`}
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.size,
                background: c.color,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
                transform: `rotate(${c.rotate}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <main className="card-wrap">
        {phase === 'countdown' ? (
          <div className="glass invite">
            <p className="eyebrow">✨ For someone special ✨</p>
            <h1 className="invite-title">Something special is on its way</h1>
            <p className="invite-sub">Unlocks automatically at midnight 🌙</p>

            <div className="countdown">
              <div className="time-box">
                <span className="time-num">{pad(hours)}</span>
                <span className="time-label">Hours</span>
              </div>
              <span className="colon">:</span>
              <div className="time-box">
                <span className="time-num">{pad(minutes)}</span>
                <span className="time-label">Minutes</span>
              </div>
              <span className="colon">:</span>
              <div className="time-box">
                <span className="time-num">{pad(seconds)}</span>
                <span className="time-label">Seconds</span>
              </div>
            </div>

            <button className="skip-link" onClick={() => setPhase('heart')}>
              already midnight? tap here
            </button>
          </div>
        ) : phase === 'heart' ? (
          <div className="heart-stage" aria-hidden="true">
            <div className="heart-burst">
              {heartBits.map((h) => (
                <span
                  key={h.id}
                  className="heart-bit"
                  style={{
                    fontSize: h.size,
                    animationDelay: `${1.1 + h.delay}s`,
                    '--dx': `${h.dx}px`,
                    '--dy': `${h.dy}px`,
                  }}
                >
                  {h.emoji}
                </span>
              ))}
            </div>
            <span className="big-heart">❤️</span>
          </div>
        ) : (
          <div className="glass reveal flip-in">
            <p className="eyebrow">🎉 🎈 🎂</p>
            <h2 className="happy">Happy</h2>
            <h1 className="birthday">Birthday</h1>
            <h1 className="name">Strgotora</h1>
            <p className="message">
              Wishing you a day as beautiful as your smile and a year ahead
              filled with everything that makes you happiest. Thank you for
              being exactly who you are.
            </p>
            <p className="signature">— always yours 🤍</p>

            <ReplyForm />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
