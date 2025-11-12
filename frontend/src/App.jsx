import React from 'react';

export default function Landing() {
  return (
    <div className="w-screen">
      {/* Container that holds all sections - sections themselves are full-page snap items */}
      <section id="home" className="h-[calc(100vh-4rem)] snap-start flex items-center bg-gradient-to-r from-white to-blue-50">
        <div className="w-full px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Quizzes that <span className="block text-green-700">understand emotions</span>
              </h1>
              <p className="mt-6 text-gray-600">
                EMEXA is the first quiz platform that adapts to your emotional state in real-time,
                creating a more effective and personalized learning experience.
              </p>
              <div className="mt-8 flex gap-4">
                <button className="bg-green-700 text-white px-6 py-3 rounded-md shadow">Try it free</button>
                <button className="bg-purple-100 text-purple-800 px-6 py-3 rounded-md">Learn more →</button>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl p-10 shadow-lg">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-green-700">
                    <path d="M12 2c1.656 0 3 1.344 3 3 0 1.655-1.344 3-3 3s-3-1.345-3-3c0-1.656 1.344-3 3-3z" stroke="#10B981" strokeWidth="1.5" />
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

      {/* ... keep the rest of your sections here ... */}
    </div>
  );
}
