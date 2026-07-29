import { useState } from 'react';
import { useBrand } from '../context/BrandContext';
import { Plug, Bell, MessageCircle, Globe, Zap, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'website' | 'crm' | 'messaging' | 'notification';
  connected: boolean;
  webhookUrl?: string;
  features: string[];
  setupNote: string;
}

const defaultIntegrations: Integration[] = [
  { id: 'elementor', name: 'Elementor / WordPress', description: 'Sync orders from your WordPress/WooCommerce site built with Elementor', icon: '🌐', category: 'website', connected: false, features: ['Auto-import orders', 'Product sync', 'Customer data sync', 'Live order notifications'], setupNote: 'Add your webhook URL to Elementor form actions or WooCommerce webhook settings' },
  { id: 'gohighlevel', name: 'GoHighLevel', description: 'Connect your GHL CRM for lead and order sync', icon: '🚀', category: 'crm', connected: false, features: ['Lead import', 'Contact sync', 'Pipeline automation', 'Two-way data sync'], setupNote: 'Paste this webhook URL in your GHL workflow actions' },
  { id: 'shopify', name: 'Shopify', description: 'Import orders automatically from your Shopify store', icon: '🛍️', category: 'website', connected: false, features: ['Auto-import orders', 'Inventory sync', 'Customer data', 'Fulfillment updates'], setupNote: 'Add webhook in Shopify Settings → Notifications → Webhooks' },
  { id: 'whatsapp', name: 'WhatsApp Business API', description: 'Automated messaging, order confirmations, and follow-ups', icon: '💬', category: 'messaging', connected: false, features: ['Auto order confirmation', 'Delivery notifications', 'Follow-up reminders', 'Broadcast messages', 'Template messages'], setupNote: 'Connect via WATI, Twilio, or Meta Cloud API. Requires WhatsApp Business API access.' },
  { id: 'instagram', name: 'Instagram DM Orders', description: 'Capture orders from Instagram DMs and comments', icon: '📸', category: 'crm', connected: false, features: ['DM order capture', 'Comment tracking', 'Auto-reply', 'Lead generation'], setupNote: 'Connect via Meta Business Suite API' },
  { id: 'paystack', name: 'Paystack Payments', description: 'Accept online payments from customers', icon: '💳', category: 'notification', connected: true, features: ['Card payments', 'Bank transfer', 'USSD', 'Payment links', 'Auto-reconciliation'], setupNote: 'Already connected (demo mode)' },
];

export default function Integrations() {
  const { brand } = useBrand();
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    try { const s = localStorage.getItem('app_integrations'); if (s) return JSON.parse(s); } catch {}
    return defaultIntegrations;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = integrations.find(i => i.id === selectedId);
  const webhookBase = `${window.location.origin}/api/webhooks/`;

  const toggle = (id: string) => {
    const updated = integrations.map(i => i.id === id ? { ...i, connected: !i.connected } : i);
    setIntegrations(updated);
    localStorage.setItem('app_integrations', JSON.stringify(updated));
  };

  const categories = [
    { key: 'website', label: 'Website & E-commerce', icon: <Globe size={16} /> },
    { key: 'crm', label: 'CRM & Social', icon: <Zap size={16} /> },
    { key: 'messaging', label: 'Messaging', icon: <MessageCircle size={16} /> },
    { key: 'notification', label: 'Payments & Notifications', icon: <Bell size={16} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Plug size={24} style={{ color: brand.primaryColor }} />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Integrations & Omnichannel Sync</h2>
          <p className="text-sm text-gray-500">Connect external platforms for live order sync and automation</p>
        </div>
      </div>

      {/* Real-time notification banner */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-blue-600 animate-pulse" />
          <div>
            <p className="text-sm font-medium text-blue-800">Live Order Notifications</p>
            <p className="text-xs text-blue-600">When connected, new orders from any platform will appear as real-time notifications in your dashboard. Manual orders can always be added directly.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration List */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map(cat => {
            const catIntegrations = integrations.filter(i => i.category === cat.key);
            if (catIntegrations.length === 0) return null;
            return (
              <div key={cat.key}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">{cat.icon} {cat.label}</h3>
                <div className="space-y-2">
                  {catIntegrations.map(integ => (
                    <div key={integ.id} onClick={() => setSelectedId(integ.id)}
                      className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selectedId === integ.id ? 'ring-2' : ''}`}
                      style={selectedId === integ.id ? { borderColor: brand.primaryColor, boxShadow: `0 0 0 2px ${brand.primaryColor}20` } : {}}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">{integ.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">{integ.name}</h4>
                            {integ.connected && <span className="badge text-[10px] bg-green-50 text-green-700 flex items-center gap-1"><CheckCircle size={10} /> Connected</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{integ.description}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); toggle(integ.id); }}
                          className={`shrink-0 ${integ.connected ? 'text-green-500' : 'text-gray-300'}`}>
                          {integ.connected ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          {selected ? (
            <div className="card p-5 sticky top-20">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl mx-auto mb-3">{selected.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                <span className={`badge mt-1 ${selected.connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {selected.connected ? '✓ Connected' : 'Not connected'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Features</p>
                  <div className="space-y-1">
                    {selected.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-green-500 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Webhook URL</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-[10px] text-gray-600 break-all">{webhookBase}{selected.id}</code>
                    <button onClick={() => { navigator.clipboard.writeText(`${webhookBase}${selected.id}`); alert('Webhook URL copied!'); }}
                      className="btn-secondary text-[10px] mt-2 w-full">Copy Webhook URL</button>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs text-amber-800"><strong>Setup:</strong> {selected.setupNote}</p>
                </div>
                <button onClick={() => toggle(selected.id)}
                  className={`w-full py-2 rounded-lg text-sm font-medium ${selected.connected ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'text-white'}`}
                  style={!selected.connected ? { backgroundColor: brand.primaryColor } : {}}>
                  {selected.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Plug size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Select an integration to view details</p>
            </div>
          )}

          {/* WhatsApp Automation */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><MessageCircle size={16} className="text-green-500" /> WhatsApp Automation</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2"><Zap size={12} className="text-amber-500 mt-0.5 shrink-0" /><span><strong>Order Confirmation:</strong> Auto-send invoice when order is created</span></div>
              <div className="flex items-start gap-2"><Zap size={12} className="text-amber-500 mt-0.5 shrink-0" /><span><strong>Shipping Update:</strong> Notify when status changes to shipped</span></div>
              <div className="flex items-start gap-2"><Zap size={12} className="text-amber-500 mt-0.5 shrink-0" /><span><strong>Delivery Confirmation:</strong> Auto-message on delivery</span></div>
              <div className="flex items-start gap-2"><Zap size={12} className="text-amber-500 mt-0.5 shrink-0" /><span><strong>Follow-up (30 days):</strong> Timed check-in after delivery</span></div>
              <div className="flex items-start gap-2"><Zap size={12} className="text-amber-500 mt-0.5 shrink-0" /><span><strong>Payment Reminder:</strong> Auto-nudge for unpaid/partial orders</span></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 italic">Requires WhatsApp Business API (WATI/Twilio/Meta Cloud API) + backend server for scheduling</p>
          </div>
        </div>
      </div>
    </div>
  );
}
