import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | VeriAct',
  description: 'VeriAct Terms of Service - Rules and guidelines for using our service',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-indigo-600 rounded-xl shadow-sm p-8 prose prose-indigo max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-sm text-gray-900">Last Updated: September 15, 2025</p>

          <p>
            Welcome to <strong>VeriAct</strong>. These Terms of Service ("Terms") govern your access
            to and use of VeriAct's website, services, and software (collectively, the "Service").
          </p>

          <p>
            <strong>
              By using VeriAct, you agree to be bound by these Terms. If you do not agree, do not use
              the Service.
            </strong>
          </p>

          <hr />

          <h2>1. Acceptance of Terms</h2>
          <ul>
            <li>You are at least 16 years old</li>
            <li>You have the legal capacity to enter into these Terms</li>
            <li>You will comply with all applicable laws and regulations</li>
          </ul>

          <hr />

          <h2>2. Description of Service</h2>
          <p>VeriAct is an AI-powered platform that:</p>
          <ul>
            <li>Extracts action items from meeting transcripts</li>
            <li>Transcribes audio and video recordings (Pro/Enterprise)</li>
            <li>Enables team collaboration on action items</li>
            <li>Sends reminders for pending tasks</li>
            <li>Provides meeting bot automation (Enterprise)</li>
          </ul>

          <hr />

          <h2>3. Account Registration</h2>
          <h3>3.1 Account Creation</h3>
          <ul>
            <li>Provide accurate and complete info</li>
            <li>Maintain account security</li>
            <li>No credential sharing</li>
            <li>Notify us of unauthorized use</li>
          </ul>

          <h3>3.2 Account Termination</h3>
          <ul>
            <li>Violation of Terms</li>
            <li>Fraudulent activity</li>
            <li>Misuse of Service</li>
            <li>Extended inactivity (with notice)</li>
          </ul>

          <hr />

          <h2>4. Subscription Plans</h2>
          <h3>4.1 Plan Types</h3>
          <ul>
            <li><strong>Free:</strong> 5 extractions/month</li>
            <li><strong>Pro (£12/mo):</strong> Unlimited + collaboration</li>
            <li><strong>Enterprise (£49/mo):</strong> All Pro + Meeting Bot</li>
          </ul>

          <h3>4.2 Billing</h3>
          <ul>
            <li>Stripe payments, billed monthly in GBP</li>
            <li>Prices exclude VAT</li>
          </ul>

          <h3>4.3 Cancellation</h3>
          <ul>
            <li>Cancel anytime — effective end of billing cycle</li>
            <li>No partial refunds</li>
            <li>Account reverts to Free plan</li>
          </ul>

          <h3>4.4 Refund Policy</h3>
          <ul>
            <li>14-day money-back guarantee (first-time users)</li>
            <li>Request via <a href="mailto:support@veriact.co.uk">support@veriact.co.uk</a></li>
          </ul>

          <h3>4.5 Price Changes</h3>
          <ul>
            <li>30 days’ notice for pricing updates</li>
          </ul>

          <hr />

          <h2>5. Usage Limits & Fair Use</h2>
          <ul>
            <li>Free: 5 transcripts/month</li>
            <li>Pro: Unlimited, up to 500MB/file</li>
            <li>Enterprise: Unlimited with fair use</li>
          </ul>
          <p>
            <strong>
              You may not upload unrelated content, spam, or excessively automate API calls.
            </strong>
          </p>

          <hr />

          <h2>6. Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of your transcripts and recordings. VeriAct only processes them to
            deliver the Service.
          </p>
          <h3>Our Content</h3>
          <p>
            VeriAct’s code, design, and trademarks belong to us. No reverse-engineering or copying.
          </p>
          <h3>AI Output</h3>
          <p>AI-generated items are provided “as-is”; verify accuracy before acting on them.</p>

          <hr />

          <h2>7. Privacy & Data Processing</h2>
          <p>
            Data collection follows our <a href="/privacy">Privacy Policy</a>. You consent to
            processing by Clerk, Supabase, Stripe, and OpenAI.
          </p>

          <ul>
            <li>Recordings auto-deleted within 24h</li>
            <li>Action items retained 90 days</li>
            <li>Transcripts not stored permanently</li>
          </ul>

          <hr />

          <h2>8. Prohibited Uses</h2>
          <ul>
            <li>Illegal transcription</li>
            <li>Malicious uploads or content</li>
            <li>System abuse or scraping</li>
          </ul>

          <p>
            <strong>
              Violations result in account termination and possible legal action.
            </strong>
          </p>

          <hr />

          <h2>9. Disclaimers & Limitations</h2>
          <ul>
            <li>Service provided “AS IS”</li>
            <li>No guarantees of accuracy or uptime</li>
            <li>
              Liability limited to fees paid in last 12 months; not liable for indirect damages or
              data loss
            </li>
          </ul>

          <hr />

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify VeriAct for claims resulting from misuse, law violations, or
            uploaded content.
          </p>

          <hr />

          <h2>11. Meeting Recording Compliance</h2>
          <ul>
            <li>You must obtain participant consent before recording</li>
            <li>Comply with local laws (UK, EU, US, etc.)</li>
            <li>VeriAct is not liable for unlawful recording</li>
          </ul>

          <hr />

          <h2>12. Termination</h2>
          <p>
            Either party may terminate the account. Upon termination, data deletion follows our
            Privacy Policy.
          </p>

          <hr />

          <h2>13. Dispute Resolution</h2>
          <p>
            Governed by the laws of England and Wales. Courts of England and Wales have exclusive
            jurisdiction. Contact <a href="mailto:support@veriact.co.uk">legal@veriact.co.uk</a> before
            filing a claim.
          </p>

          <hr />

          <h2>14. Changes to Terms</h2>
          <p>
            We may update Terms at any time. Material updates are announced 30 days prior. Continued
            use constitutes acceptance.
          </p>

          <hr />

          <h2>15. General Provisions</h2>
          <ul>
            <li>These Terms + Privacy Policy = Entire Agreement</li>
            <li>If one clause is invalid, others remain</li>
            <li>No waiver of rights unless in writing</li>
            <li>Force majeure exceptions apply</li>
          </ul>

          <hr />

          <h2>16. Contact</h2>
          <p>
            Email: <a href="mailto:support@veriact.co.uk">legal@veriact.co.uk</a> /{' '}
            <a href="mailto:support@veriact.co.uk">support@veriact.co.uk</a>
          </p>

          <hr />

          <h2>17. Legal Compliance</h2>
          <ul>
            <li>UK Data Protection Act 2018</li>
            <li>GDPR</li>
            <li>Computer Misuse Act 1990</li>
            <li>Copyright & Patents Act 1988</li>
          </ul>

          <p>
            <strong>
              By using VeriAct, you acknowledge that you have read, understood, and agree to these
              Terms of Service.
            </strong>
          </p>

          <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="mt-0 text-indigo-600">Questions about these terms?</h3>
            <p className='text-indigo-600'>
              Contact us at: <a href="mailto:support@veriact.co.uk">legal@veriact.co.uk</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
