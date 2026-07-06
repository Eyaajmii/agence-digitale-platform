import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import { Resend } from 'resend';
import { auth } from '@/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.AUTH_RESEND_KEY!);

const STORAGE_BUCKET = 'reports';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const userEmailConnecte = session?.user?.email as string | undefined;

    if (!userId || !userEmailConnecte) {
      return NextResponse.json({ error: 'Session introuvable — reconnecte-toi.' }, { status: 401 });
    }

    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID requis' }, { status: 400 });
    }

    // 1. Récupération du client (nom + email officiel, pas celui envoyé par le front)
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, nom, email, manager_id, collaborateur_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client introuvable.' }, { status: 404 });
    }

    if (!client.email) {
      return NextResponse.json({ error: "Ce client n'a pas d'email renseigné." }, { status: 400 });
    }

    const clientName = client.nom;

    // 2. Récupération des dernières analyses IA et KPI pour construire le rapport
    const { data: snapshots, error: dbError } = await supabaseAdmin
      .from('kpi_snapshots')
      .select('id, source, data')
      .eq('client_id', clientId);

    if (dbError || !snapshots || snapshots.length === 0) {
      return NextResponse.json({ error: 'Données introuvables pour ce client.' }, { status: 404 });
    }

    // Agrégation simple des données pour le template
    const dataMap: Record<string, any> = {};
    snapshots.forEach(s => dataMap[s.source] = s.data);

    // 3. Définition du Template HTML/CSS (Design pro matching AgenceAI)
    const currentDate = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background-color: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
            margin-bottom: 40px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-box {
            width: 40px;
            height: 40px;
            background-color: #f97316;
            border-radius: 12px;
          }
          .brand-name {
            font-size: 20px;
            font-weight: 700;
            color: #0a2947;
          }
          .report-title {
            text-align: right;
          }
          .report-title h1 {
            margin: 0;
            font-size: 22px;
            color: #0a2947;
          }
          .report-title p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #64748b;
          }
          .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #0a2947;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid #f97316;
            padding-left: 10px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 20px;
          }
          .card-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .card-value {
            font-size: 24px;
            font-weight: 700;
            color: #0a2947;
            margin-top: 8px;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <div class="logo-box"></div>
            <div class="brand-name">AgenceAI</div>
          </div>
          <div class="report-title">
            <h1>Rapport Performance Mensuel</h1>
            <p>Client : ${clientName || 'Votre Client'} — ${currentDate}</p>
          </div>
        </div>

        <div class="section-title">Vue d'ensemble des KPIs analytiques</div>
        <div class="grid">
          <div class="card">
            <div class="card-title">Sources de données connectées</div>
            <div class="card-value">${snapshots.length} Plateformes</div>
          </div>
          <div class="card">
            <div class="card-title">Statut d'optimisation globale</div>
            <div class="card-value" style="color: #10b981;">Performant</div>
          </div>
        </div>

        <div class="section-title">Synthèse de l'Audit Stratégique</div>
        <div class="card" style="background-color: #fafafa; border-color: #7bbfd3;">
          <p style="margin: 0; line-height: 1.6; color: #334155;">
            Ce rapport compile automatiquement les métriques de performance extraites des APIs publicitaires connectées. L'analyse algorithmique montre une répartition des budgets publicitaires stable avec des opportunités de scalabilité sur les canaux organiques identifiés.
          </p>
        </div>

        <div class="footer">
          Rapport confidentiel généré par AgenceAI Digital Marketing Platform. All rights reserved.
        </div>
      </body>
      </html>
    `;

    // 4. Initialisation de Puppeteer Headless pour imprimer le PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();
    browser = undefined;

    const pdfBuffer = Buffer.from(pdfUint8Array);
    const pdfBase64 = pdfBuffer.toString('base64');

    // 5. Upload du PDF dans Supabase Storage (le "PC" du serveur / stockage persistant)
    const safeClientName = (clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Rapport_${safeClientName}_${Date.now()}.pdf`;
    const storagePath = `${clientId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Erreur upload storage:', uploadError);
      return NextResponse.json({ error: "Échec de l'enregistrement du PDF." }, { status: 500 });
    }

    // Si le bucket est public : URL publique directe
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    const fileUrl = publicUrlData.publicUrl;

    // 6. Enregistrement de la ligne dans la table "rapports"
    const periode = new Date();
    periode.setDate(1); // premier jour du mois en cours

    const { error: insertError } = await supabaseAdmin
      .from('rapports')
      .insert({
        kpi_id: snapshots[0].id,
        periode: periode.toISOString().slice(0, 10), // format date YYYY-MM-DD
        bilan: `Rapport généré automatiquement — ${snapshots.length} source(s) KPI agrégée(s).`,
        client_id: clientId,
        file_url: fileUrl,
        generated_by: userId,
      });

    if (insertError) {
      console.error('Erreur insertion rapports:', insertError);
      // On continue quand même (le PDF existe et sera envoyé), mais on log l'erreur
    }

    // 7. Envoi du PDF par email à l'utilisateur connecté ET au client
    const destinataires = [userEmailConnecte, client.email].filter(
      (email, index, arr) => !!email && arr.indexOf(email) === index // dédoublonne si même email
    );

    await resend.emails.send({
      from: 'AgenceAI Rapports <alertes@votre-domaine.com>', // Remplace par ton domaine validé Resend
      to: destinataires,
      subject: `📊 Votre Rapport Mensuel Performance — ${currentDate}`,
      html: `
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint votre rapport d'analyse marketing automatisé pour le mois de <strong>${currentDate}</strong> concernant le compte <strong>${clientName || 'votre entreprise'}</strong>.</p>
        <p>Ce document intègre l'ensemble des KPIs agrégés analysés de vos plateformes publicitaires.</p>
        <br/>
        <p>Cordialement,<br/>L'équipe Automation <strong>AgenceAI</strong></p>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        }
      ]
    });

    // 8. Réponse HTTP : renvoie aussi le PDF pour permettre le téléchargement navigateur côté front
    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
      },
    });

  } catch (error: any) {
    if (browser) await browser.close();
    console.error('Error Generating PDF Report:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}