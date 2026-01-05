import { Button } from "@/components/ui/button";

const CodeExport = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Print Button - Hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50">
        <Button 
          onClick={handlePrint}
          className="bg-gradient-warm text-white hover:shadow-glow"
        >
          Print to PDF (Ctrl/Cmd + P)
        </Button>
        <Button 
          onClick={() => window.history.back()}
          className="ml-2"
          variant="outline"
        >
          Back
        </Button>
      </div>

      {/* Title Page */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-20 break-after-page">
          <h1 className="text-5xl font-bold mb-6">
            <span className="gradient-text">Estate Nest Capital Inc.</span>
          </h1>
          <h2 className="text-3xl font-semibold text-enc-text-primary mb-4">
            Complete Project Code Documentation
          </h2>
          <div className="w-32 h-1 bg-gradient-warm mx-auto mb-6"></div>
          <p className="text-xl text-enc-text-secondary">
            Full Source Code Export
          </p>
          <p className="text-enc-text-secondary mt-2">
            Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <div className="mt-12 text-left max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-enc-text-primary">Project Information</h3>
            <p className="text-enc-text-secondary mb-2"><strong>Company:</strong> Estate Nest Capital Inc.</p>
            <p className="text-enc-text-secondary mb-2"><strong>Email:</strong> hello@estatenest.capital</p>
            <p className="text-enc-text-secondary mb-2"><strong>Phone:</strong> 780-860-3191</p>
            <p className="text-enc-text-secondary mb-2"><strong>Website:</strong> www.estatenest.capital</p>
            <p className="text-enc-text-secondary mb-2"><strong>Location:</strong> Edmonton, Alberta, Canada</p>
          </div>
        </div>

        {/* Configuration Files */}
        <div className="mb-16 break-before-page">
          <div className="bg-gradient-warm text-white p-4 rounded-t-lg mb-0">
            <h2 className="text-3xl font-bold">Configuration Files</h2>
          </div>
          
          <div className="border border-gray-300 p-6 rounded-b-lg bg-white">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-enc-text-primary mb-3 pb-2 border-b-2 border-enc-orange">
                index.html
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-black font-mono whitespace-pre-wrap break-words">{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estate Nest Capital - Real Estate Investment & Capital Solutions</title>
    <meta name="description" content="Strategic real estate investments and capital solutions based in Edmonton, Alberta." />
    <meta name="author" content="Estate Nest Capital Inc." />
    <meta property="og:title" content="Estate Nest Capital - Real Estate Investment & Capital Solutions" />
    <meta property="og:description" content="Strategic real estate investments and capital solutions based in Edmonton, Alberta." />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`}</pre>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-enc-text-primary mb-3 pb-2 border-b-2 border-enc-orange">
                vite.config.ts
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-black font-mono whitespace-pre-wrap break-words">{`import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));`}</pre>
            </div>
          </div>
        </div>

        {/* Styles */}
        <div className="mb-16 break-before-page">
          <div className="bg-gradient-warm text-white p-4 rounded-t-lg mb-0">
            <h2 className="text-3xl font-bold">Styles & Design System</h2>
          </div>
          
          <div className="border border-gray-300 p-6 rounded-b-lg bg-white">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-enc-text-primary mb-3 pb-2 border-b-2 border-enc-orange">
                src/index.css
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-black font-mono whitespace-pre-wrap break-words">{`@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 220 14% 96%;
    --primary-foreground: 220 9% 46%;
    
    /* Estate Nest Capital logo-inspired color palette */
    --enc-red: 0 85% 60%;
    --enc-orange: 25 95% 60%;
    --enc-yellow: 50 100% 60%;
    --enc-text-primary: 220 50% 10%;
    --enc-text-secondary: 220 9% 46%;
    
    /* Logo-inspired gradients */
    --gradient-hero: linear-gradient(135deg, hsl(0 85% 60%), hsl(25 95% 60%), hsl(50 100% 60%));
    --gradient-warm: linear-gradient(135deg, hsl(10 90% 65%), hsl(25 95% 75%));
    --gradient-text: linear-gradient(135deg, hsl(0 85% 60%), hsl(25 95% 60%), hsl(50 100% 60%));
    
    /* Modern shadows and effects */
    --shadow-glow: 0 0 40px hsl(var(--enc-orange) / 0.3);
    --shadow-card: 0 10px 40px hsl(220 50% 10% / 0.1);
    --shadow-card-hover: 0 20px 60px hsl(220 50% 10% / 0.15);
  }
}

@layer components {
  .gradient-text {
    background: var(--gradient-text);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-card);
  }
  
  .card-hover:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: var(--shadow-card-hover);
  }
}`}</pre>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-enc-text-primary mb-3 pb-2 border-b-2 border-enc-orange">
                tailwind.config.ts
              </h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-black font-mono whitespace-pre-wrap break-words">{`import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'enc-red': 'hsl(var(--enc-red))',
        'enc-orange': 'hsl(var(--enc-orange))',
        'enc-yellow': 'hsl(var(--enc-yellow))',
        'enc-text-primary': 'hsl(var(--enc-text-primary))',
        'enc-text-secondary': 'hsl(var(--enc-text-secondary))',
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-warm': 'var(--gradient-warm)',
        'gradient-text': 'var(--gradient-text)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;`}</pre>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .break-before-page {
            page-break-before: always;
          }
          
          .break-after-page {
            page-break-after: always;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .gradient-text,
          .bg-gradient-warm {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default CodeExport;
