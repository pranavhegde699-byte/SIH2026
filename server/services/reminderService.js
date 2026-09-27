const nodemailer = require('nodemailer');
const ApplicationStatus = require('../models/ApplicationStatus');
const BusinessProfile = require('../models/BusinessProfile');
const Approval = require('../models/Approval');

/**
 * Reminder Service
 * 
 * Using Ethereal fake SMTP for demo purposes — swap to a real provider
 * (SendGrid/Gmail) for production by replacing the transporter config below.
 */

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Generate a disposable Ethereal test account programmatically — NO real 
  // credential or signup needed
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  console.log('Ethereal test account created:', testAccount.user);
  return transporter;
};

const checkAndSendReminders = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find all statuses with an expectedCompletionDate within the next 3 days
    // and status NOT in approved/rejected
    const upcomingStatuses = await ApplicationStatus.find({
      expectedCompletionDate: { $lte: threeDaysFromNow, $gte: new Date() },
      status: { $nin: ['approved', 'rejected'] }
    }).populate('approvalId');

    if (upcomingStatuses.length === 0) {
      console.log('[Reminder] No upcoming deadlines found.');
      return { sent: 0 };
    }

    const mailer = await getTransporter();
    let sentCount = 0;

    // Group by businessProfileId
    const grouped = {};
    for (const s of upcomingStatuses) {
      const key = s.businessProfileId.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }

    for (const [profileId, statuses] of Object.entries(grouped)) {
      const profile = await BusinessProfile.findById(profileId);
      if (!profile) continue;

      // EDGE CASE: if a profile has no email set, skip and log warning
      if (!profile.email) {
        console.warn(`[Reminder] Profile ${profileId} (${profile.businessName}) has no email set — skipping.`);
        continue;
      }

      const approvalLines = statuses.map(s => {
        const approvalName = s.approvalId?.name || 'Unknown Approval';
        const deadline = s.expectedCompletionDate.toLocaleDateString('en-IN');
        return `• ${approvalName} — Deadline: ${deadline} (Status: ${s.status})`;
      }).join('\n');

      const info = await mailer.sendMail({
        from: '"UdyogSetu Reminders" <reminders@udyogsetu.in>',
        to: profile.email,
        subject: `⚠️ Upcoming Compliance Deadline for ${profile.businessName}`,
        text: `Dear ${profile.businessName},\n\nThe following approvals have deadlines approaching within the next 3 days:\n\n${approvalLines}\n\nPlease take action soon to avoid delays.\n\nBest regards,\nUdyogSetu Compliance Assistant`,
        html: `<h2>Upcoming Compliance Deadlines</h2>
<p>Dear <strong>${profile.businessName}</strong>,</p>
<p>The following approvals have deadlines approaching within the next 3 days:</p>
<ul>${statuses.map(s => `<li><strong>${s.approvalId?.name || 'Unknown'}</strong> — Deadline: ${s.expectedCompletionDate.toLocaleDateString('en-IN')} (Status: ${s.status})</li>`).join('')}</ul>
<p>Please take action soon to avoid delays.</p>
<p>Best regards,<br/>UdyogSetu Compliance Assistant</p>`
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Reminder] Email sent to ${profile.email} for profile ${profile.businessName}`);
      console.log(`[Reminder] ✉️  Ethereal Preview URL: ${previewUrl}`);
      sentCount++;
    }

    return { sent: sentCount };
  } catch (error) {
    console.error('[Reminder] Error in checkAndSendReminders:', error);
    throw error;
  }
};

module.exports = { checkAndSendReminders };
