import React from 'react';
import { Brain, Smile, TrendingUp, Zap, Shield, BarChart3 } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Home() {
  const features = [
    {
      icon: Smile,
      title: "Emotion Detection",
      description: "Recognize your learner's mood in real-time so you can support their mental and emotional well-being."
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Everything is insights into how well your learners are performing and their emotional state overall throughout."
    },
    {
      icon: Brain,
      title: "Personalized Learning",
      description: "Tailor the user's recommendations and learning activities based on their emotional state."
    },
    {
      icon: Zap,
      title: "Engagement Analytics",
      description: "Track user activity and what they're doing during a learning activity and course completion."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your learners' data and information is safe with us. We're transparent on what we do."
    },
    {
      icon: BarChart3,
      title: "Performance Boost",
      description: "Analyze your learner's overall engagement and performance and how it will help them."
    }
  ];

  const howItWorks = [
    {
      number: "01",
      title: "Emotion Detection",
      description: "Once you enable this, our AI will capture, identify and predict emotions out of a camera to see whether the learner is engaged or not. We detect things such as whether they're confused or frustrated and if they are we will notify you."
    },
    {
      number: "02",
      title: "Smart Analysis",
      description: "A dashboard that will help you see the emotions of every single learner. It can display their engagement and how you should go back to improve and simplify your study. Whether it's the problem on students on a video, you can look at it and decide what is best based on them."
    },
    {
      number: "03",
      title: "Analytics Overview",
      description: "You will see a complete analysis of your learners during your quiz. Track the content emotions, insights and patterns of what's your quizzes mean have been undertaken to give actionable feedback and focus on the things where learner had an issue to improve."
    },
    {
      number: "04",
      title: "AI Support",
      description: "Our learner's will get insights on how they are performing like the recommendation to improve, or we can help."
    }
  ];

  const testimonials = [
    {
      initial: "S",
      name: "Sarah Johnson",
      role: "High School Teacher",
      text: "I've been amazed at what EMEXA does - not for the fact that it uses AI, but that it can understand how my students are feeling. This really helps me understand who's confused and who's already, which is particularly important in online learning."
    },
    {
      initial: "D",
      name: "David Patterson",
      role: "University Lecturer",
      text: "As a uni teacher, I'm very busy MULTIPLE times I haven't got individual real time feedback. This system I recommend because it automates that learning to track and adjust in real-time."
    },
    {
      initial: "E",
      name: "Emily Rodriguez",
      role: "Corporate L&D Manager",
      text: "This platform isn't what I THOUGHT it was. I expected it was just another quiz software, but it was game-changing. I could see my trainees emotions in real-time, now when anyone gets confused. People told me they love it to."
    }
  ];

  return (
    <>
    <Navbar/>
      <main className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen flex items-center">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Quizzes that<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  understand emotions
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                EMEXA is the first ever GAMIFIED AI-POWERED QUIZ made to measure EMOTIONAL STATE AND REAL-TIME to improve engagement and perform better learning experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  Get Started
                </button>
                <button className="bg-transparent hover:bg-white/50 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors border border-gray-300">
                  Learn more →
                </button>
              </div>
            </div>

            <div className="mt-10 w-[1140px] bg-violet-50 py-10 px-7 shadow-lg">
              <div className="mt-16 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-3xl flex items-center justify-center">
                    <img 
                    src="Frame.png" 
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                    />
                    {/* <Brain className="w-32 h-32 text-teal-600" /> */}
                  </div>
                </div>
              </div>

              {/* Value Props */}
              <div className="mt-20 grid md:grid-cols-1 gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Make quizzes go further</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Test moods - Get instant emotional insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-semibold">
                    3
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Student's ability to understand your teaching</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Illustration */}
            
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Features that understand you
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our advanced tools analyze your students' emotional state as they take quizzes. So they can feel understood and you can support better
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How EmotionIQ Works
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our AI can detect emotions in images and videos. Recorded cameras in quizzes to gather emotions
              </p>
            </div>

            {/* Image */}
            <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl aspect-[803/535.5]">
              <img 
                // The source is changed to the uploaded image file name
                src="office.jpg" 
                alt="Students collaborating on laptops"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Steps */}
            <div className="space-y-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What our users are saying
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Hear how teachers are changing the way they understand students.
              </p>
            </div>

            <div className="space-y-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">{testimonial.initial}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to transform your learning?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Start using EmotionIQ today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-white hover:bg-gray-100 text-teal-600 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                Get Started
              </button>
              <button className="bg-transparent hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors border-2 border-white">
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