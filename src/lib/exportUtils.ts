import { ActionItem } from '@/types';

// Export as JSON
export function exportAsJSON(actionItems: ActionItem[], onComplete?: () => void) {
  const dataStr = JSON.stringify(actionItems, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(blob, `veriact-actions-${getDateString()}.json`);
  if (onComplete) onComplete();
}

// Export as CSV
export function exportAsCSV(actionItems: ActionItem[], onComplete?: () => void) {
  const headers = ['Task', 'Assignee', 'Deadline', 'Status', 'Meeting', 'Created'];
  const rows = actionItems.map(item => [
    escapeCSV(item.task),
    escapeCSV(item.assignee),
    item.deadline || '',
    item.status,
    escapeCSV(item.meetingTitle || ''),
    new Date(item.createdAt).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(blob, `veriact-actions-${getDateString()}.csv`);
  if (onComplete) onComplete();
}

// Export as iCalendar (.ics) for calendar import
export function exportAsCalendar(actionItems: ActionItem[], onComplete?: () => void) {
  const itemsWithDeadlines = actionItems.filter(item => item.deadline);
  
  if (itemsWithDeadlines.length === 0) {
    throw new Error('No action items with deadlines to export');
  }

  const icsEvents = itemsWithDeadlines.map(item => {
    const deadline = new Date(item.deadline!);
    const dtstart = formatICSDate(deadline);
    const dtend = formatICSDate(new Date(deadline.getTime() + 60 * 60 * 1000)); // 1 hour duration

    return [
      'BEGIN:VEVENT',
      `UID:${item.id}@veriact.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeICS(item.task)}`,
      `DESCRIPTION:${escapeICS(`Assignee: ${item.assignee}\nFrom: ${item.meetingTitle || 'Meeting'}`)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VeriAct//Action Items//EN',
    'CALSCALE:GREGORIAN',
    ...icsEvents,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  downloadFile(blob, `veriact-deadlines-${getDateString()}.ics`);
}

// Copy action items to clipboard as markdown
export async function copyToClipboard(actionItems: ActionItem[]) {
  const markdown = actionItems
    .map(item => {
      const deadline = item.deadline 
        ? `📅 ${new Date(item.deadline).toLocaleDateString()}` 
        : '📅 No deadline';
      
      return `- [ ] **${item.task}**\n  👤 ${item.assignee} | ${deadline} | ${item.status}`;
    })
    .join('\n\n');

  await navigator.clipboard.writeText(markdown);
}

// Helper functions
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeICS(str: string): string {
  return str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}