import { motion } from "framer-motion";
import { Calendar, Users, MapPin, CheckCircle, Sparkles, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { GoldenRing, OrbitalBackground } from "@/components/nexus/GoldenRing";
import { GlassCard, FeatureCard, GoldenButton } from "@/components/nexus/Cards";

const features = [
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Calendars",
    description: "We find when everyone is actually free."
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Preferences",
    description: "We factor in food, budget, and more."
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Location",
    description: "We choose spots that work for everyone."
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Magic",
    description: "We do the heavy lifting so you don't have to."
  },
];

const stepsContent = [
  {
    number: "01",
    title: "Connect your calendar",
    description: "We only read your availability. Your events stay private."
  },
  {
    number: "02", 
    title: "Create a group",
    description: "Invite friends, family, or colleagues to join your circle."
  },
  {
    number: "03",
    title: "Find your Golden Window",
    description: "AI analyzes everyone's schedules to find the perfect time."
  },
];

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#070b14] overflow-hidden">
      <OrbitalBackground />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Logo and Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
        >
          <GoldenRing size={200} />
        </motion.div>
        
        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl font-light tracking-[0.25em] text-white mb-4"
        >
          NEXUS
        </motion.h1>
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[#d4a853] text-lg md:text-xl tracking-wide mb-4"
        >
          Plans, perfectly aligned.
        </motion.p>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-muted-foreground text-center max-w-md mb-10"
        >
          The AI assistant that finds the perfect time and place for everyone.
        </motion.p>
        
        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-10"
        >
          {[
            { icon: <Calendar className="w-4 h-4" />, label: "Sync calendars" },
            { icon: <Users className="w-4 h-4" />, label: "Align everyone" },
            { icon: <MapPin className="w-4 h-4" />, label: "Find the best spot" },
            { icon: <CheckCircle className="w-4 h-4" />, label: "One-tap confirm" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111827]/60 border border-[#d4a853]/10 text-muted-foreground text-sm"
            >
              <span className="text-[#d4a853]">{item.icon}</span>
              {item.label}
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <GoldenButton
            onClick={() => setLocation("/login")}
            size="lg"
            className="min-w-[200px]"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </GoldenButton>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-[#d4a853]/30 flex justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-[#d4a853]/50" />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Calendar Connect Preview */}
      <section className="relative px-6 py-20">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-6" glow>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a853] to-[#a88432] flex items-center justify-center shrink-0">
                <Calendar className="w-7 h-7 text-[#070b14]" />
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold mb-1">Connect your calendar</h3>
                <p className="text-muted-foreground text-sm">
                  We only read your availability. Your events stay private.
                </p>
              </div>
            </div>
            
            {/* Google Calendar Button Preview */}
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-800 font-medium hover:bg-slate-100 transition-colors mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Connect Google Calendar
            </button>
            
            <p className="text-center text-muted-foreground text-xs">
              More options coming soon
            </p>
            
            {/* Orbital decoration */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-[#d4a853]/10"
            />
          </GlassCard>
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="relative px-6 py-16">
        <div className="max-w-lg mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-white text-center mb-10"
          >
            How Nexus works
          </motion.h2>
          
          <div className="grid grid-cols-2 gap-2">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Steps Section */}
      <section className="relative px-6 py-16">
        <div className="max-w-md mx-auto space-y-4">
          {stepsContent.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-[#d4a853] text-sm font-mono tracking-wider">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="relative px-6 py-20">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
              <span className="tracking-wider uppercase">Stop organizing. Start experiencing.</span>
            </div>
            <h2 className="text-3xl font-semibold text-white mb-4">
              Ready to find your Golden Window?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of groups who've discovered the effortless way to plan.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <GoldenButton
              onClick={() => setLocation("/login")}
              size="lg"
              className="w-full"
            >
              Create your account
            </GoldenButton>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="px-6 py-10 border-t border-[#d4a853]/10">
        <div className="max-w-md mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            Nexus - Plans, perfectly aligned.
          </p>
          <p className="text-muted-foreground/50 text-xs mt-2">
            Your data is encrypted and never shared.
          </p>
        </div>
      </footer>
    </div>
  );
}
