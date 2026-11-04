import { Hero } from "@/components/sections/Hero";
import { DeveloperIdentity } from "@/components/sections/DeveloperIdentity";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Achievements } from "@/components/sections/Achievements";
import { Services } from "@/components/sections/Services";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <DeveloperIdentity />
      <About />
      <Skills />
      <Education />
      <Experience />
      <Projects />
      <Achievements />
      <Services />
      <Contact />
    </>
  );
}
