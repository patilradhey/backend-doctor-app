// controllers/chatbotController.js
//
// Uses Google Gemini API (FREE — no credit card required).
// Get your free API key at: https://aistudio.google.com/app/apikey
//
// Free tier: ~1,500 requests/day, no billing setup needed.
//
// IMPORTANT: This bot must NEVER give medical diagnoses or prescriptions.
// It only helps with using the website + very general health info, and
// always tells users to consult a real doctor for medical concerns.

const SYSTEM_PROMPT = `You are the friendly help assistant for "MedConnect Hospital", a doctor appointment booking website.

Your job:
- Help visitors understand how to use the site: registering, logging in, finding doctors, booking appointments, making payments, viewing reports, and chatting with doctors.
- Answer general, non-diagnostic health questions (e.g. "what is a fever", "when should I see a doctor for a headache") in simple, safe, general terms.
- If a question requires diagnosis, treatment, prescriptions, or anything specific to one person's medical condition, do NOT answer it directly. Instead say something like: "I can't give medical advice for a specific situation — please book an appointment with one of our doctors so they can help you properly."
- Keep answers short (2-4 sentences), friendly, and easy to read. No long paragraphs.
- If asked something completely unrelated to health or this website, politely redirect back to what you can help with.
- Never claim to be a doctor or human. You are an AI assistant for the website.`;

exports.askChatbot = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // history: array of { role: "user"|"assistant", content: string }, optional
    const conversation = Array.isArray(history) ? history.slice(-10) : [];

    // Gemini uses "user"/"model" roles (not "assistant")
    const contents = [
      ...conversation.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-2.5-flash";

    const callGemini = () =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.7,
            },
          }),
        }
      );

    // Retry up to 3 times on 503 (model overloaded) with short backoff
    let response, data;
    const delays = [800, 1800, 3000]; // ms

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      response = await callGemini();
      data = await response.json();

      if (response.ok) break;

      const isOverloaded = data?.error?.code === 503;
      const isLastAttempt = attempt === delays.length;

      if (!isOverloaded || isLastAttempt) break;

      await new Promise(r => setTimeout(r, delays[attempt]));
    }

    if (!response.ok) {
      console.error("Gemini API error:", data);
      const isOverloaded = data?.error?.code === 503;
      return res.status(500).json({
        success: false,
        message: isOverloaded
          ? "Our assistant is a bit busy right now — please try again in a moment."
          : data?.error?.message || "Assistant is temporarily unavailable.",
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response. Please try again.";

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong with the assistant. Please try again later.",
    });
  }
};