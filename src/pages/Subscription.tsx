import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useBrand } from '../context/BrandContext';
import { useCompany } from '@/context/CompanyContext';
import { useSubscriptionPlans } from '@/data/queries';
import { CreditCard, CheckCircle, Star, Zap, Crown, Rocket, Plus, X, Send } from 'lucide-react';

type Billing = 'monthly' | 'quarterly' | 'yearly';

type Plan = {
  id: number;
  name: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  trial: string;
  priceInKobo: number;
  paystackCode: string;
  features: { text: string; included: boolean }[];
  limits: string;
  popular?: boolean;
  billing: Billing;
  family: 'starter' | 'growth' | 'professional' | 'enterprise';
};

const familyMeta: Record<Plan['family'], { name: string; icon: React.ReactNode; color: string; trial: string; features: { text: string; included: boolean }[]; limits: string; popular?: boolean }> = {
  starter: {
    name: 'Starter',
    icon: <Star size={18} />,
    color: '#6B7280',
    trial: '7-day trial',
    features: [
      { text: '1 team member', included: true },
      { text: 'Unlimited orders', included: true },
      { text: 'Basic CRM & invoicing', included: true },
      { text: 'Product management', included: true },
      { text: 'Agent management', included: true },
      { text: 'WhatsApp integration', included: true },
      { text: 'Follow-up tracking', included: true },
      { text: 'Multiple team members', included: false },
      { text: 'Analytics & reports', included: false },
      { text: 'Omnichannel sync', included: false },
    ],
    limits: '1 staff only',
  },
  growth: {
    name: 'Growth',
    icon: <Zap size={18} />,
    color: '#4F46E5',
    trial: '10-day trial',
    popular: true,
    features: [
      { text: 'Up to 5 team members', included: true },
      { text: 'Up to 20 agents/locations', included: true },
      { text: 'Up to 2,000 orders/month', included: true },
      { text: 'Full CRM & Analytics', included: true },
      { text: 'Sales tracker & daily reports', included: true },
      { text: 'WhatsApp broadcast', included: true },
      { text: 'Editable invoices with images', included: true },
      { text: 'Staff & agent performance', included: true },
      { text: 'Expense management', included: true },
      { text: 'Omnichannel sync', included: false },
      { text: 'Custom domain', included: false },
    ],
    limits: '5 staff • 20 agents • 2,000 orders',
  },
  professional: {
    name: 'Professional',
    icon: <Crown size={18} />,
    color: '#059669',
    trial: '14-day trial',
    features: [
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited agents/locations', included: true },
      { text: 'Unlimited orders', included: true },
      { text: 'Everything in Growth', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom date range reports', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Return customer tracking', included: true },
      { text: 'Full follow-up automation', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Dedicated setup manager', included: false },
    ],
    limits: 'Unlimited everything',
  },
  enterprise: {
    name: 'Enterprise',
    icon: <Rocket size={18} />,
    color: '#7C3AED',
    trial: '14-day trial',
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Custom domain included', included: true },
      { text: 'Omnichannel sync (Elementor, GHL, Shopify)', included: true },
      { text: 'Dedicated setup manager', included: true },
      { text: 'WhatsApp automation (auto messages)', included: true },
      { text: 'API access', included: true },
      { text: 'Custom integrations on request', included: true },
      { text: 'White-label branding', included: true },
      { text: 'Onboarding & training', included: true },
      { text: 'Phone & WhatsApp support', included: true },
    ],
    limits: 'Enterprise suite + custom integrations',
  },
};

const getPeriod = (billing: Billing) => billing === 'monthly' ? '/mo' : billing === 'quarterly' ? '/qtr' : '/yr';
const getBillingLabel = (billing: Billing) => billing === 'monthly' ? 'Monthly' : billing === 'quarterly' ? 'Quarterly' : 'Yearly';
const getSavings = (priceInKobo: number, billing: Billing) => {
  if (billing === 'quarterly') return Math.round((1 - priceInKobo / 3000000) * 100);
  if (billing === 'yearly') return Math.round((1 - priceInKobo / 6000000) * 100);
  return 0;
};

const getPlanFamily = (name: string): Plan['family'] | null => {
  const normalized = name.trim().toLowerCase();
  if (normalized.includes('starter')) return 'starter';
  if (normalized.includes('growth')) return 'growth';
  if (normalized.includes('professional')) return 'professional';
  if (normalized.includes('enterprise')) return 'enterprise';
  return null;
};

const getBillingFromName = (name: string): Billing | null => {
  const normalized = name.trim().toLowerCase();
  if (normalized.includes('yearly') || normalized.includes('annual')) return 'yearly';
  if (normalized.includes('quarterly')) return 'quarterly';
  if (normalized.includes('monthly')) return 'monthly';
  return null;
};

const getBillingFromDurationDays = (durationDays: number): Billing => {
  if (durationDays >= 300) return 'yearly';
  if (durationDays >= 80) return 'quarterly';
  return 'monthly';
};

const getBillingFromPlan = (name: string, durationDays: number): Billing => {
  return getBillingFromName(name) ?? getBillingFromDurationDays(durationDays);
};

export default function Subscription() {
  const { brand } = useBrand();
  const { company } = useCompany();
  const { data: subscriptionPlans = [] } = useSubscriptionPlans();
  const [billing, setBilling] = useState<Billing>('monthly');
  const [showPaystack, setShowPaystack] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // Custom integration request
  const [showIntegrationRequest, setShowIntegrationRequest] = useState(false);
  const [integrationName, setIntegrationName] = useState('');
  const [integrationDesc, setIntegrationDesc] = useState('');

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? '';
  const paystackScriptUrl = import.meta.env.VITE_PAYSTACK_SCRIPT_URL ?? 'https://js.paystack.co/v1/inline.js';
  const defaultCustomerEmail = import.meta.env.VITE_DEFAULT_CUSTOMER_EMAIL ?? 'customer@example.com';

  const plans = useMemo<Plan[]>(() => {
    return (subscriptionPlans as Array<{ id: number; name: string; paystackCode: string; priceInKobo: number; durationDays: number }>).map((plan) => {
      const family = getPlanFamily(plan.name);
      const billingFromPlan = getBillingFromPlan(plan.name, plan.durationDays);
      if (!family) return null;

      const meta = familyMeta[family];
      return {
        id: plan.id,
        name: plan.name,
        label: `${meta.name} — ${getBillingLabel(billingFromPlan)}`,
        icon: meta.icon,
        color: meta.color,
        trial: meta.trial,
        priceInKobo: plan.priceInKobo,
        paystackCode: plan.paystackCode,
        features: [...meta.features],
        limits: meta.limits,
        popular: meta.popular,
        billing: billingFromPlan,
        family,
      } satisfies Plan;
    }).filter(Boolean) as Plan[];
  }, [subscriptionPlans]);

  const currentPlan = useMemo(() => {
    if (!company?.planName) return null;
    return plans.find((plan) => plan.name.toLowerCase() === company.planName.toLowerCase()) ?? null;
  }, [company?.planName, plans]);

  const visiblePlans = useMemo(() => plans.filter((plan) => plan.billing === billing), [plans, billing]);

  const loadPaystackScript = () => {
    if ((window as any).PaystackPop) return Promise.resolve(true);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = paystackScriptUrl;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Paystack script failed to load'));
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = (planId: number) => { setSelectedUpgrade(planId); setShowPaystack(true); };

  const processPayment = async () => {
    const plan = plans.find(p => p.id === selectedUpgrade);
    if (!plan) return;
    if (!paystackPublicKey) {
      toast.error('Paystack public key is not configured. Please set VITE_PAYSTACK_PUBLIC_KEY.');
      return;
    }

    setLoading(true);

    try {
      await loadPaystackScript();
      const paystack = (window as any).PaystackPop;
      if (!paystack) throw new Error('Paystack is unavailable.');

      const handler = paystack.setup({
        key: paystackPublicKey,
        email: defaultCustomerEmail,
        amount: plan.priceInKobo,
        plan: plan.paystackCode || plan.id.toString(),
        currency: 'NGN',
        ref: `SUB_${plan.id}_${Date.now()}`,
        metadata: {
          plan: plan.name,
          billing: plan.billing,
        },
        callback: (response: any) => {
          setLoading(false);
          setShowPaystack(false);
          toast.success(`Payment successful! Reference: ${response.reference}`);
        },
        onClose: () => {
          setLoading(false);
          toast.error('Payment was not completed.');
        },
      });

      handler.openIframe();
    } catch (error) {
      setLoading(false);
      toast.error('Unable to start Paystack payment. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard size={24} style={{ color: brand.primaryColor }} />
          <div><h2 className="text-xl font-bold text-gray-900">Subscription & Billing</h2><p className="text-sm text-gray-500">Manage your plan and payment</p></div>
        </div>
        <button onClick={() => setShowIntegrationRequest(true)} className="btn-secondary text-xs flex items-center gap-1"><Plus size={14} /> Request Integration</button>
      </div>

      {/* Current Plan */}
      <div className="card p-5 border-l-4" style={{ borderLeftColor: brand.primaryColor }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500">Current Plan</p>
            <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {company?.planName || 'No plan selected'}
              {currentPlan?.family === 'growth' && <Zap size={16} className="text-indigo-500" />}
            </p>
            <p className="text-sm text-gray-500">This comes from the subscription plan attached to your company.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: brand.primaryColor }}>
              ₦{((currentPlan?.priceInKobo ?? 0) / 100).toLocaleString()}
              <span className="text-sm text-gray-400">/{billing === 'monthly' ? 'mo' : billing === 'quarterly' ? 'qtr' : 'yr'}</span>
            </p>
            <p className="text-xs text-green-600">Active ✓</p>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['monthly', 'quarterly', 'yearly'] as Billing[]).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${billing === b ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {b === 'monthly' ? 'Monthly' : b === 'quarterly' ? 'Quarterly' : '🔥 Yearly'}
              {b === 'yearly' && <span className="block text-[9px] text-green-600 font-normal mt-0.5">2 months FREE</span>}
              {b === 'quarterly' && <span className="block text-[9px] text-blue-600 font-normal mt-0.5">Save ~10%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visiblePlans.map(plan => {
          const price = plan.priceInKobo / 100;
          const savings = getSavings(plan.priceInKobo, plan.billing);
          const isCurrent = currentPlan?.id === plan.id;
          return (
            <div key={plan.id} className={`card p-5 relative flex flex-col ${plan.popular ? 'ring-2' : ''}`} style={plan.popular ? { borderColor: plan.color, boxShadow: `0 0 0 2px ${plan.color}20` } : {}}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge text-white text-[10px] px-3" style={{ backgroundColor: plan.color }}>Most Popular</div>}
              <div className="text-center mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-2" style={{ backgroundColor: plan.color }}>{plan.icon}</div>
                <h3 className="text-base font-bold text-gray-900">{plan.label}</h3>
                <p className="text-[10px] text-green-600 font-medium">{plan.trial}</p>
                <div className="mt-2">
                  <span className="text-3xl font-bold" style={{ color: plan.color }}>₦{price.toLocaleString()}</span>
                  <span className="text-xs text-gray-400">{getPeriod(plan.billing)}</span>
                </div>
                {savings > 0 && <p className="text-xs text-green-600 mt-1">Save {savings}% vs monthly</p>}
                {plan.billing === 'yearly' && <p className="text-[10px] text-green-600 font-semibold">Includes 2 months free!</p>}
                <p className="text-[10px] text-gray-500 mt-1 font-semibold">{plan.limits}</p>
              </div>
              <div className="space-y-1.5 flex-1 mb-4">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px]">
                    {f.included ? <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" /> : <div className="w-3 h-3 rounded-full border-2 border-gray-200 mt-0.5 shrink-0" />}
                    <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => !isCurrent && handleUpgrade(plan.id)} disabled={isCurrent}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${isCurrent ? 'bg-gray-100 text-gray-500 cursor-default' : 'text-white hover:opacity-90'}`}
                style={!isCurrent ? { backgroundColor: plan.color } : {}}>
                {isCurrent ? '✓ Current Plan' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Yearly Value Highlight */}
      {billing === 'yearly' && (
        <div className="card p-4 bg-green-50 border-green-200 text-center">
          <p className="text-sm font-semibold text-green-800">🎉 Yearly subscribers get 2 months completely FREE!</p>
          <p className="text-xs text-green-600">That's like paying for 10 months and getting 12. Best value for growing businesses.</p>
        </div>
      )}

      {/* Paystack Modal */}
      {showPaystack && (() => {
        const plan = plans.find(p => p.id === selectedUpgrade);
        if (!plan) return null;
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPaystack(false)}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mx-auto mb-3" style={{ backgroundColor: plan.color }}>{plan.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Upgrade to {plan.label}</h3>
              <p className="text-2xl font-bold mb-1" style={{ color: plan.color }}>₦{(plan.priceInKobo / 100).toLocaleString()}<span className="text-sm text-gray-400">{getPeriod(plan.billing)}</span></p>
              <p className="text-xs text-green-600 mb-4">{plan.trial} included</p>
              {!paystackPublicKey && (
                <p className="text-xs text-red-600 mb-3">Paystack public key is missing. Configure <code>VITE_PAYSTACK_PUBLIC_KEY</code> in your environment.</p>
              )}
              <button onClick={processPayment} disabled={loading} className="btn-primary w-full py-2.5 bg-green-600 mb-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : '✓ Pay with Paystack'}
              </button>
              <button onClick={() => setShowPaystack(false)} className="text-sm text-gray-400">Cancel</button>
            </div>
          </div>
        );
      })()}

      {/* Custom Integration Request Modal */}
      {showIntegrationRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowIntegrationRequest(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b"><h3 className="font-semibold text-gray-900">Request Custom Integration</h3><button onClick={() => setShowIntegrationRequest(false)} className="text-gray-400"><X size={20} /></button></div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500">Need a specific platform connected? Tell us and we'll build it for you (available on Enterprise plan or as add-on).</p>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Platform / Service Name</label><input className="input-field" value={integrationName} onChange={e => setIntegrationName(e.target.value)} placeholder="e.g. Jumia, Konga, Flutterwave..." /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">What do you need?</label><textarea className="input-field" rows={3} value={integrationDesc} onChange={e => setIntegrationDesc(e.target.value)} placeholder="Describe what data you want synced..." /></div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setShowIntegrationRequest(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { alert(`✅ Integration request submitted!\n\nPlatform: ${integrationName}\nDetails: ${integrationDesc}\n\nOur team will reach out within 24 hours.`); setShowIntegrationRequest(false); setIntegrationName(''); setIntegrationDesc(''); }} className="btn-primary flex-1 flex items-center justify-center gap-1" style={{ backgroundColor: brand.primaryColor }}><Send size={14} /> Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
