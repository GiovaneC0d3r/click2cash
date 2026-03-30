import nodemailer from "nodemailer";

// Configuração do Transportador
// Você pode usar Gmail, Outlook, Resend, Mailtrap, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailArgs) {
  try {
    const info = await transporter.sendMail({
      from: `"Seu App" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html: html || text, // Se não passar HTML, usa o texto puro
    });

    console.log("Email enviado: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}