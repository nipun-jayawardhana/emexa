import React from 'react'

export default function Landing() {
  return (
    <div className="w-screen">
      {/* Container that holds all sections - sections themselves are full-page snap items */}
      <section id="home" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gradient-to-r from-white to-blue-50">
        <div className="w-full px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">Quizzes that
                <span className="block text-green-700">understand emotions</span>
              </h1>
              <p className="mt-6 text-gray-600">EMEXA is the first quiz platform that adapts to your emotional state in real-time, creating a more effective and personalized learning experience.</p>
              <div className="mt-8 flex gap-4">
                <button className="bg-green-700 text-white px-6 py-3 rounded-md shadow">Try it free</button>
                <button className="bg-purple-100 text-purple-800 px-6 py-3 rounded-md">Learn more →</button>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-10 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-green-700">
                    <path d="M12 2c1.656 0 3 1.344 3 3 0 1.655-1.344 3-3 3s-3-1.345-3-3c0-1.656 1.344-3 3-3z" stroke="#10B981" strokeWidth="1.5"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800">Enhance learning with emotion-aware technology</h3>
                  <ol className="mt-4 space-y-3 text-gray-600 text-left">
                    <li className="flex items-start gap-3"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">1</span>Take quizzes as normal</li>
                    <li className="flex items-start gap-3"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">2</span>Our system detects your emotional state</li>
                    <li className="flex items-start gap-3"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">3</span>Questions adapt to optimize your learning</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gray-50">
        <div className="w-full px-4 py-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center">Features that understand you</h2>
          <p className="mt-3 text-gray-500 text-center">Our emotion-aware quiz system brings a new dimension to learning by adapting to how you feel.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Emotion Detection</h4>
              <p className="mt-2 text-gray-600 text-sm">Advanced algorithms detect frustration, confusion, engagement, and more.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Adaptive Difficulty</h4>
              <p className="mt-2 text-gray-600 text-sm">Questions adapt in real-time to your state to help you learn.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Personalized Learning</h4>
              <p className="mt-2 text-gray-600 text-sm">Custom recommendations based on emotional responses.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Progress Analytics</h4>
              <p className="mt-2 text-gray-600 text-sm">Track emotional patterns to identify strengths and areas for improvement.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-white">
        <div className="w-full px-4 py-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800">How EmotionIQ Works</h2>
          <p className="mt-3 text-gray-500 text-center">Our technology seamlessly integrates emotion recognition with adaptive learning.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=123" alt="team" className="w-full rounded-lg shadow" />
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-green-700 text-white">📷</div>
                <div>
                  <h4 className="font-semibold">Emotion Detection</h4>
                  <p className="text-gray-600 text-sm">With your permission, our system uses your device camera and interaction patterns.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-green-700 text-white">🧠</div>
                <div>
                  <h4 className="font-semibold">Smart Analysis</h4>
                  <p className="text-gray-600 text-sm">AI processes emotional signals in real-time and adapts questions accordingly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-green-700 text-white">⚡</div>
                <div>
                  <h4 className="font-semibold">Adaptive Response</h4>
                  <p className="text-gray-600 text-sm">Hints, difficulty adjustments, and encouragement are tailored to your state.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gray-50">
        <div className="w-full px-4 py-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800">What our users are saying</h2>
          <p className="mt-3 text-gray-500 text-center">Discover how EmotionIQ is changing the way people learn.</p>

          <div className="mt-8 space-y-6">
            <blockquote className="bg-white p-6 rounded-lg shadow"> <p className="text-gray-700">EMEXA completely transformed how I study. My test scores have improved by 23%!</p>
              <footer className="mt-4 text-sm text-gray-500">— Sarah Johnson, University Student</footer>
            </blockquote>

            <blockquote className="bg-white p-6 rounded-lg shadow"> <p className="text-gray-700">As an educator, I've seen firsthand how EMEXA helps students who would otherwise fall behind.</p>
              <footer className="mt-4 text-sm text-gray-500">— Professor David Chen</footer>
            </blockquote>

            <blockquote className="bg-white p-6 rounded-lg shadow"> <p className="text-gray-700">Our school implemented EMEXA last semester, and we've seen a 40% reduction in quiz anxiety.</p>
              <footer className="mt-4 text-sm text-gray-500">— Michelle Rodriguez, Principal</footer>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  )
}
import React from 'react'

export default function Landing() {
  return (
    <div className="w-screen">
      {/* Container that holds all sections - sections themselves are full-page snap items */}
      <section id="home" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gradient-to-r from-white to-blue-50">
        <div className="w-full px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">Quizzes that
                <span className="block text-green-700">understand emotions</span>
              </h1>
              <p className="mt-6 text-gray-600">EMEXA is the first quiz platform that adapts to your emotional state in real-time, creating a more effective and personalized learning experience.</p>
              <div className="mt-8 flex gap-4">
                <button className="bg-green-700 text-white px-6 py-3 rounded-md shadow">Try it free</button>
                <button className="bg-purple-100 text-purple-800 px-6 py-3 rounded-md">Learn more →</button>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-10 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-green-700">
                    <path d="M12 2c1.656 0 3 1.344 3 3 0 1.655-1.344 3-3 3s-3-1.345-3-3c0-1.656 1.344-3 3-3z" stroke="#10B981" strokeWidth="1.5"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800">Enhance learning with emotion-aware technology</h3>
                  <ol className="mt-4 space-y-3 text-gray-600 text-left">
                    <li className="flex items-start gap-3"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">1</span>Take quizzes as normal</li>
                    <li className="flex items-start gap-3"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">2</span>Our system detects your emotional state</li>
                    <li className="flex items-start gap-3"><span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">3</span>Questions adapt to optimize your learning</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gray-50">
        <div className="w-full px-4 py-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center">Features that understand you</h2>
          <p className="mt-3 text-gray-500 text-center">Our emotion-aware quiz system brings a new dimension to learning by adapting to how you feel.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Emotion Detection</h4>
              <p className="mt-2 text-gray-600 text-sm">Advanced algorithms detect frustration, confusion, engagement, and more.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Adaptive Difficulty</h4>
              <p className="mt-2 text-gray-600 text-sm">Questions adapt in real-time to your state to help you learn.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Personalized Learning</h4>
              <p className="mt-2 text-gray-600 text-sm">Custom recommendations based on emotional responses.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow"> <h4 className="font-semibold">Progress Analytics</h4>
              <p className="mt-2 text-gray-600 text-sm">Track emotional patterns to identify strengths and areas for improvement.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-white">
        <div className="w-full px-4 py-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800">How EmotionIQ Works</h2>
          <p className="mt-3 text-gray-500 text-center">Our technology seamlessly integrates emotion recognition with adaptive learning.</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=123" alt="team" className="w-full rounded-lg shadow" />
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-green-700 text-white">📷</div>
                <div>
                  <h4 className="font-semibold">Emotion Detection</h4>
                  <p className="text-gray-600 text-sm">With your permission, our system uses your device camera and interaction patterns.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-green-700 text-white">🧠</div>
                <div>
                  <h4 className="font-semibold">Smart Analysis</h4>
                  <p className="text-gray-600 text-sm">AI processes emotional signals in real-time and adapts questions accordingly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-green-700 text-white">⚡</div>
                <div>
                  <h4 className="font-semibold">Adaptive Response</h4>
                  <p className="text-gray-600 text-sm">Hints, difficulty adjustments, and encouragement are tailored to your state.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gray-50">
        <div className="w-full px-4 py-16">
          <h2 className="text-3xl font-semibold text-center text-gray-800">What our users are saying</h2>
          <p className="mt-3 text-gray-500 text-center">Discover how EmotionIQ is changing the way people learn.</p>

          <div className="mt-8 space-y-6">
            <blockquote className="bg-white p-6 rounded-lg shadow"> <p className="text-gray-700">EMEXA completely transformed how I study. My test scores have improved by 23%!</p>
              <footer className="mt-4 text-sm text-gray-500">— Sarah Johnson, University Student</footer>
            </blockquote>

            <blockquote className="bg-white p-6 rounded-lg shadow"> <p className="text-gray-700">As an educator, I've seen firsthand how EMEXA helps students who would otherwise fall behind.</p>
              <footer className="mt-4 text-sm text-gray-500">— Professor David Chen</footer>
            </blockquote>

            <blockquote className="bg-white p-6 rounded-lg shadow"> <p className="text-gray-700">Our school implemented EMEXA last semester, and we've seen a 40% reduction in quiz anxiety.</p>
              <footer className="mt-4 text-sm text-gray-500">— Michelle Rodriguez, Principal</footer>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  )
}
