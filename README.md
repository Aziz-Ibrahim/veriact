# [VeriAct](veriact.co.uk)

AI-powered meeting action item tracker that extracts, organizes, and reminds you of action items from meeting transcripts. Privacy-first, GDPR compliant, with team collaboration features.

## Features

- **AI-Powered Extraction** - Automatically extracts action items, assignees, and deadlines from meeting transcripts
- **Team Collaboration** - Create shared rooms to track action items with your team
- **Email Reminders** - Never miss a deadline with automated email notifications
- **Meeting Bot** (Enterprise) - Automatically joins Zoom/Google Meet, records, transcribes, and extracts action items
- **Privacy First** - Meeting transcripts are never stored; only action items are saved (with consent)
- **Multiple Export Formats** - Download as JSON, CSV, or add to calendar
- **Real-time Status Tracking** - Mark items as pending, in-progress, or completed
- **Organization Management** (Enterprise) - Manage teams with organization tokens

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o-mini
- **Email**: Resend
- **Meeting Bot**: Recall.ai
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Document Processing**: Mammoth (DOCX), pdf-parse (PDF)

## Installation

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Supabase account
- Clerk account
- OpenAI API key
- Stripe account (for payments)
- Resend account (for emails)
- Recall.ai account (for meeting bot - Enterprise only)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Resend Email
RESEND_API_KEY=re_...
RESEND_DOMAIN=yourdomain.com
RESEND_TEST_EMAIL=your-verified-email@example.com

# Recall.ai Meeting Bot (Enterprise)
RECALL_API_KEY=your-recall-api-key
RECALL_WEBHOOK_SECRET=your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-secret-key-for-cron-jobs

# Development Only
SKIP_STRIPE_SIGNATURE=true
NODE_ENV=development
```

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/veriact.git

# Navigate to the project directory
cd veriact

# Install dependencies
npm install

# Run database migrations (Supabase)
# See database/schema.sql for the schema

# Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### For Individual Users (Free Plan)

```bash
# 1. Sign up for a free account
# 2. Upload a meeting transcript (TXT or DOCX)
# 3. AI extracts action items automatically
# 4. Data is stored locally in your browser
# 5. Export as JSON/CSV for backup
```

### For Teams (Pro Plan - £9/month)

```bash
# 1. Upgrade to Pro plan
# 2. Upload meeting transcript
# 3. Create a shared room
# 4. Invite team members via email
# 5. Everyone receives email reminders
# 6. Track progress collaboratively
```

### For Enterprises (Enterprise Plan - £49/month)

```bash
# 1. Upgrade to Enterprise
# 2. Create an organization
# 3. Invite VeriAct bot to Zoom/Google Meet
# 4. Bot automatically joins, records, and extracts action items
# 5. Room is created automatically with all action items
# 6. Team members get instant access
```

## API Routes

### Action Extraction
- `POST /api/extract-actions` - Extract action items from transcript

### Room Management
- `POST /api/rooms/create` - Create a new shared room
- `GET /api/rooms/[roomCode]` - Get room details
- `GET /api/rooms/my-rooms` - List user's rooms
- `POST /api/rooms/update-item` - Update action item status
- `POST /api/rooms/[roomCode]/invite` - Invite member to room
- `GET /api/rooms/[roomCode]/members` - List room members
- `GET /api/rooms/[roomCode]/check-access` - Check user access

### Organization Management (Enterprise)
- `POST /api/organizations/create` - Create organization
- `POST /api/organizations/join` - Join organization with token
- `GET /api/organizations/list` - List user's organizations

### Meeting Bot (Enterprise)
- `POST /api/meeting-bot/request` - Request bot to join meeting
- `GET /api/meeting-bot/requests` - List bot requests
- `POST /api/webhooks/recall` - Recall.ai webhook handler

### Subscription & Payments
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/subscription/status` - Get user subscription status

### Reminders
- `POST /api/reminders/send` - Send email reminders (cron job)

## Database Schema

### Core Tables
- `rooms` - Shared collaboration rooms
- `room_action_items` - Action items within rooms
- `room_members` - Room membership and access control
- `organizations` - Enterprise organizations
- `organization_members` - Organization membership
- `subscriptions` - User and organization subscriptions
- `meeting_bot_requests` - Meeting bot join requests
- `usage_logs` - Usage tracking for billing

### Supabase Functions
- `generate_room_code()` - Generates unique room codes (ROOM-XXXXXXX)
- `generate_org_token()` - Generates organization invite tokens

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Configure webhooks for Stripe and Recall.ai
```

### Cron Jobs

Set up a cron job to run email reminders daily:

```bash
# In Vercel, add a cron job:
# POST /api/reminders/send
# Authorization: Bearer YOUR_CRON_SECRET
# Schedule: 0 9 * * * (9 AM daily)
```

### Webhook Configuration

**Stripe Webhooks:**
- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

**Recall.ai Webhooks:**
- URL: `https://yourdomain.com/api/webhooks/recall`
- Events: `bot.status_change`, `bot.joined_meeting`, `recording.ready`, `bot.error`

## Architecture

### File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── checkout/          # Checkout page
│   ├── dashboard/         # Main dashboard
│   ├── meeting-bot/       # Meeting bot interface
│   ├── profile/           # User profile settings
│   └── sign-in/           # Authentication pages
├── components/            # React components
│   ├── ActionItemCard.tsx
│   ├── CreateRoomModal.tsx
│   ├── DashboardClient.tsx
│   ├── RoomView.tsx
│   ├── SubscriptionCard.tsx
│   └── OrganizationManagement.tsx
├── hooks/                 # Custom React hooks
│   └── useExtractActions.ts
├── lib/                   # Utility libraries
│   ├── email-templates.ts
│   ├── exportUtils.ts
│   ├── fileProcessor.ts
│   ├── supabase.ts
│   └── subscription.ts
├── store/                 # Zustand state management
│   └── useStore.ts
└── types/                 # TypeScript types
    └── index.ts
```

## Testing

VeriAct follows a **manual testing approach** to ensure quality and reliability.

### Testing Coverage

All features are **manually tested** before deployment, including:

✅ **Authentication & User Management**
- Sign up/sign in flows
- Session management
- Profile updates

✅ **Action Item Extraction**
- TXT file upload and processing
- DOCX file upload and processing
- PDF file upload (limited support)
- AI extraction accuracy
- Edge cases (empty files, invalid formats)

✅ **Room Management**
- Room creation with privacy consent
- Room sharing via codes
- Member invitation via email
- Access control (viewer/editor roles)
- Room expiration (90 days)

✅ **Collaboration Features**
- Real-time status updates
- Email reminders
- Member management
- Room access verification

✅ **Subscription & Payments**
- Stripe checkout flows (Pro & Enterprise)
- Subscription status updates
- Webhook handling
- Plan upgrades/downgrades

✅ **Organization Management** (Enterprise)
- Organization creation
- Token generation and joining
- Member role management

✅ **Export Functionality**
- JSON export
- CSV export
- Calendar (ICS) export
- Clipboard copy

⚠️ **Meeting Bot** (Beta - Limited Testing)
- Currently in beta phase
- Recall.ai integration
- Zoom/Google Meet auto-join
- Known to have occasional issues
- Users should report problems to support

### Manual Testing Checklist

Before each deployment, the following test scenarios are executed:

**Free Plan User Journey:**
1. Sign up with new account
2. Upload meeting transcript
3. Verify action items extracted correctly
4. Test status updates (pending → in-progress → completed)
5. Export as JSON and CSV
6. Verify browser storage persistence

**Pro Plan User Journey:**
1. Upgrade to Pro via Stripe checkout
2. Create shared room with action items
3. Invite team member via email
4. Verify invitation email received
5. Join room with room code
6. Update action item status as invited member
7. Verify email reminders sent

**Enterprise Plan User Journey:**
1. Upgrade to Enterprise
2. Create organization
3. Generate and share organization token
4. Invite bot to test meeting (when testing bot features)
5. Verify organization member access
6. Test all Pro features within organization context

### Testing in Development

```bash
# Run the development server
npm run dev

# Test different user roles by creating multiple Clerk accounts
# Test payment flows using Stripe test cards:
# 4242 4242 4242 4242 (Success)
# 4000 0000 0000 9995 (Decline)

# Test webhooks locally using Stripe CLI:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test email delivery in development:
# Emails only sent to verified address in RESEND_TEST_EMAIL
```

### Known Limitations

- **Meeting Bot**: Beta feature with occasional reliability issues
- **PDF Processing**: Limited support, recommend using TXT or DOCX
- **Email Delivery**: Development mode restricted to verified email addresses
- **Browser Storage**: Free plan limited to local storage (data not synced across devices)

### Bug Reporting

If you encounter issues during testing:
1. Check browser console for errors
2. Verify all environment variables are set correctly
3. Ensure webhooks are properly configured
4. Report bugs via GitHub Issues with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/environment details
   - Screenshots if applicable

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (TypeScript + ESLint)
- Write meaningful commit messages
- **Manually test all changes thoroughly** before submitting PR
- Test both happy path and edge cases
- Verify changes work across different subscription tiers
- Update documentation as needed
- Ensure all API routes have proper error handling
- Test email flows if modifying email-related features
- Verify Stripe webhooks if modifying payment flows

## License

This project is proprietary and confidential. All rights reserved.

## Contact

**Support**: support@veriact.app  
**Website**: [https://veriact.app](https://veriact.app)  
**GitHub**: [https://github.com/yourusername/veriact](https://github.com/yourusername/veriact)

## Acknowledgments

- OpenAI for GPT-4 API
- Clerk for authentication
- Supabase for database
- Stripe for payment processing
- Recall.ai for meeting bot infrastructure
- Resend for email delivery
- Vercel for hosting

## Privacy & Security

VeriAct takes privacy seriously:

- **No Transcript Storage**: Meeting transcripts are processed but never stored on our servers
- **Encrypted Data**: All data is encrypted at rest and in transit
- **GDPR Compliant**: Full compliance with European data protection regulations
- **User Control**: Users can delete their data at any time
- **Minimal Data Collection**: We only collect what's necessary for functionality

## Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Microsoft Teams bot integration
- [ ] Slack integration for notifications
- [ ] Custom AI models for domain-specific extraction
- [ ] Advanced analytics dashboard
- [ ] API access for Enterprise customers
- [ ] SSO support (SAML/OAuth)
- [ ] Webhooks for custom integrations

## FAQ

**Q: Are my meeting transcripts stored on your servers?**  
A: No. Transcripts are processed in real-time and immediately discarded. Only extracted action items are stored (with your consent).

**Q: Can I cancel my subscription anytime?**  
A: Yes. You can cancel anytime from your account settings. You'll retain access until the end of your billing period.

**Q: Does the meeting bot work with all video platforms?**  
A: Currently supports Zoom, Google Meet, and Microsoft Teams. More platforms coming soon.

**Q: How secure is my data?**  
A: All data is encrypted, stored securely in Supabase, and we're GDPR compliant. We never share data with third parties.

---

Built with ❤️Love, and some TypeScript