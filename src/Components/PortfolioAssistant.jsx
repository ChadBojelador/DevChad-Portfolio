import { useEffect, useRef, useState } from 'react';
import './PortfolioAssistant.css';

const starterQuestions = [
  'Which project best shows your AI skills?',
  'What technologies do you work with?',
  'Tell me about your most challenging project.',
  'What should a recruiter look at first?',
  'Have you built anything involving RAG?',
];

const initialMessage = {
  role: 'assistant',
  content: 'I can help you explore Chad\'s projects, technical focus, and early AI engineering journey. What would you like to know?',
  suggestions: [],
};

function readSseChunk(buffer, onEvent) {
  const events = buffer.split(/\r?\n\r?\n/);
  const remainder = events.pop() ?? '';

  events.forEach((event) => {
    const eventName = event.match(/^event:\s*(.+)$/m)?.[1] ?? 'message';
    const data = event.match(/^data:\s*(.+)$/m)?.[1];
    if (!data) return;
    try {
      onEvent(eventName, JSON.parse(data));
    } catch {
      // Ignore malformed partial events and keep the conversation usable.
    }
  });

  return remainder;
}

export default function PortfolioAssistant({
  currentPage,
  currentProject,
  isOpen,
  onNavigateProject,
  onToggle,
  mascotSrc,
}) {
  const [messages, setMessages] = useState([initialMessage]);
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const transcriptRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
  }, [messages, isStreaming]);

  async function sendMessage(question = draft) {
    const content = question.trim();
    if (!content || isStreaming) return;

    const nextHistory = [...messages, { role: 'user', content }];
    const history = nextHistory
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-10)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }));

    setDraft('');
    setError('');
    setMessages([...nextHistory, { role: 'assistant', content: '', suggestions: [], isPending: true }]);
    setIsStreaming(true);

    try {
      const response = await fetch(import.meta.env.VITE_CHAT_API_URL ?? '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history,
          currentPage,
          currentProject,
        }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get('Retry-After'));
          const waitTime = Number.isFinite(retryAfter) && retryAfter > 0
            ? `${Math.ceil(retryAfter / 60)} minute${retryAfter > 60 ? 's' : ''}`
            : 'a few minutes';
          throw new Error(`You’ve sent a lot of questions. Please try again in ${waitTime}.`);
        }
        throw new Error('The assistant is unavailable right now. Please try again shortly.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedAnswer = false;
      const updateLastAssistant = (updater) => {
        setMessages((currentMessages) => currentMessages.map((message, index) => (
          index === currentMessages.length - 1 ? updater(message) : message
        )));
      };

      const processEvent = (eventName, payload) => {
        if (eventName === 'delta') {
          receivedAnswer = true;
          updateLastAssistant((message) => ({ ...message, content: message.content + (payload.text ?? ''), isPending: false }));
        }
        if (eventName === 'recommendations') {
          updateLastAssistant((message) => ({ ...message, suggestions: payload.projects ?? [] }));
        }
        if (eventName === 'guardrail') {
          receivedAnswer = true;
          updateLastAssistant((message) => ({ ...message, content: payload.message ?? '', isPending: false }));
        }
        if (eventName === 'error') throw new Error(payload.message ?? 'Something interrupted that response.');
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        buffer = readSseChunk(buffer, processEvent);
        if (done) break;
      }

      if (!receivedAnswer) throw new Error('The assistant could not complete that response. Please try again.');
    } catch (requestError) {
      setMessages((currentMessages) => currentMessages.slice(0, -1));
      setError(requestError.message);
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    sendMessage();
  }

  return (
    <aside className="chat-assistant" aria-label="Portfolio assistant">
      {isOpen && (
        <section id="chat-panel" className="chat-panel glass-panel" aria-labelledby="chat-title">
          <div className="chat-panel-heading">
            <div>
              <p className="eyebrow">Portfolio assistant</p>
              <h2 id="chat-title">Talk to Chad&apos;s portfolio.</h2>
            </div>
            <button className="chat-close-button" type="button" onClick={onToggle} aria-label="Close portfolio assistant">×</button>
          </div>

          <div className="chat-transcript" ref={transcriptRef} aria-live="polite" aria-label="Conversation">
            {messages.map((message, index) => (
              <div className={`chat-message chat-message--${message.role}`} key={`${message.role}-${index}`}>
                {message.isPending && !message.content ? <span className="chat-thinking"><i /><i /><i /> Thinking</span> : <p>{message.content}</p>}
                {message.suggestions?.length > 0 && (
                  <div className="chat-project-suggestions" aria-label="Recommended projects">
                    {message.suggestions.map((project) => (
                      <button className="chat-project-card" key={project.slug} type="button" onClick={() => onNavigateProject(project)}>
                        <span>{project.title}</span>
                        {project.summary && <small>{project.summary}</small>}
                        <b>View project <span aria-hidden="true">→</span></b>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {messages.length === 1 && (
            <div className="chat-starters" aria-label="Suggested questions">
              {starterQuestions.map((question) => (
                <button type="button" key={question} onClick={() => sendMessage(question)}>{question}</button>
              ))}
            </div>
          )}
          {error && <p className="chat-error" role="alert">{error}</p>}
          <div className="chat-composer">
            <textarea
              ref={inputRef}
              value={draft}
              maxLength={2000}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Chad’s work…"
              aria-label="Ask a question about Chad's portfolio"
              rows="1"
              disabled={isStreaming}
            />
            <button type="button" onClick={() => sendMessage()} disabled={!draft.trim() || isStreaming} aria-label="Send question">
              <span aria-hidden="true">↑</span>
            </button>
          </div>
          <p className="chat-input-hint">Enter to send · Shift+Enter for a new line</p>
        </section>
      )}
      <button
        className={isOpen ? 'chat-launcher is-open' : 'chat-launcher'}
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Close portfolio assistant' : 'Open portfolio assistant'}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        <span className="chat-mascot-avatar" aria-hidden="true"><img src={mascotSrc} alt="" /></span>
        <span className="chat-launcher-label">Talk to me</span>
      </button>
    </aside>
  );
}
