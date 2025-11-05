import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy | VeriAct',
  description: 'VeriAct Cookie Policy - How we use cookies and similar technologies',
};

export default function CookiesPage() {
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
          <h1>Cookie Policy</h1>
          <p className="text-sm text-gray-900">Last Updated: September 15, 2025</p>

          <p>
            This Cookie Policy explains how <strong>VeriAct</strong> ("we", "our", or "us") uses
            cookies and similar technologies on{' '}
            <a href="https://veriact.co.uk">https://veriact.co.uk</a>.
          </p>

          <hr />

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help
            the website remember your preferences and improve your experience.
          </p>

          <hr />

          <h2>2. Types of Cookies We Use</h2>

          <h3>2.1 Essential Cookies (Always Active)</h3>
          <p><strong>Purpose:</strong> Required for the Service to function</p>
          <p><strong>Cannot be disabled:</strong> These are necessary for core functionality.</p>

          <table>
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>__session</td>
                <td>Clerk</td>
                <td>Authentication - keeps you logged in</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>__clerk_db_jwt</td>
                <td>Clerk</td>
                <td>Secure token for authentication</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>__client_uat</td>
                <td>Clerk</td>
                <td>User authentication tracking</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>2.2 Functional Cookies (Optional)</h3>
          <p><strong>Purpose:</strong> Remember your preferences</p>

          <table>
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>theme</td>
                <td>VeriAct</td>
                <td>Remember dark/light mode preference</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>sidebar_state</td>
                <td>VeriAct</td>
                <td>Remember sidebar collapsed/expanded</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <h3>2.3 Analytics Cookies (With Consent)</h3>
          <p><strong>Purpose:</strong> Help us understand how you use the Service</p>

          <table>
            <thead>
              <tr>
                <th>Cookie Name</th>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_vercel_analytics</td>
                <td>Vercel</td>
                <td>Anonymous usage statistics</td>
                <td>1 year</td>
              </tr>
            </tbody>
          </table>

          <p><strong>We do NOT use:</strong></p>
          <ul>
            <li>Advertising cookies</li>
            <li>Third-party tracking cookies</li>
            <li>Social media cookies</li>
          </ul>

          <hr />

          <h2>3. How We Use Cookies</h2>

          <h3>3.1 Authentication</h3>
          <ul>
            <li>Keep you logged in between sessions</li>
            <li>Secure your account access</li>
            <li>Provide seamless experience</li>
          </ul>

          <h3>3.2 Functionality</h3>
          <ul>
            <li>Remember preferences</li>
            <li>Store temporary data (e.g., drafts)</li>
            <li>Maintain session state</li>
          </ul>

          <h3>3.3 Analytics (If Consented)</h3>
          <ul>
            <li>Understand feature usage</li>
            <li>Identify performance issues</li>
            <li>Improve the Service</li>
          </ul>

          <p><strong>We do NOT:</strong> Track you across other websites or sell your data.</p>

          <hr />

          <h2>4. Third-Party Cookies</h2>

          <h3>4.1 Clerk (Authentication)</h3>
          <p>
            Purpose: Secure authentication and user management<br />
            Privacy Policy:{' '}
            <a href="https://clerk.com/privacy">https://clerk.com/privacy</a>
          </p>

          <h3>4.2 Vercel (Hosting)</h3>
          <p>
            Purpose: Service delivery and optional analytics<br />
            Privacy Policy:{' '}
            <a href="https://vercel.com/legal/privacy-policy">
              https://vercel.com/legal/privacy-policy
            </a>
          </p>

          <h3>4.3 Stripe (Payments)</h3>
          <p>
            Purpose: Secure payment processing<br />
            Privacy Policy:{' '}
            <a href="https://stripe.com/privacy">https://stripe.com/privacy</a><br />
            Note: Stripe cookies only appear on checkout pages.
          </p>

          <hr />

          <h2>5. Your Cookie Choices</h2>

          <h3>5.1 Essential Cookies</h3>
          <p>Cannot be disabled — required for the Service to work.</p>

          <h3>5.2 Optional Cookies</h3>
          <p>You can control optional cookies using your browser settings:</p>

          <ul>
            <li>Chrome → Settings → Privacy → Cookies</li>
            <li>Firefox → Settings → Privacy → Cookies</li>
            <li>Safari → Preferences → Privacy → Cookies</li>
            <li>Edge → Settings → Privacy → Cookies</li>
          </ul>

          <p>If a cookie banner is implemented, you may choose:</p>

          <ul>
            <li>Accept all cookies</li>
            <li>Accept only essential cookies</li>
            <li>Customize preferences</li>
          </ul>

          <h3>5.3 Disabling Cookies</h3>
          <p><strong>Warning:</strong> Disabling essential cookies prevents login or purchases.</p>

          <hr />

          <h2>6. Browser Storage</h2>

          <h3>6.1 Local Storage</h3>
          <p>
            Used to store your action items and temporary transcripts locally (Free plan). Clear via
            browser settings → “Clear browsing data → Cookies and site data”.
          </p>

          <h3>6.2 Session Storage</h3>
          <p>Used for temporary session data, automatically cleared on browser close.</p>

          <hr />

          <h2>7. Do Not Track (DNT)</h2>
          <p>
            We respect “Do Not Track” signals. If DNT is enabled, analytics cookies are not loaded.
            Essential cookies remain required.
          </p>

          <hr />

          <h2>8. Cookie Updates</h2>
          <p>
            We may update this Cookie Policy periodically. Updates are posted here with a new “Last
            Updated” date.
          </p>

          <hr />

          <h2>9. Your Rights (GDPR/UK GDPR)</h2>
          <ul>
            <li>Know what cookies we use</li>
            <li>Withdraw consent for non-essential cookies</li>
            <li>Request deletion of cookie data</li>
          </ul>
          <p>
            To exercise these rights, email{' '}
            <a href="mailto:support@veriact.co.uk">privacy@veriact.co.uk</a>.
          </p>

          <hr />

          <h2>10. Contact Us</h2>
          <p>
            Email: <a href="mailto:support@veriact.co.uk">privacy@veriact.co.uk</a>
            <br />
            Website: <a href="https://veriact.co.uk/contact">https://veriact.co.uk/contact</a>
          </p>

          <hr />

          <h2>11. More Information</h2>
          <ul>
            <li>
              <a href="https://www.aboutcookies.org">About Cookies</a>
            </li>
            <li>
              <a href="https://ico.org.uk/for-the-public/online/cookies/">ICO (UK)</a>
            </li>
            <li>
              <a href="https://www.allaboutcookies.org">All About Cookies</a>
            </li>
          </ul>

          <hr />

          <p>
            <strong>
              By using VeriAct, you consent to our use of essential cookies and can manage optional
              cookies as described above.
            </strong>
          </p>

          <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="mt-0 text-indigo-600">Questions about cookies?</h3>
            <p className="text-indigo-600">
              Contact us at:{' '}
              <a href="mailto:support@veriact.co.uk">support@veriact.co.uk</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
