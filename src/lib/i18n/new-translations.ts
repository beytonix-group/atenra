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
      content: string;
      highlight: string;
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
      content: string;
      highlight: string;
    };
    vision: {
      title: string;
      principle: string;
      principleHighlight: string;
      belief: string;
      worldTitle: string;
      points: string[];
    };
    commitment: {
      title: string;
      content: string;
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
      content: string;
      highlight: string;
    };
    offer: {
      title: string;
      benefits: string[];
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
    subtitleHighlight: string;
    questions: Array<{ q: string; a: string }>;
    sidebar: {
      legalTitle: string;
      terms: string;
      privacy: string;
      refund: string;
      business: string;
      featuresTitle: string;
      uae: { title: string; desc: string };
      noSelling: { title: string; desc: string };
      twoFa: { title: string; desc: string };
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    subtitleHighlight: string;
    student: string;
    personal: string;
    business: string;
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
        content: "Atenra was born from the frustration of endless searching and uncertainty when finding reliable help. We set out to simplify that — creating a platform where technology enhances, not replaces, human connection. Today, we're redefining how people and businesses find trusted professionals, one curated match at a time.",
        highlight: "technology enhances, not replaces, human connection"
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
        content: "Atenra exists to bridge people with professionals they can trust. We combine cutting-edge technology with genuine human judgment to create meaningful matches — guided by privacy, integrity, and results.",
        highlight: "cutting-edge technology with genuine human judgment"
      },
      vision: {
        title: "Our Vision",
        principle: "Atenra was built on one principle — that real connection creates better outcomes. Our vision is to redefine how people and businesses find reliable help by blending intelligent systems with genuine human understanding.",
        principleHighlight: "real connection creates better outcomes",
        belief: "We believe technology should simplify decisions, not replace trust. Every service, every match, and every partnership is built around transparency, efficiency, and measurable results.",
        worldTitle: "We're creating a world where:",
        points: [
          "Finding help is effortless — Powered by smart tools and human guidance",
          "Privacy is standard, not optional",
          "Every interaction builds confidence, not confusion",
          "Growth is mutual — When our users succeed, so do we"
        ]
      },
      commitment: {
        title: "Our Commitment",
        content: "We're not just developing tools; we're building frameworks that evolve with you. As we grow, Atenra's commitment remains the same — to keep every connection meaningful, every process transparent, and every result measurable.",
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
        content: "Atenra is redefining how people connect with professionals — and that starts with the team behind it. We believe in growth, inclusion, and meaningful work that empowers people globally. Whether you're into operations, design, marketing, or client success — there's a place for you here.",
        highlight: "growth, inclusion, and meaningful work"
      },
      offer: {
        title: "What We Offer",
        benefits: [
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
      subtitle: "Find answers to common questions about Atenra's matching service, pricing, and how we work.",
      subtitleHighlight: "matching service, pricing, and how we work",
      questions: [
        {
          q: "How does Atenra's matching process work?",
          a: "We analyze your request, verify professionals in real time, then combine human insight and AI to find the ideal match."
        },
        {
          q: "How quickly will I be matched?",
          a: "Usually within minutes, depending on service type and location."
        },
        {
          q: "What makes Atenra different?",
          a: "Every match is human-reviewed, privacy-protected, and focused on long-term trust."
        },
        {
          q: "What if I'm not satisfied?",
          a: "We'll reassess, reassign, or refund — depending on your plan."
        },
        {
          q: "Is my personal information secure?",
          a: "Yes — we use full encryption, internal-only handling, and never sell data."
        }
      ],
      sidebar: {
        legalTitle: "Legal & Privacy",
        terms: "Terms of Service",
        privacy: "Privacy Policy",
        refund: "Refund / Guarantee Policy",
        business: "Business Agreement",
        featuresTitle: "Features",
        uae: { title: "UAE HQ", desc: "for maximum privacy" },
        noSelling: { title: "Zero data trading/selling", desc: "Your data stays yours" },
        twoFa: { title: "Secure global 2FA", desc: "Multi-layer protection" }
      }
    },
    pricing: {
      title: "Choose Your Plan",
      subtitle: "Transparent pricing for everyone",
      subtitleHighlight: "Transparent pricing",
      planTypes: {
        student: "Student",
        personal: "Personal",
        business: "Business"
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
        content: "Atenra nació de la frustración de búsquedas interminables e incertidumbre al encontrar ayuda confiable. Nos propusimos simplificar eso — creando una plataforma donde la tecnología mejora, no reemplaza, la conexión humana. Hoy, estamos redefiniendo cómo las personas y empresas encuentran profesionales de confianza, una coincidencia curada a la vez.",
        highlight: "la tecnología mejora, no reemplaza, la conexión humana"
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
        content: "Atenra existe para conectar a las personas con profesionales en los que pueden confiar. Combinamos tecnología de vanguardia con juicio humano genuino para crear coincidencias significativas — guiadas por privacidad, integridad y resultados.",
        highlight: "tecnología de vanguardia con juicio humano genuino"
      },
      vision: {
        title: "Nuestra Visión",
        principle: "Atenra se construyó sobre un principio — que la conexión real crea mejores resultados. Nuestra visión es redefinir cómo las personas y empresas encuentran ayuda confiable mezclando sistemas inteligentes con comprensión humana genuina.",
        principleHighlight: "la conexión real crea mejores resultados",
        belief: "Creemos que la tecnología debe simplificar decisiones, no reemplazar la confianza. Cada servicio, cada coincidencia y cada asociación se construye alrededor de transparencia, eficiencia y resultados medibles.",
        worldTitle: "Estamos creando un mundo donde:",
        points: [
          "Encontrar ayuda es sin esfuerzo — Impulsado por herramientas inteligentes y guía humana",
          "La privacidad es estándar, no opcional",
          "Cada interacción genera confianza, no confusión",
          "El crecimiento es mutuo — Cuando nuestros usuarios tienen éxito, nosotros también"
        ]
      },
      commitment: {
        title: "Nuestro Compromiso",
        content: "No solo estamos desarrollando herramientas; estamos construyendo marcos que evolucionan contigo. A medida que crecemos, el compromiso de Atenra sigue siendo el mismo — mantener cada conexión significativa, cada proceso transparente y cada resultado medible.",
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
        content: "Atenra está redefiniendo cómo las personas se conectan con profesionales — y eso comienza con el equipo detrás de ella. Creemos en el crecimiento, la inclusión y el trabajo significativo que empodera a las personas globalmente. Ya sea que te interese operaciones, diseño, marketing o éxito del cliente — hay un lugar para ti aquí.",
        highlight: "crecimiento, inclusión y trabajo significativo"
      },
      offer: {
        title: "Lo Que Ofrecemos",
        benefits: [
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
      subtitle: "Encuentra respuestas a preguntas comunes sobre el servicio de coincidencia, precios y cómo trabajamos de Atenra.",
      subtitleHighlight: "servicio de coincidencia, precios y cómo trabajamos",
      questions: [
        {
          q: "¿Cómo funciona el proceso de coincidencia de Atenra?",
          a: "Analizamos tu solicitud, verificamos profesionales en tiempo real, luego combinamos perspicacia humana e IA para encontrar la coincidencia ideal."
        },
        {
          q: "¿Qué tan rápido seré emparejado?",
          a: "Generalmente en minutos, dependiendo del tipo de servicio y ubicación."
        },
        {
          q: "¿Qué hace diferente a Atenra?",
          a: "Cada coincidencia es revisada por humanos, protegida por privacidad y enfocada en confianza a largo plazo."
        },
        {
          q: "¿Qué pasa si no estoy satisfecho?",
          a: "Reevaluaremos, reasignaremos o reembolsaremos — dependiendo de tu plan."
        },
        {
          q: "¿Mi información personal está segura?",
          a: "Sí — usamos encriptación completa, manejo solo interno y nunca vendemos datos."
        }
      ],
      sidebar: {
        legalTitle: "Legal y Privacidad",
        terms: "Términos de Servicio",
        privacy: "Política de Privacidad",
        refund: "Política de Reembolso / Garantía",
        business: "Acuerdo Empresarial",
        featuresTitle: "Características",
        uae: { title: "Sede en EAU", desc: "para máxima privacidad" },
        noSelling: { title: "Cero comercio/venta de datos", desc: "Tus datos son tuyos" },
        twoFa: { title: "2FA global seguro", desc: "Protección multicapa" }
      }
    },
    pricing: {
      title: "Elige Tu Plan",
      subtitle: "Precios transparentes para todos",
      subtitleHighlight: "Precios transparentes",
      student: "Estudiante",
      personal: "Personal",
      business: "Empresarial"
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
        content: "Atenra est né de la frustration des recherches interminables et de l'incertitude lors de la recherche d'aide fiable. Nous nous sommes efforcés de simplifier cela — en créant une plateforme où la technologie améliore, ne remplace pas, la connexion humaine. Aujourd'hui, nous redéfinissons comment les personnes et les entreprises trouvent des professionnels de confiance, une correspondance organisée à la fois.",
        highlight: "la technologie améliore, ne remplace pas, la connexion humaine"
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
        content: "Atenra existe pour relier les personnes avec des professionnels en qui elles peuvent avoir confiance. Nous combinons une technologie de pointe avec un jugement humain authentique pour créer des correspondances significatives — guidées par la confidentialité, l'intégrité et les résultats.",
        highlight: "technologie de pointe avec un jugement humain authentique"
      },
      vision: {
        title: "Notre Vision",
        principle: "Atenra a été construit sur un principe — que la vraie connexion crée de meilleurs résultats. Notre vision est de redéfinir comment les personnes et les entreprises trouvent une aide fiable en mélangeant des systèmes intelligents avec une compréhension humaine authentique.",
        principleHighlight: "la vraie connexion crée de meilleurs résultats",
        belief: "Nous croyons que la technologie devrait simplifier les décisions, pas remplacer la confiance. Chaque service, chaque correspondance et chaque partenariat est construit autour de la transparence, l'efficacité et des résultats mesurables.",
        worldTitle: "Nous créons un monde où:",
        points: [
          "Trouver de l'aide est sans effort — Alimenté par des outils intelligents et des conseils humains",
          "La confidentialité est standard, pas optionnelle",
          "Chaque interaction construit la confiance, pas la confusion",
          "La croissance est mutuelle — Quand nos utilisateurs réussissent, nous aussi"
        ]
      },
      commitment: {
        title: "Notre Engagement",
        content: "Nous ne développons pas seulement des outils; nous construisons des cadres qui évoluent avec vous. Au fur et à mesure que nous grandissons, l'engagement d'Atenra reste le même — garder chaque connexion significative, chaque processus transparent et chaque résultat mesurable.",
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
        content: "Atenra redéfinit comment les personnes se connectent avec des professionnels — et cela commence avec l'équipe derrière. Nous croyons en la croissance, l'inclusion et un travail significatif qui responsabilise les personnes dans le monde entier. Que vous soyez dans les opérations, le design, le marketing ou le succès client — il y a une place pour vous ici.",
        highlight: "croissance, inclusion et travail significatif"
      },
      offer: {
        title: "Ce Que Nous Offrons",
        benefits: [
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
      subtitle: "Trouvez des réponses aux questions courantes sur le service de correspondance, les tarifs et notre fonctionnement d'Atenra.",
      subtitleHighlight: "service de correspondance, tarifs et notre fonctionnement",
      questions: [
        {
          q: "Comment fonctionne le processus de correspondance d'Atenra?",
          a: "Nous analysons votre demande, vérifions les professionnels en temps réel, puis combinons perspicacité humaine et IA pour trouver la correspondance idéale."
        },
        {
          q: "Combien de temps faudra-t-il pour être mis en correspondance?",
          a: "Généralement en quelques minutes, selon le type de service et l'emplacement."
        },
        {
          q: "Qu'est-ce qui rend Atenra différent?",
          a: "Chaque correspondance est examinée par des humains, protégée par la confidentialité et axée sur la confiance à long terme."
        },
        {
          q: "Que se passe-t-il si je ne suis pas satisfait?",
          a: "Nous réévaluerons, réassignerons ou rembourserons — selon votre plan."
        },
        {
          q: "Mes informations personnelles sont-elles sécurisées?",
          a: "Oui — nous utilisons un cryptage complet, une gestion interne uniquement et ne vendons jamais de données."
        }
      ],
      sidebar: {
        legalTitle: "Juridique et Confidentialité",
        terms: "Conditions d'Utilisation",
        privacy: "Politique de Confidentialité",
        refund: "Politique de Remboursement / Garantie",
        business: "Accord Commercial",
        featuresTitle: "Fonctionnalités",
        uae: { title: "Siège aux EAU", desc: "pour une confidentialité maximale" },
        noSelling: { title: "Zéro commerce/vente de données", desc: "Vos données restent les vôtres" },
        twoFa: { title: "2FA mondial sécurisé", desc: "Protection multicouche" }
      }
    },
    pricing: {
      title: "Choisissez Votre Plan",
      subtitle: "Tarification transparente pour tous",
      subtitleHighlight: "Tarification transparente",
      student: "Étudiant",
      personal: "Personnel",
      business: "Entreprise"
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
        content: "Atenra entstand aus der Frustration endloser Suchen und Unsicherheit bei der Suche nach zuverlässiger Hilfe. Wir haben uns vorgenommen, das zu vereinfachen — eine Plattform zu schaffen, auf der Technologie die menschliche Verbindung verbessert, nicht ersetzt. Heute definieren wir neu, wie Menschen und Unternehmen vertrauenswürdige Fachleute finden, eine kuratierte Übereinstimmung nach der anderen.",
        highlight: "Technologie die menschliche Verbindung verbessert, nicht ersetzt"
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
        content: "Atenra existiert, um Menschen mit Fachleuten zu verbinden, denen sie vertrauen können. Wir kombinieren modernste Technologie mit echtem menschlichem Urteilsvermögen, um bedeutungsvolle Übereinstimmungen zu schaffen — geleitet von Datenschutz, Integrität und Ergebnissen.",
        highlight: "modernste Technologie mit echtem menschlichem Urteilsvermögen"
      },
      vision: {
        title: "Unsere Vision",
        principle: "Atenra wurde auf einem Prinzip aufgebaut — dass echte Verbindung bessere Ergebnisse schafft. Unsere Vision ist es, neu zu definieren, wie Menschen und Unternehmen zuverlässige Hilfe finden, indem wir intelligente Systeme mit echtem menschlichem Verständnis verbinden.",
        principleHighlight: "echte Verbindung bessere Ergebnisse schafft",
        belief: "Wir glauben, dass Technologie Entscheidungen vereinfachen sollte, nicht Vertrauen ersetzen. Jeder Service, jede Übereinstimmung und jede Partnerschaft basiert auf Transparenz, Effizienz und messbaren Ergebnissen.",
        worldTitle: "Wir schaffen eine Welt, in der:",
        points: [
          "Hilfe finden mühelos ist — Angetrieben von intelligenten Tools und menschlicher Führung",
          "Datenschutz Standard ist, nicht optional",
          "Jede Interaktion Vertrauen aufbaut, nicht Verwirrung",
          "Wachstum gegenseitig ist — Wenn unsere Nutzer erfolgreich sind, sind wir es auch"
        ]
      },
      commitment: {
        title: "Unser Engagement",
        content: "Wir entwickeln nicht nur Tools; wir bauen Frameworks, die sich mit Ihnen weiterentwickeln. Während wir wachsen, bleibt Atenras Engagement gleich — jede Verbindung bedeutungsvoll, jeden Prozess transparent und jedes Ergebnis messbar zu halten.",
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
        content: "Atenra definiert neu, wie Menschen sich mit Fachleuten verbinden — und das beginnt mit dem Team dahinter. Wir glauben an Wachstum, Inklusion und bedeutungsvolle Arbeit, die Menschen weltweit befähigt. Ob Sie sich für Betrieb, Design, Marketing oder Kundenerfolg interessieren — es gibt einen Platz für Sie hier.",
        highlight: "Wachstum, Inklusion und bedeutungsvolle Arbeit"
      },
      offer: {
        title: "Was Wir Anbieten",
        benefits: [
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
      subtitle: "Finden Sie Antworten auf häufige Fragen zu Atenras Matching-Service, Preisen und unserer Arbeitsweise.",
      subtitleHighlight: "Matching-Service, Preisen und unserer Arbeitsweise",
      questions: [
        {
          q: "Wie funktioniert Atenras Matching-Prozess?",
          a: "Wir analysieren Ihre Anfrage, verifizieren Fachleute in Echtzeit und kombinieren dann menschliche Einsicht und KI, um die ideale Übereinstimmung zu finden."
        },
        {
          q: "Wie schnell werde ich vermittelt?",
          a: "Normalerweise innerhalb von Minuten, abhängig von Service-Typ und Standort."
        },
        {
          q: "Was macht Atenra anders?",
          a: "Jede Übereinstimmung wird von Menschen überprüft, durch Datenschutz geschützt und auf langfristiges Vertrauen ausgerichtet."
        },
        {
          q: "Was ist, wenn ich nicht zufrieden bin?",
          a: "Wir bewerten neu, weisen neu zu oder erstatten zurück — abhängig von Ihrem Plan."
        },
        {
          q: "Sind meine persönlichen Informationen sicher?",
          a: "Ja — wir verwenden vollständige Verschlüsselung, nur interne Handhabung und verkaufen niemals Daten."
        }
      ],
      sidebar: {
        legalTitle: "Rechtliches & Datenschutz",
        terms: "Nutzungsbedingungen",
        privacy: "Datenschutzrichtlinie",
        refund: "Rückerstattungs-/Garantierichtlinie",
        business: "Geschäftsvereinbarung",
        featuresTitle: "Funktionen",
        uae: { title: "VAE-Hauptsitz", desc: "für maximalen Datenschutz" },
        noSelling: { title: "Null Datenhandel/-verkauf", desc: "Ihre Daten bleiben Ihre" },
        twoFa: { title: "Sichere globale 2FA", desc: "Mehrschichtiger Schutz" }
      }
    },
    pricing: {
      title: "Wählen Sie Ihren Plan",
      subtitle: "Transparente Preise für alle",
      subtitleHighlight: "Transparente Preise",
      student: "Student",
      personal: "Persönlich",
      business: "Geschäftlich"
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
        content: "Atenra诞生于在寻找可靠帮助时无休止的搜索和不确定性的挫折感。我们着手简化这一点 —— 创建一个技术增强而非取代人际联系的平台。今天，我们正在重新定义人们和企业如何找到值得信赖的专业人士，一次精心策划的匹配。",
        highlight: "技术增强而非取代人际联系"
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
        content: "Atenra的存在是为了将人们与他们可以信任的专业人士联系起来。我们将尖端技术与真正的人类判断相结合，创造有意义的匹配 —— 以隐私、诚信和成果为指导。",
        highlight: "尖端技术与真正的人类判断"
      },
      vision: {
        title: "我们的愿景",
        principle: "Atenra建立在一个原则上 —— 真正的联系创造更好的结果。我们的愿景是重新定义人们和企业如何通过将智能系统与真正的人类理解相结合来找到可靠的帮助。",
        principleHighlight: "真正的联系创造更好的结果",
        belief: "我们相信技术应该简化决策，而不是取代信任。每项服务、每次匹配和每个合作伙伴关系都是围绕透明度、效率和可衡量的结果构建的。",
        worldTitle: "我们正在创造一个世界，其中：",
        points: [
          "寻找帮助毫不费力 —— 由智能工具和人类指导驱动",
          "隐私是标准，而非可选",
          "每次互动都建立信心，而非困惑",
          "增长是相互的 —— 当我们的用户成功时，我们也成功"
        ]
      },
      commitment: {
        title: "我们的承诺",
        content: "我们不仅仅是在开发工具；我们正在构建与您一起发展的框架。随着我们的成长，Atenra的承诺保持不变 —— 保持每个连接有意义、每个过程透明、每个结果可衡量。",
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
        content: "Atenra正在重新定义人们如何与专业人士联系 —— 这始于背后的团队。我们相信增长、包容和赋予全球人民权力的有意义的工作。无论您从事运营、设计、营销还是客户成功 —— 这里都有您的位置。",
        highlight: "增长、包容和有意义的工作"
      },
      offer: {
        title: "我们提供什么",
        benefits: [
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
      subtitle: "查找有关Atenra匹配服务、定价和我们如何工作的常见问题的答案。",
      subtitleHighlight: "匹配服务、定价和我们如何工作",
      questions: [
        {
          q: "Atenra的匹配过程如何工作？",
          a: "我们分析您的请求，实时验证专业人士，然后结合人类洞察和AI找到理想的匹配。"
        },
        {
          q: "我多快会被匹配？",
          a: "通常在几分钟内，取决于服务类型和位置。"
        },
        {
          q: "Atenra有什么不同？",
          a: "每个匹配都经过人工审核、隐私保护，并专注于长期信任。"
        },
        {
          q: "如果我不满意怎么办？",
          a: "我们将重新评估、重新分配或退款 —— 取决于您的计划。"
        },
        {
          q: "我的个人信息安全吗？",
          a: "是的 —— 我们使用完全加密、仅内部处理，永不出售数据。"
        }
      ],
      sidebar: {
        legalTitle: "法律与隐私",
        terms: "服务条款",
        privacy: "隐私政策",
        refund: "退款/保证政策",
        business: "商业协议",
        featuresTitle: "特点",
        uae: { title: "阿联酋总部", desc: "最大限度的隐私" },
        noSelling: { title: "零数据交易/销售", desc: "您的数据属于您" },
        twoFa: { title: "安全的全球2FA", desc: "多层保护" }
      }
    },
    pricing: {
      title: "选择您的计划",
      subtitle: "为每个人提供透明定价",
      subtitleHighlight: "透明定价",
      student: "学生",
      personal: "个人",
      business: "企业"
    }
  }
};

export type NewLanguageCode = keyof typeof newTranslations;
