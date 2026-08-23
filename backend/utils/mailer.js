import nodemailer from 'nodemailer';

// Create Nodemailer Transporter
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // Use SMTP configuration if provided, or fallback to Ethereal Test SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback using Nodemailer test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('Nodemailer test account creation failed, using JSON stream transporter fallback:', err.message);
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  return transporter;
}

/**
 * Sends an automated AI Interview Invitation Email to candidates auto-shortlisted by the AI Agent
 */
export async function sendInterviewInviteEmail({ to, studentName, jobTitle, companyName = 'TechSpark Innovations', matchScore = 88, interviewUrl }) {
  try {
    const mail = await getTransporter();
    const liveInterviewLink = interviewUrl || 'http://localhost:3000/student/study-hub?tab=interview';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #000; border-radius: 16px; background-color: #fcfbf9;">
        <div style="background-color: #4B3AFF; padding: 15px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 24px;">🎓 Bridgify AI Interview Invitation</h2>
        </div>
        <div style="padding: 20px; color: #111;">
          <p style="font-size: 16px; font-weight: bold;">Congratulations ${studentName || 'Candidate'}!</p>
          <p>Your verified Skill Evidence Graph (SEG) score of <strong>${matchScore}%</strong> met the automatic shortlisting threshold for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
          
          <div style="background-color: #eef2ff; border-left: 4px solid #4B3AFF; padding: 12px; margin: 15px 0; border-radius: 6px;">
            <p style="margin: 0; font-weight: bold; color: #4B3AFF;">🚀 Next Action: AI Proctored Mock Technical Interview</p>
            <p style="margin: 5px 0 0 0; font-size: 13px;">Please complete your proctored technical interview session using MediaPipe vision & speech evaluation.</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${liveInterviewLink}" style="background-color: #FF3D9A; color: white; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 10px; border: 2px solid #000; display: inline-block;">
              Start Live AI Technical Interview →
            </a>
          </div>

          <p style="font-size: 12px; color: #666;">If the button above does not work, copy and paste this URL into your browser:<br/><code>${liveInterviewLink}</code></p>
        </div>
        <div style="border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 11px; color: #888;">
          Bridgify Automated Skill Verification & Hiring Engine
        </div>
      </div>
    `;

    const info = await mail.sendMail({
      from: `"Bridgify Recruitment Agent" <no-reply@bridgify.edu>`,
      to: to || 'arjun@mrdu.edu',
      subject: `🎉 Auto-Shortlisted for ${jobTitle} at ${companyName} - Complete Your AI Interview`,
      html: htmlContent,
    });

    console.log(`[NODEMAILER SUCCESS] Sent AI Interview Email to ${to}. MessageId: ${info.messageId || 'SENT'}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[NODEMAILER ERROR] Email dispatch failed for ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
