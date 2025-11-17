import { Brain, Smile, TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Navbar Component
function Navbar() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="fixed top-0 z-10 w-full bg-white shadow-sm">
      <div className="px-6 mx-auto lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/logo.png"
              alt="EMEXA Logo"
              style={{ width: "180px", height: "auto" }}
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-12">
            <div className="flex items-center gap-10">
              <button
                onClick={() => scrollToSection("features")}
                className="text-base font-normal text-gray-700 transition-colors bg-transparent border-none cursor-pointer hover:text-gray-900"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-base font-normal text-gray-700 transition-colors bg-transparent border-none cursor-pointer hover:text-gray-900"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-base font-normal text-gray-700 transition-colors bg-transparent border-none cursor-pointer hover:text-gray-900"
              >
                Testimonials
              </button>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg text-base font-medium transition-colors shadow-sm">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="text-gray-300 bg-slate-900">
      <div className="px-6 py-12 mx-auto max-w-7xl">
        {/* Top Section */}
        <div className="mb-12">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/src/assets/footerlogo.png"
              alt="EMEXA Logo"
              style={{
                width: "107px",
                height: "100px",
                marginTop: "0.5px",
                marginLeft: "1px",
              }}
              className="object-contain"
            />
          </div>

          <p className="max-w-md mb-6 text-gray-400">
            Making learning more human with emotion-aware technology.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Twitter"
              className="flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Email"
              className="flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12 md:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Guides
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800">
          <p className="text-sm text-gray-400">
            © 2025 EMEXA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.replace("#", "") || "/login"
  );

  useEffect(() => {
    const onHash = () =>
      setRoute(window.location.hash.replace("#", "") || "/login");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const renderRoute = () => {
    if (route === "/register") return <Register />;
    if (route === "/forgot") return <ForgotPassword />;
    if (route === "/") return <LandingPage />;
    // default to login
    return <Login />;
  };

  return <div className="app-root">{renderRoute()}</div>;
}

// Landing Page Component
function LandingPage() {
  const features = [
    {
      icon: Smile,
      title: "Emotion Detection",
      description:
        "Recognize your learner's mood in real-time so you can support their mental and emotional well-being.",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description:
        "Everything is insights into how well your learners are performing and their emotional state overall throughout.",
    },
    {
      icon: Brain,
      title: "Personalized Learning",
      description:
        "Tailor the user's recommendations and learning activities based on their emotional state.",
    },
    {
      icon: Zap,
      title: "Engagement Analytics",
      description:
        "Track user activity and what they're doing during a learning activity and course completion.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your learners' data and information is safe with us. We're transparent on what we do.",
    },
    {
      icon: BarChart3,
      title: "Performance Boost",
      description:
        "Analyze your learner's overall engagement and performance and how it will help them.",
    },
  ];

  const howItWorks = [
    {
      number: "01",
      title: "Emotion Detection",
      description:
        "Once you enable this, our AI will capture, identify and predict emotions out of a camera to see whether the learner is engaged or not. We detect things such as whether they're confused or frustrated and if they are we will notify you.",
    },
    {
      number: "02",
      title: "Smart Analysis",
      description:
        "A dashboard that will help you see the emotions of every single learner. It can display their engagement and how you should go back to improve and simplify your study. Whether it's the problem on students on a video, you can look at it and decide what is best based on them.",
    },
    {
      number: "03",
      title: "Analytics Overview",
      description:
        "You will see a complete analysis of your learners during your quiz. Track the content emotions, insights and patterns of what's your quizzes mean have been undertaken to give actionable feedback and focus on the things where learner had an issue to improve.",
    },
    {
      number: "04",
      title: "AI Support",
      description:
        "Our learner's will get insights on how they are performing like the recommendation to improve, or we can help.",
    },
  ];

  const testimonials = [
    {
      initial: "S",
      name: "Sarah Johnson",
      role: "High School Teacher",
      text: "I've been amazed at what EMEXA does - not for the fact that it uses AI, but that it can understand how my students are feeling. This really helps me understand who's confused and who's already, which is particularly important in online learning.",
    },
    {
      initial: "D",
      name: "David Patterson",
      role: "University Lecturer",
      text: "As a uni teacher, I'm very busy MULTIPLE times I haven't got individual real time feedback. This system I recommend because it automates that learning to track and adjust in real-time.",
    },
    {
      initial: "E",
      name: "Emily Rodriguez",
      role: "Corporate L&D Manager",
      text: "This platform isn't what I THOUGHT it was. I expected it was just another quiz software, but it was game-changing. I could see my trainees emotions in real-time, now when anyone gets confused. People told me they love it to.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-white">
        {/* Hero Section */}
        <div className="flex items-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-6xl px-6 py-20 mx-auto lg:px-8">
            <div className="max-w-2xl">
              <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 lg:text-6xl">
                Quizzes that
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  understand emotions
                </span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                EMEXA is the first quiz platform that adapts to your emotional
                state in real-time, creating a more effective and personalized
                learning
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-3 font-medium text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700">
                  Try it free
                </button>
                <button className="px-8 py-3 font-medium text-green-700 transition-colors bg-transparent border border-gray-300 rounded-lg hover:bg-white/50">
                  Learn more →
                </button>
              </div>
            </div>

            {/* Updated Collaboration Image Section */}
            <div className="mt-10 w-full max-w-[1140px] bg-violet-50 py-10 px-7 shadow-lg rounded-2xl">
              <div className="flex justify-center mt-10">
                <div className="flex items-center justify-center overflow-hidden rounded-3xl">
                  <img
                    src="/src/assets/2.png"
                    alt="Team collaboration"
                    className="w-full max-w-[600px] h-auto object-cover rounded-2xl shadow-md"
                  />
                </div>
              </div>

              {/* Value Props */}
              <div className="grid gap-6 mt-16 md:grid-cols-1">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold text-teal-600 bg-teal-100 rounded-lg">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Make quizzes go further
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold text-teal-600 bg-teal-100 rounded-lg">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Test moods - Get instant emotional insights
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-semibold text-teal-600 bg-teal-100 rounded-lg">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Student's ability to understand your teaching
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-6xl px-6 mx-auto lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                Features that understand you
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Our advanced tools analyze your students' emotional state as
                they take quizzes. So they can feel understood and you can
                support better
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-8 transition-all bg-white border border-gray-100 rounded-2xl hover:border-teal-200 hover:shadow-lg"
                >
                  <div className="flex items-center justify-center w-12 h-12 mb-4 bg-teal-600 rounded-xl">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-6xl px-6 mx-auto lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                How Emexa Works
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Our AI can detect emotions in images and videos. Recorded
                cameras in quizzes to gather emotions
              </p>
            </div>

            <div className="mb-16 overflow-hidden shadow-2xl rounded-2xl">
              <img
                src="/src/assets/1.jpg"
                alt="Students collaborating on laptops"
                className="object-cover w-full"
              />
            </div>

            <div className="space-y-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-teal-600 rounded-xl">
                    <span className="text-lg font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="max-w-6xl px-6 mx-auto lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">
                What our users are saying
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Hear how teachers are changing the way they understand students.
              </p>
            </div>

            <div className="space-y-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="p-8 bg-white border border-gray-100 rounded-2xl"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500">
                      <span className="text-lg font-semibold text-white">
                        {testimonial.initial}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="leading-relaxed text-gray-700">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="max-w-4xl px-6 mx-auto text-center lg:px-8">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Ready to transform your learning?
            </h2>
            <p className="mb-8 text-xl text-teal-50">
              Start using Emexa today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-3 font-semibold text-teal-600 transition-colors bg-white rounded-lg shadow-lg hover:bg-gray-100">
                Get Started
              </button>
              <button className="px-8 py-3 font-semibold text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white/10">
                Learn more →
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
