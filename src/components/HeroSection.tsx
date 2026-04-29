import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-enci-home.png";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen scroll-mt-28 overflow-hidden bg-[#040b15]">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Estate Nest Capital construction and development hero image"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(11,28,46,0.48),transparent_52%),radial-gradient(circle_at_82%_18%,rgba(8,20,33,0.34),transparent_48%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/38 via-black/24 to-black/44" />
      </div>

      <div className="relative container mx-auto px-6 py-24 pt-36">
        <div className="max-w-5xl">
          <div className="space-y-8">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.75)] md:text-6xl lg:text-7xl">
              Where <span className="gradient-text-alt">Capital</span> Meets
              <span className="block text-white">
                <span className="gradient-text-alt">Craftsmanship</span> in{" "}
                <span className="gradient-text-alt">Real Estate</span>
              </span>
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
              <div className="rounded-[1.75rem] border border-white/30 bg-white/14 p-8 backdrop-blur-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-white/20">
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
              <div className="rounded-[1.75rem] border border-white/30 bg-white/14 p-8 backdrop-blur-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-white/20">
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
    </section>
  );
}
