import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import OpenAI from "openai";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL,
      "X-Title": "AI Product Analyzer",
    },
  });
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { description, headlines, hooks, strengths, targetAudience, language } = await request.json();

    const lang = language === "ar"
      ? "اكتب النص الإعلاني باللغة العربية الفصحى."
      : "Write the ad copy in English.";

    const prompt = `أنت خبير تسويق وإعلانات. بناءً على معلومات المنتج التالية، اكتب نصًا إعلانيًا احترافيًا وجاهزًا للنشر على منصات التواصل الاجتماعي (فيسبوك، إنستغرام).

معلومات المنتج:
- الوصف: ${description ?? "غير متوفر"}
- العناوين الإعلانية: ${(headlines ?? []).join(", ")}
- نقاط القوة: ${(strengths ?? []).join(", ")}
- الجمهور المستهدف: ${targetAudience ?? "غير متوفر"}

${lang}

يجب أن يحتوي النص الإعلاني على:
1. عنوان جذاب (Headline)
2. فقرة تعريفية مقنعة
3. دعوة لاتخاذ إجراء (Call to Action)

اكتب النص فقط بدون أي مقدمات أو شروحات.`;

    const completion = await getClient().chat.completions.create({
      model: "anthropic/claude-3-haiku",
      messages: [
        { role: "system", content: "You are a professional copywriter. Return ONLY the ad copy text, no explanations." },
        { role: "user", content: prompt },
      ],
    });

    const ad = completion.choices[0]?.message?.content;
    if (!ad) return NextResponse.json({ error: "Empty response" }, { status: 500 });

    return NextResponse.json({ ad });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate ad" },
      { status: 500 }
    );
  }
}
