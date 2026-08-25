import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  Truck,
  ShoppingBag,
  Copy,
  ExternalLink,
  Instagram,
  Facebook,
  Sparkles,
  Map as MapIcon,
  Crosshair,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Hardcoded branches for Assiut since this wasn't fully modelled in DB.
const BRANCHES = [
  {
    id: '1',
    nameAr: 'فرع فريال (المطعم الرئيسي)',
    nameEn: 'Feryal Branch (Main)',
    addressAr: 'محافظة أسيوط - فريال - خلف مستشفى العقاد',
    addressEn: 'Assiut Governorate - Feryal - Behind El-Akkad Hospital',
    lat: 27.1850,
    lng: 31.1800,
    phone: '01091266737',
    hoursAr: '11:00 ص - 02:00 ص',
    hoursEn: '11:00 AM - 02:00 AM',
    mapUrl: 'https://maps.google.com/?q=El-Akkad+Hospital+Assiut',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '2',
    nameAr: 'فرع حي سيتي',
    nameEn: 'City District Branch',
    addressAr: 'أسيوط - حي سيتي - بجوار سيتي ستارز',
    addressEn: 'Assiut - City Area - Beside City Stars',
    lat: 27.1750,
    lng: 31.1850,
    phone: '01091266738',
    hoursAr: '12:00 م - 01:00 ص',
    hoursEn: '12:00 PM - 01:00 AM',
    mapUrl: 'https://maps.google.com/?q=City+Stars+Assiut',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: '3',
    nameAr: 'فرع جامعة أسيوط',
    nameEn: 'Assiut University Branch',
    addressAr: 'أسيوط - أمام البوابة الرئيسية للجامعة',
    addressEn: 'Assiut - Front of Main University Gate',
    lat: 27.1900,
    lng: 31.1700,
    phone: '01091266739',
    hoursAr: '10:00 ص - 12:00 ص',
    hoursEn: '10:00 AM - 12:00 AM',
    mapUrl: 'https://maps.google.com/?q=Assiut+University',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'
  }
];

// Haversine formula
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export const BranchesView: React.FC = () => {
  const { settings, language, setCurrentView } = useApp();

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState<'order_inquiry' | 'feedback' | 'catering' | 'complaint'>('order_inquiry');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Map / Branches state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distances, setDistances] = useState<Record<string, number>>({});
  const [nearestBranchId, setNearestBranchId] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(BRANCHES[0].id);

  const phoneNumber = settings.phone || '01091266737';
  const whatsappNumber = settings.whatsapp || '01091266737';
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim() || !formMessage.trim()) return;

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormName('');
      setFormPhone('');
      setFormMessage('');
    }, 4000);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `مرحباً فرانك برجر، أود الاستفسار بخصوص: ${
        formMessage ? formMessage : 'الطلب وقائمة الطعام'
      }`
    );
    window.open(`https://wa.me/${cleanWhatsapp}?text=${text}`, '_blank');
  };

  const findNearestBranch = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationErrorMsg(language === 'ar' ? 'المتصفح لا يدعم تحديد الموقع.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('loading');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        let nearestId = BRANCHES[0].id;
        let minDistance = getDistanceKm(latitude, longitude, BRANCHES[0].lat, BRANCHES[0].lng);
        const newDistances: Record<string, number> = {};
        newDistances[BRANCHES[0].id] = minDistance;

        for (let i = 1; i < BRANCHES.length; i++) {
          const dist = getDistanceKm(latitude, longitude, BRANCHES[i].lat, BRANCHES[i].lng);
          newDistances[BRANCHES[i].id] = dist;
          if (dist < minDistance) {
            minDistance = dist;
            nearestId = BRANCHES[i].id;
          }
        }
        
        setDistances(newDistances);
        setNearestBranchId(nearestId);
        setSelectedBranchId(nearestId);
        setLocationStatus('success');
      },
      (error) => {
        setLocationStatus('error');
        setLocationErrorMsg(language === 'ar' ? 'تعذر تحديد موقعك. يرجى تفعيل إذن الموقع.' : 'Unable to retrieve your location. Please allow access.');
      }
    );
  };

  const selectedBranch = BRANCHES.find(b => b.id === selectedBranchId) || BRANCHES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-br from-[#141418] via-[#181820] to-[#121216] border border-[#262630] rounded-3xl p-6 sm:p-10 text-start relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E51E2A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#E51E2A]/15 text-[#E51E2A] border border-[#E51E2A]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'خدمة سريعة وضيافة أصيلة' : 'Direct Support & Orders'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
            {language === 'ar' ? 'فروعنا وتواصل معنا' : 'Our Branches & Contact'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {language === 'ar'
              ? 'نحن الأقرب إليك! ابحث عن أقرب فرع لك أو تواصل معنا مباشرة لتسجيل طلباتك، الاستفسارات، أو حجز الوجبات والمناسبات.'
              : 'We are closer than you think! Find your nearest branch or get in touch directly for instant orders, inquiries, or party reservations.'}
          </p>
        </div>
      </div>

      {/* 2. Interactive Map Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-[#E51E2A]" />
            <h2 className="text-xl font-bold text-white font-heading">
              {language === 'ar' ? 'اختر أقرب فرع إليك' : 'Find Your Nearest Branch'}
            </h2>
          </div>
          
          <button
            onClick={findNearestBranch}
            disabled={locationStatus === 'loading'}
            className="px-4 py-2 bg-[#18181c] hover:bg-[#202026] border border-[#282830] rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {locationStatus === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4 text-emerald-400" />
            )}
            <span>{language === 'ar' ? 'تحديد موقعي' : 'Use My Location'}</span>
          </button>
        </div>

        {locationStatus === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{locationErrorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch List */}
          <div className="lg:col-span-1 space-y-3">
            {BRANCHES.map((branch) => {
              const isSelected = selectedBranchId === branch.id;
              const isNearest = nearestBranchId === branch.id;
              const distance = distances[branch.id];

              return (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`w-full text-start p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-[#18181c] border-[#E51E2A] shadow-[0_0_15px_rgba(229,30,42,0.15)]' 
                      : 'bg-[#121215] border-[#24242a] hover:border-zinc-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold font-heading ${isSelected ? 'text-[#E51E2A]' : 'text-white'}`}>
                      {language === 'ar' ? branch.nameAr : branch.nameEn}
                    </h3>
                    {isNearest && (
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {language === 'ar' ? 'الأقرب' : 'Nearest'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 mb-2">
                    {language === 'ar' ? branch.addressAr : branch.addressEn}
                  </p>
                  
                  {distance !== undefined && (
                    <div className="text-[11px] font-mono text-zinc-300 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-emerald-400" />
                      <span>{distance.toFixed(1)} km {language === 'ar' ? 'بعيد عنك' : 'away'}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Branch Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedBranch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#121215] border border-[#24242a] rounded-3xl overflow-hidden shadow-xl"
              >
                <div className="relative h-48 sm:h-64 w-full">
                  <img
                    src={selectedBranch.image}
                    alt={selectedBranch.nameEn}
                    className="w-full h-full object-cover opacity-70 filter saturate-150"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/50 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E51E2A] text-white">
                        {language === 'ar' ? 'صالة مكيفة ومجهزة' : 'Dine-in Ready'}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                      {language === 'ar' ? selectedBranch.nameAr : selectedBranch.nameEn}
                    </h2>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-start">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-semibold uppercase tracking-wider">{language === 'ar' ? 'العنوان' : 'Address'}</span>
                      </div>
                      <p className="text-sm text-white font-medium">
                        {language === 'ar' ? selectedBranch.addressAr : selectedBranch.addressEn}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold uppercase tracking-wider">{language === 'ar' ? 'مواعيد العمل' : 'Hours'}</span>
                      </div>
                      <p className="text-sm text-white font-medium font-mono">
                        {language === 'ar' ? selectedBranch.hoursAr : selectedBranch.hoursEn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <a
                      href={selectedBranch.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#18181c] hover:bg-[#22222a] border border-[#282830] text-white hover:text-[#E51E2A] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{language === 'ar' ? 'افتح على خرائط جوجل' : 'Open in Google Maps'}</span>
                    </a>
                    <a
                      href={`tel:${selectedBranch.phone}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{language === 'ar' ? 'اتصل بالفرع' : 'Call Branch'} ({selectedBranch.phone})</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. Social Channels & Delivery Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* WhatsApp Card */}
        <div className="bg-[#121215] border border-[#24242a] hover:border-emerald-500/50 transition-all rounded-2xl p-5 text-start flex flex-col justify-between group shadow-md">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                {language === 'ar' ? 'محادثة واتساب الفورية' : 'WhatsApp Chat'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'أرسل موقعك أو استفسارك مباشرة' : 'Send your location or inquiries'}
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-[#202026]">
            <a
              href={`https://wa.me/20${cleanWhatsapp.replace(/^0+/, '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'فتح المحادثة' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Menu Navigation Card */}
        <div className="bg-[#121215] border border-[#24242a] rounded-2xl p-5 text-start flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-heading">
                  {language === 'ar' ? 'تصفح المنيو الآن' : 'Browse Our Menu'}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'اطلب الدليفري عبر الموقع مباشرة' : 'Order delivery online directly'}
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-[#202026]">
            <button
              onClick={() => {
                setCurrentView('menu');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-[#282830] text-zinc-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E51E2A]" />
              <span>{language === 'ar' ? 'اطلب الآن' : 'Order Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Feedback Section */}
      <div className="lg:col-span-5 text-start">
        <form
          onSubmit={handleSubmitMessage}
          className="bg-[#121215] border border-[#24242a] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl max-w-3xl mx-auto"
        >
          <div className="space-y-1 pb-4 border-b border-[#22222a]">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#E51E2A]" />
              <h3 className="text-lg font-bold text-white font-heading">
                {language === 'ar' ? 'أرسل رسالة أو اقتراح للإدارة' : 'Send a Message or Feedback'}
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              {language === 'ar'
                ? 'رأيك يهمنا دائماً لتحسين الخدمة وتقديم أفضل تجربة أكل.'
                : 'Your feedback helps us provide the best dining experience.'}
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 my-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                {language === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message Received!'}
              </h4>
              <p className="text-xs text-zinc-300">
                {language === 'ar'
                  ? 'شكراً لتواصلك مع فرانك برجر، سيقوم فريقنا بالرد عليك في أقرب وقت.'
                  : 'Thank you for reaching out to Frank Burger, our team will respond promptly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} <span className="text-[#E51E2A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                  className="w-full bg-[#18181c] border border-[#282830] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {language === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'} <span className="text-[#E51E2A]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full bg-[#18181c] border border-[#282830] rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-[#E51E2A]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {language === 'ar' ? 'نوع التواصل' : 'Topic'}
                </label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value as any)}
                  className="w-full bg-[#18181c] border border-[#282830] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#E51E2A]"
                >
                  <option value="order_inquiry">
                    {language === 'ar' ? 'استفسار عن طلب أو المنيو' : 'Order or Menu Inquiry'}
                  </option>
                  <option value="feedback">
                    {language === 'ar' ? 'رأي أو اقتراح صنف جديد' : 'General Feedback & Suggestion'}
                  </option>
                  <option value="catering">
                    {language === 'ar' ? 'حجز مناسبات أو وجبات عمل' : 'Catering & Event Bookings'}
                  </option>
                  <option value="complaint">
                    {language === 'ar' ? 'شكوى بخصوص طلب سابق' : 'Complaint about previous order'}
                  </option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {language === 'ar' ? 'نص الرسالة' : 'Your Message'} <span className="text-[#E51E2A]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'اكتب رسالتك أو استفسارك هنا...'
                      : 'Type your message or inquiry here...'
                  }
                  className="w-full bg-[#18181c] border border-[#282830] rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E51E2A] resize-none"
                />
              </div>

              <div className="md:col-span-2 pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#E51E2A] hover:bg-[#c81520] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إرسال الرسالة للإدارة' : 'Submit Message'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

    </div>
  );
};
