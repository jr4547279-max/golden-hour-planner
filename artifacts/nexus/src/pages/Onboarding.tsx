import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Coffee, Music, Utensils, Bike, MapPin, 
  Sun, Moon, Sunset, DollarSign, Users, 
  Sparkles, ArrowRight, ArrowLeft, Check
} from "lucide-react";
import { GoldenRing, OrbitalBackground } from "@/components/nexus/GoldenRing";
import { GlassCard, GoldenButton } from "@/components/nexus/Cards";

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: { id: string; label: string; icon?: React.ReactNode }[];
  multiSelect?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "activities",
    title: "What do you like doing?",
    subtitle: "Select all that apply",
    icon: <Sparkles className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { id: "dining", label: "Dining out", icon: <Utensils className="w-4 h-4" /> },
      { id: "coffee", label: "Coffee & tea", icon: <Coffee className="w-4 h-4" /> },
      { id: "drinks", label: "Drinks & bars", icon: <Music className="w-4 h-4" /> },
      { id: "outdoor", label: "Outdoor activities", icon: <Bike className="w-4 h-4" /> },
      { id: "movies", label: "Movies & shows", icon: <Music className="w-4 h-4" /> },
      { id: "sports", label: "Sports & fitness", icon: <Bike className="w-4 h-4" /> },
    ],
  },
  {
    id: "times",
    title: "When do you usually meet up?",
    subtitle: "Select your preferred times",
    icon: <Sun className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { id: "morning", label: "Mornings", icon: <Sun className="w-4 h-4" /> },
      { id: "afternoon", label: "Afternoons", icon: <Sun className="w-4 h-4" /> },
      { id: "evening", label: "Evenings", icon: <Sunset className="w-4 h-4" /> },
      { id: "late_night", label: "Late nights", icon: <Moon className="w-4 h-4" /> },
      { id: "weekends", label: "Weekends only", icon: <Coffee className="w-4 h-4" /> },
      { id: "flexible", label: "I'm flexible", icon: <Sparkles className="w-4 h-4" /> },
    ],
  },
  {
    id: "travel",
    title: "How far will you travel?",
    subtitle: "Maximum travel time to venues",
    icon: <MapPin className="w-6 h-6" />,
    options: [
      { id: "10min", label: "10 minutes" },
      { id: "20min", label: "20 minutes" },
      { id: "30min", label: "30 minutes" },
      { id: "45min", label: "45 minutes" },
      { id: "60min", label: "1 hour" },
      { id: "any", label: "Any distance" },
    ],
  },
  {
    id: "food",
    title: "Food preferences?",
    subtitle: "Select your favorites",
    icon: <Utensils className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { id: "italian", label: "Italian" },
      { id: "japanese", label: "Japanese" },
      { id: "mexican", label: "Mexican" },
      { id: "indian", label: "Indian" },
      { id: "chinese", label: "Chinese" },
      { id: "mediterranean", label: "Mediterranean" },
    ],
  },
  {
    id: "budget",
    title: "Budget comfort level?",
    subtitle: "Typical spend per person",
    icon: <DollarSign className="w-6 h-6" />,
    options: [
      { id: "budget", label: "Budget-friendly" },
      { id: "mid", label: "Mid-range" },
      { id: "premium", label: "Premium" },
      { id: "flexible", label: "Flexible" },
    ],
  },
  {
    id: "vibe",
    title: "Your social vibe?",
    subtitle: "What atmosphere do you prefer?",
    icon: <Users className="w-6 h-6" />,
    multiSelect: true,
    options: [
      { id: "chill", label: "Chill & relaxed" },
      { id: "lively", label: "Lively & buzzy" },
      { id: "intimate", label: "Intimate & quiet" },
      { id: "adventurous", label: "Adventurous" },
      { id: "productive", label: "Work-friendly" },
      { id: "romantic", label: "Romantic" },
    ],
  },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  
  const handleSelect = (optionId: string) => {
    if (!step) return;
    const stepId = step.id;
    const current = selections[stepId] || [];
    
    if (step.multiSelect) {
      if (current.includes(optionId)) {
        setSelections({ ...selections, [stepId]: current.filter(id => id !== optionId) });
      } else {
        setSelections({ ...selections, [stepId]: [...current, optionId] });
      }
    } else {
      setSelections({ ...selections, [stepId]: [optionId] });
    }
  };
  
  const isSelected = (optionId: string) => {
    return step ? (selections[step.id] || []).includes(optionId) : false;
  };
  
  const canProceed = step ? (selections[step.id]?.length || 0) > 0 : false;
  
  const handleNext = () => {
    if (isLastStep) {
      // Save preferences and redirect to dashboard
      setLocation("/");
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSkip = () => {
    setLocation("/");
  };

  if (!step) return null;

  return (
    <div className="min-h-screen bg-[#070b14] overflow-hidden">
      <OrbitalBackground />
      
      <div className="relative min-h-screen flex flex-col px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className={`p-2 rounded-xl border border-[#d4a853]/10 text-muted-foreground hover:text-white hover:border-[#d4a853]/30 transition-all ${
              currentStep === 0 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSkip}
            className="text-muted-foreground text-sm hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#d4a853] to-[#e8c77d]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2 text-center">
            Step {currentStep + 1} of {onboardingSteps.length}
          </p>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4a853]/20 to-[#d4a853]/5 border border-[#d4a853]/20 flex items-center justify-center"
                >
                  <span className="text-[#d4a853]">{step.icon}</span>
                </motion.div>
              </div>
              
              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-semibold text-white text-center mb-2"
              >
                {step.title}
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-center mb-8"
              >
                {step.subtitle}
              </motion.p>
              
              {/* Options */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-2 gap-3"
              >
                {step.options.map((option, i) => (
                  <motion.button
                    key={option.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => handleSelect(option.id)}
                    className={`relative p-4 rounded-xl border transition-all duration-200 ${
                      isSelected(option.id)
                        ? "bg-[#d4a853]/10 border-[#d4a853]/50 text-white"
                        : "bg-[#111827]/60 border-[#d4a853]/10 text-muted-foreground hover:border-[#d4a853]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <span className={isSelected(option.id) ? "text-[#d4a853]" : ""}>
                          {option.icon}
                        </span>
                      )}
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                    
                    {/* Selected indicator */}
                    {isSelected(option.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#d4a853] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-[#070b14]" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <GoldenButton
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full"
            size="lg"
          >
            {isLastStep ? "Get Started" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </GoldenButton>
        </motion.div>
      </div>
    </div>
  );
}
