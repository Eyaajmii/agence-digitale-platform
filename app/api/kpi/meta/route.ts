import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// إنشاء Supabase Client بالسيرفر رول لتفادي مشاكل الـ RLS في الـ Backend
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  try {
    // 1. التثبت من الـ Cache (أقل من 6 ساعات)
    //TTL
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: cache } = await supabaseAdmin
      .from('kpi_snapshots')
      .select('data')
      .eq('client_id', clientId)
      .eq('source', 'meta')
      .gt('created_at', sixHoursAgo)
      .single();

    if (cache) {
      return NextResponse.json(cache.data);
    }

    // 2. جلب الـ Tokens والـ Ad Account ID من الـ DB
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_tokens')
      .select('access_token, account_id')
      .eq('client_id', clientId)
      .eq('platform', 'meta')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Meta connection not found for this client' }, { status: 404 });
    }

    // 3. طلب البيانات من Meta Graph API
    // نجيبو الـ Spend, Impressions, Clicks, CTR, والـ Actions (Conversions) لأخر 30 يوم كمثال
    const metaUrl = `https://facebook.com{tokenData.account_id}/insights?fields=spend,impressions,clicks,ctr,cpc,actions&date_preset=last_30d&access_token=${tokenData.access_token}`;
    
    const response = await fetch(metaUrl, { method: 'GET' });
    const result = await response.json();

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    // 4. تحديث الـ Cache في Supabase (Upsert)
    await supabaseAdmin.from('kpi_snapshots').upsert({
      client_id: clientId,
      source: 'meta',
      data: result.data || result,
      created_at: new Date().toISOString()
    }, { onConflict: 'client_id,platform' });

    return NextResponse.json(result.data || result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
