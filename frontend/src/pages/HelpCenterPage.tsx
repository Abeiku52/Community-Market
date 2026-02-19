import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HelpCenterPage() {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀', color: 'from-sky-500 to-blue-600' },
    { id: 'create-listing', title: 'Creating a Listing', icon: '📝', color: 'from-emerald-500 to-teal-600' },
    { id: 'browse-buy', title: 'Browsing & Buying', icon: '🛍️', color: 'from-violet-500 to-purple-600' },
    { id: 'messages', title: 'Messaging', icon: '💬', color: 'from-pink-500 to-rose-600' },
    { id: 'profile', title: 'Managing Your Profile', icon: '👤', color: 'from-orange-500 to-amber-600' },
    { id: 'safety', title: 'Safety Tips', icon: '🔒', color: 'from-red-500 to-rose-600' },
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-16 mb-12 shadow-2xl">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(14, 165, 233, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
        }}></div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-scale-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium text-white/90">24/7 Support Available</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 animate-slide-up" style={{ letterSpacing: '-0.02em' }}>
            How Can We Help You?
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Find answers, learn tips, and get the most out of LincolnMarket
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-white/20 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20 transition-all text-slate-900 placeholder-slate-500"
                style={{ fontSize: '1rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to="/create-listing" className="group card card-body hover-lift text-center transition-all duration-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Create a Listing</h3>
          <p className="text-sm text-slate-600">Start selling your items in minutes</p>
        </Link>

        <Link to="/" className="group card card-body hover-lift text-center transition-all duration-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Browse Items</h3>
          <p className="text-sm text-slate-600">Discover great deals from colleagues</p>
        </Link>

        <a href="mailto:support@lincoln.edu.gh" className="group card card-body hover-lift text-center transition-all duration-300">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Support</h3>
          <p className="text-sm text-slate-600">Get help from our team</p>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Enhanced Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden sticky top-6 shadow-lg">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Topics
              </h3>
            </div>
            <nav className="p-3 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg transform scale-105`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="text-lg mr-3">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="lg:col-span-3">
          {/* Section Header with Gradient */}
          <div className={`card overflow-hidden mb-6 shadow-lg`}>
            <div className={`bg-gradient-to-r ${currentSection?.color} px-8 py-6`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg">
                  {currentSection?.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{currentSection?.title}</h2>
                  <p className="text-white/90">Step-by-step guide to help you succeed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-body shadow-lg space-y-8">
            {/* Getting Started */}
            {activeSection === 'getting-started' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>🚀</span> Getting Started
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Welcome to CommunityMarket! Follow these simple steps to start buying and selling within your community.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6 transition-all duration-300 hover:shadow-xl hover:border-sky-400">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        1
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Create Your Account</h3>
                    </div>
                    <div className="space-y-3 text-slate-700">
                      <p className="flex items-start gap-2">
                        <span className="text-sky-600 font-bold mt-1">→</span>
                        <span>Click the "Sign Up" button in the top right corner</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-sky-600 font-bold mt-1">→</span>
                        <span>Enter your details:</span>
                      </p>
                      <ul className="list-none pl-8 space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          <span>Full Name</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          <span>Email (must be @lincoln.edu.gh)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          <span>Password (minimum 6 characters)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          <span>Organization / Community (e.g., Tech Company, Neighborhood)</span>
                        </li>
                      </ul>
                      <p className="flex items-start gap-2">
                        <span className="text-sky-600 font-bold mt-1">→</span>
                        <span>Click "Create Account" - you'll be automatically logged in!</span>
                      </p>
                      <div className="mt-4 p-4 bg-white rounded-xl border border-sky-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sky-900 mb-1">Important Note</p>
                            <p className="text-sm text-sky-800">
                              Only @lincoln.edu.gh email addresses are accepted to ensure community safety.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 transition-all duration-300 hover:shadow-xl hover:border-emerald-400">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        2
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Complete Your Profile</h3>
                    </div>
                    <div className="space-y-3 text-slate-700">
                      <p className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-1">→</span>
                        <span>Click on your name in the top right corner</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-1">→</span>
                        <span>Select "Profile" from the dropdown</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-1">→</span>
                        <span>Click "Edit Profile" to add:</span>
                      </p>
                      <ul className="list-none pl-8 space-y-2">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Your school section/department</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Departure date (if you're leaving soon)</span>
                        </li>
                      </ul>
                      <p className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-1">→</span>
                        <span>Click "Save Changes"</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 transition-all duration-300 hover:shadow-xl hover:border-violet-400">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        3
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Start Exploring</h3>
                    </div>
                    <div className="space-y-3 text-slate-700">
                      <p className="font-medium mb-3">You're all set! Now you can:</p>
                      <ul className="list-none space-y-3">
                        <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <span className="text-2xl">🏠</span>
                          <span>Browse listings on the home page</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <span className="text-2xl">📝</span>
                          <span>Create your first listing</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <span className="text-2xl">💬</span>
                          <span>Message sellers about items</span>
                        </li>
                        <li className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <span className="text-2xl">❤️</span>
                          <span>Express interest in items you like</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Creating a Listing */}
            {activeSection === 'create-listing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>📝</span> Creating a Listing
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Sell your items quickly and easily with our simple listing process.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="border-l-4 border-sky-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 1: Navigate to Create Listing</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>Click "Sell Item" in the navigation bar or the "New Listing" button on your listings page.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 2: Upload Photos</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Click "Add Photo" to upload images (up to 8 photos)</p>
                    <p>2. The first photo will be your cover image</p>
                    <p>3. Take clear, well-lit photos showing:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Overall view of the item</li>
                      <li>Close-ups of important details</li>
                      <li>Any defects or wear</li>
                      <li>Size reference if helpful</li>
                    </ul>
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Tip:</strong> Good photos help your item sell faster! Use natural lighting and clean backgrounds.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-violet-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 3: Fill in Details</h3>
                  <div className="space-y-3 text-slate-600">
                    <p><strong>Title:</strong> Write a clear, descriptive title (e.g., "Comfortable 3-Seater Sofa - Blue")</p>
                    <p><strong>Description:</strong> Include:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Condition and age</li>
                      <li>Dimensions or size</li>
                      <li>Brand or model (if applicable)</li>
                      <li>Reason for selling</li>
                      <li>Any defects or issues</li>
                    </ul>
                    <p><strong>Price:</strong> Set a fair price based on condition and market value</p>
                    <p><strong>Category:</strong> Choose the most appropriate category</p>
                    <p><strong>Condition:</strong> Be honest about the item's condition</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-orange-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 4: Review and Publish</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Check the preview on the right side</p>
                    <p>2. Make sure all information is accurate</p>
                    <p>3. Click "Create Listing"</p>
                    <p>4. Your listing is now live and visible to all community members!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Browsing & Buying */}
            {activeSection === 'browse-buy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>🛍️</span> Browsing & Buying
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Find great deals from your colleagues and make purchases safely.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="border-l-4 border-sky-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 1: Browse Listings</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>On the home page, you can:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Search:</strong> Type keywords to find specific items</li>
                      <li><strong>Filter by Category:</strong> Select furniture, electronics, books, etc.</li>
                      <li><strong>Filter by Price:</strong> Set minimum and maximum price range</li>
                      <li><strong>Leaving Soon:</strong> Toggle to see urgent listings from members leaving soon</li>
                    </ul>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 2: View Item Details</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>Click on any listing card to see:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Full photo gallery (swipe through all images)</li>
                      <li>Complete description</li>
                      <li>Seller information</li>
                      <li>Item condition and category</li>
                      <li>Number of interested buyers</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-4 border-violet-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 3: Express Interest</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Click "I'm Interested" button</p>
                    <p>2. Optionally add a message to the seller</p>
                    <p>3. Click "Send" - the seller will be notified!</p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Privacy:</strong> Other buyers will see you as "Anonymous" - only the seller sees your name.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border-l-4 border-orange-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 4: Contact the Seller</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Click "Contact Seller" to send a direct message</p>
                    <p>2. Ask questions about:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Item condition or details</li>
                      <li>Pickup location and time</li>
                      <li>Payment method</li>
                      <li>Negotiating price (if applicable)</li>
                    </ul>
                    <p>3. Check your Messages page for replies</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="border-l-4 border-red-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 5: Complete the Purchase</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Click "Buy Now" when you're ready</p>
                    <p>2. Arrange pickup details with the seller via messages</p>
                    <p>3. Meet in a safe, public location on campus</p>
                    <p>4. Inspect the item before paying</p>
                    <p>5. Complete the transaction</p>
                  </div>
                </div>
              </div>
            )}

            {/* Messaging */}
            {activeSection === 'messages' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>💬</span> Messaging
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Communicate safely with buyers and sellers through our messaging system.
                  </p>
                </div>

                {/* Accessing Messages */}
                <div className="border-l-4 border-sky-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Accessing Your Messages</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Click "Messages" in the navigation bar</p>
                    <p>2. You'll see all your conversations</p>
                    <p>3. Unread messages are highlighted</p>
                    <p>4. A red badge shows your unread count</p>
                  </div>
                </div>

                {/* Sending Messages */}
                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Sending Messages</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Go to any listing page</p>
                    <p>2. Click "Contact Seller"</p>
                    <p>3. Type your message</p>
                    <p>4. Click "Send Message"</p>
                    <p>5. The conversation appears in your Messages page</p>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="border-l-4 border-violet-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Messaging Best Practices</h3>
                  <div className="space-y-3 text-slate-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Be Clear:</strong> State your interest and ask specific questions</li>
                      <li><strong>Be Prompt:</strong> Respond to messages within 24 hours</li>
                      <li><strong>Be Respectful:</strong> Use polite, professional language</li>
                      <li><strong>Be Specific:</strong> Confirm pickup times, locations, and payment methods</li>
                      <li><strong>Keep it on Platform:</strong> Use LincolnMarket messages for safety</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Managing Profile */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>👤</span> Managing Your Profile
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Keep your profile updated and manage your listings effectively.
                  </p>
                </div>

                {/* Editing Profile */}
                <div className="border-l-4 border-sky-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Editing Your Profile</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Click your name in the top right</p>
                    <p>2. Select "Profile"</p>
                    <p>3. Click "Edit Profile"</p>
                    <p>4. Update your information:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Name</li>
                      <li>Organization / Community</li>
                      <li>Departure Date (if leaving soon)</li>
                    </ul>
                    <p>5. Click "Save Changes"</p>
                  </div>
                </div>

                {/* Managing Listings */}
                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Managing Your Listings</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Go to "My Listings" page</p>
                    <p>2. View your stats:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Active Listings count</li>
                      <li>Total Value of active items</li>
                      <li>Sold Items count</li>
                    </ul>
                    <p>3. Switch between Grid and Table view</p>
                    <p>4. For each listing you can:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>View:</strong> See the full listing page</li>
                      <li><strong>Delete:</strong> Remove active listings (sold items cannot be deleted)</li>
                    </ul>
                  </div>
                </div>

                {/* Viewing Interested Buyers */}
                <div className="border-l-4 border-violet-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Viewing Interested Buyers</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>1. Go to your listing's detail page</p>
                    <p>2. Scroll to "Interested Buyers" section</p>
                    <p>3. You'll see:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Buyer names (you see real names, others see "Anonymous")</li>
                      <li>Their messages</li>
                      <li>When they expressed interest</li>
                    </ul>
                    <p>4. Contact interested buyers directly via messages</p>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            {activeSection === 'safety' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span>🔒</span> Safety Tips
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Stay safe while buying and selling on LincolnMarket.
                  </p>
                </div>

                {/* Meeting Safely */}
                <div className="border-l-4 border-sky-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Meeting Safely</h3>
                  <div className="space-y-3 text-slate-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Meet on Campus:</strong> Use school facilities during school hours</li>
                      <li><strong>Public Locations:</strong> Meet in well-lit, populated areas</li>
                      <li><strong>Bring a Friend:</strong> Consider bringing a colleague</li>
                      <li><strong>Daytime Meetings:</strong> Schedule during daylight hours when possible</li>
                      <li><strong>Tell Someone:</strong> Let a friend know where you're going</li>
                    </ul>
                  </div>
                </div>

                {/* Payment Safety */}
                <div className="border-l-4 border-emerald-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Payment Safety</h3>
                  <div className="space-y-3 text-slate-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Cash Preferred:</strong> Cash transactions are simplest and safest</li>
                      <li><strong>Mobile Money:</strong> Use trusted mobile payment services</li>
                      <li><strong>Inspect First:</strong> Always inspect items before paying</li>
                      <li><strong>Get Receipt:</strong> For expensive items, get a written receipt</li>
                      <li><strong>No Advance Payment:</strong> Never pay before seeing the item</li>
                    </ul>
                  </div>
                </div>

                {/* Avoiding Scams */}
                <div className="border-l-4 border-orange-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Avoiding Scams</h3>
                  <div className="space-y-3 text-slate-600">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Too Good to Be True:</strong> Be wary of prices far below market value</li>
                      <li><strong>Verify Identity:</strong> Confirm the person is a community member</li>
                      <li><strong>Check Email:</strong> Ensure they have a verified email</li>
                      <li><strong>No Shipping:</strong> Only do local, in-person transactions</li>
                      <li><strong>Trust Your Instincts:</strong> If something feels wrong, walk away</li>
                    </ul>
                  </div>
                </div>

                {/* Reporting Issues */}
                <div className="border-l-4 border-red-500 pl-6 py-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Reporting Issues</h3>
                  <div className="space-y-3 text-slate-600">
                    <p>If you encounter any problems:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Suspicious Activity:</strong> Report to school administration</li>
                      <li><strong>Inappropriate Content:</strong> Contact platform administrators</li>
                      <li><strong>Disputes:</strong> Try to resolve directly first, then escalate if needed</li>
                      <li><strong>Technical Issues:</strong> Contact IT support</li>
                    </ul>
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>Emergency:</strong> For urgent safety concerns, contact school security immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Quick Tips Box */}
            <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-3xl">💡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Quick Tips for Success</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: '📸', text: 'Take clear, well-lit photos' },
                    { icon: '📝', text: 'Write detailed descriptions' },
                    { icon: '💰', text: 'Price items fairly' },
                    { icon: '⚡', text: 'Respond to messages promptly' },
                    { icon: '✅', text: 'Be honest about condition' },
                    { icon: '🔒', text: 'Meet in safe, public places' },
                  ].map((tip, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                      <span className="text-2xl">{tip.icon}</span>
                      <span className="text-white font-medium">{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Need More Help Section */}
            <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 border-2 border-slate-200 shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Still Need Help?</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Can't find what you're looking for? Our support team is here to assist you!
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link to="/" className="btn-primary btn-lg inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Home
                  </Link>
                  <a href="mailto:support@lincoln.edu.gh" className="btn-outline btn-lg inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Support
                  </a>
                </div>
                
                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-3">Or reach us directly:</p>
                  <div className="flex flex-wrap gap-4 justify-center text-sm">
                    <a href="mailto:support@lincoln.edu.gh" className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      support@lincoln.edu.gh
                    </a>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      24/7 Support Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
