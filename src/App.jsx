import React, { useState } from 'react'

const tabs = [
  { key: 'love', label: '💌 연애 상담' },
  { key: 'breakup', label: '💔 이별 상담' },
  { key: 'some', label: '🌱 썸 상담' },
  { key: 'mbti', label: '🔮 연애 MBTI' },
  { key: 'letter', label: '✉️ 편지 답장 도우미' },
]

function TabContent({ tab }) {
  if (tab === 'love') {
    return <p>라라💖: "요즘 연애 고민이 있으신가요? 구체적으로 말씀해주시면 같이 풀어드릴게요!"</p>
  }
  if (tab === 'breakup') {
    return <p>라라😢: "이별은 정말 힘든 경험이에요. 당신의 마음을 충분히 이해해요. 함께 치유의 방법을 찾아봐요."</p>
  }
  if (tab === 'some') {
    return <p>라라🌱: "썸은 두근두근하지만 헷갈리기도 해요. 상황을 말씀해주시면 신호를 같이 분석해드릴게요."</p>
  }
  if (tab === 'mbti') {
    return <p>라라🔮: "당신의 성향에 맞는 연애 MBTI 유형을 알아볼 수 있어요. 질문을 시작해볼까요?"</p>
  }
  if (tab === 'letter') {
    return <p>라라✉️: "마음은 있는데 표현이 어렵죠? 편지를 써주시면 따뜻하고 공감가는 답장을 같이 만들어드릴게요."</p>
  }
  return <p>라라😊: "환영해요! 메뉴에서 원하는 상담을 선택해주세요."</p>
}

export default function App() {
  const [active, setActive] = useState('love')

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">러브 서포터 💕 (군인 에디션)</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={
              'px-4 py-2 rounded-full text-sm font-medium ' +
              (active === t.key
                ? 'bg-pink-500 text-white'
                : 'bg-white shadow text-pink-600 hover:bg-pink-100')
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow p-6 min-h-[200px]">
        <TabContent tab={active} />
      </div>
    </div>
  )
}
