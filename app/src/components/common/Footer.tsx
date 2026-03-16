import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    product: [
      { label: 'Features', href: '/#features' },
      { label: 'Courses', href: '/#courses' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'For Teams', href: '/teams' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="border-t bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 items-start">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-12 text-left">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                LearnFlux
              </span>
            </Link>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-md">
              Empowering learners worldwide with AI-powered personalized education. Access courses across dozens of categories, upgrade your skills, and start your journey today.
            </p>

            <div className="space-y-4 w-full">
              <p className="text-sm font-semibold text-foreground">Subscribe to our newsletter</p>
              <div className="flex items-center w-full max-w-md gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button>
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Links Space */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="text-left">
              <h4 className="font-semibold mb-6 text-foreground">Product</h4>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-left">
              <h4 className="font-semibold mb-6 text-foreground">Company</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-left">
              <h4 className="font-semibold mb-6 text-foreground">Resources</h4>
              <ul className="space-y-4">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-6 pb-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} LearnFlux. All rights reserved.
            </p>
            <div className="flex items-center gap-6 justify-center">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Youtube className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
