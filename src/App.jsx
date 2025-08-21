import React, { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#ffe6f0,#e6f7ff)', padding:'24px'}}>
      <h1>💌 러브 서포터 (군인 에디션)</h1>
      <p>이 템플릿은 GitHub Actions로 자동 배포됩니다. 저장소 이름이 바뀌면 vite.config.js의 base를 '/새이름/'으로 바꾸세요.</p>
      <button onClick={()=>setCount(c=>c+1)} style={{padding:'12px 16px', borderRadius:12, border:'none', background:'#ff6699', color:'#fff'}}>클릭 수: {count}</button>
    </div>
  )
}
