import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, Star, Zap, Crown, Rocket } from 'lucide-react';

type View = 'login' | 'signup' | 'plans';
type Billing = 'monthly' | 'quarterly' | 'yearly';

const plans = [
  {
    id: 'starter', name: 'Starter', icon: <Star size={20} />, color: '#6B7280', trial: '7 days free',
    monthly: 5000, quarterly: 13500, yearly: 50000,
    features: ['1 team member', 'Unlimited orders', 'Basic CRM & invoicing', 'Product management', 'Agent management', 'WhatsApp integration', 'Follow-up tracking'],
    limits: 'Single user only',
  },
  {
    id: 'growth', name: 'Growth', icon: <Zap size={20} />, color: '#4F46E5', trial: '10 days free', popular: true,
    monthly: 8000, quarterly: 21600, yearly: 80000,
    features: ['Up to 5 team members', 'Up to 20 agents', 'Up to 2,000 orders/month', 'Full CRM & Analytics', 'Sales tracker & reports', 'Broadcast messaging', 'Editable invoices with images', 'Staff & agent performance', 'Expense management'],
    limits: '5 staff • 20 agents • 2,000 orders',
  },
  {
    id: 'professional', name: 'Professional', icon: <Crown size={20} />, color: '#059669', trial: '14 days free',
    monthly: 12000, quarterly: 32400, yearly: 120000,
    features: ['Unlimited team members', 'Unlimited agents', 'Unlimited orders', 'Everything in Growth', 'Advanced analytics', 'Custom date range reports', 'Priority support', 'Full follow-up automation'],
    limits: 'Unlimited everything',
  },
  {
    id: 'enterprise', name: 'Enterprise', icon: <Rocket size={20} />, color: '#7C3AED', trial: '14 days free',
    monthly: 25000, quarterly: 67500, yearly: 250000,
    features: ['Everything in Professional', 'Custom domain', 'Omnichannel sync (Elementor, GHL, Shopify)', 'Dedicated setup manager', 'WhatsApp automation', 'API access', 'Custom integrations on request', 'White-label branding', 'Onboarding support'],
    limits: 'Full enterprise suite',
  },
];

const getPrice = (plan: typeof plans[0], billing: Billing) => {
  if (billing === 'monthly') return plan.monthly;
  if (billing === 'quarterly') return plan.quarterly;
  return plan.yearly;
};

const getPeriod = (billing: Billing) => billing === 'monthly' ? '/mo' : billing === 'quarterly' ? '/qtr' : '/yr';

const getSavings = (plan: typeof plans[0], billing: Billing) => {
  if (billing === 'quarterly') return Math.round((1 - plan.quarterly / (plan.monthly * 3)) * 100);
  if (billing === 'yearly') return Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100);
  return 0;
};

export default function Login() {
  const { brand } = useBrand();
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupBusiness, setSignupBusiness] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [billing, setBilling] = useState<Billing>('monthly');
  const [showPaystack, setShowPaystack] = useState(false);

  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (!ok) setError('Invalid email or password');
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword || !signupBusiness) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');

    const result = await register(
      signupEmail,
      signupPassword,
      signupName,
      signupBusiness,
      selectedPlan.toLowerCase(),
    );

    if (!result.success || !result.uid) {
      setError(result.error ?? 'Signup failed. Please try again.');
      setLoading(false);
      return;
    }

    // Company/profile/brand defaults are now created server-side by the
    // `create-user` edge function (using the service role), so there's no
    // local storage to seed or clear here anymore.

    setLoading(false);
    setShowPaystack(true);
  };

  const handlePaystackDemo = async () => {
    setLoading(true); await new Promise(r => setTimeout(r, 1500));
    setLoading(false); setShowPaystack(false); setSignupSuccess(true);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan)!;

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #312E81, #4F46E5, #818CF8)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {signupBusiness}!</h2>
          <p className="text-gray-500 text-sm mb-2">Your workspace is ready with a <strong>{selectedPlanData.trial}</strong> trial.</p>
          <p className="text-xs text-gray-400 mb-6">Plan: {selectedPlanData.name} • ₦{getPrice(selectedPlanData, billing).toLocaleString()}{getPeriod(billing)}</p>
          <button onClick={() => { setView('login'); setEmail(signupEmail); setPassword(signupPassword); setSignupSuccess(false); }}
            className="btn-primary w-full py-2.5" style={{ backgroundColor: '#4F46E5' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${brand.sidebarGradientFrom} 0%, ${brand.sidebarGradientTo} 50%, ${brand.primaryLight} 100%)` }}>

      {/* Paystack Modal */}
      {showPaystack && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">💳</span></div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Paystack Payment</h3>
            <p className="text-sm text-gray-500 mb-1">{selectedPlanData.name} Plan</p>
            <p className="text-2xl font-bold mb-4" style={{ color: selectedPlanData.color }}>₦{getPrice(selectedPlanData, billing).toLocaleString()}<span className="text-sm text-gray-400">{getPeriod(billing)}</span></p>
            <p className="text-[10px] text-green-600 mb-4">Includes {selectedPlanData.trial} — no charge until trial ends</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-[10px] font-mono text-gray-500">
              PaystackPop.setup({'{'} key: 'pk_live_xxx', email: '{signupEmail}', amount: {getPrice(selectedPlanData, billing) * 100}, currency: 'NGN' {'}'})
            </div>
            <button onClick={handlePaystackDemo} disabled={loading} className="btn-primary w-full py-2.5 bg-green-600 mb-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : `✓ Start ${selectedPlanData.trial}`}
            </button>
            <button onClick={() => setShowPaystack(false)} className="text-sm text-gray-400">Cancel</button>
          </div>
        </div>
      )}

      <div className={`w-full ${view === 'plans' ? 'max-w-4xl' : 'max-w-md'}`}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg" style={{ backgroundColor: brand.primaryColor }}>
              {brand.logoUrl ? <img src={brand.logoUrl} alt="" className="w-full h-full rounded-2xl object-cover" /> : brand.logoEmoji}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
            <p className="text-gray-500 text-xs mt-1">{brand.tagline}</p>
          </div>

          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4"><AlertCircle size={16} />{error}</div>}

          {/* LOGIN */}
          {view === 'login' && (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="Enter your email" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative"><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" placeholder="Enter your password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center" style={{ backgroundColor: brand.primaryColor }}>
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Login'}
                </button>
              </form>
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                <button onClick={() => { setView('plans'); setError(''); }} className="btn-secondary w-full font-semibold">Sign Up →</button>
              </div>
            </>
          )}

          {/* PLANS */}
          {view === 'plans' && (
            <div>
              <button onClick={() => setView('login')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft size={14} /> Back to login</button>
              <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Choose Your Plan</h2>
              <p className="text-xs text-gray-500 text-center mb-4">All plans include a free trial. No credit card required to start.</p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-1 mb-6 bg-gray-100 rounded-xl p-1">
                {(['monthly', 'quarterly', 'yearly'] as Billing[]).map(b => (
                  <button key={b} onClick={() => setBilling(b)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${billing === b ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                    {b === 'monthly' ? 'Monthly' : b === 'quarterly' ? 'Quarterly' : '🔥 Yearly'}
                    {b === 'yearly' && <span className="block text-[9px] text-green-600 font-normal">2 months FREE</span>}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {plans.map(plan => {
                  const price = getPrice(plan, billing);
                  const savings = getSavings(plan, billing);
                  const sel = selectedPlan === plan.id;
                  return (
                    <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                      className={`rounded-xl p-4 border-2 cursor-pointer transition-all relative ${sel ? 'shadow-lg scale-[1.02]' : 'border-gray-100 hover:border-gray-200'}`}
                      style={sel ? { borderColor: plan.color } : {}}>
                      {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge text-white text-[9px] px-2.5" style={{ backgroundColor: plan.color }}>Most Popular</div>}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: plan.color }}>{plan.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                          <p className="text-[9px] text-green-600 font-medium">{plan.trial}</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <span className="text-2xl font-bold" style={{ color: plan.color }}>₦{price.toLocaleString()}</span>
                        <span className="text-xs text-gray-400">{getPeriod(billing)}</span>
                        {savings > 0 && <span className="ml-1 badge text-[9px] bg-green-50 text-green-700">-{savings}%</span>}
                      </div>
                      <p className="text-[10px] text-gray-500 font-semibold mb-2">{plan.limits}</p>
                      <div className="space-y-1">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[10px] text-gray-600">
                            <CheckCircle size={10} className="text-green-500 mt-0.5 shrink-0" /><span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setView('signup')} className="btn-primary w-full mt-6 py-2.5 text-sm" style={{ backgroundColor: selectedPlanData.color }}>
                Continue with {selectedPlanData.name} →
              </button>
            </div>
          )}

          {/* SIGNUP */}
          {view === 'signup' && (
            <div>
              <button onClick={() => setView('plans')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft size={14} /> Change plan</button>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: `${selectedPlanData.color}08`, border: `1px solid ${selectedPlanData.color}20` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: selectedPlanData.color }}>{selectedPlanData.icon}</div>
                <div className="flex-1"><p className="text-sm font-bold text-gray-900">{selectedPlanData.name}</p><p className="text-[10px] text-gray-500">₦{getPrice(selectedPlanData, billing).toLocaleString()}{getPeriod(billing)} • {selectedPlanData.trial}</p></div>
              </div>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Your Full Name</label><input className="input-field" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Jane Doe" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label><input className="input-field" value={signupBusiness} onChange={e => setSignupBusiness(e.target.value)} placeholder="Bow Naturals" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Email</label><input className="input-field" type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@business.com" /></div>
                <div><label className="block text-xs font-medium text-gray-700 mb-1">Password</label><input className="input-field" type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Create a password" /></div>
              </div>
              <button onClick={handleSignup} disabled={loading} className="btn-primary w-full mt-4 py-2.5 flex items-center justify-center" style={{ backgroundColor: selectedPlanData.color }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Start ${selectedPlanData.trial}`}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-2">No credit card required during trial</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}