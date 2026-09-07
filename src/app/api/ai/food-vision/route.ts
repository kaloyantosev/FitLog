import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchFoods } from '@/lib/foodDatabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType = 'image/jpeg', promptContext } = body;

    const headerApiKey = request.headers.get('x-gemini-api-key');
    const apiKey = body.apiKey || headerApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. If Gemini API key is available, run real AI Vision Analysis
    if (apiKey && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Ти си експертен спортен AI диетолог за FitLog платформата.
Анализирай предоставената снимка на ястие в детайли.
${promptContext ? `Потребителят посочва следния контекст/описание: "${promptContext}".` : ''}
Определи какво точно е ястието на БЪЛГАРСКИ ЕЗИК.
Идентифицирай всяка видима съставка, оцени реалистично грамажа в грамове и изчисли макронутриентите (калории, протеин в грамове, въглехидрати в грамове, мазнини в грамове).

Върни ЕДИНСТВЕНО валиден JSON формат с тази точна структура:
{
  "dishName": "Име на ястието на БЪЛГАРСКИ (напр. 'Азиатски нудли с кайма и зеленчуци' или 'Омлет със сирене')",
  "description": "Кратко обобщение на съставките и грамажите на български език.",
  "items": [
    {
      "name": "Име на съставка на български",
      "portion": "напр. 180г",
      "calories": 240,
      "protein": 12.0,
      "carbs": 35.0,
      "fats": 4.5
    }
  ],
  "totalCalories": 520,
  "totalProtein": 32.0,
  "totalCarbs": 58.0,
  "totalFats": 16.0,
  "confidence": "HIGH"
}`;

        const imagePart = {
          inlineData: {
            data: cleanBase64,
            mimeType,
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json(parsed);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini vision API error:', geminiErr?.message || geminiErr);
      }
    }

    // 2. If user provided a prompt context or search hint, look up from Bulgarian Food Database
    if (promptContext && promptContext.trim()) {
      const matches = searchFoods(promptContext.trim());
      if (matches.length > 0) {
        const top = matches[0];
        const servingRatio = (top.servingGrams || 100) / 100;
        const calories = Math.round((top.caloriesPer100g || 100) * servingRatio);
        const protein = parseFloat(((top.proteinPer100g || 10) * servingRatio).toFixed(1));
        const carbs = parseFloat(((top.carbsPer100g || 10) * servingRatio).toFixed(1));
        const fats = parseFloat(((top.fatsPer100g || 5) * servingRatio).toFixed(1));

        return NextResponse.json({
          dishName: top.nameBg || top.name,
          description: `Оценена стандартна порция: ${top.servingLabel || `${top.servingGrams}г`} от базата данни с храни.`,
          items: [
            {
              name: top.nameBg || top.name,
              portion: top.servingLabel || `${top.servingGrams}г`,
              calories,
              protein,
              carbs,
              fats,
            },
          ],
          totalCalories: calories,
          totalProtein: protein,
          totalCarbs: carbs,
          totalFats: fats,
          confidence: 'HIGH',
          source: 'DATABASE_MATCH',
        });
      }
    }

    // 3. If no API key is provided and no specific dish was typed, return helpful instruction
    return NextResponse.json(
      {
        error: 'За автоматично разпознаване на снимки от камерата въведете безплатен Google Gemini API ключ или напишете какво съдържа чинията.',
        requiresApiKey: true,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('AI Food Vision error:', error);
    return NextResponse.json({ error: 'Грешка при обработка на заявката за разпознаване на храна' }, { status: 500 });
  }
}
