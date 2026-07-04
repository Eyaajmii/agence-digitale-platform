//Analyse IA des KPIs
// /app/api/analyze-campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import Groq from 'groq-sdk';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

//const anthropic = new Anthropic({
  //apiKey: process.env.ANTHROPIC_API_KEY!,
//});
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const resend = new Resend(process.env.AUTH_RESEND_KEY!);

export async function POST(request: NextRequest) {
  try {
        // Récupération de userId et userEmail depuis le front pour savoir à qui envoyer l'alerte
    const { clientId,userId, userEmail } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // 1. تجميع البيانات (Agrégation) من جدول kpi_snapshots للحريف هذا
    const { data: snapshots, error: dbError } = await supabaseAdmin
      .from('kpi_snapshots')
      .select('source, data')
      .eq('client_id', clientId);

    if (dbError || !snapshots || snapshots.length === 0) {
      return NextResponse.json({ error: 'No KPI snapshots found for this client. Please fetch data first.' }, { status: 404 });
    }

    // 2. دمج البيانات في Object واحد منظم ومفهوم لـ Claude
    const aggregatedData: Record<string, any> = {};
    snapshots.forEach((snap) => {
      aggregatedData[snap.source] = snap.data;
    });

    // 3. صياغة الـ Prompt المحبوك بـ الـ شروط (Prompt Engineering) مع إجبارية الـ JSON Output
    const systemPrompt = `
      Tu êtes un expert en marketing digital et data analyst.
      Ton rôle est d'analyser les données KPI agrégées des 30 derniers jours d'un client (Meta Ads, Google Ads, GA4, Search Console) et de générer un audit stratégique complet.
      
      Tu DOIS obligatoirement répondre uniquement avec un objet JSON valide contenant EXACTEMENT la structure suivante (sans texte avant ou après, sans markdown code blocks) :
      {
        "anomalies": [
          { "description": "Description textuelle de l'anomalie détectée", "importance": "HIGH" | "MEDIUM" | "LOW" }
        ],
        "campagnes_a_risque": [
          { "nom": "Nom de la plateforme ou campagne", "raison": "Pourquoi elle est à risque (ex: baisse du ROAS, hausse du CPC)", "metrique_critique": "La valeur textuelle" }
        ],
        "recommandations": [
          { "action": "L'action concrète à entreprendre", "impact_attendu": "Impact estimé", "priorite": 1 | 2 | 3 }
        ]
      }
    `;

    // 4. إرسال الطلب لـ Claude API (استعمال نموذج Claude 3.5 Sonnet)
    /**const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.2, // نسبة حرارة منخفضة لضمان الالتزام بالـ JSON هيكلياً
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Voici les données KPI réelles du client au format JSON : ${JSON.stringify(aggregatedData)}. Analyse-les et retourne l'objet JSON complet.`
        }
      ]
    });*/
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      temperature:0.8,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Voici les données KPI : ${JSON.stringify(
            aggregatedData
          )}`,
        },
      ],
    });


    // 5. استخراج النص وتحويله لـ JSON حقيقي لإرساله للـ Frontend
    //const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    const responseText = JSON.parse(response.choices[0].message.content || "{}");
    
    // تنظيف النص من أي زوائد جراء الـ Markdown blocks لو وجدت
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiAnalysis = JSON.parse(cleanJsonString);
    if (userId && userEmail) {
      // Filtrer les anomalies importantes (HIGH) ou les campagnes à risque pour déclencher les alertes
      const criticalAnomalies = aiAnalysis.anomalies?.filter((a: any) => a.importance === 'HIGH') || [];
      const RISKCampaigns = aiAnalysis.campagnes_a_risk || [];

      // Traitement des anomalies HIGH
      for (const anomaly of criticalAnomalies) {
        const title = `Alerte Rouge : Anomalie Critique Détectée`;
        
        // A. Notification In-App via Supabase (Déclenche Realtime automatiquement)
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          title: title,
          message: anomaly.description,
          type: 'critical'
        });

        // B. Envoi de l'email via Resend
        await resend.emails.send({
          from: 'Plateforme IA <alertes@votre-domaine.com>', // Remplacer par votre domaine vérifié Resend
          to: userEmail,
          subject: `⚠️ ${title}`,
          html: `
            <h3>Une anomalie critique a été détectée lors de l'analyse automatique :</h3>
            <p style="color: red; font-weight: bold;">${anomaly.description}</p>
            <p>Connectez-vous à votre plateforme interne pour appliquer les recommandations IA.</p>
          `,
        });
      }
      for (const campaign of RISKCampaigns) {
        const title = `Campagne à risque — ${campaign.nom}`;
        const msg = `${campaign.raison}\nMétrique critique : ${campaign.metrique_critique}`;

        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          title: title,
          message: msg,
          type: 'warning', // Badge orange "Alerte" dans votre maquette
          source: campaign.nom
        });

        await resend.emails.send({
          from: 'Plateforme IA <alertes@votre-domaine.com>',
          to: userEmail,
          subject: `⚠️ ${title}`,
          html: `
            <h3>Une campagne a été identifiée comme à risque :</h3>
            <p><strong>Plateforme/Campagne :</strong> ${campaign.nom}</p>
            <p><strong>Raison :</strong> ${campaign.raison}</p>
            <p><strong>Métrique critique :</strong> ${campaign.metrique_critique}</p>
          `,
        });
      }
    }
    return NextResponse.json(aiAnalysis, { status: 200 });

  } catch (error: any) {
    console.error('Error in AI Analysis Route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
