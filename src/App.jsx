import { useState } from 'react'
import './App.css'

const QUESTIONS = [
  {
    id: 1,
    question: "Your friend is in danger. What's your move?",
    options: [
      { text: "Rush in without thinking — protect them at all costs", value: "impulsive-loyal" },
      { text: "Calculate the best approach first, then act", value: "strategic-calm" },
      { text: "Use whatever dirty trick it takes to win", value: "cunning-ruthless" },
      { text: "Stand back — getting emotional clouds judgment", value: "cold-detached" },
    ]
  },
  {
    id: 2,
    question: "What drives you most?",
    options: [
      { text: "Proving everyone who doubted me wrong", value: "revenge-pride" },
      { text: "Protecting the people I care about", value: "protective-warm" },
      { text: "Uncovering the truth, no matter the cost", value: "curious-obsessive" },
      { text: "Reaching a power no one has ever touched", value: "ambitious-isolated" },
    ]
  },
  {
    id: 3,
    question: "How do you handle losing?",
    options: [
      { text: "I don't accept it — I train until I can't lose again", value: "relentless-stubborn" },
      { text: "Analyze exactly what went wrong and fix it", value: "analytical-cold" },
      { text: "Smile and remember — losing teaches more than winning", value: "composed-wise" },
      { text: "Rage. Pure rage. Then channel it.", value: "volatile-powerful" },
    ]
  },
  {
    id: 4,
    question: "Pick your fighting style:",
    options: [
      { text: "Raw power — overwhelm them before they can react", value: "brute-power" },
      { text: "Speed and precision — one shot, one kill", value: "surgical-fast" },
      { text: "Psychological warfare — break their mind first", value: "mental-manipulative" },
      { text: "Adaptability — copy, counter, dominate", value: "adaptive-mirror" },
    ]
  },
  {
    id: 5,
    question: "Your darkest trait?",
    options: [
      { text: "I push people away before they can leave", value: "lonely-isolated" },
      { text: "I'll sacrifice anyone for the greater goal", value: "utilitarian-cold" },
      { text: "My pride makes me underestimate threats", value: "arrogant-blind" },
      { text: "I lose myself completely when someone I love is hurt", value: "berserk-emotional" },
    ]
  },
  {
    id: 6,
    question: "Which line hits you hardest?",
    options: [
      { text: '"I\'ll keep moving forward — that\'s my only option"', value: "forward-driven" },
      { text: '"Everything is calculated. Nothing surprises me."', value: "chess-player" },
      { text: '"I don\'t want to rule the world. I want to change it."', value: "idealist-rebel" },
      { text: '"You either win or you learn. I choose to win."', value: "winner-mentality" },
    ]
  },
]

const ANIME_IMAGES = {
  "Gojo Satoru": "https://api.dicebear.com/7.x/shapes/svg?seed=gojo&backgroundColor=4c1d95",
  "Levi Ackerman": "https://api.dicebear.com/7.x/shapes/svg?seed=levi&backgroundColor=1e293b",
  "Light Yagami": "https://api.dicebear.com/7.x/shapes/svg?seed=light&backgroundColor=0f172a",
  "Itachi Uchiha": "https://api.dicebear.com/7.x/shapes/svg?seed=itachi&backgroundColor=1a0a0a",
  "Killua Zoldyck": "https://api.dicebear.com/7.x/shapes/svg?seed=killua&backgroundColor=0c1a2e",
  "Eren Yeager": "https://api.dicebear.com/7.x/shapes/svg?seed=eren&backgroundColor=14200e",
  "Sukuna": "https://api.dicebear.com/7.x/shapes/svg?seed=sukuna&backgroundColor=2d0a0a",
  "Ayanokoji Kiyotaka": "https://api.dicebear.com/7.x/shapes/svg?seed=ayanokoji&backgroundColor=0a1a0a",
}

function StatBar({ label, value }) {
  return (
    <div className="stat-bar">
      <span className="stat-label">{label}</span>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="stat-value">{value}</span>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('intro') // intro | quiz | loading | result
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function startQuiz() {
    setScreen('quiz')
    setCurrentQ(0)
    setAnswers([])
    setSelected(null)
  }

  function selectOption(value) {
    setSelected(value)
  }

  function nextQuestion() {
    if (!selected) return
    const newAnswers = [...answers, selected]

    if (currentQ < QUESTIONS.length - 1) {
      setAnswers(newAnswers)
      setCurrentQ(currentQ + 1)
      setSelected(null)
    } else {
      setAnswers(newAnswers)
      submitQuiz(newAnswers)
    }
  }

  async function submitQuiz(finalAnswers) {
    setScreen('loading')
    setError(null)

    const prompt = `You are an anime character matching AI. Based on the following quiz answers, match the user to ONE iconic anime character and provide a detailed personality breakdown.

Quiz answers (personality traits revealed):
${finalAnswers.map((a, i) => `Q${i+1}: ${a}`).join('\n')}

Characters you can match to (pick the BEST fit):
Gojo Satoru, Levi Ackerman, Light Yagami, Itachi Uchiha, Killua Zoldyck, Eren Yeager, Sukuna, Ayanokoji Kiyotaka

Respond ONLY with this exact JSON (no extra text, no markdown fences):
{
  "character": "Character Name",
  "anime": "Anime Name",
  "tagline": "A single sharp sentence that captures their essence (max 12 words)",
  "summary": "3-4 sentences about why this person matches this character. Be specific about the traits revealed in their answers. Make it feel personal and accurate.",
  "stats": {
    "Power": 85,
    "Intelligence": 70,
    "Loyalty": 90,
    "Ruthlessness": 40,
    "Charisma": 75,
    "Emotional Control": 60
  },
  "darkSide": "One sentence about their shadow trait — the flaw that makes them dangerous or self-destructive.",
  "quote": "A real or fitting quote from or about this character (max 15 words)"
}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setScreen('result')
    } catch (err) {
      console.error(err)
      setError('Failed to get your result. Check your API key or try again.')
      setScreen('quiz')
      setCurrentQ(QUESTIONS.length - 1)
    }
  }

  function restart() {
    setScreen('intro')
    setCurrentQ(0)
    setAnswers([])
    setSelected(null)
    setResult(null)
    setError(null)
  }

  if (screen === 'intro') return <IntroScreen onStart={startQuiz} />
  if (screen === 'loading') return <LoadingScreen />
  if (screen === 'result' && result) return <ResultScreen result={result} onRestart={restart} />

  // quiz screen
  const q = QUESTIONS[currentQ]
  const progress = ((currentQ) / QUESTIONS.length) * 100

  return (
    <div className="quiz-screen">
      <div className="quiz-header">
        <span className="quiz-counter font-mono">{String(currentQ + 1).padStart(2, '0')} / {QUESTIONS.length}</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="quiz-body">
        <p className="question-eyebrow">QUESTION {currentQ + 1}</p>
        <h2 className="question-text">{q.question}</h2>

        <div className="options-grid">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option-btn ${selected === opt.value ? 'selected' : ''}`}
              onClick={() => selectOption(opt.value)}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt.text}</span>
            </button>
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          className={`next-btn ${selected ? 'active' : ''}`}
          onClick={nextQuestion}
          disabled={!selected}
        >
          {currentQ === QUESTIONS.length - 1 ? 'Reveal My Character →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

function IntroScreen({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="intro-bg-glow" />
      <div className="intro-content">
        <p className="intro-eyebrow font-mono">// PERSONALITY MATRIX</p>
        <h1 className="intro-title">Which Anime<br />Character<br />Are You?</h1>
        <p className="intro-sub">
          6 questions. No soft answers.<br />
          AI-matched to your exact archetype.
        </p>
        <button className="start-btn" onClick={onStart}>
          Begin the Test
        </button>
        <p className="intro-disclaimer font-mono">powered by claude ai · 6 questions</p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  const lines = [
    "Scanning personality matrix...",
    "Cross-referencing archetypes...",
    "Analyzing your dark side...",
    "Summoning your character...",
  ]
  const [lineIdx, setLineIdx] = useState(0)

  useState(() => {
    const interval = setInterval(() => {
      setLineIdx(i => (i + 1) % lines.length)
    }, 900)
    return () => clearInterval(interval)
  })

  return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <p className="loading-text font-mono">{lines[lineIdx]}</p>
    </div>
  )
}

function ResultScreen({ result, onRestart }) {
  const imgSeed = result.character.toLowerCase().replace(/\s+/g, '')
  const bgColors = {
    'gojo': '4c1d95', 'levi': '1e293b', 'light': '0f172a',
    'itachi': '1a0a0a', 'killua': '0c1a2e', 'eren': '14200e',
    'sukuna': '2d0a0a', 'ayanokoji': '0a1a0a'
  }
  const bg = bgColors[imgSeed] || '1a1a2e'

  return (
    <div className="result-screen">
      <div className="result-glow" />

      <div className="result-card">
        <p className="result-eyebrow font-mono">// YOUR MATCH</p>

        <div className="result-header">
          <div className="result-avatar" style={{ background: `#${bg}` }}>
            <svg viewBox="0 0 100 100" className="avatar-svg">
              <circle cx="50" cy="35" r="22" fill="rgba(139,92,246,0.3)" stroke="#8b5cf6" strokeWidth="1.5"/>
              <ellipse cx="50" cy="80" rx="30" ry="20" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1"/>
              <circle cx="50" cy="35" r="10" fill="#8b5cf6" opacity="0.8"/>
            </svg>
          </div>

          <div className="result-identity">
            <h2 className="result-character">{result.character}</h2>
            <p className="result-anime font-mono">{result.anime}</p>
            <p className="result-tagline">"{result.tagline}"</p>
          </div>
        </div>

        <div className="result-summary">
          <p>{result.summary}</p>
        </div>

        <div className="result-stats">
          <p className="stats-title font-mono">// STATS</p>
          {Object.entries(result.stats).map(([label, value]) => (
            <StatBar key={label} label={label} value={value} />
          ))}
        </div>

        <div className="dark-side-box">
          <p className="dark-side-label font-mono">⚠ SHADOW TRAIT</p>
          <p className="dark-side-text">{result.darkSide}</p>
        </div>

        <blockquote className="result-quote">
          "{result.quote}"
        </blockquote>

        <button className="restart-btn" onClick={onRestart}>
          Retake Quiz
        </button>
      </div>
    </div>
  )
}
