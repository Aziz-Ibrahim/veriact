
interface ActionItem {
  task: string;
  deadline: string | null;
  status: string;
  assignee: string;
}

interface ReminderEmailProps {
  userName: string;
  roomTitle: string;
  roomCode: string;
  actionItems: ActionItem[];
  roomLink: string;
}

export function generateReminderEmail({
  userName,
  roomTitle,
  roomCode,
  actionItems,
  roomLink,
}: ReminderEmailProps) {
  const pendingItems = actionItems.filter(item => item.status === 'pending');
  const inProgressItems = actionItems.filter(item => item.status === 'in-progress');
  
  const totalPending = pendingItems.length + inProgressItems.length;

  return {
    subject: `⏰ ${totalPending} Action Item${totalPending > 1 ? 's' : ''} Due Soon - ${roomTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Items Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">VeriAct</h1>
              <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">Action Items Reminder</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                Hi ${userName} 👋
              </h2>
              <p style="color: #4b5563; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                You have <strong style="color: #667eea;">${totalPending} pending action item${totalPending > 1 ? 's' : ''}</strong> 
                in <strong>${roomTitle}</strong> that need your attention.
              </p>

              <!-- Pending Items -->
              ${pendingItems.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  🔴 Not Started (${pendingItems.length})
                </h3>
                ${pendingItems.map(item => `
                  <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 12px 16px; margin-bottom: 8px; border-radius: 4px;">
                    <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 15px; font-weight: 500;">
                      ${item.task}
                    </p>
                    ${item.deadline ? `
                      <p style="color: #dc2626; margin: 0; font-size: 13px;">
                        📅 Due: ${new Date(item.deadline).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              ` : ''}

              <!-- In Progress Items -->
              ${inProgressItems.length > 0 ? `
              <div style="margin-bottom: 24px;">
                <h3 style="color: #d97706; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  🟡 In Progress (${inProgressItems.length})
                </h3>
                ${inProgressItems.map(item => `
                  <div style="background-color: #fffbeb; border-left: 3px solid #d97706; padding: 12px 16px; margin-bottom: 8px; border-radius: 4px;">
                    <p style="color: #1f2937; margin: 0 0 4px 0; font-size: 15px; font-weight: 500;">
                      ${item.task}
                    </p>
                    ${item.deadline ? `
                      <p style="color: #d97706; margin: 0; font-size: 13px;">
                        📅 Due: ${new Date(item.deadline).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
              ` : ''}

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="${roomLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      View Action Items →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Room Info -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 13px;">
                  <strong>Room:</strong> ${roomTitle}<br>
                  <strong>Code:</strong> ${roomCode}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 13px;">
                This is an automated reminder from VeriAct
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                To stop receiving these reminders, update your preferences in your dashboard
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Hi ${userName},

You have ${totalPending} pending action item${totalPending > 1 ? 's' : ''} in "${roomTitle}" that need your attention.

${pendingItems.length > 0 ? `
NOT STARTED (${pendingItems.length}):
${pendingItems.map(item => `- ${item.task}${item.deadline ? ` (Due: ${new Date(item.deadline).toLocaleDateString()})` : ''}`).join('\n')}
` : ''}

${inProgressItems.length > 0 ? `
IN PROGRESS (${inProgressItems.length}):
${inProgressItems.map(item => `- ${item.task}${item.deadline ? ` (Due: ${new Date(item.deadline).toLocaleDateString()})` : ''}`).join('\n')}
` : ''}

View and update your action items: ${roomLink}

Room: ${roomTitle}
Code: ${roomCode}

---
This is an automated reminder from VeriAct
    `.trim(),
  };
}