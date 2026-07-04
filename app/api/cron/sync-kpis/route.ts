import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// إنشاء Supabase Client بالسيرفر رول لتجاوز الـ RLS وتحديث البيانات
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // 1. الأمان: نتثبتوا إنو اللي طالب الـ Route هو Vercel بركة مش حد خارجي
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Cron Job' }, { status: 401 });
  }

  try {
    // 2. نجيبو قائمة الـ IDs متاع الحرفاء الكل من جدول clients
    const { data: clients, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id');

    if (clientError || !clients || clients.length === 0) {
      return NextResponse.json({ message: 'No clients found to sync' }, { status: 200 });
    }

    // تحديد الـ domain متاعك (في الـ Production ياخذ رابط الموقع، في الـ Local ياخذ localhost)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 3. ندورو على الكليونات كليون بكليون ونحدثولهم الـ Cache
    for (const client of clients) {
      // نطلبوا الـ 4 API Routes متاعنا مع بارامتر refresh=true باش يتخطاو الكاش القديم ويجيبو الجديد
      // استعملنا Promise.allSettled باش لو كليون فيه مشكلة في التوكن، ما يوقفش البقية
      await Promise.allSettled([
        fetch(`${baseUrl}/api/kpi/meta?clientId=${client.id}&refresh=true`),
        fetch(`${baseUrl}/api/kpi/google-ads?clientId=${client.id}&refresh=true`),
        fetch(`${baseUrl}/api/kpi/ga4?clientId=${client.id}&refresh=true`),
        fetch(`${baseUrl}/api/kpi/gsc?clientId=${client.id}&refresh=true`)
      ]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully triggered synchronization for ${clients.length} clients.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
