import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { commonFeatures, modeSpecificData } from "./features";
import { TrainingMode } from "@/types/types";

interface HeroSectionProps {
  mode: TrainingMode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ mode }) => {
  const data = modeSpecificData[mode];

  return (
    <section className="py-8 pb-0 px-4">
      <div className="container mx-auto text-center max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {data.heroTitle}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          {data.heroDescription}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {commonFeatures.map((feature, index) => (
            <Card
              key={index}
              className="text-center border-border/50 hover:border-primary/50 transition-colors"
            >
              <CardContent className="pt-4 pb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 text-primary">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
