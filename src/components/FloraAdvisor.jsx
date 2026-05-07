import { useState, useRef, useEffect, useMemo } from "react";
import { Send } from "lucide-react";
import { useAppState, useAppDispatch, STAGE_LABEL } from "../hooks/useAppState";
import { FLORA_BASE_PROMPT, buildFloraContextAddition } from "../data/floraSystemPrompt";

let AnthropicClient = null;
try {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
    AnthropicClient = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
} catch {}

const QUICK_REPLIES = [
  "What should I eat this trimester?",
  "Foods from my culture that help with iron?",
  "I have nausea — what can I eat?",
  "Is my baby getting enough nutrients?",
  "Foods that support breastfeeding?",
  "I'm exhausted and don't know if it's normal",
  "I have a bad headache that won't go away",
];

const STATIC_RESPONSES = {
  "What should I eat this trimester?":
    "In the first trimester, folate is your best friend — it supports your baby's neural tube development. Think leafy greens, lentils, black beans, and fortified foods. If nausea is making things hard, go for small, bland meals: toast, rice, ginger tea, or congee. In the second trimester, iron and calcium become more important as your blood volume expands. By the third, add more protein and vitamin D. What trimester are you in? I can give you more specific suggestions.",
  "Foods from my culture that help with iron?":
    "So many traditional foods are iron powerhouses! A few examples: collard greens and black-eyed peas (Southern/West African), lentil dal (South Asian), callaloo (Caribbean), mchicha/amaranth greens (East African), black beans (Latin American), and egusi seeds (West African). The key with plant-based iron is pairing it with vitamin C — like a squeeze of lemon or tomato — to boost absorption. What cultural background do you cook from? I'd love to get more specific.",
  "I have nausea — what can I eat?":
    "First trimester nausea is so hard — you need to eat but everything sounds terrible. A few things that tend to help: cold foods (nausea is often triggered by smell, and cold foods have less aroma), small frequent meals instead of big ones, plain starchy foods like toast, crackers, rice, or plain congee, and ginger in any form — tea, candied ginger, or ginger ale. Sour flavors like lemon can also help settle the stomach. What time of day is your nausea worst?",
  "Is my baby getting enough nutrients?":
    "During pregnancy, your baby takes what it needs from you first — which is why your own nutrition matters so much. The nutrients to watch most are folate (neural tube, especially in T1), iron (blood volume and oxygen delivery), calcium and vitamin D (bone development), and DHA omega-3 (brain and eye development). Are you taking a prenatal vitamin? That's the best safety net. Is there a specific nutrient you're worried about? I can point you to the best food sources.",
  "Foods that support breastfeeding?":
    "Breast milk quality is remarkably stable even when your diet isn't perfect — your body prioritizes your baby. But to protect your own stores, focus on: omega-3 rich foods (fatty fish, walnuts, flaxseed) for milk DHA, iron-rich foods to replenish what you lost at birth, and stay well hydrated (aim for 13 cups of fluids daily). Some mothers find galactagogues — foods like oats, fenugreek, brewer's yeast, and moringa — help with supply, though the evidence is mixed. Are you also taking a postnatal vitamin?",
  "I'm exhausted and don't know if it's normal":
    "Yes — this kind of exhaustion is extremely common, especially in the first year. Interrupted sleep compounds over time in ways that hit harder than any single all-nighter. That said, exhaustion that feels crushing or doesn't improve with rest can be a sign of anemia or thyroid issues, both common postpartum. When did you last have bloodwork done? If it's been more than 6 weeks since delivery, it's worth asking your provider for a postpartum panel.",
  "I have a bad headache that won't go away":
    "A persistent headache after delivery — especially if it's severe, or comes with vision changes, swelling, or upper abdominal pain — is something I take seriously. Those can be signs of postpartum preeclampsia, which can develop up to 6 weeks after birth. If any of those symptoms are present alongside your headache, please contact your provider or go to the ER today. If it's more of a tension headache, check your water intake and sleep first. How long has it been going on?",
  "i have anxiety and a killer headache":
    "I'm so sorry you're dealing with both anxiety and a severe headache — that sounds really tough. Anxiety is incredibly common during pregnancy and postpartum, and when it comes with a bad headache, it's important to rule out any medical causes. A severe headache could be related to preeclampsia, especially if accompanied by vision changes, swelling, or abdominal pain. Please reach out to your healthcare provider today to discuss both symptoms. In the meantime, try some gentle anxiety-reducing practices like deep breathing or a short walk. Have you been able to talk to anyone about how you're feeling?",
  "im anxious":
    "Anxiety during pregnancy and postpartum is so common — you're not alone in this. Many mothers experience it due to hormonal changes, sleep disruption, and the big life changes happening. If it's interfering with your daily life or feels overwhelming, talking to your provider about it is a great step. They can help determine if it's something that might benefit from additional support. What kinds of things tend to trigger your anxiety right now?",
  "i have anxiety":
    "Anxiety during pregnancy and postpartum is so common — you're not alone in this. Many mothers experience it due to hormonal changes, sleep disruption, and the big life changes happening. If it's interfering with your daily life or feels overwhelming, talking to your provider about it is a great step. They can help determine if it's something that might benefit from additional support. What kinds of things tend to trigger your anxiety right now?",
  "im sick":
    "I'm sorry you're not feeling well. During pregnancy and postpartum, feeling sick can come from many things — from hormones and tiredness to a simple cold or stomach upset. If your symptoms feel severe, sudden, or include fever, nausea, dizziness, or pain, please contact your provider. In the meantime, rest, stay hydrated, and reach out to someone you trust if you need support. What symptoms are you noticing right now?",
  "i am sick":
    "I'm sorry you're not feeling well. During pregnancy and postpartum, feeling sick can come from many things — from hormones and tiredness to a simple cold or stomach upset. If your symptoms feel severe, sudden, or include fever, nausea, dizziness, or pain, please contact your provider. In the meantime, rest, stay hydrated, and reach out to someone you trust if you need support. What symptoms are you noticing right now?",
  "killer headache":
    "A severe headache, especially during pregnancy or postpartum, needs to be taken seriously. It could be related to preeclampsia, dehydration, or other factors. Please contact your healthcare provider or go to urgent care if it's accompanied by vision changes, swelling, nausea, or confusion. In the meantime, rest in a dark room and stay hydrated. How long has this been going on and what does it feel like?",
};

const findStaticResponse = (input) => {
  const normalizedInput = input.toLowerCase().trim();
  
  // Exact match first using normalized keys
  const exactKey = Object.keys(STATIC_RESPONSES).find(
    (key) => key.toLowerCase() === normalizedInput
  );
  if (exactKey) return STATIC_RESPONSES[exactKey];
  
  // Check for partial or synonym matches
  for (const [key, response] of Object.entries(STATIC_RESPONSES)) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedInput.includes(normalizedKey) ||
      normalizedKey.includes(normalizedInput)
    ) {
      return response;
    }
  }
  
  // Keyword matching for symptoms
  const keywords = {
    anxious: STATIC_RESPONSES["im anxious"] || STATIC_RESPONSES["i have anxiety"],
    anxiety: STATIC_RESPONSES["im anxious"] || STATIC_RESPONSES["i have anxiety"],
    sick: STATIC_RESPONSES["im sick"],
    headache: STATIC_RESPONSES["killer headache"],
    "bad headache": STATIC_RESPONSES["I have a bad headache that won't go away"],
    nausea: STATIC_RESPONSES["I have nausea — what can I eat?"],
    exhausted: STATIC_RESPONSES["I'm exhausted and don't know if it's normal"],
  };
  
  for (const [keyword, response] of Object.entries(keywords)) {
    if (response && normalizedInput.includes(keyword)) {
      return response;
    }
  }
  
  return null;
};

export default function FloraAdvisor() {
  const { mama, baby, currentDay, floraMessages } = useAppState();
  const dispatch = useAppDispatch();
  const [input, setInput]       = useState("");
  const [streaming, setStreaming]= useState(false);
  const [streamText, setStreamText]= useState("");
  const [isDemo, setIsDemo]     = useState(!AnthropicClient);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [floraMessages, streamText]);

  const lastMood   = mama.moodLog.at(-1);
  const latestBP   = mama.bpLog.at(-1);
  const avgSleep   = mama.sleepLog.length
    ? (mama.sleepLog.slice(-7).reduce((s,l)=>s+l.hours,0)/Math.min(mama.sleepLog.length,7)).toFixed(1)
    : null;
  const babyAge    = baby.birthDay > 0 ? Math.max(0, currentDay - baby.birthDay) : 0;
  const doneCount  = baby.milestones.length;

  const floraContext = useMemo(() => buildFloraContextAddition(), []);

  const SYSTEM_PROMPT = `${FLORA_BASE_PROMPT}

${floraContext}

APP STATE CONTEXT:
- Name: ${mama.name || "Mama"}
- Day ${currentDay} of 1,000 (${STAGE_LABEL(currentDay)})
- Weeks pregnant: ${mama.weeksPregnant || 0} (0 = postpartum)
- Recent mood: ${lastMood ? `${lastMood.score}/5` : "not logged"}
- Latest BP: ${latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "not logged"}
- Average sleep: ${avgSleep ? `${avgSleep}h` : "not logged"}
- Baby name: ${baby.name}
- Baby age: ${babyAge} days old
- Milestones completed: ${doneCount}

RULES:
- Never diagnose. Triage toward care: "This is worth mentioning to your provider."
- For BP ≥ 140/90 or preeclampsia signs (headache + swelling + vision changes): "Please contact your provider or go to the ER today."
- For any suicidal ideation: immediately provide 988 and affirm help is available.
- Keep responses under 150 words unless asked for detail.
- Always end with one gentle question or next step.
- Reference specific data you can see — don't give generic advice.`;

  const sendMessage = async (text) => {
    if (!text.trim() || streaming) return;
    const userMsg = { id: Date.now(), role: "user", text, timestamp: new Date().toISOString() };
    dispatch({ type: "ADD_FLORA_MESSAGE", message: userMsg, unread: false });
    setInput("");
    setStreaming(true);
    setStreamText("");

    if (!AnthropicClient) {
      // Demo mode — static response
      const response = findStaticResponse(text) ||
        `I hear you, ${mama.name || "Mama"}. That's worth paying attention to. Can you tell me a bit more about what's going on?`;
      let i = 0;
      const interval = setInterval(() => {
        setStreamText(response.slice(0, i));
        i += 4;
        if (i > response.length) {
          clearInterval(interval);
          setStreamText("");
          setStreaming(false);
          dispatch({ type: "ADD_FLORA_MESSAGE", message: { id: Date.now()+1, role: "flora", text: response, timestamp: new Date().toISOString() } });
        }
      }, 18);
      return;
    }

    try {
      const history = [...floraMessages, userMsg]
        .filter(m => m.role === "user" || m.role === "flora")
        .map(m => ({ role: m.role === "flora" ? "assistant" : "user", content: m.text }));

      const stream = AnthropicClient.messages.stream({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: history,
      });

      let full = "";
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta?.text) {
          full += chunk.delta.text;
          setStreamText(full);
        }
      }
      setStreamText("");
      setStreaming(false);
      dispatch({ type: "ADD_FLORA_MESSAGE", message: { id: Date.now()+1, role: "flora", text: full, timestamp: new Date().toISOString() } });
    } catch (err) {
      console.error(err);
      setStreaming(false);
      setStreamText("");
      // Fallback to demo mode on API failure
      const response = findStaticResponse(text) ||
        `I hear you, ${mama.name || "Mama"}. That's worth paying attention to. Can you tell me a bit more about what's going on?`;
      let i = 0;
      const interval = setInterval(() => {
        setStreamText(response.slice(0, i));
        i += 4;
        if (i > response.length) {
          clearInterval(interval);
          setStreamText("");
          setStreaming(false);
          dispatch({ type: "ADD_FLORA_MESSAGE", message: { id: Date.now()+1, role: "flora", text: response, timestamp: new Date().toISOString() } });
        }
      }, 18);
    }
  };

  const allMessages = streaming && streamText
    ? [...floraMessages, { id: "streaming", role: "flora", text: streamText, streaming: true }]
    : floraMessages;

  const floraIntro = mama.name
    ? `Hi ${mama.name}! 🌿 I'm Flora — your wellness companion through every step of this journey. I'm here to listen, share what I know, and cheer you on, whether you're wondering about a symptom, navigating a tough day, or just need someone to talk to.\n\nOne small note: I'm AI-powered, so for anything medical, always loop in your provider — they know you best. But I'm here for everything in between. 💜\n\nHow are you feeling today, mama?`
    : `Hi there! 🌿 I'm Flora — your wellness companion in Bloom. I'm here to listen, share what I know, and cheer you on through pregnancy and beyond.\n\nOne small note: I'm AI-powered, so for anything medical, please loop in your provider. But I'm here for everything in between. 💜\n\nHow are you doing today, mama?`;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Flora 🌿
              <span className="text-[10px] bg-[#EEEDFE] text-[#534AB7] border border-[#C5C2F5] px-2 py-0.5 rounded-full font-medium">
                AI companion
              </span>
            </h2>
            <p className="text-xs text-gray-400">Powered by Claude · Always check with your provider for medical questions</p>
          </div>
          {isDemo && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {allMessages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm whitespace-pre-line">
              {floraIntro}
            </div>
          </div>
        )}
        {allMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#7F77DD] text-white rounded-br-sm"
                : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
            }`}>
              {msg.text}
              {msg.streaming && <span className="inline-block w-1.5 h-4 bg-[#7F77DD] rounded-sm ml-1 animate-pulse align-middle"/>}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Quick replies */}
      {!streaming && floraMessages.length === 0 && (
        <div className="px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2 pb-1" style={{scrollbarWidth:"none"}}>
            {QUICK_REPLIES.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs bg-[#EEEDFE] text-[#534AB7] px-3 py-2 rounded-xl border border-[#C5C2F5] hover:bg-[#DCD9FC] transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask Flora anything…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7F77DD]"
            disabled={streaming}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || streaming}
            className="bg-[#7F77DD] text-white rounded-xl px-4 disabled:opacity-40 transition-opacity">
            {streaming
              ? <span className="flex gap-1 items-center"><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"/><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:"0.15s"}}/><span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:"0.3s"}}/></span>
              : <Send size={16}/>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
