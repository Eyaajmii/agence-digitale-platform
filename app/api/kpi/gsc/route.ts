//serach console
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
      .eq('source', 'gsc')
      .gt('created_at', sixHoursAgo)
      .single();

    if (cache) return NextResponse.json(cache.data);

    // 2. Tokens (هنا الـ account_id يمثل الـ Site URL الموثق في GSC مثل sc-domain:example.com)
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_tokens')
      .select('access_token, account_id')
      .eq('client_id', clientId)
      .eq('platform', 'gsc')
      .single();

    if (tokenError || !tokenData) return NextResponse.json({ error: 'GSC not connected' }, { status: 404 });

    // encode للـ siteUrl باش يمشي صحيح في الـ API URL
    const siteUrl = encodeURIComponent(tokenData.account_id);
    const url = `https://googleapis.com{siteUrl}/searchAnalytics/query`;

    const body = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // منذ 30 يوم
      endDate: new Date().toISOString().split('T')[0],
      dimensions: ['date'],
      rowLimit: 100
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
      source: 'gsc',
      data: result,
      created_at: new Date().toISOString()
    }, { onConflict: 'client_id,platform' });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
