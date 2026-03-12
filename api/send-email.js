import nodemailer from "nodemailer";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { SMTP_USER, SMTP_PASS, EMAIL_TO } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return res.status(500).json({ error: "SMTP not configured" });

  const { title, html } = req.body;
  if (!title || !html) return res.status(400).json({ error: "title and html required" });

  const today = new Date().toISOString().slice(0, 10);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: SMTP_USER,
      to: EMAIL_TO || "ceo@groove-web.com",
      subject: "[GrooveBot] " + title + " (" + today + ")",
      html: '<h2>' + title + '</h2><p>GrooveBot 자동 생성 칼럼 | ' + today + '</p><hr><p>첨부된 HTML 파일을 아임웹 에디터에 복붙하시면 됩니다.</p>',
      attachments: [{
        filename: today.replace(/-/g, "") + "_grooveweb_imweb.html",
        content: html,
        contentType: "text/html",
      }],
    });

    return res.status(200).json({ ok: true, message: "Email sent to " + (EMAIL_TO || "ceo@groove-web.com") });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
