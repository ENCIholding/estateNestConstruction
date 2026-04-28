import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-enci-home.png";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen scroll-mt-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
        />
        <img
          src={heroImage}
          alt="Estate Nest Capital concept image representing residential and commercial development work in Edmonton, Alberta"
          className="absolute inset-0 h-full w-full object-contain object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061a38]/78 via-[#0c2f5a]/48 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-black/16 to-black/52" />
      </div>

      <div className="relative container mx-auto px-6 py-24 pt-36">
        <div className="max-w-5xl">
          <div className="space-y-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
              Edmonton construction and development
            </p>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.75)] md:text-6xl lg:text-7xl">
              Where Capital Meets
              <span className="block text-white">Craftsmanship in Real Estate</span>
            </h1>
            <p className="max-w-3xl text-xl leading-8 text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.7)] md:text-2xl">
              Estate Nest Capital Inc. coordinates construction and
              development projects across the Edmonton region, connecting
              disciplined project oversight with practical execution from
              foundation to finish.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Link to="/builder-profile" className="block">
              <div className="rounded-[1.75rem] border border-white/20 bg-slate-900/38 p-8 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] hover:bg-slate-900/44">
                <h2 className="text-3xl font-bold text-white">
                  Builder
                  <span className="gradient-text-alt"> Profile</span>
                </h2>
                <p className="mt-4 text-lg leading-7 text-white/95">
                  Estate Nest Capital approaches construction with disciplined
                  planning, clear scope control, organized documentation, and
                  practical communication for clients, lenders, consultants,
                  and project stakeholders.
                </p>
              </div>
            </Link>

            <Link to="/investor-relations" className="block">
              <div className="rounded-[1.75rem] border border-white/20 bg-slate-900/38 p-8 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] hover:bg-slate-900/44">
                <h2 className="text-3xl font-bold text-white">
                  Investor
                  <span className="gradient-text-alt"> Relations</span>
                </h2>
                <p className="mt-4 text-lg leading-7 text-white/95">
                  Estate Nest Capital evaluates development opportunities with
                  disciplined due diligence, project-specific review, and clear
                  communication before any partnership or capital discussion
                  moves forward.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
