import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // 1. Cache Check
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: cache } = await supabaseAdmin
      .from('kpi_snapshots')
      .select('data')
      .eq('client_id', clientId)
      .eq('source', 'google-ads')
      .gt('created_at', sixHoursAgo)
      .single();

    if (cache) return NextResponse.json(cache.data);

    // 2. Get Tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_tokens')
      .select('access_token, account_id')
      .eq('client_id', clientId)
      .eq('platform', 'google-ads')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Google Ads connection not found' }, { status: 404 });
    }

    // 3. Fetch Google Ads API (Google API metrics query)
    const customerId = tokenData.account_id.replace(/-/g, ''); // تنظيف الـ ID من الفواصل
    const url = `https://googleapis.com{customerId}/googleAds:search`;

    const query = {
      query: `SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign WHERE segments.date DURING LAST_30_DAYS`
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN! // الـ dev token الخاص بيك
      },
      body: JSON.stringify(query)
    });

    const result = await response.json();

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    // 4. Save Cache & Return
    await supabaseAdmin.from('kpi_snapshots').upsert({
      client_id: clientId,
      source: 'google-ads',
      data: result,
      created_at: new Date().toISOString()
    }, { onConflict: 'client_id,platform' });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
