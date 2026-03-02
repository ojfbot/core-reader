import { TextInput } from '@carbon/react'
import './CondensedChat.css'

/**
 * Phase 1: visible but fully disabled footer.
 * Thread state + agent wiring comes in Phase 4.
 */
export default function CondensedChat() {
  return (
    <div className="condensed-chat">
      <TextInput
        id="condensed-chat-input"
        labelText=""
        hideLabel
        placeholder="Ask about the codebase — available in Phase 4"
        disabled
        size="sm"
      />
    </div>
  )
}
