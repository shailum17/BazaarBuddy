import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Package, TrendingUp, Shield } from 'lucide-react';
import ScrollReveal from 'scrollreveal';
import ThreeScene from '../components/ThreeScene';

const Home = () => {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified suppliers',
      description: 'Onboarded and vetted partners so you can order with confidence every time.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Transparent pricing',
      description: 'Compare rates instantly and track daily price changes to buy at the best time.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Smart matching',
      description: 'Get recommendations based on location, volume, and product quality preferences.'
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Order management',
      description: 'Place orders, chat, and track status — with all records neatly saved for you.'
    }
  ];

  const stats = [
    { number: '1.5k+', label: 'Vendors onboarded' },
    { number: '600+', label: 'Verified suppliers' },
    { number: '10k+', label: 'Products listed' },
    { number: '95%', label: 'On‑time delivery' }
  ];

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const sr = ScrollReveal({
      distance: '60px',
      duration: 2500,
      delay: 400,
      reset: true,
    });

    if (heroRef.current) {
      sr.reveal(heroRef.current, { origin: 'top', interval: 100 });
    }
    if (statsRef.current) {
      sr.reveal(statsRef.current, { origin: 'bottom', interval: 100 });
    }
    if (featuresRef.current) {
      sr.reveal(featuresRef.current, { origin: 'bottom', interval: 100 });
    }
    if (howItWorksRef.current) {
      sr.reveal(howItWorksRef.current, { origin: 'bottom', interval: 100 });
    }
    if (ctaRef.current) {
      sr.reveal(ctaRef.current, { origin: 'bottom' });
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 py-24">
        <div className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(400px_200px_at_20%_10%,black,transparent)]">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-200 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-secondary-200 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm text-primary-700 ring-1 ring-primary-200 mb-4">
              <span className="h-2 w-2 rounded-full bg-primary-500"></span>
              Trusted by growing street food brands
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
              Simplify vendor–supplier sourcing
            </h1>
            <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
              Discover verified suppliers, transparent pricing, and fast ordering — purpose‑built for
              street food businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2 hover:shadow-md"
              >
                <span>Create free account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="btn-outline text-lg px-8 py-3 hover:shadow-sm"
              >
                Explore suppliers
              </Link>
            </div>
            <div className="relative mx-auto mt-10 h-96 max-w-xl">
              <ThreeScene />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-gray-50 rounded-xl p-6 ring-1 ring-gray-100">
                <div className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Everything you need to source with ease
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for the speed and reliability your business demands.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Food categories */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Popular categories</h3>
              <Link to="/vendor/products" className="text-primary-700 hover:text-primary-800 font-medium transition-colors">Browse all</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[{e:'🍞',t:'Bakery'},{e:'🥬',t:'Fresh produce'},{e:'🧀',t:'Dairy & cheese'},{e:'🌶️',t:'Spices'}].map((c, i) => (
                <Link key={i} to="/vendor/products" className="group">
                  <div className="rounded-xl bg-white ring-1 ring-gray-200 p-5 hover:shadow-md transition-all">
                    <div className="text-3xl mb-2 transition-transform group-hover:-translate-y-0.5">{c.e}</div>
                    <div className="font-medium text-gray-900">{c.t}</div>
                    <div className="text-sm text-gray-500">Tap to explore</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="py-20 bg-white">
.
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How it works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign up and choose your role</h3>
              <p className="text-gray-600">Create your free account as a vendor or supplier — it takes less than a minute.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compare and connect</h3>
              <p className="text-gray-600">Search products, compare pricing, and discover verified partners nearby.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order and track</h3>
              <p className="text-gray-600">Place orders in a few taps, track delivery, and keep your records digital.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Grow with BazaarBuddy
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Smoother sourcing. Better margins. Stronger partnerships.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-all inline-flex items-center space-x-2 hover:shadow-md"
          >
            <span>Get started free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 