import Hero from "../components/Hero";
import Rezome from "../components/Rezome";
import Sliders from "../components/Sliders";
import ProfileCompletionGuard from "../components/ProfileCompletionGuard";

export default function Home() {
  return (
    <>
      <ProfileCompletionGuard />
      <Hero />
      <Sliders />
      <Rezome />
      <Sliders />
    </>
  );
}