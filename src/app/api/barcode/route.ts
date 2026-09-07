import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Баркодът е задължителен' }, { status: 400 });
    }

    const cleanCode = code.trim();

    // 1. Check Bulgarian Open Food Facts API first
    let res = await fetch(`https://bg.openfoodfacts.org/api/v2/product/${cleanCode}.json`, {
      headers: { 'User-Agent': 'FitLogBulgaria - WebApp - Version 1.0' },
    });

    let data = await res.json();

    // 2. If not found, try Global Open Food Facts endpoint
    if (!data.product) {
      res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`, {
        headers: { 'User-Agent': 'FitLogBulgaria - WebApp - Version 1.0' },
      });
      data = await res.json();
    }

    // 3. If still not found and has leading zeros, try stripped zeros
    if (!data.product && cleanCode.startsWith('0')) {
      const stripped = cleanCode.replace(/^0+/, '');
      const retryRes = await fetch(`https://bg.openfoodfacts.org/api/v2/product/${stripped}.json`, {
        headers: { 'User-Agent': 'FitLogBulgaria - WebApp - Version 1.0' },
      });
      const retryData = await retryRes.json();
      if (retryData.product) {
        data = retryData;
      }
    }

    // 4. Bulgarian Supermarket Presets (Lidl, Kaufland, Billa, Fantastico, Vereya, Olympus, Bor Chvor, Bulgarea, etc.)
    const bulgarianPresets: Record<string, any> = {
      // === LIDL (Milbona, Pilos, Dulano, Crownfield, Pikok, Vemondo) ===
      '4056489115792': { productName: 'Milbona High Protein Протеинов Пудинг Шоколад', brand: 'Lidl / Milbona', packageGrams: 200, per100g: { calories: 76, protein: 10.0, carbs: 5.5, fats: 1.5 } },
      '20822606': { productName: 'Milbona High Protein Ванилов Пудинг 20g Протеин', brand: 'Lidl / Milbona', packageGrams: 200, per100g: { calories: 76, protein: 10.0, carbs: 5.5, fats: 1.5 } },
      '20478148': { productName: 'Milbona Скир Натурален 0.2% Мазнини', brand: 'Lidl / Milbona', packageGrams: 500, per100g: { calories: 59, protein: 11.0, carbs: 3.5, fats: 0.2 } },
      '20067670': { productName: 'Milbona Кварк / Обезсолена Извара 0.3%', brand: 'Lidl / Milbona', packageGrams: 250, per100g: { calories: 68, protein: 12.0, carbs: 4.1, fats: 0.3 } },
      '20140236': { productName: 'Pilos Кисело Мляко по БДС 2.0%', brand: 'Lidl / Pilos', packageGrams: 400, per100g: { calories: 48, protein: 3.2, carbs: 4.3, fats: 2.0 } },
      '20140229': { productName: 'Pilos Кисело Мляко по БДС 3.6%', brand: 'Lidl / Pilos', packageGrams: 400, per100g: { calories: 61, protein: 3.2, carbs: 4.2, fats: 3.6 } },
      '20317379': { productName: 'Pilos Котидж Сирене Натурално', brand: 'Lidl / Pilos', packageGrams: 200, per100g: { calories: 98, protein: 12.3, carbs: 2.1, fats: 4.5 } },
      '20216443': { productName: 'Pilos Нискомаслена Извара 0.5%', brand: 'Lidl / Pilos', packageGrams: 250, per100g: { calories: 74, protein: 16.0, carbs: 2.0, fats: 0.5 } },
      '4056489370016': { productName: 'Dulano Пуешко Филе Запечено 96% Месо', brand: 'Lidl / Dulano', packageGrams: 100, per100g: { calories: 104, protein: 21.0, carbs: 1.0, fats: 1.8 } },
      '20015534': { productName: 'Dulano Пилешко Филе Пушено Класик', brand: 'Lidl / Dulano', packageGrams: 100, per100g: { calories: 102, protein: 21.5, carbs: 0.8, fats: 1.4 } },
      '4056489069507': { productName: 'Crownfield Фини Овесени Ядки 100% Пълнозърнести', brand: 'Lidl / Crownfield', packageGrams: 500, per100g: { calories: 372, protein: 13.5, carbs: 59.0, fats: 7.0 } },
      '20556105': { productName: 'Pikok Пилешка Шунка 90% Месо', brand: 'Lidl / Pikok', packageGrams: 100, per100g: { calories: 99, protein: 19.5, carbs: 1.2, fats: 1.8 } },
      '4056489437290': { productName: 'Vemondo Био Натурално Тофу', brand: 'Lidl / Vemondo', packageGrams: 200, per100g: { calories: 128, protein: 14.0, carbs: 1.5, fats: 7.2 } },

      // === KAUFLAND (K-Classic, K-Bio, K-Favourites, K-Take it veggie) ===
      '4337185361002': { productName: 'K-Classic Cottage Cheese Котидж Сирене', brand: 'Kaufland / K-Classic', packageGrams: 200, per100g: { calories: 96, protein: 12.5, carbs: 2.2, fats: 4.1 } },
      '4337185489027': { productName: 'K-Classic Скир Традиционен 0.2%', brand: 'Kaufland / K-Classic', packageGrams: 500, per100g: { calories: 58, protein: 11.2, carbs: 3.4, fats: 0.2 } },
      '4337185124010': { productName: 'K-Classic Обезмаслена Извара (Magerquark)', brand: 'Kaufland / K-Classic', packageGrams: 250, per100g: { calories: 67, protein: 12.2, carbs: 3.9, fats: 0.3 } },
      '3800214421016': { productName: 'K-Classic Кисело Мляко по БДС 2%', brand: 'Kaufland / K-Classic', packageGrams: 400, per100g: { calories: 48, protein: 3.2, carbs: 4.3, fats: 2.0 } },
      '3800214421023': { productName: 'K-Classic Кисело Мляко по БДС 3.6%', brand: 'Kaufland / K-Classic', packageGrams: 400, per100g: { calories: 61, protein: 3.2, carbs: 4.2, fats: 3.6 } },
      '4337185012348': { productName: 'K-Classic Фини Овесени Ядки', brand: 'Kaufland / K-Classic', packageGrams: 500, per100g: { calories: 370, protein: 13.0, carbs: 59.5, fats: 6.9 } },
      '4337185203913': { productName: 'K-Classic Пушено Пилешко Филе 96% Месо', brand: 'Kaufland / K-Classic', packageGrams: 100, per100g: { calories: 103, protein: 21.0, carbs: 1.0, fats: 1.6 } },
      '4337185890120': { productName: 'K-Favourites Прясно Филе от Атлантическа Сьомга', brand: 'Kaufland / K-Favourites', packageGrams: 200, per100g: { calories: 208, protein: 20.0, carbs: 0.0, fats: 14.0 } },
      '4337185234566': { productName: 'K-Bio Био Пълнозърнести Овесени Ядки', brand: 'Kaufland / K-Bio', packageGrams: 500, per100g: { calories: 365, protein: 13.5, carbs: 58.7, fats: 7.0 } },
      '4337185567891': { productName: 'K-Take it veggie Био Натурално Тофу', brand: 'Kaufland / K-Take it veggie', packageGrams: 200, per100g: { calories: 130, protein: 13.8, carbs: 1.8, fats: 7.5 } },

      // === ПОПУЛЯРНИ БЪЛГАРСКИ МАРКИ (Верея, Olympus, Булгареа, Бор Чвор, Меггле, Саяна) ===
      '3800000600021': { productName: 'Верея Кисело Мляко 2%', brand: 'Верея (ОМК)', packageGrams: 400, per100g: { calories: 48, protein: 3.2, carbs: 4.2, fats: 2.0 } },
      '3800000600052': { productName: 'Верея Кисело Мляко 0.1%', brand: 'Верея (ОМК)', packageGrams: 400, per100g: { calories: 34, protein: 3.4, carbs: 4.5, fats: 0.1 } },
      '3800000600014': { productName: 'Верея Кисело Мляко 3.6%', brand: 'Верея (ОМК)', packageGrams: 400, per100g: { calories: 61, protein: 3.2, carbs: 4.2, fats: 3.6 } },
      '5201509001321': { productName: 'Olympus Cottage Cheese Котидж Сирене', brand: 'Olympus (Олимпус)', packageGrams: 200, per100g: { calories: 95, protein: 12.5, carbs: 2.0, fats: 4.2 } },
      '5201509002847': { productName: 'Olympus High Protein Drink Ванилия (32g Протеин)', brand: 'Olympus', packageGrams: 330, per100g: { calories: 60, protein: 9.2, carbs: 4.8, fats: 0.2 } },
      '3800214420019': { productName: 'Булгареа Нискомаслена Извара', brand: 'Булгареа', packageGrams: 250, per100g: { calories: 72, protein: 16.5, carbs: 1.8, fats: 0.5 } },
      '3800030501145': { productName: 'Бор Чвор Скир Исландски 0%', brand: 'Бор Чвор', packageGrams: 350, per100g: { calories: 57, protein: 11.0, carbs: 3.5, fats: 0.2 } },
      '3850108041238': { productName: 'Meggle Cottage Cheese Котидж', brand: 'Meggle (Меггле)', packageGrams: 180, per100g: { calories: 94, protein: 12.0, carbs: 2.3, fats: 4.0 } },
      '3800206540022': { productName: 'Овесени Ядки Фини 100% Пълнозърнести', brand: 'Биосет', packageGrams: 500, per100g: { calories: 368, protein: 13.0, carbs: 60.0, fats: 6.8 } },
      '3800067800013': { productName: 'Пилешко Филе от Гърди Прясно', brand: 'Градус', packageGrams: 500, per100g: { calories: 110, protein: 23.5, carbs: 0.0, fats: 1.5 } },
      '3800002100017': { productName: 'Пресни Кокоши Яйца размер L (10 бр)', brand: 'Яйца БГ', packageGrams: 600, per100g: { calories: 143, protein: 12.6, carbs: 0.8, fats: 9.9 } },
      '3800108300083': { productName: 'Домлян Кисело Мляко 2%', brand: 'Домлян', packageGrams: 400, per100g: { calories: 47, protein: 3.1, carbs: 4.2, fats: 2.0 } },
      '3800096200051': { productName: 'Саяна Кисело Мляко 2%', brand: 'Саяна', packageGrams: 400, per100g: { calories: 48, protein: 3.2, carbs: 4.2, fats: 2.0 } },
    };

    if (!data.product) {
      if (bulgarianPresets[cleanCode]) {
        return NextResponse.json({
          barcode: cleanCode,
          ...bulgarianPresets[cleanCode],
          servingSize: `${bulgarianPresets[cleanCode].packageGrams || 100}g`,
          imageUrl: null,
        });
      }

      return NextResponse.json({ error: 'Продуктът не е намерен в базата данни за България (Lidl / Kaufland / Billa). Въведете го ръчно.' }, { status: 404 });
    }

    const prod = data.product;
    const nutriments = prod.nutriments || {};

    const calories = Math.round(
      nutriments['energy-kcal_100g'] || 
      (nutriments['energy-kcal'] ? nutriments['energy-kcal'] : 0) ||
      (nutriments['energy-kj_100g'] ? nutriments['energy-kj_100g'] / 4.184 : 0) ||
      (nutriments.energy_100g ? nutriments.energy_100g / 4.184 : 0) || 150
    );

    const protein = parseFloat((nutriments.proteins_100g ?? nutriments.proteins ?? 0).toFixed(1));
    const carbs = parseFloat((nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0).toFixed(1));
    const fats = parseFloat((nutriments.fat_100g ?? nutriments.fat ?? 0).toFixed(1));

    return NextResponse.json({
      barcode: cleanCode,
      productName: prod.product_name || prod.product_name_bg || prod.generic_name || 'Сканиран хранителен продукт',
      brand: prod.brands || '',
      servingSize: prod.serving_size || '100g',
      per100g: {
        calories,
        protein,
        carbs,
        fats,
      },
      imageUrl: prod.image_front_small_url || prod.image_small_url || null,
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json({ error: 'Грешка при търсене на баркод' }, { status: 500 });
  }
}
