import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-28">
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-3xl">
              <Card className="card-hover border-0 shadow-xl">
                <CardContent className="space-y-6 px-8 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                      Submission received
                    </p>
                    <h1 className="mt-3 text-4xl font-bold text-foreground">
                      Thank you
                    </h1>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                      Your form has been submitted. Estate Nest Capital will review it and follow up through the contact information you provided.
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild className="bg-gradient-warm text-white hover:shadow-glow">
                      <Link to="/">Return to home</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/careers">Back to careers</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
