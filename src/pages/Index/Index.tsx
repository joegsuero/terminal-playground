import React, { useState } from "react";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { MainInterface } from "./MainInterface";
import { FooterSection } from "./FooterSection";
import { TrainingMode } from "@/types/types";

const Index = () => {
  const [suggestedCommand, setSuggestedCommand] = useState<
    string | undefined
  >();
  const [mode, setMode] = useState<TrainingMode>("linux");

  const handleCommandSuggest = (command: string) => {
    setSuggestedCommand(command);
    setTimeout(() => setSuggestedCommand(undefined), 100);
  };

  const handleModeChange = (newMode: TrainingMode) => {
    setMode(newMode);
    setSuggestedCommand(undefined);
  };

  return (
    <div
      className={`min-h-screen bg-background ${
        mode === "docker" ? "docker-theme" : ""
      }`}
    >
      <Header mode={mode} onModeChange={handleModeChange} />
      <HeroSection mode={mode} />
      <MainInterface mode={mode} onCommandSuggest={handleCommandSuggest} />
      <FooterSection mode={mode} />
    </div>
  );
};

export default Index;
