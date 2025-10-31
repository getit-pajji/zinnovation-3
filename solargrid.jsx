import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, setLogLevel } from 'firebase/firestore';
import { 
  Sun, Zap, Home, Map, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, User, DollarSign, BarChart2, Briefcase, HelpCircle, Bell, Eye, EyeOff, CheckCircle, AlertTriangle, Info, Moon, Github, Globe, Search, Filter, Plus, Trash2, Edit2, Move, Package, Users, Maximize, Minimize, ExternalLink, CloudSun, CloudRain, Snowflake, Wind, Droplet, TrendingUp, BatteryCharging, ShieldCheck, IndianRupee, Activity, TrendingDown,
  Wallet, ChevronDown // Added Wallet icon and ChevronDown
} from 'lucide-react';
import {
  BookOpen,
} from 'lucide-react';
// Import recharts components
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';


// --- !!! IMPORTANT FIREBASE CONFIG !!! ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{"apiKey":"DEFAULT_API_KEY","authDomain":"DEFAULT_AUTH_DOMAIN","projectId":"DEFAULT_PROJECT_ID","storageBucket":"DEFAULT_STORAGE_BUCKET","messagingSenderId":"DEFAULT_SENDER_ID","appId":"DEFAULT_APP_ID"}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'solargrid-mvp-default';
// --- End of Config ---


// Initialize Firebase
function initializeFirebaseApp() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    setLogLevel('debug'); // Enable debug logging
    return { app, db, auth };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    // Check for specific initialization errors
    if (error.code === 'app/duplicate-app') {
      console.warn("Firebase app already initialized.");
      const app = getApp(); // Get the existing app
      const db = getFirestore(app);
      const auth = getAuth(app);
      return { app, db, auth };
    }
    // Handle other errors
    return { app: null, db: null, auth: null };
  }
}

// A simple seeded pseudo-random number generator
const seededRandom = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return next;
};

// --- Multi-Language (i18n) Setup ---
const translations = {
  en: {
    // Keys for SectorDetailView
    grid_node: "Grid Node",
    load: "Load",
    sector_map: "Sector Map",
    sector: "Sector",
    houses: "Houses",
    grid_nodes: "Grid Nodes",
    production: "Production",
    
    // NEW: Dashboard
    city_overview: "City Overview",
    total_grid_load: "Total Grid Load",
    total_production: "Total Production",
    surplus_deficit: "Surplus / Deficit",
    production_vs_consumption: "Production vs. Consumption",
    recent_market_activity: "Recent Market Activity",

    // NEW: Portfolio
    weather_forecast: "Weather Forecast",
    solar_health_prediction: "Solar Health Prediction",
    system_status: "System Status",
    efficiency: "Efficiency",
    next_maintenance: "Next Maintenance",
    all_systems_normal: "All systems normal",
    degraded_performance: "Degraded performance",
    in_3_months: "In 3 months",
    panel_lifespan: "Panel Lifespan",
    years_remaining: "Est. 18 Years Remaining",
    my_production: "My Production",

    // NEW: Marketplace
    price_history: "Price History",
    past_7_days: "Past 7 Days",
    past_1_month: "Past 1 Month",
    price_inr_kwh: "Price (INR/kWh)",
    total_inr: "Total (INR)",
    
    // NEW: Wallet
    wallet: "Wallet",
    deposit: "Deposit",
    withdraw: "Withdraw",
    current_balance: "Current Balance",
    recent_transactions: "Recent Transactions",
    transaction_type: "Type",
    transaction_amount: "Amount",
    transaction_date: "Date",
    transaction_status: "Status",
    status_completed: "Completed",
    status_pending: "Pending",
    amount_inr: "Amount (INR)",
    confirm_deposit: "Confirm Deposit",
    confirm_withdraw: "Confirm Withdraw",
    account: "Account",

    // Common App Keys
    dashboard: "Dashboard",
    live_map: "Live Map",
    portfolio: "Portfolio",
    marketplace: "Marketplace",
    settings: "Settings",
    help: "Help",
    logout: "Logout",
    language: "Language",
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    system: "System",
    notifications: "Notifications",
    profile: "Profile",
    search: "Search...",
    filter: "Filter",
    new_offer: "New Offer",
    my_assets: "My Assets",
    energy_production: "Energy Production",
    energy_consumption: "Energy Consumption",
    credits_earned: "Credits Earned",
    market_activity: "Market Activity",
    buy: "Buy",
    sell: "Sell",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    confirm_trade: "Confirm Trade",
    cancel: "Cancel",
    trade_successful: "Trade Successful",
    error_trade: "Error during trade",
    account_details: "Account Details",
    username: "Username",
    email: "Email",
    change_password: "Change Password",
    faq: "FAQ",
    contact_support: "Contact Support",
    documentation: "Documentation",
    github_repo: "GitHub Repository",
  },
  es: {
    // Keys for SectorDetailView
    grid_node: "Nodo de Red",
    load: "Carga",
    sector_map: "Mapa del Sector",
    sector: "Sector",
    houses: "Casas",
    grid_nodes: "Nodos de Red",
    production: "Producción",

    // NEW: Dashboard
    city_overview: "Vista de la Ciudad",
    total_grid_load: "Carga Total de la Red",
    total_production: "Producción Total",
    surplus_deficit: "Excedente / Déficit",
    production_vs_consumption: "Producción vs. Consumo",
    recent_market_activity: "Actividad Reciente del Mercado",

    // NEW: Portfolio
    weather_forecast: "Pronóstico del Tiempo",
    solar_health_prediction: "Predicción de Salud Solar",
    system_status: "Estado del Sistema",
    efficiency: "Eficiencia",
    next_maintenance: "Próximo Mantenimiento",
    all_systems_normal: "Todos los sistemas normales",
    degraded_performance: "Rendimiento degradado",
    in_3_months: "En 3 meses",
    panel_lifespan: "Vida Útil del Panel",
    years_remaining: "Est. 18 Años Restantes",
    my_production: "Mi Producción",

    // NEW: Marketplace
    price_history: "Historial de Precios",
    past_7_days: "Últimos 7 Días",
    past_1_month: "Último Mes",
    price_inr_kwh: "Precio (INR/kWh)",
    total_inr: "Total (INR)",
    
    // NEW: Wallet
    wallet: "Billetera",
    deposit: "Depositar",
    withdraw: "Retirar",
    current_balance: "Saldo Actual",
    recent_transactions: "Transacciones Recientes",
    transaction_type: "Tipo",
    transaction_amount: "Monto",
    transaction_date: "Fecha",
    transaction_status: "Estado",
    status_completed: "Completado",
    status_pending: "Pendiente",
    amount_inr: "Monto (INR)",
    confirm_deposit: "Confirmar Depósito",
    confirm_withdraw: "Confirmar Retiro",
    account: "Cuenta",

    // Common App Keys
    dashboard: "Tablero",
    live_map: "Mapa en Vivo",
    portfolio: "Portafolio",
    marketplace: "Mercado",
    settings: "Ajustes",
    help: "Ayuda",
    logout: "Cerrar Sesión",
    language: "Idioma",
    theme: "Tema",
    dark: "Oscuro",
    light: "Claro",
    system: "Sistema",
    notifications: "Notificaciones",
    profile: "Perfil",
    search: "Buscar...",
    filter: "Filtrar",
    new_offer: "Nueva Oferta",
    my_assets: "Mis Activos",
    energy_production: "Producción de Energía",
    energy_consumption: "Consumo de Energía",
    credits_earned: "Créditos Ganados",
    market_activity: "Actividad del Mercado",
    buy: "Comprar",
    sell: "Vender",
    price: "Precio",
    quantity: "Cantidad",
    total: "Total",
    confirm_trade: "Confirmar Intercambio",
    cancel: "Cancelar",
    trade_successful: "Intercambio Exitoso",
    error_trade: "Error during el intercambio",
    account_details: "Detalles de la Cuenta",
    username: "Nombre de Usuario",
    email: "Correo Electrónico",
    change_password: "Cambiar Contraseña",
    faq: "Preguntas Frecuentes",
    contact_support: "Contactar Soporte",
    documentation: "Documentación",
    github_repo: "Repositorio de GitHub",
  },
  hi: {
    // Keys for SectorDetailView
    grid_node: "ग्रिड नोड",
    load: "लोड",
    sector_map: "सेक्टर मानचित्र",
    sector: "सेक्टर",
    houses: "घर",
    grid_nodes: "ग्रिड नोड्स",
    production: "उत्पादन",

    // NEW: Dashboard
    city_overview: "शहर का अवलोकन",
    total_grid_load: "कुल ग्रिड लोड",
    total_production: "कुल उत्पादन",
    surplus_deficit: "अधिशेष / घाटा",
    production_vs_consumption: "उत्पादन बनाम खपत",
    recent_market_activity: "हाल की बाज़ार गतिविधि",

    // NEW: Portfolio
    weather_forecast: "मौसम पूर्वानुमान",
    solar_health_prediction: "सौर स्वास्थ्य भविष्यवाणी",
    system_status: "सिस्टम स्थिति",
    efficiency: "दक्षता",
    next_maintenance: "अगला रखरखाव",
    all_systems_normal: "सभी सिस्टम सामान्य हैं",
    degraded_performance: "प्रदर्शन खराब है",
    in_3_months: "3 महीने में",
    panel_lifespan: "पैनल का जीवनकाल",
    years_remaining: "अनुमानित 18 वर्ष शेष",
    my_production: "मेरा उत्पादन",

    // NEW: Marketplace
    price_history: "मूल्य इतिहास",
    past_7_days: "पिछले 7 दिन",
    past_1_month: "पिछला 1 महीना",
    price_inr_kwh: "कीमत (INR/kWh)",
    total_inr: "कुल (INR)",
    
    // NEW: Wallet
    wallet: "वॉलेट",
    deposit: "जमा करें",
    withdraw: "निकालें",
    current_balance: "वर्तमान शेष",
    recent_transactions: "हाल के लेनदेन",
    transaction_type: "प्रकार",
    transaction_amount: "राशि",
    transaction_date: "तारीख",
    transaction_status: "स्थिति",
    status_completed: "पूरा हुआ",
    status_pending: "लंबित",
    amount_inr: "राशि (INR)",
    confirm_deposit: "जमा की पुष्टि करें",
    confirm_withdraw: "निकासी की पुष्टि करें",
    account: "खाता",

    // Common App Keys
    dashboard: "डैशबोर्ड",
    live_map: "लाइव मैप",
    portfolio: "पोर्टफोलियो",
    marketplace: "बाज़ार",
    settings: "सेटिंग्स",
    help: "सहायता",
    logout: "लॉग आउट",
    language: "भाषा",
    theme: "थीम",
    dark: "डार्क",
    light: "लाइट",
    system: "सिस्टम",
    notifications: "सूचनाएं",
    profile: "प्रोफ़ाइल",
    search: "खोजें...",
    filter: "फ़िल्टर",
    new_offer: "नई पेशकश",
    my_assets: "मेरी संपत्ति",
    energy_production: "ऊर्जा उत्पादन",
    energy_consumption: "ऊर्जा की खपत",
    credits_earned: "अर्जित क्रेडिट",
    market_activity: "बाज़ार गतिविधि",
    buy: " खरीदें",
    sell: "बेचें",
    price: "कीमत",
    quantity: "मात्रा",
    total: "कुल",
    confirm_trade: "व्यापार की पुष्टि करें",
    cancel: "रद्द करें",
    trade_successful: "व्यापार सफल",
    error_trade: "व्यापार के दौरान त्रुटि",
    account_details: "खाता विवरण",
    username: "उपयोगकर्ता नाम",
    email: "ईमेल",
    change_password: "पासवर्ड बदलें",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    contact_support: "समर्थन से संपर्क करें",
    documentation: "दस्तावेज़ीकरण",
    github_repo: "गिटहब रिपोजिटरी",
  },
  bn: { // Bengali
    // Keys for SectorDetailView
    grid_node: "গ্রিড নোড",
    load: "লোড",
    sector_map: "সেক্টর ম্যাপ",
    sector: "সেক্টর",
    houses: "বাড়ি",
    grid_nodes: "গ্রিড নোড",
    production: "উৎপাদন",
    
    // Dashboard
    city_overview: "শহরের ওভারভিউ",
    total_grid_load: "মোট গ্রিড লোড",
    total_production: "মোট উৎপাদন",
    surplus_deficit: "উদ্বৃত্ত / ঘাটতি",
    production_vs_consumption: "উৎপাদন বনাম খরচ",
    recent_market_activity: "সাম্প্রতিক বাজারের কার্যকলাপ",

    // Portfolio
    weather_forecast: "আবহাওয়ার পূর্বাভাস",
    solar_health_prediction: "সোলার হেলথ প্রেডিকশন",
    my_production: "আমার উৎপাদন",

    // Marketplace
    price_history: "মূল্যের ইতিহাস",
    price_inr_kwh: "মূল্য (INR/kWh)",
    total_inr: "মোট (INR)",

    // NEW: Wallet
    wallet: "ওয়ালেট",
    deposit: "জমা",
    withdraw: "প্রত্যাহার",
    current_balance: "বর্তমান ব্যালেন্স",
    recent_transactions: "সাম্প্রতিক লেনদেন",
    transaction_type: "ধরন",
    transaction_amount: "পরিমাণ",
    transaction_date: "তারিখ",
    transaction_status: "স্ট্যাটাস",
    status_completed: "সম্পন্ন",
    status_pending: "মুলতুবি",
    amount_inr: "পরিমাণ (INR)",
    confirm_deposit: "জমা নিশ্চিত করুন",
    confirm_withdraw: "প্রত্যাহার নিশ্চিত করুন",
    account: "অ্যাকাউন্ট",

    // Common App Keys
    dashboard: "ড্যাশবোর্ড",
    live_map: "লাইভ ম্যাপ",
    portfolio: "পোর্টফোলিও",
    marketplace: "বাজার",
    settings: "সেটিংস",
    help: "সাহায্য",
    logout: "লগ আউট",
    language: "ভাষা",
    theme: "থিম",
    dark: "ডার্ক",
    light: "লাইট",
    system: "সিস্টেম",
    // ... other keys as needed
  },
  ta: { // Tamil
    // Keys for SectorDetailView
    grid_node: "கிரிட் நோடு",
    load: "சுமை",
    sector_map: "துறை வரைபடம்",
    sector: "துறை",
    houses: "வீடுகள்",
    grid_nodes: "கிரிட் முனைகள்",
    production: "உற்பத்தி",
    
    // Dashboard
    city_overview: "நகர மேலோட்டம்",
    total_grid_load: "மொத்த கிரிட் சுமை",
    total_production: "மொத்த உற்பத்தி",
    surplus_deficit: "உபரி / பற்றாக்குறை",
    production_vs_consumption: "உற்பத்தி vs. நுகர்வு",
    recent_market_activity: "சமீபத்திய சந்தை செயல்பாடு",

    // Portfolio
    weather_forecast: "வானிலை முன்னறிவிப்பு",
    solar_health_prediction: "சோலார் சுகாதார கணிப்பு",
    my_production: "எனது உற்பத்தி",

    // Marketplace
    price_history: "விலை வரலாறு",
    price_inr_kwh: "விலை (INR/kWh)",
    total_inr: "மொத்தம் (INR)",

    // NEW: Wallet
    wallet: "பணப்பை",
    deposit: "டெபாசிட்",
    withdraw: "திரும்பப் பெறு",
    current_balance: "தற்போதைய இருப்பு",
    recent_transactions: "சமீபத்திய பரிவர்த்தனைகள்",
    transaction_type: "வகை",
    transaction_amount: "தொகை",
    transaction_date: "தேதி",
    transaction_status: "நிலை",
    status_completed: "முடிந்தது",
    status_pending: "நிலுவையில்",
    amount_inr: "தொகை (INR)",
    confirm_deposit: "வைப்புத்தொகையை உறுதிப்படுத்தவும்",
    confirm_withdraw: "திரும்பப் பெறுவதை உறுதிப்படுத்தவும்",
    account: "கணக்கு",

    // Common App Keys
    dashboard: "டாஷ்போர்டு",
    live_map: "லைவ் மேப்",
    portfolio: "போர்ட்ஃபோலியோ",
    marketplace: "சந்தை",
    settings: "அமைப்புகள்",
    help: "உதவி",
    logout: "வெளியேறு",
    language: "மொழி",
    theme: "தீம்",
    dark: "டார்க்",
    light: "லைட்",
    system: "சிஸ்டம்",
    // ... other keys as needed
  },
  te: { // Telugu
    // Keys for SectorDetailView
    grid_node: "గ్రిడ్ నోడ్",
    load: "లోడ్",
    sector_map: "సెక్టార్ మ్యాప్",
    sector: "సెక్టార్",
    houses: "ఇళ్ళు",
    grid_nodes: "గ్రిడ్ నోడ్లు",
    production: "ఉత్పత్తి",
    
    // Dashboard
    city_overview: "నగర అవలోకనం",
    total_grid_load: "మొత్తం గ్రిడ్ లోడ్",
    total_production: "మొత్తం ఉత్పత్తి",
    surplus_deficit: "మిగులు / లోటు",
    production_vs_consumption: "ఉత్పత్తి vs. వినియోగం",
    recent_market_activity: "ఇటీవలి మార్కెట్ కార్యకలాపం",

    // Portfolio
    weather_forecast: "వాతావరణ సూచన",
    solar_health_prediction: "సోలార్ ఆరోగ్య సూచన",
    my_production: "నా ఉత్పత్తి",

    // Marketplace
    price_history: "ధర చరిత్ర",
    price_inr_kwh: "ధర (INR/kWh)",
    total_inr: "మొత్తం (INR)",

    // NEW: Wallet
    wallet: "వాలెట్",
    deposit: "డిపాజిట్",
    withdraw: "ఉపసంహరించు",
    current_balance: "ప్రస్తుత బ్యాలెన్స్",
    recent_transactions: "ఇటీవలి లావాదేవీలు",
    transaction_type: "రకం",
    transaction_amount: "మొత్తం",
    transaction_date: "తేదీ",
    transaction_status: "స్థితి",
    status_completed: "పూర్తయింది",
    status_pending: "పెండింగ్‌లో ఉంది",
    amount_inr: "మొత్తం (INR)",
    confirm_deposit: "డిపాజిట్‌ను నిర్ధారించండి",
    confirm_withdraw: "ఉపసంహరణను నిర్ధారించండి",
    account: "ఖాతా",

    // Common App Keys
    dashboard: "డాష్బోర్డ్",
    live_map: "లైవ్ మ్యాప్",
    portfolio: "పోర్ట్ఫోలియో",
    marketplace: "మార్కెట్",
    settings: "సెట్టింగులు",
    help: "సహాయం",
    logout: "లాగ్ అవుట్",
    language: "భాష",
    theme: "థీమ్",
    dark: "డార్క్",
    light: "లైట్",
    system: "సిస్టమ్",
    // ... other keys as needed
  }
};

// Full language names mapping
const languageNames = {
  en: "English",
  es: "Español",
  hi: "हिन्दी",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు"
};

// --- React App ---
const { app, db, auth } = initializeFirebaseApp();

// --- Contexts ---
const I18nContext = React.createContext();
const AuthContext = React.createContext();
const ThemeContext = React.createContext();

// --- Hooks ---

// i18n Hook
const useI18n = () => React.useContext(I18nContext);

// Auth Hook
const useAuth = () => React.useContext(AuthContext);

// Theme Hook
const useTheme = () => React.useContext(ThemeContext);

// --- Providers ---

// i18n Provider
const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  const t = (key, params = {}) => {
    let translation = translations[language]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    return translation;
  };
  
  const switchLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <I18nContext.Provider value={{ t, language, switchLanguage, availableLanguages: Object.keys(translations) }}>
      {children}
    </I18nContext.Provider>
  );
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not initialized.");
      setLoading(false);
      return;
    }
    
    const signIn = async () => {
      try {
        const authToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (authToken) {
          await signInWithCustomToken(auth, authToken);
        } else {
          console.warn("No auth token provided, signing in anonymously.");
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase auth sign-in error:", error);
      }
    };
    
    signIn();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserId(firebaseUser.uid);
      } else {
        setUser(null);
        setUserId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userId, loading, db, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Try to get saved theme from localStorage
    const savedTheme = null; // localStorage.getItem('theme'); - Disabled for sandbox
    return savedTheme || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('dark', 'light');
    root.classList.add(currentTheme);
    
    // try {
    //   localStorage.setItem('theme', theme);
    // } catch (e) {
    //   console.warn('localStorage not available. Theme settings will not be persisted.');
    // }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- Reusable UI Components ---

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg md:text-xl font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]}`}></div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="!p-1">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Page Components ---

// --- Dashboard ---
const CityOverview = () => {
  const { t } = useI18n();
  const production = 1.21; // GW
  const consumption = 0.89; // GW
  const surplus = production - consumption;
  const isSurplus = surplus > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('city_overview')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mock City Map */}
          <div className="flex-1 h-64 lg:h-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center p-4">
            <div className="w-full max-w-xs h-full p-2">
              <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full">
                {[...Array(9)].map((_, i) => {
                  const seed = i + 1; // Simple seed
                  const rand = seededRandom(seed);
                  const isSurplus = rand() > 0.4;
                  const isCenter = i === 4;

                  if (isCenter) {
                    return (
                      <div key={i} className="flex items-center justify-center bg-blue-200 dark:bg-blue-900/50 rounded-full animate-pulse">
                        <Zap className="h-6 w-6 text-blue-500" />
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      className={`rounded-lg ${isSurplus ? 'bg-green-200 dark:bg-green-900/50' : 'bg-red-200 dark:bg-red-900/50'} flex items-center justify-center text-xs font-medium ${isSurplus ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'} opacity-75`}
                    >
                      <span className="opacity-75">S-{i < 4 ? i + 1 : i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* City Stats */}
          <div className="lg:w-1/3 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">{t('total_production')}</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-200">{production} GW</p>
              </div>
              <Sun className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{t('total_grid_load')}</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-200">{consumption} GW</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
            <div className={`flex items-center justify-between p-4 rounded-lg ${isSurplus ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
              <div>
                <p className={`text-sm font-medium ${isSurplus ? 'text-blue-700 dark:text-blue-300' : 'text-yellow-700 dark:text-yellow-300'}`}>{t('surplus_deficit')}</p>
                <p className={`text-2xl font-semibold ${isSurplus ? 'text-blue-600 dark:text-blue-200' : 'text-yellow-600 dark:text-yellow-200'}`}>
                  {isSurplus ? '+' : ''}{surplus.toFixed(2)} GW
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${isSurplus ? 'text-blue-500' : 'text-yellow-500'}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const { t } = useI18n();
  
  // Data for recharts
  const prodConsData = useMemo(() => [
    { name: 'Mon', [t('production')]: 400, [t('energy_consumption')]: 500 },
    { name: 'Tue', [t('production')]: 500, [t('energy_consumption')]: 450 },
    { name: 'Wed', [t('production')]: 600, [t('energy_consumption')]: 550 },
    { name: 'Thu', [t('production')]: 800, [t('energy_consumption')]: 700 },
    { name: 'Fri', [t('production')]: 900, [t('energy_consumption')]: 750 },
    { name: 'Sat', [t('production')]: 700, [t('energy_consumption')]: 800 },
    { name: 'Sun', [t('production')]: 600, [t('energy_consumption')]: 700 },
  ], [t]);
  
  const recentTrades = [
    { id: 'T001', type: 'Buy', amount: '50 kWh', price: '₹7.50', time: '2m ago' },
    { id: 'T002', type: 'Sell', amount: '120 kWh', price: '₹8.10', time: '10m ago' },
    { id: 'T003', type: 'Buy', amount: '75 kWh', price: '₹7.65', time: '23m ago' },
  ];

  const kpiData = [
    { title: t('energy_production'), value: '1.21 GW', change: '+5.2%', icon: Sun, color: 'text-yellow-500' },
    { title: t('energy_consumption'), value: '890 MW', change: '+1.5%', icon: Zap, color: 'text-red-500' },
    { title: t('credits_earned'), value: '₹3,450', change: '+12.1%', icon: IndianRupee, color: 'text-green-500' },
    { title: t('market_activity'), value: '189 Trades', change: '-2.0%', icon: BarChart2, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
      
      {/* City Overview */}
      <CityOverview />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map(item => (
          <Card key={item.title}>
            <CardContent className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-opacity-20 ${item.color.replace('text-', 'bg-')}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                <p className={`text-sm ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('production_vs_consumption')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prodConsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.3} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(2px)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey={t('production')} stroke="#10b981" fillOpacity={1} fill="url(#colorProd)" />
                  <Area type="monotone" dataKey={t('energy_consumption')} stroke="#ef4444" fillOpacity={1} fill="url(#colorCons)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('recent_market_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 space-y-3 overflow-y-auto">
              {recentTrades.map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {trade.type === 'Buy' ? <TrendingUp className="h-5 w-5 text-green-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{trade.type} {trade.amount}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{trade.price} / kWh</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{trade.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Live Map Components ---

const SectorGridSquare = ({ sectorId, onSelect }) => {
  const { production, consumption, isSurplus } = useMemo(() => {
    const rand = seededRandom(sectorId);
    const prod = rand() * 100 + 50;
    const cons = rand() * 80 + 40;
    return {
      production: prod.toFixed(0),
      consumption: cons.toFixed(0),
      isSurplus: prod > cons,
    };
  }, [sectorId]);
  
  return (
    <div 
      className={`relative w-full aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300
                  border border-gray-300 dark:border-gray-700 
                  ${isSurplus ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50' 
                             : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'}
                  hover:scale-105 hover:shadow-lg`}
      onClick={() => onSelect(sectorId)}
    >
      <span className={`font-bold text-lg ${isSurplus ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
        {sectorId}
      </span>
      <span className={`absolute top-1 right-1 h-2 w-2 rounded-full ${isSurplus ? 'bg-green-500' : 'bg-red-500'}`}></span>
    </div>
  );
};

const SectorDetailView = ({ sectorId, onBack }) => {
  const { t } = useI18n();

  // Generate stable, deterministic positions for houses and nodes using the sectorId as a seed
  const { houses, nodes } = useMemo(() => {
    const rand = seededRandom(sectorId);
    const numHouses = Math.floor(rand() * 10) + 10; // 10-19 houses
    const numNodes = Math.floor(rand() * 3) + 2;   // 2-4 nodes
    
    const generateItems = (count, icon) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `${icon}-${i}`,
        x: Math.floor(rand() * 90) + 5, // % position (5-94)
        y: Math.floor(rand() * 90) + 5, // % position (5-94)
        production: (rand() * 5 + 2).toFixed(1), // kW
        load: (rand() * 3 + 0.5).toFixed(1), // kW
      }));
    };

    return {
      houses: generateItems(numHouses, 'house'),
      nodes: generateItems(numNodes, 'node'),
    };
  }, [sectorId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="!p-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('sector_map')}: {sectorId}
        </h1>
      </div>
      
      {/* Map Area */}
      <Card className="flex-1 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 opacity-50">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage:
                'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          ></div>
        </div>

        {/* Houses (Green Dots) */}
        {houses.map(house => (
          <div
            key={house.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${house.x}%`, top: `${house.y}%` }}
          >
            <div className="h-4 w-4 bg-green-500 rounded-full shadow-md border-2 border-white dark:border-gray-900"></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              <p className="font-bold">{t('house')}</p>
              <p>{t('production')}: {house.production} kW</p>
              <p>{t('load')}: {house.load} kW</p>
            </div>
          </div>
        ))}

        {/* Grid Nodes (Yellow Dots) */}
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="h-6 w-6 bg-yellow-400 rounded-full shadow-lg border-2 border-white dark:border-gray-900 animate-pulse"></div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white dark:bg-gray-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              <p className="font-bold">{t('grid_node')}</p>
              <p>{t('load')}: {node.load} kW</p>
            </div>
          </div>
        ))}
      </Card>

      {/* Stats */}
      <Card className="mt-4">
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('houses')}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{houses.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('grid_nodes')}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{nodes.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total {t('production')}</p>
            <p className="text-2xl font-semibold text-green-500">
              {houses.reduce((acc, h) => acc + parseFloat(h.production), 0).toFixed(1)} kW
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const LiveMap = () => {
  const { t } = useI18n();
  const [selectedSector, setSelectedSector] = useState(null);
  const totalSectors = 25; // 5x5 grid

  if (selectedSector) {
    return (
      <SectorDetailView 
        sectorId={selectedSector} 
        onBack={() => setSelectedSector(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('live_map')}</h1>
      <Card>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 md:gap-3 lg:gap-4">
            {Array.from({ length: totalSectors }, (_, i) => i + 1).map(sectorId => (
              <SectorGridSquare 
                key={sectorId} 
                sectorId={sectorId} 
                onSelect={setSelectedSector} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Portfolio ---

const WeatherWidget = () => {
  const { t } = useI18n();
  const forecast = [
    { day: 'Mon', icon: CloudSun, temp: '28°C' },
    { day: 'Tue', icon: Sun, temp: '30°C' },
    { day: 'Wed', icon: CloudRain, temp: '25°C' },
    { day: 'Thu', icon: CloudSun, temp: '27°C' },
    { day: 'Fri', icon: Sun, temp: '31°C' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('weather_forecast')}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center space-x-2">
        {forecast.map(item => (
          <div key={item.day} className="flex flex-col items-center flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.day}</p>
            <item.icon className="h-8 w-8 text-blue-500 my-1" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.temp}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const SolarHealthPrediction = () => {
  const { t } = useI18n();
  const status = 'normal'; // 'normal' or 'warning'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('solar_health_prediction')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('system_status')}</span>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status === 'normal' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
            {status === 'normal' ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
            <span className={`font-medium ${status === 'normal' ? 'text-green-600 dark:text-green-200' : 'text-yellow-600 dark:text-yellow-200'}`}>
              {status === 'normal' ? t('all_systems_normal') : t('degraded_performance')}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('efficiency')}</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">98.5%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('next_maintenance')}</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('in_3_months')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('panel_lifespan')}</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('years_remaining')}</span>
        </div>
      </CardContent>
    </Card>
  );
}


const Portfolio = () => {
  const { t } = useI18n();
  const assets = [
    { id: 'A001', type: 'Solar Panel', capacity: '5 kW', status: 'Online', icon: Sun, color: 'text-yellow-500' },
    { id: 'B002', type: 'Battery', capacity: '10 kWh', status: 'Charging', icon: BatteryCharging, color: 'text-blue-500' },
    { id: 'C003', type: 'Energy Credits', capacity: '1,250', status: 'Available', icon: IndianRupee, color: 'text-green-500' },
  ];
  
  const myProdData = [
    { name: 'Jan', kWh: 500 }, { name: 'Feb', kWh: 600 }, { name: 'Mar', kWh: 800 },
    { name: 'Apr', kWh: 700 }, { name: 'May', kWh: 900 }, { name: 'Jun', kWh: 800 },
    { name: 'Jul', kWh: 600 }, { name: 'Aug', kWh: 700 }, { name: 'Sep', kWh: 500 },
    { name: 'Oct', kWh: 800 }, { name: 'Nov', kWh: 900 }, { name: 'Dec', kWh: 1000 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('portfolio')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('my_assets')}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
                    <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Capacity/Amount</th>
                    <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr key={asset.id} className="border-b dark:border-gray-700 last:border-b-0">
                      <td className="p-2 text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <asset.icon className={`h-5 w-5 ${asset.color}`} />
                          <span>{asset.type}</span>
                        </div>
                      </td>
                      <td className="p-2 text-gray-900 dark:text-white">{asset.capacity}</td>
                      <td className="p-2 text-gray-900 dark:text-white">{asset.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('my_production')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={myProdData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorProdYellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.3} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        backdropFilter: 'blur(2px)',
                        border: 'none',
                        borderRadius: '0.5rem',
                      }}
                      itemStyle={{ color: '#1f2937' }}
                    />
                    <Area type="monotone" dataKey="kWh" stroke="#f59e0b" fillOpacity={1} fill="url(#colorProdYellow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <WeatherWidget />
          <SolarHealthPrediction />
        </div>
      </div>
    </div>
  );
};

// --- Marketplace ---

const PriceHistoryGraph = () => {
  const { t } = useI18n();
  const [timeframe, setTimeframe] = useState('7d'); // '7d' or '1m'
  
  const priceData = {
    '7d': [
      { name: 'Mon', price: 7.50 }, { name: 'Tue', price: 7.65 }, { name: 'Wed', price: 7.55 },
      { name: 'Thu', price: 7.80 }, { name: 'Fri', price: 7.75 }, { name: 'Sat', price: 8.00 },
      { name: 'Sun', price: 7.90 },
    ],
    '1m': [
      { name: 'W1', price: 7.20 }, { name: 'W2', price: 7.50 }, { name: 'W3', price: 7.80 }, { name: 'W4', price: 7.90 },
    ]
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
        <CardTitle>{t('price_history')}</CardTitle>
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mt-2 sm:mt-0">
          <Button 
            size="sm" 
            variant={timeframe === '7d' ? 'primary' : 'ghost'} 
            onClick={() => setTimeframe('7d')}
            className={`!py-1 ${timeframe === '7d' ? '' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {t('past_7_days')}
          </Button>
          <Button 
            size="sm" 
            variant={timeframe === '1m' ? 'primary' : 'ghost'} 
            onClick={() => setTimeframe('1m')}
            className={`!py-1 ${timeframe === '1m' ? '' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {t('past_1_month')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData[timeframe]} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis domain={['auto', 'auto']} stroke="#6b7280" fontSize={12} />
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.3} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  backdropFilter: 'blur(2px)',
                  border: 'none',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: '#1f2937' }}
                formatter={(value) => `₹${value.toFixed(2)}`}
              />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const Marketplace = () => {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'
  
  const openModal = (type) => {
    setTradeType(type);
    setIsModalOpen(true);
  };
  
  const offers = [
    { id: 'S001', type: 'Sell', price: '8.15', amount: '500 kWh', total: '4,075.00' },
    { id: 'B001', type: 'Buy', price: '8.10', amount: '1000 kWh', total: '8,100.00' },
    { id: 'S002', type: 'Sell', price: '8.20', amount: '200 kWh', total: '1,640.00' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('marketplace')}</h1>
        <Button onClick={() => openModal('sell')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('new_offer')}
        </Button>
      </div>
      
      <PriceHistoryGraph />
      
      <Card>
        <CardHeader>
          <CardTitle>{t('market_activity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('price_inr_kwh')}</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('total_inr')}</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer.id} className="border-b dark:border-gray-700 last:border-b-0">
                    <td className={`p-2 font-medium ${offer.type === 'Sell' ? 'text-red-500' : 'text-green-500'}`}>{offer.type}</td>
                    <td className="p-2 text-gray-900 dark:text-white">₹{offer.price}</td>
                    <td className="p-2 text-gray-900 dark:text-white">{offer.amount}</td>
                    <td className="p-2 text-gray-900 dark:text-white">₹{offer.total}</td>
                    <td className="p-2">
                      <Button size="sm" variant={offer.type === 'Sell' ? 'primary' : 'secondary'} onClick={() => openModal(offer.type === 'Sell' ? 'buy' : 'sell')}>
                        {offer.type === 'Sell' ? t('buy') : t('sell')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Trade Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={tradeType === 'buy' ? t('buy') : t('sell')}>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('price_inr_kwh')}</label>
            <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('quantity')} (kWh)</label>
            <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="pt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {t('total')}: ₹0.00
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary">{t('confirm_trade')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- NEW: Wallet Page ---
const WalletPage = () => {
  const { t } = useI18n();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  const currentBalance = "12,450.00"; // Mock balance
  
  const transactions = [
    { id: 'TX001', type: 'Deposit', amount: '₹5,000.00', date: '2025-10-28', status: 'Completed' },
    { id: 'TX002', type: 'Withdraw', amount: '₹1,500.00', date: '2025-10-25', status: 'Completed' },
    { id: 'TX003', type: 'Trade (Sell)', amount: '₹810.00', date: '2025-10-24', status: 'Completed' },
    { id: 'TX004', type: 'Trade (Buy)', amount: '-₹407.50', date: '2025-10-22', status: 'Completed' },
    { id: 'TX005', type: 'Deposit', amount: '₹10,000.00', date: '2025-10-20', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('wallet')}</h1>
      
      {/* Balance and Actions */}
      <Card>
        <CardContent className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('current_balance')}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">₹{currentBalance}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="primary" onClick={() => setIsDepositModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('deposit')}
            </Button>
            <Button variant="secondary" onClick={() => setIsWithdrawModalOpen(true)}>
              <TrendingDown className="h-4 w-4 mr-2" />
              {t('withdraw')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recent_transactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('transaction_type')}</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('transaction_amount')}</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('transaction_date')}</th>
                  <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('transaction_status')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b dark:border-gray-700 last:border-b-0">
                    <td className="p-2 text-gray-900 dark:text-white font-medium">{tx.type}</td>
                    <td className={`p-2 font-medium ${tx.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{tx.amount}</td>
                    <td className="p-2 text-gray-700 dark:text-gray-300">{tx.date}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200">
                        {t('status_completed')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Deposit Modal */}
      <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title={t('deposit')}>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount_inr')}</label>
            <input type="number" step="100" min="100" placeholder="e.g., 5000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will be redirected to a secure payment gateway to complete your transaction.
          </p>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsDepositModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary">{t('confirm_deposit')}</Button>
          </div>
        </form>
      </Modal>
      
      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} title={t('withdraw')}>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount_inr')}</label>
            <input type="number" step="100" min="100" placeholder="e.g., 1000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Account (Last 4 Digits)</label>
            <input type="text" value="... 1234" disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Funds will be transferred to your registered bank account within 2-3 business days.
          </p>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsWithdrawModalOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" variant="primary">{t('confirm_withdraw')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


// --- Settings ---
const SettingsPage = () => {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { language, switchLanguage, availableLanguages } = useI18n();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
      
      {/* Profile Settings */}
      <Card>
        <CardHeader><CardTitle>{t('profile')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('username')}</label>
            <input type="text" value="DemoUser" disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email')}</label>
            <input type="email" value="demo@solargrid.com" disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <Button variant="secondary">{t('change_password')}</Button>
        </CardContent>
      </Card>
      
      {/* Appearance Settings */}
      <Card>
        <CardHeader><CardTitle>{t('theme')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            {['light', 'dark', 'system'].map(t => (
              <Button
                key={t}
                variant={theme === t ? 'primary' : 'secondary'}
                onClick={() => setTheme(t)}
                className="capitalize"
              >
                {t === 'light' && <Sun className="h-4 w-4 mr-2" />}
                {t === 'dark' && <Moon className="h-4 w-4 mr-2" />}
                {t === 'system' && <Settings className="h-4 w-4 mr-2" />}
                {t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Language Settings */}
      <Card>
        <CardHeader><CardTitle>{t('language')}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {availableLanguages.map(lang => (
            <Button
              key={lang}
              variant={language === lang ? 'primary' : 'secondary'}
              onClick={() => switchLanguage(lang)}
              className="uppercase"
            >
              {lang}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// --- Help Page ---
const HelpPage = () => {
  const { t } = useI18n();
  const faqs = [
    { q: "What is the SolarGrid Exchange?", a: "It's a peer-to-peer energy trading platform for producers and consumers of solar energy." },
    { q: "How do I sell energy?", a: "Navigate to the Marketplace and create a 'New Offer' to sell your surplus energy credits." },
    { q: "What does the Live Map show?", a: "It shows a real-time overview of energy production and consumption across different grid sectors." },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('help')}</h1>
      
      {/* FAQ */}
      <Card>
        <CardHeader><CardTitle>{t('faq')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{faq.q}</h3>
              <p className="text-gray-700 dark:text-gray-300">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Links */}
      <Card>
        <CardHeader><CardTitle>More Info</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <a href="#" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
            <BookOpen className="h-5 w-5" />
            <span>{t('documentation')}</span>
          </a>
          <a href="#" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
            <Github className="h-5 w-5" />
            <span>{t('github_repo')}</span>
          </a>
          <a href="#" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
            <HelpCircle className="h-5 w-5" />
            <span>{t('contact_support')}</span>
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Main App Layout ---

const Sidebar = ({ currentPage, setCurrentPage, isSidebarOpen, setIsSidebarOpen }) => {
  const { t } = useI18n();
  const navItems = [
    { name: t('dashboard'), icon: BarChart2, page: 'dashboard' },
    { name: t('live_map'), icon: Map, page: 'live_map' },
    { name: t('portfolio'), icon: Briefcase, page: 'portfolio' },
    { name: t('marketplace'), icon: IndianRupee, page: 'marketplace' },
    { name: t('wallet'), icon: Wallet, page: 'wallet' }, // Added Wallet
  ];
  
  const bottomNavItems = [
    { name: t('settings'), icon: Settings, page: 'settings' },
    { name: t('help'), icon: HelpCircle, page: 'help' },
  ];

  const sidebarClasses = `
    absolute md:relative z-20 h-full w-64
    bg-gray-100 dark:bg-gray-900
    flex flex-col p-4 
    transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;
  
  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SolarGrid</h1>
        </div>
        <Button variant="ghost" className="md:hidden !p-1" onClick={() => setIsSidebarOpen(false)}>
          <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </Button>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => {
              setCurrentPage(item.page);
              setIsSidebarOpen(false);
            }}
            className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left transition-colors ${
              currentPage === item.page
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      
      <div className="space-y-2">
        {bottomNavItems.map(item => (
          <button
            key={item.page}
            onClick={() => {
              setCurrentPage(item.page);
              setIsSidebarOpen(false);
            }}
            className={`flex items-center space-x-3 p-2 rounded-lg w-full text-left transition-colors ${
              currentPage === item.page
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
         {/* Logout button removed from here and added to TopHeader account dropdown */}
      </div>
    </aside>
  );
};

const TopHeader = ({ onMenuClick, setCurrentPage }) => {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { language, switchLanguage, availableLanguages } = useI18n();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  const toggleTheme = () => {
    // Determine the effective current theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = theme === 'system' ? systemTheme : theme;
    
    // Toggle to the opposite
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  const handleLangChange = (e) => {
    switchLanguage(e.target.value);
  }

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuRef]);

  return (
    <header className="h-16 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" className="md:hidden !p-2" onClick={onMenuClick}>
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </Button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('search') + '...'}
            className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Language Switcher */}
        <div className="relative">
          <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
          <select 
            value={language} 
            onChange={handleLangChange}
            className="pl-8 pr-8 py-2 appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang} className="dark:bg-gray-800">
                {languageNames[lang] || lang.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        {/* Theme Toggle */}
        <Button variant="ghost" className="!p-2" onClick={toggleTheme}>
          {(() => {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const currentTheme = theme === 'system' ? systemTheme : theme;
            return currentTheme === 'dark' ? (
              <Sun className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            );
          })()}
        </Button>

        {/* --- NEW: Wallet Button --- */}
        <Button variant="ghost" className="!p-2" onClick={() => setCurrentPage('wallet')}>
          <Wallet className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </Button>

        <Button variant="ghost" className="!p-2">
          <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </Button>

        {/* Account Dropdown */}
        <div className="relative" ref={accountMenuRef}>
          <Button variant="ghost" className="!p-2" onClick={() => setIsAccountMenuOpen(prev => !prev)}>
            <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </Button>

          {isAccountMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 overflow-hidden border dark:border-gray-700">
              <button
                onClick={() => {
                  setCurrentPage('settings');
                  setIsAccountMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="h-4 w-4" />
                <span>{t('profile')}</span>
              </button>
              <button
                onClick={() => {
                  setCurrentPage('wallet');
                  setIsAccountMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Wallet className="h-4 w-4" />
                <span>{t('wallet')}</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <button
                onClick={() => {
                  // Add logout logic here later if needed
                  console.log("Logout clicked");
                  setIsAccountMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Main App Layout
const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default to dashboard to show new graphs
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loading, userId } = useAuth();
  const { t } = useI18n();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'live_map':
        return <LiveMap />;
      case 'portfolio':
        return <Portfolio />;
      case 'marketplace':
        return <Marketplace />;
      case 'wallet': // Added Wallet page
        return <WalletPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <Dashboard />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-2 text-blue-500">
          <Spinner size="lg" />
          <span className="text-lg font-semibold">Loading SolarGrid...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-200 dark:bg-gray-950">
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} setCurrentPage={setCurrentPage} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 h-full">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

// Root App Component
function App() {
  if (!app || !db || !auth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <span className="text-lg font-semibold text-red-500">Firebase Initialization Failed.</span>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;



