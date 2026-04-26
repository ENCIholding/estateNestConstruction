import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-building.jpg";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen scroll-mt-28 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Estate Nest Capital concept image representing residential and commercial development work in Edmonton, Alberta"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75" />
      </div>

      <div className="relative container mx-auto px-6 py-24 pt-36">
        <div className="max-w-5xl">
          <div className="space-y-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/75">
              Edmonton construction and development
            </p>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Project delivery with
              <span className="hero-gradient-text block"> clearer controls and real accountability</span>
            </h1>
            <p className="max-w-3xl text-xl leading-8 text-white/90 md:text-2xl">
              Estate Nest Capital Inc. is building a practical platform for pre-construction planning,
              project execution, and stakeholder communication across residential and commercial work.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Link to="/builder-profile" className="block">
              <div className="rounded-[1.75rem] border border-white/15 bg-white/8 p-8 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] hover:bg-white/12">
                <h2 className="text-3xl font-bold text-white">
                  Builder
                  <span className="gradient-text-alt"> Profile</span>
                </h2>
                <p className="mt-4 text-lg leading-7 text-white/85">
                  Review how Estate Nest approaches planning, project controls, documentation, and lender/client communication.
                </p>
              </div>
            </Link>

            <Link to="/investor-relations" className="block">
              <div className="rounded-[1.75rem] border border-white/15 bg-white/8 p-8 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] hover:bg-white/12">
                <h2 className="text-3xl font-bold text-white">
                  Investor
                  <span className="gradient-text-alt"> Relations</span>
                </h2>
                <p className="mt-4 text-lg leading-7 text-white/85">
                  Understand how diligence materials, opportunity reviews, and partnership discussions are handled before capital is committed.
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
