import {useEffect,useRef,useState} from 'react';
import './Chatbot.css';

const suggestions=['Where is the Taj Mahal?','Who built the Qutub Minar?','What is the Red Fort made of?'];

export default function Chatbot(){
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState('');
  const [messages,setMessages]=useState([{role:'assistant',text:'Welcome to the museum! Ask me about the Taj Mahal, Qutub Minar, or Red Fort.',id:'welcome'}]);
  const [messageNumber,setMessageNumber]=useState(0);
  const [isSending,setIsSending]=useState(false);
  const [error,setError]=useState('');
  const endRef=useRef(null);

  useEffect(()=>{if(open)endRef.current?.scrollIntoView({behavior:'smooth',block:'end'});},[open,messages,error,isSending]);

  async function sendQuestion(question){
    const text=question.trim();
    if(!text||isSending)return;
    const userMessageNumber=messageNumber+1;
    const history=messages.filter(message=>message.id!=='welcome').map(({role,text})=>({role,text})).slice(-11);
    while(history[0]?.role==='assistant')history.shift();
    const conversation=[...history,{role:'user',text}];
    setMessages(current=>[...current,{role:'user',text,id:userMessageNumber}]);
    setMessageNumber(userMessageNumber);
    setError('');
    setIsSending(true);
    setInput('');
    try{
      const response=await fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:conversation}),
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||`Chat request failed (${response.status}).`);
      if(typeof data.reply!=='string'||!data.reply.trim())throw new Error('Gemini returned an empty answer. Please try again.');
      setMessages(current=>[...current,{role:'assistant',text:data.reply,id:userMessageNumber}]);
    }catch(requestError){
      setError(requestError instanceof Error?requestError.message:'Unable to reach Gemini. Please try again.');
    }finally{
      setIsSending(false);
    }
  }

  return <div className="museum-chat">
    {open&&<section className="chat-panel" aria-label="Museum guide chatbot">
      <header className="chat-header"><div><span className="chat-status"/>GEMINI MUSEUM GUIDE<h2>Ask about the monuments</h2></div><button type="button" className="chat-close" aria-label="Close museum guide" onClick={()=>setOpen(false)}>×</button></header>
      <div className="chat-messages" aria-live="polite">
        {messages.map((message,index)=><p key={`${message.role}-${message.id??index}`} className={`chat-message ${message.role}`}>{message.text}</p>)}
        {messages.length===1&&<div className="chat-suggestions">{suggestions.map(question=><button type="button" key={question} disabled={isSending} onClick={()=>sendQuestion(question)}>{question}</button>)}</div>}
        {isSending&&<p className="chat-typing" role="status">Gemini is thinking…</p>}
        {error&&<p className="chat-error" role="alert">{error}</p>}
        <div ref={endRef}/>
      </div>
      <form className="chat-form" onSubmit={event=>{event.preventDefault();sendQuestion(input);}}>
        <label className="sr-only" htmlFor="museum-chat-input">Ask the museum guide</label>
        <input id="museum-chat-input" value={input} onChange={event=>setInput(event.target.value)} placeholder="Ask a question…" autoComplete="off" maxLength={2000} disabled={isSending}/>
        <button type="submit" aria-label="Send question" disabled={!input.trim()||isSending}>{isSending?'…':'Send'}</button>
      </form>
      <p className="chat-footnote">Gemini AI · Answers grounded in this museum’s exhibit notes.</p>
    </section>}
    <button type="button" className="chat-launcher" aria-expanded={open} aria-label={open?'Close museum guide':'Open museum guide'} onClick={()=>setOpen(value=>!value)}>
      <span aria-hidden="true">{open?'×':'✦'}</span>{open?'Close guide':'Ask Gemini'}
    </button>
  </div>;
}
