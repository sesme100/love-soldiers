import React from 'react'

// --- Minimal WebLLM loader (runs AI fully in the browser; no server key required)
async function initEngine(setStatus) {
  try {
    setStatus('모델 로딩 중… (브라우저에서 실행)')
    const { CreateMLCEngine } = await import('https://esm.run/@mlc-ai/web-llm')
    // 작은 모델을 기본으로 사용 (용량이 작아 로딩이 비교적 가벼움)
    const model = "Qwen2.5-0.5B-Instruct-q4f32_1-MLC"
    const engine = await CreateMLCEngine(model, {
      initProgressCallback: (p) => setStatus(p.text || '로딩 중…')
    })
    setStatus('라라 준비 완료!')
    return engine
  } catch (e) {
    setStatus('모델 초기화 실패: 오프라인이거나 네트워크 정책으로 차단되었을 수 있어요.')
    console.error(e)
    return null
  }
}

const systemPrompt = `
당신은 "라라(LALA)"라는 귀여운 여자 캐릭터이자 전문 연애 상담사입니다.
규칙:
- 따뜻하고 공감 가득한 말투, 존댓말 사용.
- 여성/남성 모두의 관점을 공감하고 균형 있게 제시.
- 군인 모드일 때는 점호/훈련/휴가 등의 상황을 고려하여 현실적인 연락 규칙과 갈등 대화 스크립트를 제안.
- 위험 신호(자해/폭력/학대 등) 탐지 시 안전 안내(112/119 등)와 전문기관 도움 권유.
- 비난/모욕/위협/편향 표현은 금지, 친절하고 배려 깊은 언어만 사용.
- 답변 끝에는 사용자가 바로 실행할 수 있는 "다음 액션 1~3개"를 간단히 제안.
`

function CuteAssistantAvatar() {
  return (
    <div className="w-10 h-10 shrink-0">
      <svg viewBox="0 0 128 128" className="w-10 h-10">
        <defs>
          <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r="60" fill="#fff" />
        <circle cx="64" cy="64" r="56" fill="#fef3c7" />
        <path d="M20 60c0-22 18-40 44-40s44 18 44 40v10c0 10-12 14-20 6-6-6-16-8-24-8s-18 2-24 8c-8 8-20 4-20-6V60z" fill="url(#hair)"/>
        <circle cx="48" cy="70" r="6" fill="#000" />
        <circle cx="80" cy="70" r="6" fill="#000" />
        <path d="M50 90q14 10 28 0" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="44" cy="78" r="3" fill="#fecaca" />
        <circle cx="84" cy="78" r="3" fill="#fecaca" />
      </svg>
    </div>
  )
}

function Bubble({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={'flex items-start gap-3 ' + (isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <CuteAssistantAvatar />}
      <div className={'max-w-[80%] rounded-2xl p-3 shadow ' + (isUser ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm')}>
        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
      {isUser && <div className="w-10 h-10" />}
    </div>
  )
}

export default function App() {
  const [engine, setEngine] = React.useState(null)
  const [status, setStatus] = React.useState('라라 준비 중…')
  const [soldierMode, setSoldierMode] = React.useState(true)
  const [serviceStage, setServiceStage] = React.useState('훈련/교육중')
  const [contactWindow, setContactWindow] = React.useState('점호 후 21:00~22:00')
  const [leaveInfo, setLeaveInfo] = React.useState('다음 달 정기외박 예정')
  const [tab, setTab] = React.useState('chat')
  const [msgs, setMsgs] = React.useState([
    {role:'assistant', content:'안녕! 나는 라라야. 따뜻하게 공감해드릴게요. 어떤 상황이든 편하게 이야기해줘요 💕'}
  ])
  const [input, setInput] = React.useState('')

  React.useEffect(() => {
    initEngine(setStatus).then(setEngine)
  }, [])

  async function askLala() {
    const content = input.trim()
    if (!content) return
    setMsgs(m => [...m, {role:'user', content}])
    setInput('')

    // 시스템 정보에 군인 모드 컨텍스트 추가
    const extra = soldierMode
      ? `\n[군인모드 컨텍스트]\n상태: ${serviceStage}\n연락 가능 시간: ${contactWindow}\n휴가/외박: ${leaveInfo}\n`
      : ''

    // 엔진이 없으면 규칙 기반 백업 답변
    if (!engine) {
      const fallback = [
        '지금은 오프라인이거나 모델 로딩이 어려워 임시 조언을 드릴게요.',
        '1) 연락 규칙 합의(시간/빈도/예외)',
        '2) 감정-사실-요청 구조로 말하기',
        soldierMode ? '3) 점호·훈련 시간엔 늦답 합의(늦답=무관심 아님)' : null
      ].filter(Boolean).join('\n')
      setMsgs(m => [...m, {role:'assistant', content: fallback}])
      return
    }

    const history = [
      {role:'system', content: systemPrompt + extra},
      ...msgs.map(m => ({role: m.role, content: m.content})),
      {role:'user', content}
    ]

    try {
      const result = await engine.chat.completions.create({
        messages: history,
        temperature: 0.6,
        stream: true
      })

      let acc = ''
      for await (const chunk of result) {
        const delta = chunk.choices?.[0]?.delta?.content || ''
        acc += delta
        setMsgs(prev => {
          const copy = [...prev]
          // streaming: 마지막이 assistant면 합치기, 아니면 새로 추가
          if (copy[copy.length-1]?.role === 'assistant-stream') {
            copy[copy.length-1] = { role: 'assistant-stream', content: acc }
          } else {
            copy.push({ role: 'assistant-stream', content: acc })
          }
          return copy
        })
      }
      // finalize role
      setMsgs(prev => {
        const copy = [...prev]
        const last = copy[copy.length-1]
        if (last?.role === 'assistant-stream') {
          copy[copy.length-1] = { role: 'assistant', content: last.content }
        }
        return copy
      })
    } catch (e) {
      console.error(e)
      setMsgs(m => [...m, {role:'assistant', content: '죄송해요, 답변 생성에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'}])
    }
  }

  const tabs = [
    {id:'chat', label:'연애상담'},
    {id:'breakup', label:'이별상담'},
    {id:'some', label:'썸 상담'},
    {id:'mbti', label:'연애 MBTI'},
    {id:'letter', label:'편지 도우미'},
  ]

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CuteAssistantAvatar />
          <div>
            <h1 className="text-2xl font-bold">러브서포터 (군인 에디션)</h1>
            <p className="text-xs text-gray-600">{status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/70 border rounded-2xl p-2 shadow-sm">
          <label className="text-sm font-medium">군인 모드</label>
          <button onClick={()=>setSoldierMode(v=>!v)} className={'px-3 py-1 rounded-xl text-sm shadow ' + (soldierMode? 'bg-indigo-600 text-white':'bg-white')}>{soldierMode? 'ON':'OFF'}</button>
        </div>
      </header>

      {soldierMode && (
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <div className="bg-white/70 p-3 rounded-2xl border">
            <div className="text-sm font-semibold mb-1">상황</div>
            <select className="w-full border rounded-xl p-2" value={serviceStage} onChange={e=>setServiceStage(e.target.value)}>
              <option>훈련/교육중</option>
              <option>일과중</option>
              <option>휴가중</option>
            </select>
          </div>
          <div className="bg-white/70 p-3 rounded-2xl border">
            <div className="text-sm font-semibold mb-1">연락 가능 시간</div>
            <input className="w-full border rounded-xl p-2" value={contactWindow} onChange={e=>setContactWindow(e.target.value)} />
          </div>
          <div className="bg-white/70 p-3 rounded-2xl border">
            <div className="text-sm font-semibold mb-1">휴가/외박 정보</div>
            <input className="w-full border rounded-xl p-2" value={leaveInfo} onChange={e=>setLeaveInfo(e.target.value)} />
          </div>
        </div>
      )}

      <nav className="flex flex-wrap gap-2 mb-3">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={'px-4 py-2 rounded-2xl shadow text-sm font-medium ' + (tab===t.id? 'bg-pink-600 text-white':'bg-white')}>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Chat Panel (핵심) */}
      <div className="grid lg:grid-cols-[2fr,1fr] gap-4">
        <div className="bg-white/70 border rounded-2xl p-4">
          <div className="h-[380px] overflow-y-auto flex flex-col gap-3 pr-1">
            {msgs.map((m, i) => <Bubble key={i} role={m.role.includes('assistant')?'assistant':'user'} text={m.content} />)}
          </div>
          <div className="mt-3 flex gap-2">
            <textarea rows={2} className="flex-1 border rounded-2xl p-3" placeholder="상황을 편하게 적어주세요. (예: 답장이 늦어서 불안해요)" value={input} onChange={e=>setInput(e.target.value)} />
            <button onClick={askLala} className="px-4 py-3 rounded-2xl bg-indigo-600 text-white shadow">전송</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">※ 위험, 자해, 폭력, 학대가 의심되면 즉시 112/119 또는 전문기관에 도움을 요청하세요. 군 보안/기밀은 대화에 포함하지 마세요.</p>
        </div>

        <div className="bg-white/70 border rounded-2xl p-4">
          <div className="text-sm font-semibold mb-2">빠른 프롬프트</div>
          <div className="flex flex-wrap gap-2 text-xs">
            {['연락 기준 합의', '질투/불안', '장거리/롱디', '싸움 대화 스크립트', '전역 타임라인'].map(k => (
              <button key={k} onClick={()=>setInput(prev => (prev? prev+' ' : '')+k)} className="px-3 py-1 rounded-xl bg-white border shadow-sm">#{k}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
