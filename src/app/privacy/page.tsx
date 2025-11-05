import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | VeriAct',
  description: 'VeriAct Privacy Policy - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
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

        <div className="bg-indigo-500 rounded-xl shadow-sm p-8 prose prose-indigo max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-gray-600">Last Updated: September 15, 2025</p>

          <p><strong>VeriAct</strong> (“we”, “our”, or “us”) operates https://veriact.com (the “Service”). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
          <p>By using VeriAct, you agree to the collection and use of information in accordance with this policy.</p>

          <hr />

          <h2>1. Information We Collect</h2>

          <h3>1.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email (via Clerk authentication)</li>
            <li><strong>Payment Information:</strong> Processed by Stripe — we do NOT store card details</li>
            <li><strong>Meeting Transcripts:</strong> Text files you upload</li>
            <li><strong>Action Items:</strong> Tasks extracted using AI processing</li>
            <li><strong>Organization Details:</strong> Company name, team member emails (Enterprise)</li>
          </ul>

          <h3>1.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> Feature usage, pages visited, timestamps</li>
            <li><strong>Device Information:</strong> Browser, IP, OS</li>
            <li><strong>Cookies:</strong> Authentication/session cookies</li>
          </ul>

          <h3>1.3 Audio/Video Files</h3>
          <ul>
            <li><strong>Temporary Storage:</strong> Uploads stored only for processing</li>
            <li><strong>Automatic Deletion:</strong> All media files deleted within 24 hours</li>
            <li><strong>No Permanent Storage:</strong> Only transcript and derived action items are retained</li>
          </ul>

          <hr />

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Process transcripts using OpenAI Whisper</li>
            <li>Extract action items using AI</li>
            <li>Manage billing and subscriptions via Stripe</li>
            <li>Email reminders and invitation access</li>
            <li>Customer support</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h3>OpenAI Data Processing</h3>
          <ul>
            <li>Your transcript data is processed securely through OpenAI</li>
            <li>OpenAI <u>does not</u> use API data for model training</li>
            <li>Secure retention/deletion based on OpenAI policy</li>
          </ul>

          <hr />

          <h2>3. Data Storage & Security</h2>

          <h3>Where Data Is Stored</h3>
          <ul>
            <li><strong>Authentication:</strong> Clerk</li>
            <li><strong>Database:</strong> Supabase</li>
            <li><strong>Processing:</strong> OpenAI</li>
            <li><strong>Payments:</strong> Stripe</li>
            <li><strong>Hosting:</strong> Vercel</li>
          </ul>

          <h3>Security Measures</h3>
          <ul>
            <li>HTTPS/TLS encryption</li>
            <li>Role-based & row-level database security</li>
            <li>Encrypted temporary storage</li>
            <li>No card storage</li>
          </ul>

          <h3>Data Retention</h3>
          <ul>
            <li>Action items: 90 days</li>
            <li>Account data: while active</li>
            <li>Audio/video files: deleted in 24 hours</li>
            <li>Usage logs: 90 days</li>
          </ul>

          <hr />

          <h2>4. Data Sharing</h2>
          <p><strong>We do NOT sell your data.</strong></p>
          <p>We only share data with required service providers:</p>
          <ul>
            <li>Clerk</li>
            <li>Supabase</li>
            <li>OpenAI</li>
            <li>Stripe</li>
            <li>Resend</li>
            <li>Vercel</li>
          </ul>

          <p>We may share data if legally required or in business transfers (e.g. acquisition).</p>

          <hr />

          <h2>5. Your Rights (GDPR & UK GDPR)</h2>
          <ul>
            <li>Access, correction, deletion</li>
            <li>Download/export data</li>
            <li>Withdraw consent</li>
            <li>Object to certain processing</li>
          </ul>
          <p>Email: <a href="mailto:support@veriact.co.uk">privacy@veriact.co.uk</a></p>

          <hr />

          <h2>6. Children’s Privacy</h2>
          <p>Not for users under 16. If data was mistakenly submitted, please contact us.</p>

          <hr />

          <h2>7. International Data Transfers</h2>
          <p>GDPR-compliant safeguards including SCCs and encryption.</p>

          <hr />

          <h2>8. Cookies</h2>
          <p>Only essential cookies (authentication/session). No ads or trackers.</p>

          <hr />

          <h2>9. California CCPA Rights</h2>
          <p>Right to know, delete, and non-discrimination — we do not sell data.</p>

          <hr />

          <h2>10. Data Breach Notification</h2>
          <p>You will be notified within 72 hours if your data is impacted.</p>

          <hr />

          <h2>11. Changes to This Policy</h2>
          <p>We notify users of changes via website update and/or email.</p>

          <hr />

          <h2>12. Contact Us</h2>
          <p>Email: <a href="mailto:support@veriact.co.uk">privacy@veriact.co.uk</a></p>
          <p>Supervisory Authority: UK ICO — https://ico.org.uk</p>

          <hr />

          <h2>13. Legal Basis for Processing</h2>

          <table>
            <thead>
              <tr>
                <th>Processing</th>
                <th>Legal Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account creation</td>
                <td>Contract performance</td>
              </tr>
              <tr>
                <td>Payment processing</td>
                <td>Contract performance</td>
              </tr>
              <tr>
                <td>Service improvement</td>
                <td>Legitimate interest</td>
              </tr>
              <tr>
                <td>Marketing (if opted in)</td>
                <td>Consent</td>
              </tr>
            </tbody>
          </table>

          <p><strong>By using VeriAct, you acknowledge that you have read and understood this Privacy Policy.</strong></p>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-indigo-200">
            <h3 className="mt-0 text-indigo-600">Questions about privacy?</h3>
            <p className='text-indigo-600'>Contact us at: <a href="mailto:support@veriact.co.uk">privacy@veriact.co.uk</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
