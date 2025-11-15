import { useEffect, useState } from 'react'
import { Search, FlaskConical, Bot, Activity, BookOpen } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function Section({ title, subtitle, icon }) {
  const Icon = icon
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

function DrugSearch() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  async function onSearch(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/drugs/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Section title="Drug database" subtitle="Instant search across drugs" icon={Search} />
      <form onSubmit={onSearch} className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search drug, class, indication..." className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading? 'Searching...' : 'Search'}</button>
      </form>
      <div className="mt-4 space-y-3 max-h-64 overflow-auto">
        {items.map((d)=> (
          <div key={d.id || d.name} className="border rounded-lg p-3">
            <div className="font-semibold text-gray-800">{d.name}</div>
            <div className="text-xs text-gray-500">{(d.brand_names||[]).join(', ')}</div>
            <div className="text-sm text-gray-600 mt-1">{d.class_name}</div>
            <div className="text-sm mt-1"><span className="font-medium">Indications:</span> {(d.indications||[]).join(', ')}</div>
            <div className="text-sm mt-1"><span className="font-medium">Side effects:</span> {(d.side_effects||[]).join(', ')}</div>
          </div>
        ))}
        {!items.length && <div className="text-sm text-gray-500">No results yet. Try seeding demo data below.</div>}
      </div>
    </div>
  )
}

function InteractionSim() {
  const [input, setInput] = useState('warfarin, fluconazole, metoprolol')
  const [pairs, setPairs] = useState([])
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/interactions/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: input.split(',').map(s=>s.trim()).filter(Boolean) })
      })
      const data = await res.json()
      setPairs(data.pairs || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Section title="Interaction simulator" subtitle="Check pairwise interactions" icon={FlaskConical} />
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400" />
        <button onClick={run} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading? 'Running...' : 'Simulate'}</button>
      </div>
      <div className="mt-4 space-y-3 max-h-64 overflow-auto">
        {pairs.map((p, i)=> (
          <div key={i} className="border rounded-lg p-3">
            <div className="flex justify-between">
              <div className="font-semibold text-gray-800">{p.drug_a} × {p.drug_b}</div>
              <span className={`text-xs px-2 py-1 rounded ${p.severity==='major'?'bg-red-100 text-red-700': p.severity==='moderate'?'bg-amber-100 text-amber-700': p.severity==='minor'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{p.severity}</span>
            </div>
            <div className="text-sm mt-1">{p.description}</div>
            {p.management && <div className="text-xs text-gray-600 mt-1">Management: {p.management}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function Chatbot() {
  const [msg, setMsg] = useState('What is the mechanism of action of warfarin?')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function ask() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) })
      const data = await res.json()
      setReply(data.reply || 'No reply')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Section title="Pharmacology chatbot" subtitle="Answers with AI (if configured)" icon={Bot} />
      <div className="flex gap-2">
        <input value={msg} onChange={e=>setMsg(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" />
        <button onClick={ask} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading? 'Asking...' : 'Ask'}</button>
      </div>
      <div className="mt-3 text-sm text-gray-800 whitespace-pre-line">{reply}</div>
    </div>
  )
}

function QuizGen() {
  const [topic, setTopic] = useState('Beta blockers')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/quizzes/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, count: 4 }) })
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Section title="Quiz generator" subtitle="Creates practice questions" icon={Activity} />
      <div className="flex gap-2">
        <input value={topic} onChange={e=>setTopic(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" />
        <button onClick={generate} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading? 'Working...' : 'Generate'}</button>
      </div>
      <div className="mt-4 space-y-3 max-h-64 overflow-auto">
        {items.map((q,i)=> (
          <div key={i} className="border rounded-lg p-3">
            <div className="font-medium">{q.question}</div>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {q.options?.map((o, j)=> <li key={j}>{o}</li>)}
            </ul>
            {typeof q.answer_index === 'number' && <div className="text-xs text-gray-600 mt-1">Answer: {q.options?.[q.answer_index]}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function ResearchAssistant() {
  const [query, setQuery] = useState('GLP-1 agonists for obesity')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/research/summarize`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
      const data = await res.json()
      setSummary(data.summary || '')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <Section title="Research assistant" subtitle="Summarizes literature" icon={BookOpen} />
      <div className="flex gap-2">
        <input value={query} onChange={e=>setQuery(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" />
        <button onClick={run} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60" disabled={loading}>{loading? 'Summarizing...' : 'Summarize'}</button>
      </div>
      <div className="mt-3 text-sm text-gray-800 whitespace-pre-line">{summary}</div>
    </div>
  )
}

function SeedDataButton() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  async function seed() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/seed`, { method: 'POST' })
      const data = await res.json()
      setStatus(`Seeded ${data.seeded?.drugs} drugs and ${data.seeded?.rules} rules`)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Need demo data?</div>
        <button onClick={seed} className="bg-gray-800 text-white px-3 py-1.5 rounded-lg disabled:opacity-60" disabled={loading}>{loading? 'Seeding...' : 'Seed demo'}</button>
      </div>
      {status && <div className="text-xs text-gray-600 mt-2">{status}</div>}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Learning Toolkit</h1>
          <p className="text-gray-600 mt-1">Search drugs, simulate interactions, chat with AI, generate quizzes, and summarize research.</p>
        </div>
        <SeedDataButton />
        <div className="grid md:grid-cols-2 gap-6">
          <DrugSearch />
          <InteractionSim />
          <Chatbot />
          <QuizGen />
          <ResearchAssistant />
        </div>
      </div>
    </div>
  )
}
