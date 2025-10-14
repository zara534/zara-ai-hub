import React from 'react';

const AboutSection: React.FC = () => {
    const socialLinks = [
        { 
            href: 'https://www.facebook.com/profile.php?id=61579058107810', 
            label: 'Facebook',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>
        },
        { 
            href: 'https://www.tiktok.com/@zarahacks070?_t=ZS-90EKk2Xi93w&_r=1', 
            label: 'TikTok',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.345 6.273c-1.597 1.597-2.316 3.033-2.316 5.515 0 2.213.918 4.498 3.109 4.498.442 0 .82-.056 1.157-.145v-3.483c-.337.089-.714.145-1.157.145-1.114 0-1.282-1.042-1.282-1.638 0-2.953 2.123-2.775 4.142-2.775v-3.483c-.328 0-1.04-.009-1.5-.009-2.825 0-4.004 1.37-4.143 1.37zm-9.336 4.225c.013 3.498-2.112 5.503-5.018 5.503-2.905 0-4.991-2.005-4.991-5.503 0-3.498 2.086-5.502 4.991-5.502 2.906-.001 5.005 2.004 5.018 5.502zm-2.019.001c-.006-2.203-.924-3.502-2.99-3.502s-2.983 1.299-2.983 3.502c0 2.203.915 3.501 2.983 3.501s2.996-1.298 2.99-3.501z"/></svg>
        },
        { 
            href: 'tel:+2347011156046', 
            label: 'Phone',
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path></svg>
        },
    ];

    return (
        <div className="bg-surface/50 p-6 sm:p-8 rounded-2xl border border-border-color space-y-8">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-6">A Note from the Creator</h3>
                <div className="text-text-secondary text-sm sm:text-base leading-relaxed space-y-4 max-w-2xl mx-auto">
                    <p>
                        Hello! I'm <span className="font-semibold text-accent">Goodluck Zara</span> (also known as Zara Codec), the creator of this platform. As a young Nigerian developer, my journey into artificial intelligence has been driven by pure passion. This platform was built by me, Zara.
                    </p>
                    <p>
                        Building the ZARA AI HUB from the ground up was an immense challenge—a true labor of love filled with sleepless nights, complex coding problems, and a relentless desire to build something both powerful and user-friendly. This website is the result of that dedication.
                    </p>
                    <p>
                        My dream is to empower everyone with access to incredible AI tools. If you're interested in creating a website or app, or wish to explore AI further, I'm available for hire. You can reach me directly on WhatsApp at <strong className="text-text-primary">+2347011156046</strong>. Let's build something amazing together!
                    </p>
                </div>
                 <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border-color">
                    {socialLinks.map(link => (
                        <a 
                            key={link.label}
                            href={link.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`Contact Zara on ${link.label}`}
                            className="text-text-secondary hover:text-primary transition-colors transform hover:scale-110"
                        >
                            {link.icon}
                        </a>
                    ))}
                </div>
            </div>

            <div className="border-t border-border-color my-4"></div>
            
            <div className="text-left text-xs text-text-secondary space-y-4 max-w-3xl mx-auto">
                <h4 className="font-bold text-sm text-text-primary text-center">Legal & Terms of Use</h4>
                <p><strong>1. Your Agreement:</strong> By using ZARA AI HUB ("the Service"), you agree to these terms. Please use the Service responsibly.</p>
                <p><strong>2. Content & Ownership:</strong> You own the content and images you create. You agree not to generate illegal, harmful, or infringing content. We reserve the right to suspend accounts for misuse.</p>
                <p><strong>3. Account Security:</strong> You are responsible for maintaining the security of your account credentials.</p>
                <p><strong>4. Privacy:</strong> We collect essential data (email, username) for account purposes only. Your personal information is securely handled and will never be sold.</p>
                <p><strong>5. Disclaimer:</strong> The Service is provided "as is" without any warranties. ZARA AI HUB is not liable for any damages resulting from the use of the AI-generated content or the Service itself.</p>
            </div>
        </div>
    );
};

export default AboutSection;