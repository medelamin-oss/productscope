import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { log } from './utils'

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'AI Product Analyzer',
  },
})

const SYSTEM_PROMPT = `You are an expert e-commerce and dropshipping product analyst. Analyze the given product and return ONLY valid JSON with these exact fields:
- product_description: compelling 2-3 paragraph product description
- ad_headlines: array of 5-10 attention-grabbing ad headlines
- marketing_hooks: array of 5 emotional or curiosity-driven hooks
- strengths: array of 3-5 product strengths
- weaknesses: array of 3-5 product weaknesses
- target_audience: detailed ideal customer profile
- main_objection: the single biggest customer objection
- objection_response: compelling counter-argument addressing the objection`

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
        { type: 'text' as const, text: 'Analyze this product image for dropshipping marketing. Identify the product and provide a complete marketing analysis.' },
        { type: 'image_url' as const, image_url: { url: imageBase64 } },
      ],
    }
    messages.push(imageContent)
  } else {
    messages.push({
      role: 'user',
      content: `Analyze this product for dropshipping marketing: ${productUrl}`,
    })
  }

  const completion = await client.chat.completions.create({
    model: 'anthropic/claude-3-haiku',
    messages,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('AI returned empty response')

  log('info', 'AI analysis completed')

  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*$/gm, '').trim()
  return JSON.parse(cleaned) as AnalysisResponse
}
