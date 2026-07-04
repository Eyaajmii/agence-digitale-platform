import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  try {
    // 1. Cache
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: cache } = await supabaseAdmin
      .from('kpi_snapshots')
      .select('data')
      .eq('client_id', clientId)
      .eq('source', 'ga4')
      .gt('created_at', sixHoursAgo)
      .single();

    if (cache) return NextResponse.json(cache.data);

    // 2. Tokens (GA4 يستحق الـ Property ID مخزن في account_id)
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_tokens')
      .select('access_token, account_id')
      .eq('client_id', clientId)
      .eq('platform', 'ga4')
      .single();

    if (tokenError || !tokenData) return NextResponse.json({ error: 'GA4 not connected' }, { status: 404 });

    // 3. Google Analytics Data API (RunReport)
    const url = `https://googleapis.com{tokenData.account_id}:runReport`;
    
    const body = {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }, { name: 'bounceRate' }],
      dimensions: [{ name: 'date' }] // باش الـ Recharts ينجم يرسم الأيام
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    // 4. Cache & Response
    await supabaseAdmin.from('kpi_snapshots').upsert({
      client_id: clientId,
      source: 'ga4',
      data: result,
      created_at: new Date().toISOString()
    }, { onConflict: 'client_id,platform' });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
