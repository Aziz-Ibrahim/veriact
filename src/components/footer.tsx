import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VeriAct</span>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered meeting action item tracker. Never miss a task again.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#pricing" className="text-sm text-gray-600 hover:text-indigo-600">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/meeting-bot" className="text-sm text-gray-600 hover:text-indigo-600">
                  Meeting Bot
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-indigo-600">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:support@veriact.co.uk" className="text-sm text-gray-600 hover:text-indigo-600">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="mailto:support@veriact.co.uk" className="text-sm text-gray-600 hover:text-indigo-600">
                  Privacy Inquiries
                </a>
              </li>
              <li>
                <a href="mailto:support@veriact.co.uk" className="text-sm text-gray-600 hover:text-indigo-600">
                  Legal Inquiries
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} VeriAct. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🇬🇧 Made in the UK</span>
              <span>•</span>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}