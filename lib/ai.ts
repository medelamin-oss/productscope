import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { log } from './utils'

function getClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
      'X-Title': 'AI Product Analyzer',
    },
  })
}

const SYSTEM_PROMPT = `You are a veteran dropshipper and copywriter who's been in the game for years. You've sold everything from kitchen gadgets to phone accessories, and you know what actually moves units. Analyze the given product like you're advising a friend who's about to launch their first store.

CRITICAL: Write like a real human expert — not an AI. Avoid any robotic, template-like language. Every piece of content should feel like it came from a seasoned marketer who's seen it all.

Return ONLY valid JSON with these exact fields:
- product_description: 2-3 paragraph description written like a professional copywriter crafted it — natural flow, persuasive but not pushy, paints a picture
- ad_headlines: array of 5-10 headlines that feel like they'd actually stop someone mid-scroll on Facebook or Instagram — no generic "Amazing Product!" nonsense
- marketing_hooks: array of 5 hooks that tap into real emotions — curiosity, FOMO, pain points, aspiration — written like a copywriter brainstorming with you
- strengths: array of 3-5 genuine reasons this product could win in the market — be specific, not generic fluff
- weaknesses: array of 3-5 smart marketing angles — instead of pointing out flaws, show how to spin them into selling points (e.g. "Higher price point? Position it as premium — people associate price with quality")
- target_audience: a detailed profile of the ideal customer — not just demographics, but what keeps them up at night, what they scroll past, what makes them click "buy"
- main_objection: the single biggest thing holding buyers back — be brutally honest
- objection_response: a real, human-sounding counter that addresses the objection like a trusted salesperson would`

export interface AnalysisResponse {
  product_description: string
  ad_headlines: string[]
  marketing_hooks: string[]
  strengths: string[]
  weaknesses: string[]
  target_audience: string
  main_objection: string
  objection_response: string
}

export async function analyzeProduct(
  productUrl: string | null,
  language: 'en' | 'ar',
  imageBase64?: string
): Promise<AnalysisResponse> {
  const lang = language === 'ar'
    ? 'IMPORTANT: Generate ALL content in Arabic language.'
    : 'Generate all content in English.'

  log('info', 'AI analysis started', {
    inputType: imageBase64 ? 'image' : 'url',
    language,
  })

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n${lang}\nReturn ONLY valid JSON.` },
  ]

  if (imageBase64) {
    const imageContent: ChatCompletionMessageParam = {
      role: 'user',
      content: [
        { type: 'text' as const, text: 'Take a look at this product image. What would you tell someone who wants to sell this online? Give me your honest marketing take — the good, the smart angles, and who you\'d target.' },
        { type: 'image_url' as const, image_url: { url: imageBase64 } },
      ],
    }
    messages.push(imageContent)
  } else {
    messages.push({
      role: 'user',
      content: `Check out this product: ${productUrl}. Give me your honest marketing breakdown as if you're advising a friend who wants to sell this. What works, what's the angle, and who's the target?`,
    })
  }

  const completion = await getClient().chat.completions.create({
    model: 'anthropic/claude-3-haiku',
    messages,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('AI returned empty response')

  log('info', 'AI analysis completed')

  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*$/gm, '').trim()
  return JSON.parse(cleaned) as AnalysisResponse
}
