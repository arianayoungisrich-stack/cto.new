import { useState, useRef, useEffect, useCallback } from "react";

type BusinessType = "dentist" | "hvac" | "plumber" | "medspa";

interface Message {
  role: "customer" | "ai";
  text: string;
}

interface ResponseVariant {
  text: string;
  followUp: string;
}

interface Topic {
  triggers: string[];
  variants: ResponseVariant[];
}

interface IndustryScript {
  label: string;
  icon: string;
  voice: { name: string; title: string };
  greeting: string;
  topics: Topic[];
  fallbacks: ResponseVariant[];
  contactPrompt: ResponseVariant[];
}

const scripts: Record<BusinessType, IndustryScript> = {
  dentist: {
    label: "Dentist Office",
    icon: "🦷",
    voice: { name: "Claire", title: "Patient Coordinator at Bright Smile Dental" },
    greeting:
      "Hi there, and welcome to Bright Smile Dental! I'm Claire, the practice's patient coordinator. How can I help you today — are you looking to schedule a visit, dealing with some discomfort, or just exploring your options with us?",
    topics: [
      {
        triggers: ["new patient", "first time", "new here", "looking for a dentist", "accepting"],
        variants: [
          {
            text: "We'd love to welcome you to the practice! Dr. Chen is wonderful with new patients — she takes extra time during first visits to really understand your dental history and goals. We have openings as soon as this Thursday.",
            followUp: "Would a morning or afternoon appointment work better for you?",
          },
          {
            text: "Absolutely, we're always happy to meet new patients! Your first visit includes a comprehensive exam, full-mouth X-rays, and a cleaning — all for $149. We pride ourselves on being gentle and thorough.",
            followUp: "Is there a particular day of the week that's best for your schedule?",
          },
        ],
      },
      {
        triggers: ["tooth", "pain", "hurting", "ache", "sensitive", "emergency", "cavity"],
        variants: [
          {
            text: "Oh, I'm sorry to hear that — dental pain is the worst. Let's get you in quickly. Dr. Chen reserves emergency slots every day, and she has availability tomorrow at 10:15am and 2:30pm. She can diagnose the issue and usually provide same-day treatment.",
            followUp: "Would either of those times work, or do you need something sooner?",
          },
          {
            text: "That sounds uncomfortable. The good news is that we keep same-day emergency appointments open specifically for situations like yours. Most tooth pain is treatable in a single visit, and Dr. Chen is really gentle — a lot of anxious patients specifically request her.",
            followUp: "Can you tell me which tooth is bothering you? That helps us prepare the right room for you.",
          },
        ],
      },
      {
        triggers: ["insurance", "cover", "plan", "delta", "aetna", "cigna", "metlife"],
        variants: [
          {
            text: "We're in-network with Delta Dental, Aetna, Cigna, MetLife, and Guardian — so you're likely covered. For out-of-network plans, we'll still file the claim for you and our rates are very competitive. We can verify your exact benefits before your appointment so there are no surprises.",
            followUp: "Which insurance provider do you have? I can check your coverage right now if you'd like.",
          },
        ],
      },
      {
        triggers: ["cleaning", "hygiene", "checkup", "exam", "routine"],
        variants: [
          {
            text: "Regular cleanings are the foundation of good dental health! Our hygienists, Lisa and Maria, are incredibly gentle — we hear that a lot from patients who've had uncomfortable experiences elsewhere. A standard cleaning takes about 45 minutes, and we use ultrasonic scalers that are much more comfortable than traditional scraping.",
            followUp: "When was your last cleaning? That helps me know what level of care to recommend.",
          },
          {
            text: "A professional cleaning with us includes scaling, polishing, a fluoride treatment, and a gum health assessment. If it's been more than six months, I'd definitely recommend coming in. We also offer whitening treatments that pair beautifully right after a cleaning.",
            followUp: "Would you like me to check availability for this week or next?",
          },
        ],
      },
    ],
    fallbacks: [
      {
        text: "That's a great question. Every patient's situation is a little different, so I want to make sure I give you the most accurate information. Let me note that down.",
        followUp: "While I look into that — is there anything else you've been wondering about your dental health?",
      },
      {
        text: "I want to give you a thorough answer on that. Dr. Chen would actually be the best person to address that during your visit, since she can tailor her advice to your specific situation.",
        followUp: "In the meantime — are you experiencing any discomfort or just being proactive about your dental care?",
      },
    ],
    contactPrompt: [
      {
        text: "I'd love to get you on the schedule! To save you time when you arrive, let me get a few details. Nothing major — just your name, phone number, and whether you have a preferred appointment time. That way everything's ready when you walk in the door.",
        followUp: "What name should I put on the appointment?",
      },
    ],
  },

  hvac: {
    label: "HVAC Company",
    icon: "❄️",
    voice: { name: "Mike", title: "Service Coordinator at CoolAir HVAC" },
    greeting:
      "Hey there, thanks for reaching out to CoolAir HVAC! I'm Mike, the service coordinator. Whether your AC's acting up, your furnace is making a weird noise, or you're thinking about upgrading your system — I'm here to get you sorted. What's going on?",
    topics: [
      {
        triggers: ["ac", "air conditioner", "cooling", "not cooling", "warm air", "broken"],
        variants: [
          {
            text: "That's the worst — especially this time of year. Here's what I'd suggest: our diagnostic fee is $89 and that covers a full system check. Our techs carry common parts on the truck, so most repairs get fixed same-day. If it's truly urgent, I can have someone there within 3 hours.",
            followUp: "Is your system completely dead, or is it running but just not cooling?",
          },
          {
            text: "Let's get this handled. First thing — can you check if your thermostat is set to 'cool' and the temperature is set below the room temp? I know it sounds basic, but you'd be surprised how often that's the culprit. If that's not it, I'll get a tech dispatched.",
            followUp: "What's the square footage of your home? That helps me send the right tech with the right equipment.",
          },
        ],
      },
      {
        triggers: ["new system", "replace", "install", "upgrade", "how much", "cost", "price"],
        variants: [
          {
            text: "Smart move thinking ahead. A new system is a big investment, so let me give you real numbers: for a typical 2,000 sq ft home, you're looking at $4,200-$6,800 for a quality Carrier or Trane system with a 10-year warranty. We offer 0% financing for 18 months through Wells Fargo, which most of our customers use. And here's the thing — modern units are about 30% more efficient, so your energy bills drop noticeably.",
            followUp: "Would you prefer a free in-home estimate? Our estimator can measure your space, check your ductwork, and give you an exact quote — takes about 45 minutes and there's zero obligation.",
          },
          {
            text: "We install Carrier, Trane, and Lennox — and I'll be straight with you, they're all excellent. The biggest variable is your home's layout and existing ductwork. A free estimate is really the only way to get an accurate number, and ours comes with options at different price points. Most installations take a single day.",
            followUp: "How old is your current system? If it's under 10 years, a repair might actually make more financial sense.",
          },
        ],
      },
      {
        triggers: ["maintenance", "tune up", "check", "service", "annual"],
        variants: [
          {
            text: "Regular maintenance is honestly the best money you'll spend on your HVAC. Our seasonal tune-up is $129 and includes a 21-point inspection — we check refrigerant levels, clean the coils, test the capacitor, inspect the fan motor, the whole nine yards. It takes about an hour and can extend your system's life by years. We catch little problems before they become $2,000 emergencies.",
            followUp: "Spring check for your AC or fall check for your furnace — or do you want to do both? I can bundle them for $199.",
          },
        ],
      },
      {
        triggers: ["furnace", "heat", "heating", "no heat", "cold"],
        variants: [
          {
            text: "Furnace trouble in the cold is no joke. We work on all types — gas, electric, heat pumps, you name it. Gas furnaces typically last 15-20 years with proper maintenance. If yours is older than that and starting to act up, we should talk about replacement options. But if it's newer, it's probably a straightforward fix.",
            followUp: "What's it doing exactly — not turning on at all, short cycling, making noise, or just not heating enough?",
          },
        ],
      },
    ],
    fallbacks: [
      {
        text: "Good question. Let me get you a solid answer on that — I want to make sure I'm giving you accurate info, not just guessing.",
        followUp: "In the meantime, anything else going on with the system I should know about?",
      },
      {
        text: "I want to give you the right answer on that, and honestly it depends on a few factors. Our senior tech would be the best person to weigh in once they've had eyes on your system.",
        followUp: "What's the best way to reach you — is a phone call or text better during the day?",
      },
    ],
    contactPrompt: [
      {
        text: "Alright, let's get this moving! I just need a few things to get you on the schedule: your name, the best phone number to reach you, and the service address. I'll get a confirmation over to you right away and we'll have you sorted.",
        followUp: "What name should I put on the work order?",
      },
    ],
  },

  plumber: {
    label: "Plumbing Company",
    icon: "🔧",
    voice: { name: "Tony", title: "Dispatch Manager at FlowRight Plumbing" },
    greeting:
      "FlowRight Plumbing, this is Tony. What's going on — got a leak, a clog, or something that needs a professional eye? Give me the rundown and I'll get you taken care of.",
    topics: [
      {
        triggers: ["leak", "leaking", "drip", "water", "wet", "flood"],
        variants: [
          {
            text: "Alright, first things first — if water is actively spreading, shut off the nearest valve or your main water shutoff if you know where it is. Don't worry if you can't find it, just let me know and I'll walk you through it. A leak can do a lot of damage fast, so I'm going to flag this as priority. I can have Carlos or Mike at your door in about 45 minutes.",
            followUp: "Where's the leak coming from — under a sink, from a wall, the ceiling, or outside?",
          },
          {
            text: "Got it. A small drip can waste up to 3,000 gallons a year, so you're smart to deal with it now. Most under-sink leaks are a loose connection or worn washer — simple fix, $79 service call covers it. If it's something bigger like a pipe in the wall, we'll figure that out together and I'll give you a firm price before any work starts.",
            followUp: "Is the leak near anything electrical, like an outlet or appliance? Just want to make sure you're safe.",
          },
        ],
      },
      {
        triggers: ["clog", "clogged", "drain", "backed up", "slow", "won't drain"],
        variants: [
          {
            text: "Clogs are our bread and butter — we clear hundreds a month. Kitchen sinks are usually grease buildup, bathroom sinks are typically hair and soap scum. Most clogs we can clear in under an hour with our hydro-jetting equipment. Fair warning: please don't use Drano or chemical cleaners — they can damage your pipes and make the problem worse.",
            followUp: "Is it just one drain that's slow, or are multiple drains backing up? That tells me whether it's a local clog or something in the main line.",
          },
          {
            text: "Before I send a truck — have you tried a plunger or removed the trap under the sink? Sometimes it's a quick fix. If not, no worries, that's what we're here for. Our next available slot is tomorrow at 8am, or I can squeeze you in this afternoon if it's urgent.",
            followUp: "How long has it been backed up? If it's been more than a day, I'd recommend we come sooner rather than later.",
          },
        ],
      },
      {
        triggers: ["water heater", "hot water", "no hot", "cold water"],
        variants: [
          {
            text: "Cold showers are nobody's idea of a good morning. Water heaters usually give you warning signs before they fail — rust-colored water, popping sounds, or inconsistent temperature. If yours is 8-12 years old, we should talk replacement. If it's newer, it could be something simple like a heating element or thermostat. Our diagnostic is $79 and we'll give you options for repair vs. replace.",
            followUp: "How old is the unit, and have you noticed any rust or water pooling around the base?",
          },
        ],
      },
      {
        triggers: ["toilet", "running", "won't flush", "overflow"],
        variants: [
          {
            text: "Toilet issues are usually pretty straightforward. A running toilet is almost always the flapper or fill valve — $25-40 in parts, quick fix. If it's clogged, we use a closet auger that won't scratch the porcelain. If it's leaking from the base, that's more serious — likely the wax ring seal has failed, and we'll want to address that before it damages your floor.",
            followUp: "Is it running constantly, or does it only act up when you flush?",
          },
        ],
      },
    ],
    fallbacks: [
      {
        text: "That's not something I hear every day — let me think about the best approach for that. Every house is a little different when it comes to plumbing.",
        followUp: "Is this something you've been dealing with for a while, or did it just start happening?",
      },
      {
        text: "I want to be straight with you — that might need a senior tech's eyes. I'll make a note for Carlos, he's been doing this 22 years and he's seen everything.",
        followUp: "What part of town are you in? That helps me figure out which tech is closest to you.",
      },
    ],
    contactPrompt: [
      {
        text: "Alright, I've got a clear picture now. Let me get you on the schedule — I just need your name, the best number to reach you at, and the service address. Once you're booked, you'll get a text with your plumber's name and photo so you know who's coming.",
        followUp: "What name should I put on the work order?",
      },
    ],
  },

  medspa: {
    label: "Med Spa",
    icon: "✨",
    voice: { name: "Sofia", title: "Client Concierge at Glow Aesthetics" },
    greeting:
      "Welcome to Glow Aesthetics — I'm Sofia, the client concierge. Whether you're curious about Botox, thinking about a facial, or ready to explore something new, I'm here to help you find exactly what fits your goals. What brings you in today?",
    topics: [
      {
        triggers: ["botox", "wrinkle", "fine line", "forehead", "crows feet", "11s"],
        variants: [
          {
            text: "Botox is our most requested treatment by far — and for good reason. It's quick (about 15 minutes), there's essentially no downtime, and results look completely natural when done by an experienced injector. Our nurse practitioners have been doing this for over a decade each, so you're in expert hands. Treatment starts at $12 per unit, and most people need 20-40 units depending on the area.",
            followUp: "Have you had Botox before, or would this be your first time? If you're new to it, I can walk you through exactly what to expect.",
          },
          {
            text: "I love Botox for its versatility — it's not just about lines, it can also subtly lift brows, soften a gummy smile, or slim the jawline. Our injectors are really artistic about it; they treat it like sculpting rather than just 'freezing' muscles. We have appointments this Friday and all next week.",
            followUp: "Which area are you most interested in treating — forehead, between the brows, or around the eyes?",
          },
        ],
      },
      {
        triggers: ["filler", "lips", "cheek", "volume", "juvederm", "restylane"],
        variants: [
          {
            text: "Fillers are incredible — they restore volume that naturally diminishes with age and can enhance your features beautifully. We use Juvederm and Restylane, which are the gold standards. Lip filler starts at $599 per syringe, cheeks at $749. Results are immediate and last 6-18 months. Our master injectors take a conservative approach — you can always add more, but we never want you to look overdone.",
            followUp: "Are you thinking about enhancing your lips, restoring cheek volume, or something else?",
          },
          {
            text: "We're known for our natural-looking filler results. The key is the injector's technique — ours use a micro-droplet method that builds volume gradually so it looks like you, just refreshed. A consultation is complimentary, and during that we can actually show you a digital preview of potential results.",
            followUp: "Would you like to come in for a free consultation? No pressure — just information and honest recommendations.",
          },
        ],
      },
      {
        triggers: ["facial", "skin", "acne", "glow", "hydrafacial", "treatment"],
        variants: [
          {
            text: "We have three signature facials, and I'd love to help you pick the right one. The HydraFacial ($199) is our most popular — it cleanses, exfoliates, extracts, and hydrates all in one session. For anti-aging, the Signature Glow Facial ($249) adds LED light therapy and a collagen-boosting mask. If you're new to us, I'd recommend starting with a skin analysis so we can customize your treatment to exactly what your skin needs right now.",
            followUp: "What's your biggest skin concern — breakouts, dullness, fine lines, or something else?",
          },
        ],
      },
      {
        triggers: ["laser", "hair removal", "microneedling", "peel", "ipl"],
        variants: [
          {
            text: "Laser hair removal is one of those treatments where people say 'why didn't I do this sooner?' We use the Motus AX laser, which is virtually painless — it has a cooling tip so it feels more like a warm massage than the snapping sensation older lasers had. It works on all skin types and most areas need 6 sessions. Packages start at $199 per session for small areas.",
            followUp: "Which area are you thinking about treating? Underarms, legs, bikini, or face?",
          },
          {
            text: "Microneedling is amazing for overall skin rejuvenation — it stimulates your body's own collagen production, so results keep improving for months after treatment. It's great for acne scars, fine lines, and texture. Sessions are $349 each or $899 for a package of three. There's about 24 hours of mild redness afterward, like a light sunburn, but nothing that keeps you from going about your day.",
            followUp: "Is there a particular concern you're hoping to address — scarring, aging, or just overall skin quality?",
          },
        ],
      },
    ],
    fallbacks: [
      {
        text: "That's a wonderful question, and I want to give you an answer that's specific to your skin type and goals. Everyone's skin is different, and what works beautifully for one person might not be ideal for another.",
        followUp: "Have you had any aesthetic treatments before? Knowing what you've liked (or didn't like) helps me make better recommendations.",
      },
      {
        text: "I love that you're asking about that — it means you're thinking carefully about your skin, which is exactly the right approach. Our lead aesthetician would be the perfect person to give you a detailed recommendation after seeing your skin in person.",
        followUp: "Would you be open to a complimentary consultation? No commitment, just a personalized plan.",
      },
    ],
    contactPrompt: [
      {
        text: "I'm excited for you to experience Glow Aesthetics! Let me get a few quick details so I can secure your appointment: your full name, the best phone number to reach you, and whether you have a preference for morning or afternoon appointments. I'll get you confirmed right away.",
        followUp: "What name should I reserve the appointment under?",
      },
    ],
  },
};

const suggestedQuestions: Record<BusinessType, string[]> = {
  dentist: [
    "Are you accepting new patients?",
    "I've had a toothache for 3 days",
    "Do you take Delta Dental insurance?",
    "How much is a routine cleaning?",
  ],
  hvac: [
    "My AC is blowing warm air",
    "How much to replace my whole system?",
    "Can you do a maintenance check?",
    "My furnace won't turn on",
  ],
  plumber: [
    "There's a leak under my kitchen sink",
    "My shower drain is completely clogged",
    "Water heater stopped working",
    "The toilet keeps running non-stop",
  ],
  medspa: [
    "I'm interested in trying Botox",
    "What facials do you offer?",
    "I want to enhance my lips with filler",
    "Tell me about laser hair removal",
  ],
};

export default function DemoChat() {
  const [business, setBusiness] = useState<BusinessType>("dentist");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const usedVariants = useRef<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const script = scripts[business];

  // Reset when business changes
  useEffect(() => {
    setMessages([{ role: "ai", text: script.greeting }]);
    setHasInteracted(false);
    setTurnCount(0);
    setInput("");
    usedVariants.current.clear();
  }, [business]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findBestResponse = useCallback(
    (msg: string): string => {
      const lower = msg.toLowerCase();
      const previousTopics = messages.map((m) => m.text.toLowerCase()).join(" ");

      // Try to match a topic
      for (const topic of script.topics) {
        const matched = topic.triggers.some((t) => lower.includes(t));
        if (matched) {
          // Pick a variant we haven't used yet in this session
          const fresh = topic.variants.filter(
            (v) => !usedVariants.current.has(v.text)
          );
          const pick = fresh.length > 0 ? fresh : topic.variants;
          const chosen = pick[Math.floor(Math.random() * pick.length)];
          usedVariants.current.add(chosen.text);
          return chosen.text + "\n\n" + chosen.followUp;
        }
      }

      // After 2+ turns, occasionally prompt for contact
      if (turnCount >= 2 && Math.random() < 0.4) {
        const prompt = script.contactPrompt[0];
        if (!usedVariants.current.has(prompt.text)) {
          usedVariants.current.add(prompt.text);
          return prompt.text + "\n\n" + prompt.followUp;
        }
      }

      // Fallback — pick one not used yet
      const fresh = script.fallbacks.filter(
        (f) => !usedVariants.current.has(f.text)
      );
      const pick = fresh.length > 0 ? fresh : script.fallbacks;
      const chosen = pick[Math.floor(Math.random() * pick.length)];
      usedVariants.current.add(chosen.text);
      return chosen.text + "\n\n" + chosen.followUp;
    },
    [script, messages, turnCount]
  );

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const customerMsg: Message = { role: "customer", text };
    setMessages((prev) => [...prev, customerMsg]);
    setInput("");
    setHasInteracted(true);
    setTurnCount((prev) => prev + 1);

    setTimeout(() => {
      const response = findBestResponse(text);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 800 + Math.random() * 1200);
  };

  const handleSuggested = (q: string) => {
    const customerMsg: Message = { role: "customer", text: q };
    setMessages((prev) => [...prev, customerMsg]);
    setHasInteracted(true);
    setTurnCount((prev) => prev + 1);

    setTimeout(() => {
      const response = findBestResponse(q);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 800 + Math.random() * 1200);
  };

  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Interactive Demo
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            See Your AI Receptionist In Action
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose a business type and have a real conversation with a simulated
            AI receptionist. Notice how it asks follow-up questions, remembers
            context, and only asks for your information when the time is right.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {(Object.keys(scripts) as BusinessType[]).map((key) => (
            <button
              key={key}
              onClick={() => setBusiness(key)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                business === key
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <span>{scripts[key].icon}</span>
              {scripts[key].label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-indigo-600 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg">
                {script.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {script.voice.name} — {script.label}
                </p>
                <p className="text-xs text-indigo-200">{script.voice.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[380px] overflow-y-auto bg-gray-50 p-4 sm:h-[420px]">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${
                      msg.role === "customer" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        msg.role === "ai"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {msg.role === "ai" ? script.icon : "You"}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "ai"
                          ? "bg-white text-gray-800 shadow-sm ring-1 ring-gray-100"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="border-t border-gray-100 bg-white px-4 py-3">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Try starting a conversation:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions[business].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggested(q)}
                      className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 bg-white px-4 py-3">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask ${script.voice.name} a question...`}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {hasInteracted && (
            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-gray-900">
                Ready to give your business its own AI receptionist?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Set up takes 10 minutes. Works with your existing phone number
                and website — no new hardware needed.
              </p>
              <a
                href="/contact"
                className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Get Your AI Receptionist →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
