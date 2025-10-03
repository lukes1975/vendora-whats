import About from "../sections/About"
import Contact from "../sections/Contact"
import Footer from "../sections/Footer"
import Header from "../sections/Header"
import Hero from "../sections/Hero"
import HowItWorks from "../sections/HowItWorks"
import CategoriesGrid from "../sections/CategoriesGrid"
import PopularProducts from "../sections/PopularProducts"
import SocialProof from "../sections/SocialProof"

function HeroPage() {
  return (
    <main className="overflow-hidden">
      <Header />
      <Hero />
      <CategoriesGrid />
      <PopularProducts />
      <HowItWorks />
      <SocialProof />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}

export default HeroPage