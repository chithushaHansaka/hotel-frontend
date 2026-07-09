"use client";

import { Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import Step1Selection from "@/components/booking/Step1Selection";
import Step2Personalize from "@/components/booking/Step2Personalize";
import Step3Checkout from "@/components/booking/Step3Checkout";

const STEPS = [
  { id: 1, label: "Dates & Room", shortLabel: "Room" },
  { id: 2, label: "Details", shortLabel: "Details" },
  { id: 3, label: "Checkout", shortLabel: "Pay" },
];

export default function BookPage() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const setStep = useBookingStore((state) => state.setStep);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Suspense
            fallback={
              <div className="py-20 text-center text-sm text-white/60">
                Preparing your booking experience...
              </div>
            }
          >
            <Step1Selection key="step-1" />
          </Suspense>
        );
      case 2:
        return <Step2Personalize key="step-2" />;
      case 3:
        return <Step3Checkout key="step-3" />;
      default:
        return <Step1Selection key="step-1" />;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(28,35,46,0.95),_rgba(5,6,8,1))] pb-24 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-[#050607]" />

        <div className="relative z-10 container mx-auto px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center will-change-transform"
          >
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-amber-200/90">
              <Crown size={14} />
              Luxury Booking
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Reserve Your Experience
            </h1>
            <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">
              A three-stage journey designed for effortless elegance — from suite
              selection to personalized enhancements and final confirmation.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12 sm:py-16">
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
            <div className="absolute left-8 right-8 top-1/2 hidden h-px -translate-y-1/2 bg-white/10 sm:block" />

            <div className="grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isComplete = currentStep > step.id;

                return (
                  <motion.button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep) {
                        setStep(step.id);
                      }
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    disabled={step.id > currentStep}
                    className={`relative flex flex-col items-center text-center transition-opacity will-change-transform ${
                      step.id > currentStep
                        ? "cursor-default opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-amber-400 bg-amber-400 text-black shadow-[0_0_30px_rgba(212,165,116,0.45)]"
                          : isComplete
                            ? "border-amber-400/40 bg-amber-400/15 text-amber-200"
                            : "border-white/15 bg-black/40 text-white/55"
                      }`}
                    >
                      {step.id}
                    </div>

                    <p
                      className={`mt-4 text-sm font-medium ${
                        isActive ? "text-amber-200" : "text-white/70"
                      }`}
                    >
                      <span className="hidden sm:inline">{step.id}. </span>
                      {step.label}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/40 sm:hidden">
                      {step.shortLabel}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
      </section>
    </main>
  );
}
