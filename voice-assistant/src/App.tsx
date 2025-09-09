import React from 'react'
import './App.css'
import { StoreProvider, useStore } from './state/store'
import { useVoice } from './voice/useVoice'
import { VoiceButton } from './components/VoiceButton'
import { ShoppingList } from './components/ShoppingList'
import { getSuggestions } from './suggestions/suggest'
import { parseIntent } from './nlp/intent'

function AppInner() {
  const { state, dispatch } = useStore()
  const [lastAction, setLastAction] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState<string>('')

  const voice = useVoice((intent, utterance) => {
    handleIntent(intent, utterance)
  })

  function handleIntent(intent: ReturnType<typeof parseIntent>, utterance: string) {
    switch (intent.type) {
      case 'ADD_ITEM': {
        if (!intent.item) break
        dispatch({ type: 'ADD_ITEM', payload: { name: intent.item, quantity: intent.quantity } })
        setLastAction(`Added ${intent.quantity || 1} ${intent.item}`)
        break
      }
      case 'REMOVE_ITEM': {
        if (!intent.item) break
        dispatch({ type: 'REMOVE_ITEM', payload: { name: intent.item } })
        setLastAction(`Removed ${intent.item}`)
        break
      }
      case 'UPDATE_QUANTITY': {
        if (!intent.item) break
        dispatch({ type: 'UPDATE_ITEM', payload: { name: intent.item, quantity: intent.quantity || 1 } })
        setLastAction(`Set ${intent.item} to ${intent.quantity || 1}`)
        break
      }
      case 'SEARCH_ITEM': {
        setSearchQuery(intent.item || '')
        setLastAction(`Searching for ${intent.item}`)
        break
      }
      default: {
        setLastAction('Say: add milk, remove milk, find apples under $5')
      }
    }
  }

  const suggestions = React.useMemo(() => getSuggestions(state.items, state.history), [state.items, state.history])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1>Voice Command Shopping Assistant</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <VoiceButton status={voice.status} onStart={voice.start} onStop={voice.stop} />
        <div style={{ fontSize: 12, opacity: 0.7 }}>Status: {voice.status}</div>
      </div>
      {voice.lastTranscript && (
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Heard: "{voice.lastTranscript}"</div>
      )}
      {lastAction && (
        <div style={{ fontSize: 14, background: '#f0fdf4', border: '1px solid #dcfce7', padding: '8px 10px', borderRadius: 10, marginBottom: 12 }}>{lastAction}</div>
      )}

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Type or speak: add milk, remove milk, find apples"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleIntent(parseIntent(searchQuery), searchQuery)
            }
          }}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}
        />
      </div>

      <ShoppingList items={state.items} onRemove={(name) => dispatch({ type: 'REMOVE_ITEM', payload: { name } })} />

      <div style={{ marginTop: 16 }}>
        <h3>Smart Suggestions</h3>
        <ul>
          {suggestions.map((s, i) => (
            <li key={i}>{s.text}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
