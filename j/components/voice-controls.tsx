"use client"

import { useState, useRef, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, MicOff } from "lucide-react"

interface VoiceControlsProps {
  onUserMessage: (message: string) => void
  isMuted: boolean
  isListening: boolean
  toggleListening: () => void
}

export function VoiceControls({ onUserMessage, isMuted, isListening, toggleListening }: VoiceControlsProps) {
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (message.trim()) {
      onUserMessage(message)
      setMessage("")

      // Focus the input after sending
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder={isListening ? "Listening..." : "Type your message..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={isListening ? "border-red-500 focus-visible:ring-red-500" : ""}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleListening}
        aria-label={isListening ? "Stop Listening" : "Start Listening"}
      >
        {isListening ? <MicOff className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button type="submit" size="icon" disabled={!message.trim()}>
        <Send className="h-5 w-5" />
      </Button>
    </form>
  )
}
