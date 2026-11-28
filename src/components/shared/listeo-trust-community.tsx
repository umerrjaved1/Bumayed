"use client";

import { Star, ShieldCheck, CheckCircle2, MessageCircle, PhoneCall } from "lucide-react";

export function ListeoTrustCommunity() {
  const testimonials = [
    {
      name: "Rashid Al-Maktoum",
      role: "Private Collector, Dubai",
      quote:
        "Sold my Land Cruiser within 48 hours of posting. Direct WhatsApp inquiries from serious UAE buyers without middlemen.",
      rating: 5,
      vehicle: "Toyota Land Cruiser VXR",
    },
    {
      name: "Ahmed Bin Salem",
      role: "Marine Enthusiast, Abu Dhabi",
      quote:
        "The verified boat specifications and direct contact buttons made buying our Majesty 62 Yacht smooth and transparent.",
      rating: 5,
      vehicle: "Gulf Craft Majesty 62",
    },
    {
      name: "Tariq Mansoor",
      role: "Showroom Manager, Sharjah",
      quote:
        "As a verified motors dealer, Bumayed provides us with the highest quality automotive leads across all 7 emirates.",
      rating: 5,
      vehicle: "VIP Motors Partner",
    },
  ];

  return (
    <section className="py-20 bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-3">
            <ShieldCheck className="size-4" />
            <span>Built for UAE Motors</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
            Trusted by Buyers & Verified Dealers
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Experience direct, hassle-free vehicle transactions with instant WhatsApp and phone access.
          </p>
        </div>

        {/* 3-Column Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
            >
              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-foreground leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {t.vehicle}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Direct WhatsApp & Call Trust Strip */}
        <div className="mt-14 rounded-3xl bg-muted/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-border">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-foreground">
                Direct Contact — 0% Commission
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Connect with sellers instantly via phone or WhatsApp. No hidden transaction fees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>GCC Specs Verified</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Free Buyer Inquiries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
