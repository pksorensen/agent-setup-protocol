import type { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

import './globals.css';

// Self-hosted at build time, so a reader's browser contacts no third party.
const sans = IBM_Plex_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-sans',
    display: 'swap',
});
const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://agentsetupprotocol.com'),
    title: {
        default: 'Agent Setup Protocol',
        template: '%s',
    },
    description:
        'A platform publishes what a person is entitled to as JSON documents. A client reads them and writes the agent configuration files.',
    openGraph: {
        type: 'website',
        siteName: 'Agent Setup Protocol',
        url: 'https://agentsetupprotocol.com',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`${sans.variable} ${mono.variable}`}>
            <body>
                <div className="wrap">{children}</div>
                <footer className="wrap">
                    <p>Agent Setup Protocol &middot; draft &middot; agentsetupprotocol.com</p>
                    <p className="small">
                        Specification text CC-BY-4.0. Schemas, tooling and this site Apache-2.0.
                    </p>
                </footer>
            </body>
        </html>
    );
}
