export interface NewTranslations {
  hero: {
    title: string;
    tagline: string;
    subheadline: string;
    bodyText: string;
    bodyHighlight: string;
    bodyText2: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustBadge1: string;
    trustBadge2: string;
  };
  industries: {
    title: string;
    subtitle: string;
    subtitleHighlight: string;
    viewAll: string;
    categories: {
      home: { title: string; services: string[] };
      logistics: { title: string; services: string[] };
      wellness: { title: string; services: string[] };
      professional: { title: string; services: string[] };
      tech: { title: string; services: string[] };
    };
    servicesCount: string;
  };
  about: {
    hero: {
      title: string;
      subtitle: string;
    };
    story: {
      title: string;
      text1: string;
      highlight: string;
      text2: string;
    };
    values: {
      title: string;
      items: {
        privacy: { title: string; description: string };
        human: { title: string; description: string };
        reliability: { title: string; description: string };
        efficiency: { title: string; description: string };
        growth: { title: string; description: string };
      };
    };
    mission: {
      title: string;
      text1: string;
      highlight: string;
      text2: string;
    };
    vision: {
      title: string;
      text1: string;
      highlight: string;
      text2: string;
      text3: string;
      listTitle: string;
      points: string[];
    };
    commitment: {
      title: string;
      text1: string;
      highlight: string;
    };
  };
  careers: {
    hero: {
      title: string;
      subtitle: string;
      subtitleHighlight: string;
    };
    about: {
      title: string;
      text1: string;
      highlight: string;
      text2: string;
    };
    benefits: {
      title: string;
      list: string[];
    };
    opportunities: {
      title: string;
      subtitle: string;
      subtitleHighlight: string;
      cta: string;
      departments: string[];
    };
    culture: {
      title: string;
      quote: string;
      quoteHighlight: string;
    };
  };
  faq: {
    title: string;
    subtitle: string;
    questions: Array<{ question: string; answer: string }>;
    sidebar: {
      legal: {
        title: string;
        links: Array<{ label: string; href: string }>;
      };
      features: {
        title: string;
        items: Array<{ title: string; description: string }>;
      };
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    planTypes: {
      student: string;
      personal: string;
      business: string;
    };
    loading: string;
    perMonth: string;
    offFirstMonths: string;
    dayTrial: string;
    refundGuarantee: string;
    getStarted: string;
    contactUs: string;
    inviteOnly: string;
    inviteOnlyBadge: string;
    custom: string;
    tailoredPricing: string;
    features: {
      [key: string]: string;
    };
    taglines: {
      [key: string]: string;
    };
    descriptions: {
      [key: string]: string;
    };
    planNames: {
      [key: string]: string;
    };
  };
  contact: {
    directory: {
      title: string;
      generalInquiries: { label: string; email: string };
      supportTechnical: { label: string; email: string };
      mediaPartnerships: { label: string; email: string };
      legalCompliance: { label: string; email: string };
    };
    offices: {
      title: string;
      florida: { label: string; address: string };
      uae: { label: string; address: string };
    };
  };
}

export const newTranslations: Record<string, NewTranslations> = {
  en: {
    hero: {
      title: "Atenra",
      tagline: "Your Personal & Business Assistant, On Demand",
      subheadline: "Discover trusted professionals through intelligent matching — where technology meets genuine human insight.",
      bodyText: "At Atenra, every connection is",
      bodyHighlight: "hand-verified, thoughtfully matched, and designed to make your life easier",
      bodyText2: " Whether it's managing your business, your home, or your next big project — we connect you with professionals who deliver results.",
      ctaPrimary: "Get Started",
      ctaSecondary: "Partner With Us",
      trustBadge1: "1000+ Verified Professionals",
      trustBadge2: "20+ Service Categories"
    },
    industries: {
      title: "Industries We Serve",
      subtitle: "Connect with verified professionals across multiple industries",
      subtitleHighlight: "verified professionals",
      viewAll: "View all services",
      categories: {
        home: {
          title: "Home & Maintenance",
          services: ["Plumbing", "Electrical", "Carpentry", "Landscaping", "Renovation"]
        },
        logistics: {
          title: "Logistics & Transport",
          services: ["Moving", "Courier", "Freight", "Auto Transport", "Storage"]
        },
        wellness: {
          title: "Wellness & Health",
          services: ["Fitness", "Therapy", "Nutrition", "Home Care", "Spa & Recovery"]
        },
        professional: {
          title: "Professional Services",
          services: ["Accounting", "Legal", "Consulting", "Marketing", "Administrative Support"]
        },
        tech: {
          title: "Tech & Creative",
          services: ["Web Development", "Design", "Photography", "IT Services", "Software Solutions"]
        }
      },
      servicesCount: "services"
    },
    about: {
      hero: {
        title: "About Atenra",
        subtitle: "The human-first platform for trusted service discovery."
      },
      story: {
        title: "Our Story",
        text1: "Atenra was born from the frustration of endless searching and uncertainty when finding reliable help. We set out to simplify that — creating a platform where",
        highlight: "technology enhances, not replaces, human connection",
        text2: "Today, we're redefining how people and businesses find trusted professionals, one curated match at a time."
      },
      values: {
        title: "What We Stand For",
        items: {
          privacy: { title: "Privacy First", description: "Your data stays yours. Always." },
          human: { title: "Human Insight", description: "Real people guiding every match." },
          reliability: { title: "Reliability", description: "Consistent quality you can depend on." },
          efficiency: { title: "Efficiency", description: "Results delivered in minutes, not days." },
          growth: { title: "Growth", description: "Your success unlocks ours." }
        }
      },
      mission: {
        title: "Our Mission",
        text1: "Atenra exists to bridge people with professionals they can trust. We combine",
        highlight: "cutting-edge technology with genuine human judgment",
        text2: "to create meaningful matches — guided by privacy, integrity, and results."
      },
      vision: {
        title: "Our Vision",
        text1: "Atenra was built on one principle — that",
        highlight: "real connection creates better outcomes",
        text2: "Our vision is to redefine how people and businesses find reliable help by blending intelligent systems with genuine human understanding.",
        text3: "We believe technology should simplify decisions, not replace trust. Every service, every match, and every partnership is built around transparency, efficiency, and measurable results.",
        listTitle: "We're creating a world where:",
        points: [
          "Finding help is effortless — Powered by smart tools and human guidance",
          "Privacy is standard, not optional",
          "Every interaction builds confidence, not confusion",
          "Growth is mutual — When our users succeed, so do we"
        ]
      },
      commitment: {
        title: "Our Commitment",
        text1: "We're not just developing tools; we're building frameworks that evolve with you. As we grow, Atenra's commitment remains the same — to keep",
        highlight: "every connection meaningful, every process transparent, and every result measurable"
      }
    },
    careers: {
      hero: {
        title: "Join Our Team",
        subtitle: "Grow with a company built on trust, technology, and people.",
        subtitleHighlight: "trust, technology, and people"
      },
      about: {
        title: "About Working at Atenra",
        text1: "Atenra is redefining how people connect with professionals — and that starts with the team behind it. We believe in",
        highlight: "growth, inclusion, and meaningful work",
        text2: "that empowers people globally. Whether you're into operations, design, marketing, or client success — there's a place for you here."
      },
      benefits: {
        title: "What We Offer",
        list: [
          "Remote-first flexibility",
          "Transparent growth paths",
          "Inclusive and collaborative culture",
          "Technology-driven learning environment",
          "Competitive pay and benefits"
        ]
      },
      opportunities: {
        title: "Explore Opportunities",
        subtitle: "Join a mission-driven team that's modernizing service connections worldwide.",
        subtitleHighlight: "mission-driven team",
        cta: "Explore Career Opportunities",
        departments: [
          "Operations & Client Support",
          "Marketing & Partnerships",
          "Engineering & AI Development",
          "Product & UX Design",
          "Legal & Compliance"
        ]
      },
      culture: {
        title: "Team Culture",
        quote: "We don't just offer jobs — we create careers that empower autonomy, purpose, and innovation.",
        quoteHighlight: "autonomy, purpose, and innovation"
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about Atenra",
      questions: [
        {
          question: "How does Atenra's matching process work?",
          answer: "We analyze your request, verify professionals in real time, then combine human insight and AI to find the ideal match."
        },
        {
          question: "How quickly will I be matched?",
          answer: "Usually within minutes, depending on service type and location."
        },
        {
          question: "What makes Atenra different?",
          answer: "Every match is human-reviewed, privacy-protected, and focused on long-term trust."
        },
        {
          question: "What if I'm not satisfied?",
          answer: "We'll reassess, reassign, or refund — depending on your plan."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes — we use full encryption, internal-only handling, and never sell data."
        }
      ],
      sidebar: {
        legal: {
          title: "Legal & Privacy",
          links: [
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Refund / Guarantee Policy", href: "/refund" },
            { label: "Business Agreement", href: "/business" }
          ]
        },
        features: {
          title: "Features",
          items: [
            { title: "UAE HQ", description: "for maximum privacy" },
            { title: "Zero data trading/selling", description: "Your data stays yours" },
            { title: "Secure global 2FA", description: "Multi-layer protection" }
          ]
        }
      }
    },
    pricing: {
      title: "Choose Your Plan",
      subtitle: "Transparent pricing for everyone",
      planTypes: {
        student: "Student",
        personal: "Personal",
        business: "Business"
      },
      loading: "Loading plans...",
      perMonth: "/month",
      offFirstMonths: "% off first {months} months",
      dayTrial: "-day trial",
      refundGuarantee: "Pro-rata refund guarantee",
      getStarted: "Get Started",
      contactUs: "Contact Us",
      inviteOnly: "Invite only",
      inviteOnlyBadge: "Invite Only",
      custom: "Custom",
      tailoredPricing: "Tailored pricing based on your needs",
      features: {
        "24/7 concierge lifestyle": "24/7 concierge lifestyle",
        "Global travel/event support": "Global travel/event support",
        "Bespoke management teams": "Bespoke management teams",
        "Save on essentials (food, rides)": "Save on essentials (food, rides)",
        "Study & finance tools": "Study & finance tools",
        "Simplified planning and reminders": "Simplified planning and reminders",
        "Daily task support": "Daily task support",
        "Smart reminders": "Smart reminders",
        "Personal planning": "Personal planning",
        "Everything in Basic": "Everything in Basic",
        "Faster response, personal assistance": "Faster response, personal assistance",
        "Adaptive automations": "Adaptive automations",
        "Verified provider listing": "Verified provider listing",
        "Client referral dashboard": "Client referral dashboard",
        "Analytics + support": "Analytics + support",
        "Dedicated Atenra agent": "Dedicated Atenra agent",
        "On-demand support team": "On-demand support team",
        "Concierge-level access": "Concierge-level access"
      },
      taglines: {
        "A world of possibilities, crafted just for you.": "A world of possibilities, crafted just for you.",
        "Built For: Students on a budget": "Built For: Students on a budget",
        "Built For: Everyday individuals, freelancers, or part-timers": "Built For: Everyday individuals, freelancers, or part-timers",
        "Built For: Families and busy professionals": "Built For: Families and busy professionals",
        "Built For: All businesses": "Built For: All businesses",
        "Built For: Executives and high achievers": "Built For: Executives and high achievers"
      },
      descriptions: {
        "Built For: Discerning individuals and institutions": "Built For: Discerning individuals and institutions",
        "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.": "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.",
        "Perfect for individuals who want a helping hand with life's little tasks.": "Perfect for individuals who want a helping hand with life's little tasks.",
        "This is the upgrade for people ready to take convenience to the next level.": "This is the upgrade for people ready to take convenience to the next level.",
        "Imagine a solid step up in convenience, week after week.": "Imagine a solid step up in convenience, week after week."
      },
      planNames: {
        "☐☐☐ Plan": "☐☐☐ Plan",
        "Student Plan": "Student Plan",
        "Basic Plan": "Basic Plan",
        "Premium Plan": "Premium Plan",
        "Premium Business Partnership": "Premium Business Partnership",
        "Royal Plan": "Royal Plan"
      }
    },
    contact: {
      directory: {
        title: "Contact Directory",
        generalInquiries: { label: "General Inquiries", email: "info@atenra.com" },
        supportTechnical: { label: "Support & Technical", email: "it@atenra.com" },
        mediaPartnerships: { label: "Media & Partnerships", email: "contact@atenra.com" },
        legalCompliance: { label: "Legal & Compliance", email: "legal@atenra.com" }
      },
      offices: {
        title: "Office Locations",
        florida: { label: "Florida", address: "8430 Bird Rd, Miami, FL 33155, USA" },
        uae: { label: "U.A.E", address: "Coming Soon" }
      }
    }
  },
  es: {
    hero: {
      title: "Atenra",
      tagline: "Tu Asistente Personal y Empresarial, A Demanda",
      subheadline: "Descubre profesionales de confianza a través de coincidencias inteligentes — donde la tecnología se encuentra con la perspicacia humana genuina.",
      bodyText: "En Atenra, cada conexión está",
      bodyHighlight: "verificada manualmente, cuidadosamente emparejada y diseñada para facilitar tu vida",
      bodyText2: " Ya sea administrando tu negocio, tu hogar o tu próximo gran proyecto — te conectamos con profesionales que entregan resultados.",
      ctaPrimary: "Comenzar",
      ctaSecondary: "Asóciate Con Nosotros",
      trustBadge1: "1000+ Profesionales Verificados",
      trustBadge2: "20+ Categorías de Servicios"
    },
    industries: {
      title: "Industrias que Servimos",
      subtitle: "Conéctate con profesionales verificados en múltiples industrias",
      subtitleHighlight: "profesionales verificados",
      viewAll: "Ver todos los servicios",
      categories: {
        home: {
          title: "Hogar y Mantenimiento",
          services: ["Plomería", "Eléctrico", "Carpintería", "Jardinería", "Renovación"]
        },
        logistics: {
          title: "Logística y Transporte",
          services: ["Mudanzas", "Mensajería", "Carga", "Transporte de Autos", "Almacenamiento"]
        },
        wellness: {
          title: "Bienestar y Salud",
          services: ["Fitness", "Terapia", "Nutrición", "Cuidado en Casa", "Spa y Recuperación"]
        },
        professional: {
          title: "Servicios Profesionales",
          services: ["Contabilidad", "Legal", "Consultoría", "Marketing", "Soporte Administrativo"]
        },
        tech: {
          title: "Tecnología y Creatividad",
          services: ["Desarrollo Web", "Diseño", "Fotografía", "Servicios TI", "Soluciones de Software"]
        }
      },
      servicesCount: "servicios"
    },
    about: {
      hero: {
        title: "Acerca de Atenra",
        subtitle: "La plataforma centrada en humanos para el descubrimiento de servicios confiables."
      },
      story: {
        title: "Nuestra Historia",
        text1: "Atenra nació de la frustración de búsquedas interminables e incertidumbre al encontrar ayuda confiable. Nos propusimos simplificar eso — creando una plataforma donde",
        highlight: "la tecnología mejora, no reemplaza, la conexión humana",
        text2: "Hoy, estamos redefiniendo cómo las personas y empresas encuentran profesionales de confianza, una coincidencia curada a la vez."
      },
      values: {
        title: "Lo Que Defendemos",
        items: {
          privacy: { title: "Privacidad Primero", description: "Tus datos son tuyos. Siempre." },
          human: { title: "Perspicacia Humana", description: "Personas reales guiando cada coincidencia." },
          reliability: { title: "Confiabilidad", description: "Calidad consistente en la que puedes confiar." },
          efficiency: { title: "Eficiencia", description: "Resultados entregados en minutos, no días." },
          growth: { title: "Crecimiento", description: "Tu éxito desbloquea el nuestro." }
        }
      },
      mission: {
        title: "Nuestra Misión",
        text1: "Atenra existe para conectar a las personas con profesionales en los que pueden confiar. Combinamos",
        highlight: "tecnología de vanguardia con juicio humano genuino",
        text2: "para crear coincidencias significativas — guiadas por privacidad, integridad y resultados."
      },
      vision: {
        title: "Nuestra Visión",
        text1: "Atenra se construyó sobre un principio — que",
        highlight: "la conexión real crea mejores resultados",
        text2: "Nuestra visión es redefinir cómo las personas y empresas encuentran ayuda confiable mezclando sistemas inteligentes con comprensión humana genuina.",
        text3: "Creemos que la tecnología debe simplificar decisiones, no reemplazar la confianza. Cada servicio, cada coincidencia y cada asociación se construye alrededor de transparencia, eficiencia y resultados medibles.",
        listTitle: "Estamos creando un mundo donde:",
        points: [
          "Encontrar ayuda es sin esfuerzo — Impulsado por herramientas inteligentes y guía humana",
          "La privacidad es estándar, no opcional",
          "Cada interacción genera confianza, no confusión",
          "El crecimiento es mutuo — Cuando nuestros usuarios tienen éxito, nosotros también"
        ]
      },
      commitment: {
        title: "Nuestro Compromiso",
        text1: "No solo estamos desarrollando herramientas; estamos construyendo marcos que evolucionan contigo. A medida que crecemos, el compromiso de Atenra sigue siendo el mismo — mantener",
        highlight: "cada conexión significativa, cada proceso transparente y cada resultado medible"
      }
    },
    careers: {
      hero: {
        title: "Únete a Nuestro Equipo",
        subtitle: "Crece con una empresa construida sobre confianza, tecnología y personas.",
        subtitleHighlight: "confianza, tecnología y personas"
      },
      about: {
        title: "Sobre Trabajar en Atenra",
        text1: "Atenra está redefiniendo cómo las personas se conectan con profesionales — y eso comienza con el equipo detrás de ella. Creemos en",
        highlight: "crecimiento, inclusión y trabajo significativo",
        text2: "que empodera a las personas globalmente. Ya sea que te interese operaciones, diseño, marketing o éxito del cliente — hay un lugar para ti aquí."
      },
      benefits: {
        title: "Lo Que Ofrecemos",
        list: [
          "Flexibilidad remota primero",
          "Caminos de crecimiento transparentes",
          "Cultura inclusiva y colaborativa",
          "Ambiente de aprendizaje impulsado por tecnología",
          "Pago y beneficios competitivos"
        ]
      },
      opportunities: {
        title: "Explora Oportunidades",
        subtitle: "Únete a un equipo impulsado por la misión que está modernizando las conexiones de servicios en todo el mundo.",
        subtitleHighlight: "equipo impulsado por la misión",
        cta: "Explorar Oportunidades de Carrera",
        departments: [
          "Operaciones y Soporte al Cliente",
          "Marketing y Asociaciones",
          "Ingeniería y Desarrollo de IA",
          "Producto y Diseño UX",
          "Legal y Cumplimiento"
        ]
      },
      culture: {
        title: "Cultura de Equipo",
        quote: "No solo ofrecemos empleos — creamos carreras que empoderan la autonomía, el propósito y la innovación.",
        quoteHighlight: "autonomía, propósito e innovación"
      }
    },
    faq: {
      title: "Preguntas Frecuentes",
      subtitle: "Encuentra respuestas a preguntas comunes sobre Atenra",
      questions: [
        {
          question: "¿Cómo funciona el proceso de coincidencia de Atenra?",
          answer: "Analizamos tu solicitud, verificamos profesionales en tiempo real, luego combinamos perspicacia humana e IA para encontrar la coincidencia ideal."
        },
        {
          question: "¿Qué tan rápido seré emparejado?",
          answer: "Generalmente en minutos, dependiendo del tipo de servicio y ubicación."
        },
        {
          question: "¿Qué hace diferente a Atenra?",
          answer: "Cada coincidencia es revisada por humanos, protegida por privacidad y enfocada en confianza a largo plazo."
        },
        {
          question: "¿Qué pasa si no estoy satisfecho?",
          answer: "Reevaluaremos, reasignaremos o reembolsaremos — dependiendo de tu plan."
        },
        {
          question: "¿Mi información personal está segura?",
          answer: "Sí — usamos encriptación completa, manejo solo interno y nunca vendemos datos."
        }
      ],
      sidebar: {
        legal: {
          title: "Legal y Privacidad",
          links: [
            { label: "Términos de Servicio", href: "/terms" },
            { label: "Política de Privacidad", href: "/privacy" },
            { label: "Política de Reembolso / Garantía", href: "/refund" },
            { label: "Acuerdo Empresarial", href: "/business" }
          ]
        },
        features: {
          title: "Características",
          items: [
            { title: "Sede en EAU", description: "para máxima privacidad" },
            { title: "Cero comercio/venta de datos", description: "Tus datos son tuyos" },
            { title: "2FA global seguro", description: "Protección multicapa" }
          ]
        }
      }
    },
    pricing: {
      title: "Elige Tu Plan",
      subtitle: "Precios transparentes para todos",
      planTypes: {
        student: "Estudiante",
        personal: "Personal",
        business: "Empresarial"
      },
      loading: "Cargando planes...",
      perMonth: "/mes",
      offFirstMonths: "% de descuento los primeros {months} meses",
      dayTrial: "-días de prueba",
      refundGuarantee: "Garantía de reembolso prorrateado",
      getStarted: "Comenzar",
      contactUs: "Contáctenos",
      inviteOnly: "Solo por invitación",
      inviteOnlyBadge: "Solo por Invitación",
      custom: "Personalizado",
      tailoredPricing: "Precio personalizado según sus necesidades",
      features: {
        "24/7 concierge lifestyle": "Estilo de vida con conserje 24/7",
        "Global travel/event support": "Soporte global de viajes/eventos",
        "Bespoke management teams": "Equipos de gestión personalizados",
        "Save on essentials (food, rides)": "Ahorra en esenciales (comida, transporte)",
        "Study & finance tools": "Herramientas de estudio y finanzas",
        "Simplified planning and reminders": "Planificación simplificada y recordatorios",
        "Daily task support": "Soporte de tareas diarias",
        "Smart reminders": "Recordatorios inteligentes",
        "Personal planning": "Planificación personal",
        "Everything in Basic": "Todo en Básico",
        "Faster response, personal assistance": "Respuesta más rápida, asistencia personal",
        "Adaptive automations": "Automatizaciones adaptativas",
        "Verified provider listing": "Lista de proveedores verificados",
        "Client referral dashboard": "Panel de referencias de clientes",
        "Analytics + support": "Análisis + soporte",
        "Dedicated Atenra agent": "Agente Atenra dedicado",
        "On-demand support team": "Equipo de soporte a demanda",
        "Concierge-level access": "Acceso nivel conserje"
      },
      taglines: {
        "A world of possibilities, crafted just for you.": "Un mundo de posibilidades, diseñado solo para ti.",
        "Built For: Students on a budget": "Diseñado Para: Estudiantes con presupuesto limitado",
        "Built For: Everyday individuals, freelancers, or part-timers": "Diseñado Para: Individuos cotidianos, freelancers o trabajadores a tiempo parcial",
        "Built For: Families and busy professionals": "Diseñado Para: Familias y profesionales ocupados",
        "Built For: All businesses": "Diseñado Para: Todo tipo de empresas",
        "Built For: Executives and high achievers": "Diseñado Para: Ejecutivos y alto rendimiento"
      },
      descriptions: {
        "Built For: Discerning individuals and institutions": "Diseñado Para: Individuos e instituciones exigentes",
        "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.": "Únase a nuestra red exclusiva de proveedores de servicios verificados. Comience con nuestra prueba sin riesgo de 3 meses.",
        "Perfect for individuals who want a helping hand with life's little tasks.": "Perfecto para individuos que quieren una mano amiga con las pequeñas tareas de la vida.",
        "This is the upgrade for people ready to take convenience to the next level.": "Esta es la actualización para personas listas para llevar la conveniencia al siguiente nivel.",
        "Imagine a solid step up in convenience, week after week.": "Imagina un paso sólido en conveniencia, semana tras semana."
      },
      planNames: {
        "☐☐☐ Plan": "Plan ☐☐☐",
        "Student Plan": "Plan Estudiante",
        "Basic Plan": "Plan Básico",
        "Premium Plan": "Plan Premium",
        "Premium Business Partnership": "Asociación Empresarial Premium",
        "Royal Plan": "Plan Royal"
      }
    },
    contact: {
      directory: {
        title: "Directorio de Contacto",
        generalInquiries: { label: "Consultas Generales", email: "info@atenra.com" },
        supportTechnical: { label: "Soporte y Técnico", email: "it@atenra.com" },
        mediaPartnerships: { label: "Medios y Asociaciones", email: "contact@atenra.com" },
        legalCompliance: { label: "Legal y Cumplimiento", email: "legal@atenra.com" }
      },
      offices: {
        title: "Ubicaciones de Oficinas",
        florida: { label: "Florida", address: "8430 Bird Rd, Miami, FL 33155, USA" },
        uae: { label: "E.A.U", address: "Próximamente" }
      }
    }
  },
  fr: {
    hero: {
      title: "Atenra",
      tagline: "Votre Assistant Personnel et Professionnel, À la Demande",
      subheadline: "Découvrez des professionnels de confiance grâce à une correspondance intelligente — où la technologie rencontre une véritable perspicacité humaine.",
      bodyText: "Chez Atenra, chaque connexion est",
      bodyHighlight: "vérifiée manuellement, soigneusement appariée et conçue pour vous faciliter la vie",
      bodyText2: " Que ce soit pour gérer votre entreprise, votre maison ou votre prochain grand projet — nous vous connectons avec des professionnels qui livrent des résultats.",
      ctaPrimary: "Commencer",
      ctaSecondary: "Devenez Partenaire",
      trustBadge1: "1000+ Professionnels Vérifiés",
      trustBadge2: "20+ Catégories de Services"
    },
    industries: {
      title: "Industries que Nous Servons",
      subtitle: "Connectez-vous avec des professionnels vérifiés dans plusieurs industries",
      subtitleHighlight: "professionnels vérifiés",
      viewAll: "Voir tous les services",
      categories: {
        home: {
          title: "Maison et Entretien",
          services: ["Plomberie", "Électricité", "Menuiserie", "Aménagement Paysager", "Rénovation"]
        },
        logistics: {
          title: "Logistique et Transport",
          services: ["Déménagement", "Coursier", "Fret", "Transport Auto", "Stockage"]
        },
        wellness: {
          title: "Bien-être et Santé",
          services: ["Fitness", "Thérapie", "Nutrition", "Soins à Domicile", "Spa et Récupération"]
        },
        professional: {
          title: "Services Professionnels",
          services: ["Comptabilité", "Juridique", "Conseil", "Marketing", "Support Administratif"]
        },
        tech: {
          title: "Tech et Créatif",
          services: ["Développement Web", "Design", "Photographie", "Services IT", "Solutions Logicielles"]
        }
      },
      servicesCount: "services"
    },
    about: {
      hero: {
        title: "À Propos d'Atenra",
        subtitle: "La plateforme centrée sur l'humain pour la découverte de services de confiance."
      },
      story: {
        title: "Notre Histoire",
        text1: "Atenra est né de la frustration des recherches interminables et de l'incertitude lors de la recherche d'aide fiable. Nous nous sommes efforcés de simplifier cela — en créant une plateforme où",
        highlight: "la technologie améliore, ne remplace pas, la connexion humaine",
        text2: "Aujourd'hui, nous redéfinissons comment les personnes et les entreprises trouvent des professionnels de confiance, une correspondance organisée à la fois."
      },
      values: {
        title: "Ce Pour Quoi Nous Nous Battons",
        items: {
          privacy: { title: "Confidentialité d'Abord", description: "Vos données restent les vôtres. Toujours." },
          human: { title: "Perspicacité Humaine", description: "De vraies personnes guidant chaque correspondance." },
          reliability: { title: "Fiabilité", description: "Qualité constante sur laquelle vous pouvez compter." },
          efficiency: { title: "Efficacité", description: "Résultats livrés en minutes, pas en jours." },
          growth: { title: "Croissance", description: "Votre succès débloque le nôtre." }
        }
      },
      mission: {
        title: "Notre Mission",
        text1: "Atenra existe pour relier les personnes avec des professionnels en qui elles peuvent avoir confiance. Nous combinons",
        highlight: "technologie de pointe avec un jugement humain authentique",
        text2: "pour créer des correspondances significatives — guidées par la confidentialité, l'intégrité et les résultats."
      },
      vision: {
        title: "Notre Vision",
        text1: "Atenra a été construit sur un principe — que",
        highlight: "la vraie connexion crée de meilleurs résultats",
        text2: "Notre vision est de redéfinir comment les personnes et les entreprises trouvent une aide fiable en mélangeant des systèmes intelligents avec une compréhension humaine authentique.",
        text3: "Nous croyons que la technologie devrait simplifier les décisions, pas remplacer la confiance. Chaque service, chaque correspondance et chaque partenariat est construit autour de la transparence, l'efficacité et des résultats mesurables.",
        listTitle: "Nous créons un monde où:",
        points: [
          "Trouver de l'aide est sans effort — Alimenté par des outils intelligents et des conseils humains",
          "La confidentialité est standard, pas optionnelle",
          "Chaque interaction construit la confiance, pas la confusion",
          "La croissance est mutuelle — Quand nos utilisateurs réussissent, nous aussi"
        ]
      },
      commitment: {
        title: "Notre Engagement",
        text1: "Nous ne développons pas seulement des outils; nous construisons des cadres qui évoluent avec vous. Au fur et à mesure que nous grandissons, l'engagement d'Atenra reste le même — garder",
        highlight: "chaque connexion significative, chaque processus transparent et chaque résultat mesurable"
      }
    },
    careers: {
      hero: {
        title: "Rejoignez Notre Équipe",
        subtitle: "Grandissez avec une entreprise construite sur la confiance, la technologie et les personnes.",
        subtitleHighlight: "confiance, technologie et personnes"
      },
      about: {
        title: "À Propos de Travailler chez Atenra",
        text1: "Atenra redéfinit comment les personnes se connectent avec des professionnels — et cela commence avec l'équipe derrière. Nous croyons en",
        highlight: "croissance, inclusion et travail significatif",
        text2: "qui responsabilise les personnes dans le monde entier. Que vous soyez dans les opérations, le design, le marketing ou le succès client — il y a une place pour vous ici."
      },
      benefits: {
        title: "Ce Que Nous Offrons",
        list: [
          "Flexibilité à distance en premier",
          "Chemins de croissance transparents",
          "Culture inclusive et collaborative",
          "Environnement d'apprentissage technologique",
          "Rémunération et avantages compétitifs"
        ]
      },
      opportunities: {
        title: "Explorer les Opportunités",
        subtitle: "Rejoignez une équipe axée sur la mission qui modernise les connexions de services dans le monde entier.",
        subtitleHighlight: "équipe axée sur la mission",
        cta: "Explorer les Opportunités de Carrière",
        departments: [
          "Opérations et Support Client",
          "Marketing et Partenariats",
          "Ingénierie et Développement IA",
          "Produit et Design UX",
          "Juridique et Conformité"
        ]
      },
      culture: {
        title: "Culture d'Équipe",
        quote: "Nous n'offrons pas seulement des emplois — nous créons des carrières qui responsabilisent l'autonomie, le but et l'innovation.",
        quoteHighlight: "autonomie, but et innovation"
      }
    },
    faq: {
      title: "Questions Fréquemment Posées",
      subtitle: "Trouvez des réponses aux questions courantes sur Atenra",
      questions: [
        {
          question: "Comment fonctionne le processus de correspondance d'Atenra?",
          answer: "Nous analysons votre demande, vérifions les professionnels en temps réel, puis combinons perspicacité humaine et IA pour trouver la correspondance idéale."
        },
        {
          question: "Combien de temps faudra-t-il pour être mis en correspondance?",
          answer: "Généralement en quelques minutes, selon le type de service et l'emplacement."
        },
        {
          question: "Qu'est-ce qui rend Atenra différent?",
          answer: "Chaque correspondance est examinée par des humains, protégée par la confidentialité et axée sur la confiance à long terme."
        },
        {
          question: "Que se passe-t-il si je ne suis pas satisfait?",
          answer: "Nous réévaluerons, réassignerons ou rembourserons — selon votre plan."
        },
        {
          question: "Mes informations personnelles sont-elles sécurisées?",
          answer: "Oui — nous utilisons un cryptage complet, une gestion interne uniquement et ne vendons jamais de données."
        }
      ],
      sidebar: {
        legal: {
          title: "Juridique et Confidentialité",
          links: [
            { label: "Conditions d'Utilisation", href: "/terms" },
            { label: "Politique de Confidentialité", href: "/privacy" },
            { label: "Politique de Remboursement / Garantie", href: "/refund" },
            { label: "Accord Commercial", href: "/business" }
          ]
        },
        features: {
          title: "Fonctionnalités",
          items: [
            { title: "Siège aux EAU", description: "pour une confidentialité maximale" },
            { title: "Zéro commerce/vente de données", description: "Vos données restent les vôtres" },
            { title: "2FA mondial sécurisé", description: "Protection multicouche" }
          ]
        }
      }
    },
    pricing: {
      title: "Choisissez Votre Plan",
      subtitle: "Tarification transparente pour tous",
      planTypes: {
        student: "Étudiant",
        personal: "Personnel",
        business: "Entreprise"
      },
      loading: "Chargement des plans...",
      perMonth: "/mois",
      offFirstMonths: "% de réduction les {months} premiers mois",
      dayTrial: "-jours d'essai",
      refundGuarantee: "Garantie de remboursement au prorata",
      getStarted: "Commencer",
      contactUs: "Contactez-nous",
      inviteOnly: "Sur invitation uniquement",
      inviteOnlyBadge: "Sur Invitation",
      custom: "Personnalisé",
      tailoredPricing: "Tarification personnalisée selon vos besoins",
      features: {
        "24/7 concierge lifestyle": "Style de vie concierge 24/7",
        "Global travel/event support": "Support voyage/événement mondial",
        "Bespoke management teams": "Équipes de gestion sur mesure",
        "Save on essentials (food, rides)": "Économisez sur l'essentiel (nourriture, transports)",
        "Study & finance tools": "Outils d'étude et de finance",
        "Simplified planning and reminders": "Planification simplifiée et rappels",
        "Daily task support": "Support des tâches quotidiennes",
        "Smart reminders": "Rappels intelligents",
        "Personal planning": "Planification personnelle",
        "Everything in Basic": "Tout dans Basique",
        "Faster response, personal assistance": "Réponse plus rapide, assistance personnelle",
        "Adaptive automations": "Automatisations adaptatives",
        "Verified provider listing": "Liste de fournisseurs vérifiés",
        "Client referral dashboard": "Tableau de bord des références clients",
        "Analytics + support": "Analyses + support",
        "Dedicated Atenra agent": "Agent Atenra dédié",
        "On-demand support team": "Équipe de support à la demande",
        "Concierge-level access": "Accès niveau concierge"
      },
      taglines: {
        "A world of possibilities, crafted just for you.": "Un monde de possibilités, conçu rien que pour vous.",
        "Built For: Students on a budget": "Conçu Pour: Étudiants avec un budget limité",
        "Built For: Everyday individuals, freelancers, or part-timers": "Conçu Pour: Particuliers, freelances ou travailleurs à temps partiel",
        "Built For: Families and busy professionals": "Conçu Pour: Familles et professionnels occupés",
        "Built For: All businesses": "Conçu Pour: Toutes les entreprises",
        "Built For: Executives and high achievers": "Conçu Pour: Cadres et hauts performers"
      },
      descriptions: {
        "Built For: Discerning individuals and institutions": "Conçu Pour: Particuliers et institutions exigeants",
        "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.": "Rejoignez notre réseau exclusif de fournisseurs de services vérifiés. Commencez avec notre essai sans risque de 3 mois.",
        "Perfect for individuals who want a helping hand with life's little tasks.": "Parfait pour les particuliers qui veulent un coup de main avec les petites tâches de la vie.",
        "This is the upgrade for people ready to take convenience to the next level.": "C'est la mise à niveau pour les personnes prêtes à porter la commodité au niveau supérieur.",
        "Imagine a solid step up in convenience, week after week.": "Imaginez un pas solide vers plus de commodité, semaine après semaine."
      },
      planNames: {
        "☐☐☐ Plan": "Plan ☐☐☐",
        "Student Plan": "Plan Étudiant",
        "Basic Plan": "Plan Basique",
        "Premium Plan": "Plan Premium",
        "Premium Business Partnership": "Partenariat Entreprise Premium",
        "Royal Plan": "Plan Royal"
      }
    },
    contact: {
      directory: {
        title: "Annuaire de Contact",
        generalInquiries: { label: "Demandes Générales", email: "info@atenra.com" },
        supportTechnical: { label: "Support et Technique", email: "it@atenra.com" },
        mediaPartnerships: { label: "Médias et Partenariats", email: "contact@atenra.com" },
        legalCompliance: { label: "Juridique et Conformité", email: "legal@atenra.com" }
      },
      offices: {
        title: "Emplacements des Bureaux",
        florida: { label: "Floride", address: "8430 Bird Rd, Miami, FL 33155, USA" },
        uae: { label: "É.A.U", address: "Bientôt disponible" }
      }
    }
  },
  de: {
    hero: {
      title: "Atenra",
      tagline: "Ihr Persönlicher und Geschäftlicher Assistent, Auf Abruf",
      subheadline: "Entdecken Sie vertrauenswürdige Fachleute durch intelligente Vermittlung — wo Technologie auf echte menschliche Einsicht trifft.",
      bodyText: "Bei Atenra ist jede Verbindung",
      bodyHighlight: "handgeprüft, sorgfältig abgestimmt und darauf ausgelegt, Ihr Leben einfacher zu machen",
      bodyText2: " Ob es um die Verwaltung Ihres Unternehmens, Ihres Zuhauses oder Ihres nächsten großen Projekts geht — wir verbinden Sie mit Fachleuten, die Ergebnisse liefern.",
      ctaPrimary: "Beginnen",
      ctaSecondary: "Partner Werden",
      trustBadge1: "1000+ Verifizierte Fachleute",
      trustBadge2: "20+ Service-Kategorien"
    },
    industries: {
      title: "Branchen, Die Wir Bedienen",
      subtitle: "Verbinden Sie sich mit verifizierten Fachleuten in mehreren Branchen",
      subtitleHighlight: "verifizierten Fachleuten",
      viewAll: "Alle Services anzeigen",
      categories: {
        home: {
          title: "Haus & Wartung",
          services: ["Sanitär", "Elektrik", "Tischlerei", "Landschaftsbau", "Renovierung"]
        },
        logistics: {
          title: "Logistik & Transport",
          services: ["Umzug", "Kurier", "Fracht", "Auto-Transport", "Lagerung"]
        },
        wellness: {
          title: "Wellness & Gesundheit",
          services: ["Fitness", "Therapie", "Ernährung", "Häusliche Pflege", "Spa & Erholung"]
        },
        professional: {
          title: "Professionelle Dienste",
          services: ["Buchhaltung", "Rechtlich", "Beratung", "Marketing", "Administrative Unterstützung"]
        },
        tech: {
          title: "Tech & Kreativ",
          services: ["Webentwicklung", "Design", "Fotografie", "IT-Services", "Softwarelösungen"]
        }
      },
      servicesCount: "Services"
    },
    about: {
      hero: {
        title: "Über Atenra",
        subtitle: "Die menschenzentrierte Plattform für vertrauenswürdige Service-Entdeckung."
      },
      story: {
        title: "Unsere Geschichte",
        text1: "Atenra entstand aus der Frustration endloser Suchen und Unsicherheit bei der Suche nach zuverlässiger Hilfe. Wir haben uns vorgenommen, das zu vereinfachen — eine Plattform zu schaffen, auf der",
        highlight: "Technologie die menschliche Verbindung verbessert, nicht ersetzt",
        text2: "Heute definieren wir neu, wie Menschen und Unternehmen vertrauenswürdige Fachleute finden, eine kuratierte Übereinstimmung nach der anderen."
      },
      values: {
        title: "Wofür Wir Stehen",
        items: {
          privacy: { title: "Datenschutz Zuerst", description: "Ihre Daten bleiben Ihre. Immer." },
          human: { title: "Menschliche Einsicht", description: "Echte Menschen leiten jede Übereinstimmung." },
          reliability: { title: "Zuverlässigkeit", description: "Konstante Qualität, auf die Sie sich verlassen können." },
          efficiency: { title: "Effizienz", description: "Ergebnisse in Minuten geliefert, nicht Tagen." },
          growth: { title: "Wachstum", description: "Ihr Erfolg erschließt unseren." }
        }
      },
      mission: {
        title: "Unsere Mission",
        text1: "Atenra existiert, um Menschen mit Fachleuten zu verbinden, denen sie vertrauen können. Wir kombinieren",
        highlight: "modernste Technologie mit echtem menschlichem Urteilsvermögen",
        text2: "um bedeutungsvolle Übereinstimmungen zu schaffen — geleitet von Datenschutz, Integrität und Ergebnissen."
      },
      vision: {
        title: "Unsere Vision",
        text1: "Atenra wurde auf einem Prinzip aufgebaut — dass",
        highlight: "echte Verbindung bessere Ergebnisse schafft",
        text2: "Unsere Vision ist es, neu zu definieren, wie Menschen und Unternehmen zuverlässige Hilfe finden, indem wir intelligente Systeme mit echtem menschlichem Verständnis verbinden.",
        text3: "Wir glauben, dass Technologie Entscheidungen vereinfachen sollte, nicht Vertrauen ersetzen. Jeder Service, jede Übereinstimmung und jede Partnerschaft basiert auf Transparenz, Effizienz und messbaren Ergebnissen.",
        listTitle: "Wir schaffen eine Welt, in der:",
        points: [
          "Hilfe finden mühelos ist — Angetrieben von intelligenten Tools und menschlicher Führung",
          "Datenschutz Standard ist, nicht optional",
          "Jede Interaktion Vertrauen aufbaut, nicht Verwirrung",
          "Wachstum gegenseitig ist — Wenn unsere Nutzer erfolgreich sind, sind wir es auch"
        ]
      },
      commitment: {
        title: "Unser Engagement",
        text1: "Wir entwickeln nicht nur Tools; wir bauen Frameworks, die sich mit Ihnen weiterentwickeln. Während wir wachsen, bleibt Atenras Engagement gleich — zu halten",
        highlight: "jede Verbindung bedeutungsvoll, jeden Prozess transparent und jedes Ergebnis messbar"
      }
    },
    careers: {
      hero: {
        title: "Treten Sie Unserem Team Bei",
        subtitle: "Wachsen Sie mit einem Unternehmen, das auf Vertrauen, Technologie und Menschen aufbaut.",
        subtitleHighlight: "Vertrauen, Technologie und Menschen"
      },
      about: {
        title: "Über die Arbeit bei Atenra",
        text1: "Atenra definiert neu, wie Menschen sich mit Fachleuten verbinden — und das beginnt mit dem Team dahinter. Wir glauben an",
        highlight: "Wachstum, Inklusion und bedeutungsvolle Arbeit",
        text2: "die Menschen weltweit befähigt. Ob Sie sich für Betrieb, Design, Marketing oder Kundenerfolg interessieren — es gibt einen Platz für Sie hier."
      },
      benefits: {
        title: "Was Wir Anbieten",
        list: [
          "Remote-First-Flexibilität",
          "Transparente Wachstumspfade",
          "Inklusive und kollaborative Kultur",
          "Technologiegetriebene Lernumgebung",
          "Wettbewerbsfähige Bezahlung und Vorteile"
        ]
      },
      opportunities: {
        title: "Erkunden Sie Chancen",
        subtitle: "Treten Sie einem missionsgetriebenen Team bei, das weltweit Service-Verbindungen modernisiert.",
        subtitleHighlight: "missionsgetriebenen Team",
        cta: "Karrieremöglichkeiten Erkunden",
        departments: [
          "Betrieb & Kundensupport",
          "Marketing & Partnerschaften",
          "Engineering & KI-Entwicklung",
          "Produkt & UX-Design",
          "Rechtliches & Compliance"
        ]
      },
      culture: {
        title: "Teamkultur",
        quote: "Wir bieten nicht nur Jobs — wir schaffen Karrieren, die Autonomie, Zweck und Innovation fördern.",
        quoteHighlight: "Autonomie, Zweck und Innovation"
      }
    },
    faq: {
      title: "Häufig Gestellte Fragen",
      subtitle: "Finden Sie Antworten auf häufige Fragen zu Atenra",
      questions: [
        {
          question: "Wie funktioniert Atenras Matching-Prozess?",
          answer: "Wir analysieren Ihre Anfrage, verifizieren Fachleute in Echtzeit und kombinieren dann menschliche Einsicht und KI, um die ideale Übereinstimmung zu finden."
        },
        {
          question: "Wie schnell werde ich vermittelt?",
          answer: "Normalerweise innerhalb von Minuten, abhängig von Service-Typ und Standort."
        },
        {
          question: "Was macht Atenra anders?",
          answer: "Jede Übereinstimmung wird von Menschen überprüft, durch Datenschutz geschützt und auf langfristiges Vertrauen ausgerichtet."
        },
        {
          question: "Was ist, wenn ich nicht zufrieden bin?",
          answer: "Wir bewerten neu, weisen neu zu oder erstatten zurück — abhängig von Ihrem Plan."
        },
        {
          question: "Sind meine persönlichen Informationen sicher?",
          answer: "Ja — wir verwenden vollständige Verschlüsselung, nur interne Handhabung und verkaufen niemals Daten."
        }
      ],
      sidebar: {
        legal: {
          title: "Rechtliches & Datenschutz",
          links: [
            { label: "Nutzungsbedingungen", href: "/terms" },
            { label: "Datenschutzrichtlinie", href: "/privacy" },
            { label: "Rückerstattungs-/Garantierichtlinie", href: "/refund" },
            { label: "Geschäftsvereinbarung", href: "/business" }
          ]
        },
        features: {
          title: "Funktionen",
          items: [
            { title: "VAE-Hauptsitz", description: "für maximalen Datenschutz" },
            { title: "Null Datenhandel/-verkauf", description: "Ihre Daten bleiben Ihre" },
            { title: "Sichere globale 2FA", description: "Mehrschichtiger Schutz" }
          ]
        }
      }
    },
    pricing: {
      title: "Wählen Sie Ihren Plan",
      subtitle: "Transparente Preise für alle",
      planTypes: {
        student: "Student",
        personal: "Persönlich",
        business: "Geschäftlich"
      },
      loading: "Pläne werden geladen...",
      perMonth: "/Monat",
      offFirstMonths: "% Rabatt auf die ersten {months} Monate",
      dayTrial: "-Tage Testversion",
      refundGuarantee: "Anteilige Rückerstattungsgarantie",
      getStarted: "Beginnen",
      contactUs: "Kontaktieren Sie uns",
      inviteOnly: "Nur auf Einladung",
      inviteOnlyBadge: "Nur auf Einladung",
      custom: "Individuell",
      tailoredPricing: "Maßgeschneiderte Preisgestaltung nach Ihren Bedürfnissen",
      features: {
        "24/7 concierge lifestyle": "24/7 Concierge-Lifestyle",
        "Global travel/event support": "Globale Reise-/Event-Unterstützung",
        "Bespoke management teams": "Maßgeschneiderte Management-Teams",
        "Save on essentials (food, rides)": "Sparen Sie bei Grundbedarf (Essen, Fahrten)",
        "Study & finance tools": "Studien- und Finanztools",
        "Simplified planning and reminders": "Vereinfachte Planung und Erinnerungen",
        "Daily task support": "Unterstützung bei täglichen Aufgaben",
        "Smart reminders": "Intelligente Erinnerungen",
        "Personal planning": "Persönliche Planung",
        "Everything in Basic": "Alles in Basic",
        "Faster response, personal assistance": "Schnellere Antwort, persönliche Unterstützung",
        "Adaptive automations": "Adaptive Automatisierungen",
        "Verified provider listing": "Verifizierte Anbieterauflistung",
        "Client referral dashboard": "Kunden-Empfehlungs-Dashboard",
        "Analytics + support": "Analysen + Support",
        "Dedicated Atenra agent": "Dedizierter Atenra-Agent",
        "On-demand support team": "On-Demand-Support-Team",
        "Concierge-level access": "Concierge-Level-Zugang"
      },
      taglines: {
        "A world of possibilities, crafted just for you.": "Eine Welt voller Möglichkeiten, nur für Sie gemacht.",
        "Built For: Students on a budget": "Entwickelt Für: Studenten mit begrenztem Budget",
        "Built For: Everyday individuals, freelancers, or part-timers": "Entwickelt Für: Alltägliche Personen, Freelancer oder Teilzeitbeschäftigte",
        "Built For: Families and busy professionals": "Entwickelt Für: Familien und vielbeschäftigte Profis",
        "Built For: All businesses": "Entwickelt Für: Alle Unternehmen",
        "Built For: Executives and high achievers": "Entwickelt Für: Führungskräfte und Hochleister"
      },
      descriptions: {
        "Built For: Discerning individuals and institutions": "Entwickelt Für: Anspruchsvolle Einzelpersonen und Institutionen",
        "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.": "Treten Sie unserem exklusiven Netzwerk verifizierter Dienstleister bei. Starten Sie mit unserer risikofreien 3-Monats-Testversion.",
        "Perfect for individuals who want a helping hand with life's little tasks.": "Perfekt für Personen, die eine helfende Hand bei den kleinen Aufgaben des Lebens wünschen.",
        "This is the upgrade for people ready to take convenience to the next level.": "Dies ist das Upgrade für Menschen, die bereit sind, Komfort auf die nächste Stufe zu heben.",
        "Imagine a solid step up in convenience, week after week.": "Stellen Sie sich einen soliden Schritt zu mehr Komfort vor, Woche für Woche."
      },
      planNames: {
        "☐☐☐ Plan": "☐☐☐ Plan",
        "Student Plan": "Studenten-Plan",
        "Basic Plan": "Basic-Plan",
        "Premium Plan": "Premium-Plan",
        "Premium Business Partnership": "Premium-Geschäftspartnerschaft",
        "Royal Plan": "Royal-Plan"
      }
    },
    contact: {
      directory: {
        title: "Kontaktverzeichnis",
        generalInquiries: { label: "Allgemeine Anfragen", email: "info@atenra.com" },
        supportTechnical: { label: "Support & Technik", email: "it@atenra.com" },
        mediaPartnerships: { label: "Medien & Partnerschaften", email: "contact@atenra.com" },
        legalCompliance: { label: "Rechtliches & Compliance", email: "legal@atenra.com" }
      },
      offices: {
        title: "Bürostandorte",
        florida: { label: "Florida", address: "8430 Bird Rd, Miami, FL 33155, USA" },
        uae: { label: "V.A.E", address: "Demnächst" }
      }
    }
  },
  zh: {
    hero: {
      title: "Atenra",
      tagline: "您的个人和商业助手，随需而至",
      subheadline: "通过智能匹配发现值得信赖的专业人士 —— 技术与真正的人类洞察力相遇。",
      bodyText: "在Atenra，每个连接都经过",
      bodyHighlight: "人工验证、精心匹配，旨在让您的生活更轻松",
      bodyText2: " 无论是管理您的业务、您的家庭还是您的下一个大项目 —— 我们将您与提供成果的专业人士联系起来。",
      ctaPrimary: "开始使用",
      ctaSecondary: "与我们合作",
      trustBadge1: "1000+ 认证专业人士",
      trustBadge2: "20+ 服务类别"
    },
    industries: {
      title: "我们服务的行业",
      subtitle: "与多个行业的认证专业人士联系",
      subtitleHighlight: "认证专业人士",
      viewAll: "查看所有服务",
      categories: {
        home: {
          title: "家居与维护",
          services: ["管道", "电工", "木工", "景观美化", "装修"]
        },
        logistics: {
          title: "物流与运输",
          services: ["搬家", "快递", "货运", "汽车运输", "仓储"]
        },
        wellness: {
          title: "健康与养生",
          services: ["健身", "治疗", "营养", "居家护理", "水疗与康复"]
        },
        professional: {
          title: "专业服务",
          services: ["会计", "法律", "咨询", "营销", "行政支持"]
        },
        tech: {
          title: "技术与创意",
          services: ["网页开发", "设计", "摄影", "IT服务", "软件解决方案"]
        }
      },
      servicesCount: "服务"
    },
    about: {
      hero: {
        title: "关于Atenra",
        subtitle: "以人为本的值得信赖的服务发现平台。"
      },
      story: {
        title: "我们的故事",
        text1: "Atenra诞生于在寻找可靠帮助时无休止的搜索和不确定性的挫折感。我们着手简化这一点 —— 创建一个",
        highlight: "技术增强而非取代人际联系",
        text2: "的平台。今天，我们正在重新定义人们和企业如何找到值得信赖的专业人士，一次精心策划的匹配。"
      },
      values: {
        title: "我们的立场",
        items: {
          privacy: { title: "隐私第一", description: "您的数据始终属于您。" },
          human: { title: "人类洞察", description: "真人指导每一次匹配。" },
          reliability: { title: "可靠性", description: "您可以依赖的一致质量。" },
          efficiency: { title: "效率", description: "在几分钟内交付结果，而不是几天。" },
          growth: { title: "增长", description: "您的成功解锁我们的成功。" }
        }
      },
      mission: {
        title: "我们的使命",
        text1: "Atenra的存在是为了将人们与他们可以信任的专业人士联系起来。我们将",
        highlight: "尖端技术与真正的人类判断",
        text2: "相结合，创造有意义的匹配 —— 以隐私、诚信和成果为指导。"
      },
      vision: {
        title: "我们的愿景",
        text1: "Atenra建立在一个原则上 —— ",
        highlight: "真正的联系创造更好的结果",
        text2: "我们的愿景是重新定义人们和企业如何通过将智能系统与真正的人类理解相结合来找到可靠的帮助。",
        text3: "我们相信技术应该简化决策，而不是取代信任。每项服务、每次匹配和每个合作伙伴关系都是围绕透明度、效率和可衡量的结果构建的。",
        listTitle: "我们正在创造一个世界，其中：",
        points: [
          "寻找帮助毫不费力 —— 由智能工具和人类指导驱动",
          "隐私是标准，而非可选",
          "每次互动都建立信心，而非困惑",
          "增长是相互的 —— 当我们的用户成功时，我们也成功"
        ]
      },
      commitment: {
        title: "我们的承诺",
        text1: "我们不仅仅是在开发工具；我们正在构建与您一起发展的框架。随着我们的成长，Atenra的承诺保持不变 —— 保持",
        highlight: "每个连接有意义、每个过程透明、每个结果可衡量"
      }
    },
    careers: {
      hero: {
        title: "加入我们的团队",
        subtitle: "与一家建立在信任、技术和人才基础上的公司一起成长。",
        subtitleHighlight: "信任、技术和人才"
      },
      about: {
        title: "关于在Atenra工作",
        text1: "Atenra正在重新定义人们如何与专业人士联系 —— 这始于背后的团队。我们相信",
        highlight: "增长、包容和有意义的工作",
        text2: "赋予全球人民权力。无论您从事运营、设计、营销还是客户成功 —— 这里都有您的位置。"
      },
      benefits: {
        title: "我们提供什么",
        list: [
          "远程优先的灵活性",
          "透明的成长路径",
          "包容和协作的文化",
          "技术驱动的学习环境",
          "具有竞争力的薪酬和福利"
        ]
      },
      opportunities: {
        title: "探索机会",
        subtitle: "加入一个使命驱动的团队，该团队正在使全球服务连接现代化。",
        subtitleHighlight: "使命驱动的团队",
        cta: "探索职业机会",
        departments: [
          "运营与客户支持",
          "营销与合作伙伴关系",
          "工程与AI开发",
          "产品与UX设计",
          "法律与合规"
        ]
      },
      culture: {
        title: "团队文化",
        quote: "我们不只是提供工作 —— 我们创造赋予自主权、目标和创新的职业。",
        quoteHighlight: "自主权、目标和创新"
      }
    },
    faq: {
      title: "常见问题",
      subtitle: "查找有关Atenra的常见问题的答案",
      questions: [
        {
          question: "Atenra的匹配过程如何工作？",
          answer: "我们分析您的请求，实时验证专业人士，然后结合人类洞察和AI找到理想的匹配。"
        },
        {
          question: "我多快会被匹配？",
          answer: "通常在几分钟内，取决于服务类型和位置。"
        },
        {
          question: "Atenra有什么不同？",
          answer: "每个匹配都经过人工审核、隐私保护，并专注于长期信任。"
        },
        {
          question: "如果我不满意怎么办？",
          answer: "我们将重新评估、重新分配或退款 —— 取决于您的计划。"
        },
        {
          question: "我的个人信息安全吗？",
          answer: "是的 —— 我们使用完全加密、仅内部处理，永不出售数据。"
        }
      ],
      sidebar: {
        legal: {
          title: "法律与隐私",
          links: [
            { label: "服务条款", href: "/terms" },
            { label: "隐私政策", href: "/privacy" },
            { label: "退款/保证政策", href: "/refund" },
            { label: "商业协议", href: "/business" }
          ]
        },
        features: {
          title: "特点",
          items: [
            { title: "阿联酋总部", description: "最大限度的隐私" },
            { title: "零数据交易/销售", description: "您的数据属于您" },
            { title: "安全的全球2FA", description: "多层保护" }
          ]
        }
      }
    },
    pricing: {
      title: "选择您的计划",
      subtitle: "为每个人提供透明定价",
      planTypes: {
        student: "学生",
        personal: "个人",
        business: "企业"
      },
      loading: "正在加载计划...",
      perMonth: "/月",
      offFirstMonths: "% 折扣前 {months} 个月",
      dayTrial: "天试用",
      refundGuarantee: "按比例退款保证",
      getStarted: "开始使用",
      contactUs: "联系我们",
      inviteOnly: "仅限邀请",
      inviteOnlyBadge: "仅限邀请",
      custom: "自定义",
      tailoredPricing: "根据您的需求量身定制的价格",
      features: {
        "24/7 concierge lifestyle": "24/7 礼宾生活方式",
        "Global travel/event support": "全球旅行/活动支持",
        "Bespoke management teams": "定制管理团队",
        "Save on essentials (food, rides)": "节省必需品（食品、交通）",
        "Study & finance tools": "学习和财务工具",
        "Simplified planning and reminders": "简化的计划和提醒",
        "Daily task support": "日常任务支持",
        "Smart reminders": "智能提醒",
        "Personal planning": "个人规划",
        "Everything in Basic": "基础计划的所有功能",
        "Faster response, personal assistance": "更快响应，个人协助",
        "Adaptive automations": "自适应自动化",
        "Verified provider listing": "认证供应商列表",
        "Client referral dashboard": "客户推荐仪表板",
        "Analytics + support": "分析 + 支持",
        "Dedicated Atenra agent": "专属Atenra代理",
        "On-demand support team": "按需支持团队",
        "Concierge-level access": "礼宾级访问"
      },
      taglines: {
        "A world of possibilities, crafted just for you.": "专为您打造的无限可能世界。",
        "Built For: Students on a budget": "专为：预算有限的学生",
        "Built For: Everyday individuals, freelancers, or part-timers": "专为：日常个人、自由职业者或兼职人员",
        "Built For: Families and busy professionals": "专为：家庭和忙碌的专业人士",
        "Built For: All businesses": "专为：所有企业",
        "Built For: Executives and high achievers": "专为：高管和高成就者"
      },
      descriptions: {
        "Built For: Discerning individuals and institutions": "专为：眼光独到的个人和机构",
        "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.": "加入我们的认证服务提供商专属网络。从我们的无风险3个月试用开始。",
        "Perfect for individuals who want a helping hand with life's little tasks.": "非常适合希望在生活小事上得到帮助的个人。",
        "This is the upgrade for people ready to take convenience to the next level.": "这是为准备将便利提升到新水平的人们而设计的升级版。",
        "Imagine a solid step up in convenience, week after week.": "想象一下，每周便利性都在稳步提升。"
      },
      planNames: {
        "☐☐☐ Plan": "☐☐☐ 计划",
        "Student Plan": "学生计划",
        "Basic Plan": "基础计划",
        "Premium Plan": "高级计划",
        "Premium Business Partnership": "高级商业合作",
        "Royal Plan": "尊享计划"
      }
    },
    contact: {
      directory: {
        title: "联系目录",
        generalInquiries: { label: "一般咨询", email: "info@atenra.com" },
        supportTechnical: { label: "支持与技术", email: "it@atenra.com" },
        mediaPartnerships: { label: "媒体与合作", email: "contact@atenra.com" },
        legalCompliance: { label: "法律与合规", email: "legal@atenra.com" }
      },
      offices: {
        title: "办公地点",
        florida: { label: "佛罗里达", address: "8430 Bird Rd, Miami, FL 33155, USA" },
        uae: { label: "阿联酋", address: "即将推出" }
      }
    }
  }
};

export type NewLanguageCode = keyof typeof newTranslations;
