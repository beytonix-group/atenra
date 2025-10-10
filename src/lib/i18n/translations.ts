export interface Translations {
  navigation: {
    home: string;
    pricing: string;
    about: string;
    more: string;
    faq: string;
    careers: string;
    contact: string;
    signIn: string;
    getStarted: string;
  };
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    subheadline: string;
    bodyText: string;
    getStarted: string;
    partnerWithUs: string;
    trustIndicators: {
      professionals: string;
      categories: string;
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    mostPopular: string;
    perMonth: string;
    freeForever: string;
    tiers: {
      guest: {
        name: string;
        description: string;
        features: string[];
        button: string;
      };
      essentials: {
        name: string;
        description: string;
        features: string[];
        button: string;
      };
      premium: {
        name: string;
        description: string;
        features: string[];
        button: string;
      };
      executive: {
        name: string;
        description: string;
        features: string[];
        button: string;
      };
    };
    business: {
      title: string;
      description: string;
      features: string[];
      button: string;
      disclaimer: string;
    };
  };
  about: {
    title: string;
    mission: string;
    ourStory: string;
    foundedOnTrust: {
      title: string;
      description: string;
    };
    humanFirst: {
      title: string;
      description: string;
    };
    ourValues: string;
    values: {
      privacy: { title: string; description: string };
      human: { title: string; description: string };
      efficiency: { title: string; description: string };
      reliability: { title: string; description: string };
    };
    supportedServices: string;
    services: {
      home: { title: string; description: string };
      logistics: { title: string; description: string };
      wellness: { title: string; description: string };
      vehicle: { title: string; description: string };
      professional: { title: string; description: string };
      more: { title: string; description: string };
    };
  };
  industries?: {
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
  careers?: {
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
  faq?: {
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
  contact: {
    title: string;
    subtitle: string;
    form: {
      title: string;
      name: string;
      email: string;
      subject: string;
      message: string;
      send: string;
      sending: string;
      success: string;
      successMessage: string;
      sendAnother: string;
      subjects: {
        general: string;
        support: string;
        billing: string;
        partnership: string;
        feedback: string;
        media: string;
      };
    };
    info: {
      title: string;
      email: { title: string; description: string };
      phone: { title: string; description: string };
      location: { title: string; description: string };
      response: { title: string; description: string };
      community: { title: string; description: string; link: string };
    };
  };
  social: {
    title: string;
    subtitle: string;
    followUs: string;
    followUsSubtitle: string;
    joinCommunity: string;
    joinCommunitySubtitle: string;
    stayUpdated: string;
    stayUpdatedSubtitle: string;
    subscribe: string;
    emailPlaceholder: string;
    disclaimer: string;
  };
  more: {
    title: string;
    subtitle: string;
    faq: string;
    legalPrivacy: string;
    privacyGuarantees: string;
    legalInformation: string;
    legalQuestions: string;
    legalQuestionsText: string;
  };
  footer: {
    contact: string;
    connect: string;
    copyright: string;
  };
  auth: {
    signIn: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      rememberMe: string;
      forgotPassword: string;
      signInButton: string;
      signInWithGoogle: string;
      or: string;
      noAccount: string;
      signUp: string;
      errors: {
        invalidCredentials: string;
        googleSignInFailed: string;
        somethingWentWrong: string;
      };
    };
    signUp: {
      title: string;
      subtitle: string;
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      createAccount: string;
      continueWithGoogle: string;
      or: string;
      alreadyHaveAccount: string;
      signIn: string;
      agreeToTerms: string;
      termsOfService: string;
      and: string;
      privacyPolicy: string;
      placeholders: {
        fullName: string;
        email: string;
        password: string;
        confirmPassword: string;
      };
      emailSent: {
        title: string;
        message: string;
        resendVerification: string;
        didNotReceive: string;
      };
      errors: {
        nameRequired: string;
        invalidEmail: string;
        passwordLength: string;
        passwordMismatch: string;
        emailExists: string;
        registrationFailed: string;
        somethingWentWrong: string;
        googleSignInFailed: string;
      };
    };
  };
}

export const translations: Record<string, Translations> = {
  en: {
    navigation: {
      home: "Home",
      pricing: "Pricing",
      about: "About",
      more: "More",
      faq: "FAQ's",
      careers: "Careers",
      contact: "Contact",
      signIn: "Sign In",
      getStarted: "Get Started"
    },
    hero: {
      title: "Atenra",
      subtitle: "Atenra",
      tagline: "Your Personal & Business Assistant, On Demand",
      subheadline: "Discover trusted professionals through intelligent matching — where technology meets genuine human insight.",
      bodyText: "At Atenra, every connection is hand-verified, thoughtfully matched, and designed to make your life easier. Whether it's managing your business, your home, or your next big project — we connect you with professionals who deliver results.",
      getStarted: "Get Started",
      partnerWithUs: "Partner With Us",
      trustIndicators: {
        professionals: "1000+ Verified Professionals",
        categories: "20+ Service Categories"
      }
    },
    pricing: {
      title: "Simple, transparent pricing",
      subtitle: "Choose the perfect plan for your needs. Always flexible to scale",
      mostPopular: "MOST POPULAR",
      perMonth: "per month",
      freeForever: "Free forever",
      tiers: {
        guest: {
          name: "Guest",
          description: "Perfect for individuals getting started",
          features: [
            "Basic dashboard access",
            "Community forum access", 
            "Public documentation",
            "Tutorial library",
            "Email support"
          ],
          button: "Get Started"
        },
        essentials: {
          name: "Essentials",
          description: "Everything you need to grow",
          features: [
            "Everything in Guest",
            "Project participation tools",
            "Internal dashboards",
            "KPI tracking & analytics", 
            "Direct priority support",
            "Team collaboration tools"
          ],
          button: "Start Free Trial"
        },
        premium: {
          name: "Premium",
          description: "Advanced features for teams", 
          features: [
            "Everything in Essentials",
            "Custom analytics & reporting",
            "Role-based access control",
            "Voting rights",
            "Multi-project management",
            "API access",
            "24/7 phone support"
          ],
          button: "Start Free Trial"
        },
        executive: {
          name: "Executive",
          description: "Complete control & customization",
          features: [
            "Everything in Premium",
            "Full platform access",
            "Policy decision voting", 
            "Cross-tier management",
            "Governance visibility",
            "Capital allocation tools",
            "Custom integrations",
            "Dedicated account manager"
          ],
          button: "Contact Sales"
        }
      },
      business: {
        title: "Premium Business Partnership",
        description: "Join our exclusive network of verified service providers. Start with our risk-free 3-month trial.",
        features: ["3-month trial period", "Full refund guarantee", "Premium listing benefits", "Dedicated support"],
        button: "Start Partnership Trial",
        disclaimer: "No credit card required • Cancel anytime"
      }
    },
    about: {
      title: "About Atenra",
      mission: "Our mission is to revolutionize how people connect with trusted service providers through human-first matching, cutting-edge technology, and unwavering commitment to privacy and results.",
      ourStory: "Our Story",
      foundedOnTrust: {
        title: "Founded on Trust",
        description: "Atenra was born from the frustration of endless searching, comparing, and uncertainty when finding reliable service providers. We recognized that people deserved a better way—one that prioritized human connection and expert curation over automated algorithms."
      },
      humanFirst: {
        title: "Human-First Approach", 
        description: "Every match is carefully evaluated by our team of experts who understand local markets, service quality, and client needs. We combine this human insight with advanced technology to deliver results that exceed expectations."
      },
      ourValues: "Our Values",
      values: {
        privacy: { title: "Privacy First", description: "Your data is never sold or compromised" },
        human: { title: "Human Connection", description: "Real people guiding every match" },
        efficiency: { title: "Efficiency", description: "Results delivered in minutes, not days" },
        reliability: { title: "Reliability", description: "Consistent quality you can trust" }
      },
      supportedServices: "Supported Services",
      services: {
        home: { title: "Home Repairs", description: "Professional home maintenance and repairs" },
        logistics: { title: "Logistics", description: "Moving, delivery, and transportation services" },
        wellness: { title: "Wellness", description: "Personal training, therapy, and health services" },
        vehicle: { title: "Vehicle Services", description: "Auto repair, detailing, and maintenance" },
        professional: { title: "Professional Services", description: "Legal, financial, and consulting services" },
        more: { title: "& More", description: "Expanding catalog of trusted service providers" }
      }
    },
    contact: {
      title: "Get in Touch",
      subtitle: "Have questions? Need support? Want to partner with us? We'd love to hear from you.",
      form: {
        title: "Send us a message",
        name: "Name",
        email: "Email", 
        subject: "Subject",
        message: "Message",
        send: "Send Message",
        sending: "Sending...",
        success: "Message Sent!",
        successMessage: "Thank you for reaching out. We'll get back to you within 24 hours.",
        sendAnother: "Send Another Message",
        subjects: {
          general: "General Inquiry",
          support: "Technical Support",
          billing: "Billing Question",
          partnership: "Business Partnership",
          feedback: "Feedback & Suggestions",
          media: "Media Inquiry"
        }
      },
      info: {
        title: "Get in touch",
        email: { title: "Email Support", description: "We typically respond within 24 hours" },
        phone: { title: "Phone Support", description: "Available Mon-Fri, 9am-6pm EST" },
        location: { title: "Office Location", description: "Serving clients nationwide" },
        response: { title: "Response Times", description: "Premium tiers get priority support" },
        community: { title: "Prefer to chat?", description: "Join our community forums for quick questions and peer support.", link: "Visit Community Forums →" }
      }
    },
    social: {
      title: "Connect with Atenra",
      subtitle: "Follow our journey as we revolutionize service discovery. Join our community across all platforms for insights, updates, and expert tips.",
      followUs: "Follow Us Everywhere",
      followUsSubtitle: "Stay connected across all your favorite platforms for the latest updates and insights.",
      joinCommunity: "Join Our Community", 
      joinCommunitySubtitle: "Beyond social media, engage with our community through various interactive platforms.",
      stayUpdated: "Stay Updated",
      stayUpdatedSubtitle: "Get the latest updates, industry insights, and exclusive tips delivered directly to your inbox.",
      subscribe: "Subscribe",
      emailPlaceholder: "Enter your email",
      disclaimer: "We respect your privacy. Unsubscribe anytime."
    },
    more: {
      title: "More Information",
      subtitle: "Everything you need to know about using Atenra, our policies, and legal information.",
      faq: "Frequently Asked Questions",
      legalPrivacy: "Legal & Privacy",
      privacyGuarantees: "Privacy Guarantees",
      legalInformation: "Legal Information",
      legalQuestions: "Legal Questions?",
      legalQuestionsText: "Contact our legal team for any questions about terms, privacy, or compliance."
    },
    footer: {
      contact: "Contact",
      connect: "Connect", 
      copyright: "© 2025 Atenra. Built for transparency."
    },
    auth: {
      signIn: {
        title: "Welcome back",
        subtitle: "Sign in to your account to continue",
        email: "Email",
        password: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        signInButton: "Sign In",
        signInWithGoogle: "Continue with Google",
        or: "or",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        errors: {
          invalidCredentials: "Invalid email or password",
          googleSignInFailed: "Google sign-in failed. Please try again.",
          somethingWentWrong: "Something went wrong. Please try again."
        }
      },
      signUp: {
        title: "Create your account",
        subtitle: "Join thousands of users finding trusted services",
        fullName: "Full Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        createAccount: "Create Account",
        continueWithGoogle: "Continue with Google",
        or: "or",
        alreadyHaveAccount: "Already have an account?",
        signIn: "Sign in",
        agreeToTerms: "I agree to the",
        termsOfService: "Terms of Service",
        and: "and",
        privacyPolicy: "Privacy Policy",
        placeholders: {
          fullName: "John Doe",
          email: "your.email@example.com",
          password: "Create a strong password",
          confirmPassword: "Confirm your password"
        },
        emailSent: {
          title: "Check your email",
          message: "We've sent a verification link to your email address. Please click the link to complete your registration.",
          resendVerification: "Resend verification",
          didNotReceive: "Didn't receive the email?"
        },
        errors: {
          nameRequired: "Name must be at least 2 characters",
          invalidEmail: "Please enter a valid email address",
          passwordLength: "Password must be at least 8 characters",
          passwordMismatch: "Passwords do not match",
          emailExists: "This email address is already in use",
          registrationFailed: "Registration failed",
          somethingWentWrong: "Something went wrong. Please try again.",
          googleSignInFailed: "Google sign-in failed. Please try again."
        }
      }
    }
  },
  es: {
    navigation: {
      home: "Inicio",
      pricing: "Precios",
      about: "Acerca de",
      more: "Más",
      faq: "Preguntas Frecuentes",
      careers: "Carreras",
      contact: "Contacto",
      signIn: "Iniciar Sesión",
      getStarted: "Comenzar"
    },
    hero: {
      title: "Atenra",
      subtitle: "Atenra",
      tagline: "Tu Asistente Personal y Empresarial, A Demanda",
      subheadline: "Descubre profesionales de confianza a través de coincidencias inteligentes — donde la tecnología se encuentra con la perspicacia humana genuina.",
      bodyText: "En Atenra, cada conexión está verificada a mano, cuidadosamente emparejada y diseñada para facilitar tu vida. Ya sea que estés administrando tu negocio, tu hogar o tu próximo gran proyecto — te conectamos con profesionales que entregan resultados.",
      getStarted: "Comenzar",
      partnerWithUs: "Asóciate Con Nosotros",
      trustIndicators: {
        professionals: "1000+ Profesionales Verificados",
        categories: "20+ Categorías de Servicios"
      }
    },
    pricing: {
      title: "Precios simples y transparentes",
      subtitle: "Elige el plan perfecto para tus necesidades. Siempre flexible para escalar",
      mostPopular: "MÁS POPULAR",
      perMonth: "por mes",
      freeForever: "Gratis para siempre",
      tiers: {
        guest: {
          name: "Invitado",
          description: "Perfecto para individuos que comienzan",
          features: [
            "Acceso básico al panel",
            "Acceso al foro comunitario",
            "Documentación pública", 
            "Biblioteca de tutoriales",
            "Soporte por email"
          ],
          button: "Comenzar"
        },
        essentials: {
          name: "Esenciales", 
          description: "Todo lo que necesitas para crecer",
          features: [
            "Todo en Invitado",
            "Herramientas de participación en proyectos",
            "Paneles internos",
            "Seguimiento de KPI y análisis",
            "Soporte directo prioritario", 
            "Herramientas de colaboración en equipo"
          ],
          button: "Comenzar Prueba Gratuita"
        },
        premium: {
          name: "Premium",
          description: "Funciones avanzadas para equipos",
          features: [
            "Todo en Esenciales",
            "Análisis e informes personalizados",
            "Control de acceso basado en roles",
            "Derechos de voto",
            "Gestión multi-proyecto",
            "Acceso a API",
            "Soporte telefónico 24/7"
          ],
          button: "Comenzar Prueba Gratuita"
        },
        executive: {
          name: "Ejecutivo",
          description: "Control completo y personalización",
          features: [
            "Todo en Premium",
            "Acceso completo a la plataforma",
            "Votación de decisiones de política",
            "Gestión entre niveles",
            "Visibilidad de gobernanza", 
            "Herramientas de asignación de capital",
            "Integraciones personalizadas",
            "Gerente de cuenta dedicado"
          ],
          button: "Contactar Ventas"
        }
      },
      business: {
        title: "Asociación Empresarial Premium",
        description: "Únete a nuestra red exclusiva de proveedores de servicios verificados. Comienza con nuestra prueba sin riesgo de 3 meses.",
        features: ["Período de prueba de 3 meses", "Garantía de reembolso completo", "Beneficios de listado premium", "Soporte dedicado"],
        button: "Comenzar Prueba de Asociación",
        disclaimer: "No se requiere tarjeta de crédito • Cancela en cualquier momento"
      }
    },
    about: {
      title: "Acerca de Atenra",
      mission: "Nuestra misión es revolucionar cómo las personas se conectan con proveedores de servicios confiables a través de coincidencias centradas en humanos, tecnología de vanguardia y compromiso inquebrantable con la privacidad y los resultados.",
      ourStory: "Nuestra Historia",
      foundedOnTrust: {
        title: "Fundado en la Confianza",
        description: "Atenra nació de la frustración de búsquedas interminables, comparaciones e incertidumbre al encontrar proveedores de servicios confiables. Reconocimos que las personas merecían un mejor camino: uno que priorizara la conexión humana y la curación experta sobre algoritmos automatizados."
      },
      humanFirst: {
        title: "Enfoque Centrado en Humanos",
        description: "Cada coincidencia es cuidadosamente evaluada por nuestro equipo de expertos que entienden los mercados locales, la calidad del servicio y las necesidades del cliente. Combinamos esta perspicacia humana con tecnología avanzada para entregar resultados que superan las expectativas."
      },
      ourValues: "Nuestros Valores",
      values: {
        privacy: { title: "Privacidad Primero", description: "Tus datos nunca se venden o comprometen" },
        human: { title: "Conexión Humana", description: "Personas reales guiando cada coincidencia" },
        efficiency: { title: "Eficiencia", description: "Resultados entregados en minutos, no días" },
        reliability: { title: "Confiabilidad", description: "Calidad consistente en la que puedes confiar" }
      },
      supportedServices: "Servicios Soportados",
      services: {
        home: { title: "Reparaciones del Hogar", description: "Mantenimiento y reparaciones profesionales del hogar" },
        logistics: { title: "Logística", description: "Servicios de mudanza, entrega y transporte" },
        wellness: { title: "Bienestar", description: "Entrenamiento personal, terapia y servicios de salud" },
        vehicle: { title: "Servicios Vehiculares", description: "Reparación, detallado y mantenimiento de autos" },
        professional: { title: "Servicios Profesionales", description: "Servicios legales, financieros y de consultoría" },
        more: { title: "Y Más", description: "Catálogo en expansión de proveedores de servicios confiables" }
      }
    },
    contact: {
      title: "Ponerse en Contacto",
      subtitle: "¿Tienes preguntas? ¿Necesitas soporte? ¿Quieres asociarte con nosotros? Nos encantaría saber de ti.",
      form: {
        title: "Envíanos un mensaje",
        name: "Nombre",
        email: "Email",
        subject: "Asunto",
        message: "Mensaje",
        send: "Enviar Mensaje",
        sending: "Enviando...",
        success: "¡Mensaje Enviado!",
        successMessage: "Gracias por contactarnos. Te responderemos en 24 horas.",
        sendAnother: "Enviar Otro Mensaje",
        subjects: {
          general: "Consulta General",
          support: "Soporte Técnico",
          billing: "Pregunta de Facturación",
          partnership: "Asociación Empresarial",
          feedback: "Comentarios y Sugerencias",
          media: "Consulta de Medios"
        }
      },
      info: {
        title: "Ponte en contacto",
        email: { title: "Soporte por Email", description: "Normalmente respondemos en 24 horas" },
        phone: { title: "Soporte Telefónico", description: "Disponible Lun-Vie, 9am-6pm EST" },
        location: { title: "Ubicación de Oficina", description: "Sirviendo clientes a nivel nacional" },
        response: { title: "Tiempos de Respuesta", description: "Los niveles premium obtienen soporte prioritario" },
        community: { title: "¿Prefieres chatear?", description: "Únete a nuestros foros comunitarios para preguntas rápidas y soporte entre pares.", link: "Visitar Foros Comunitarios →" }
      }
    },
    social: {
      title: "Conéctate con Atenra",
      subtitle: "Sigue nuestro viaje mientras revolucionamos el descubrimiento de servicios. Únete a nuestra comunidad en todas las plataformas para insights, actualizaciones y consejos de expertos.",
      followUs: "Síguenos en Todas Partes",
      followUsSubtitle: "Mantente conectado en todas tus plataformas favoritas para las últimas actualizaciones e insights.",
      joinCommunity: "Únete a Nuestra Comunidad",
      joinCommunitySubtitle: "Más allá de las redes sociales, participa con nuestra comunidad a través de varias plataformas interactivas.",
      stayUpdated: "Mantente Actualizado",
      stayUpdatedSubtitle: "Recibe las últimas actualizaciones, insights de la industria y consejos exclusivos directamente en tu bandeja de entrada.",
      subscribe: "Suscribirse",
      emailPlaceholder: "Ingresa tu email",
      disclaimer: "Respetamos tu privacidad. Cancela suscripción en cualquier momento."
    },
    more: {
      title: "Más Información",
      subtitle: "Todo lo que necesitas saber sobre usar Atenra, nuestras políticas e información legal.",
      faq: "Preguntas Frecuentes",
      legalPrivacy: "Legal y Privacidad",
      privacyGuarantees: "Garantías de Privacidad",
      legalInformation: "Información Legal",
      legalQuestions: "¿Preguntas Legales?",
      legalQuestionsText: "Contacta a nuestro equipo legal para cualquier pregunta sobre términos, privacidad o cumplimiento."
    },
    footer: {
      contact: "Contacto",
      connect: "Conectar",
      copyright: "© 2025 Atenra. Construido para la transparencia."
    },
    auth: {
      signIn: {
        title: "Bienvenido de vuelta",
        subtitle: "Inicia sesión en tu cuenta para continuar",
        email: "Correo electrónico",
        password: "Contraseña",
        rememberMe: "Recordarme",
        forgotPassword: "¿Olvidaste tu contraseña?",
        signInButton: "Iniciar Sesión",
        signInWithGoogle: "Continuar con Google",
        or: "o",
        noAccount: "¿No tienes una cuenta?",
        signUp: "Registrarse",
        errors: {
          invalidCredentials: "Correo electrónico o contraseña inválidos",
          googleSignInFailed: "Error al iniciar sesión con Google. Inténtalo de nuevo.",
          somethingWentWrong: "Algo salió mal. Inténtalo de nuevo."
        }
      },
      signUp: {
        title: "Crear tu cuenta",
        subtitle: "Únete a miles de usuarios encontrando servicios confiables",
        fullName: "Nombre Completo",
        email: "Correo electrónico",
        password: "Contraseña",
        confirmPassword: "Confirmar Contraseña",
        createAccount: "Crear Cuenta",
        continueWithGoogle: "Continuar con Google",
        or: "o",
        alreadyHaveAccount: "¿Ya tienes una cuenta?",
        signIn: "Iniciar sesión",
        agreeToTerms: "Acepto los",
        termsOfService: "Términos de Servicio",
        and: "y",
        privacyPolicy: "Política de Privacidad",
        placeholders: {
          fullName: "Juan Pérez",
          email: "tu.correo@ejemplo.com",
          password: "Crea una contraseña segura",
          confirmPassword: "Confirma tu contraseña"
        },
        emailSent: {
          title: "Revisa tu correo electrónico",
          message: "Hemos enviado un enlace de verificación a tu dirección de correo electrónico. Por favor, haz clic en el enlace para completar tu registro.",
          resendVerification: "Reenviar verificación",
          didNotReceive: "¿No recibiste el correo?"
        },
        errors: {
          nameRequired: "El nombre debe tener al menos 2 caracteres",
          invalidEmail: "Por favor, ingresa una dirección de correo válida",
          passwordLength: "La contraseña debe tener al menos 8 caracteres",
          passwordMismatch: "Las contraseñas no coinciden",
          emailExists: "Esta dirección de correo ya está en uso",
          registrationFailed: "Registro fallido",
          somethingWentWrong: "Algo salió mal. Inténtalo de nuevo.",
          googleSignInFailed: "Error al iniciar sesión con Google. Inténtalo de nuevo."
        }
      }
    }
  },
  fr: {
    navigation: {
      home: "Accueil",
      pricing: "Tarifs",
      about: "À propos",
      more: "Plus",
      faq: "FAQ",
      careers: "Carrières",
      contact: "Contact",
      signIn: "Se connecter",
      getStarted: "Commencer"
    },
    hero: {
      title: "Atenra",
      subtitle: "Atenra",
      tagline: "Votre Assistant Personnel et Professionnel, À la Demande",
      subheadline: "Découvrez des professionnels de confiance grâce à une correspondance intelligente — où la technologie rencontre une véritable perspicacité humaine.",
      bodyText: "Chez Atenra, chaque connexion est vérifiée manuellement, soigneusement appariée et conçue pour faciliter votre vie. Que ce soit pour gérer votre entreprise, votre maison ou votre prochain grand projet — nous vous connectons avec des professionnels qui livrent des résultats.",
      getStarted: "Commencer",
      partnerWithUs: "Partenaire Avec Nous",
      trustIndicators: {
        professionals: "1000+ Professionnels Vérifiés",
        categories: "20+ Catégories de Services"
      }
    },
    pricing: {
      title: "Tarification simple et transparente",
      subtitle: "Choisissez le plan parfait pour vos besoins. Toujours flexible pour évoluer",
      mostPopular: "PLUS POPULAIRE",
      perMonth: "par mois",
      freeForever: "Gratuit pour toujours",
      tiers: {
        guest: {
          name: "Invité",
          description: "Parfait pour les individus qui commencent",
          features: [
            "Accès au tableau de bord de base",
            "Accès au forum communautaire",
            "Documentation publique",
            "Bibliothèque de tutoriels", 
            "Support par email"
          ],
          button: "Commencer"
        },
        essentials: {
          name: "Essentiels",
          description: "Tout ce dont vous avez besoin pour grandir",
          features: [
            "Tout dans Invité",
            "Outils de participation aux projets", 
            "Tableaux de bord internes",
            "Suivi KPI et analyses",
            "Support direct prioritaire",
            "Outils de collaboration d'équipe"
          ],
          button: "Commencer Essai Gratuit"
        },
        premium: {
          name: "Premium",
          description: "Fonctionnalités avancées pour les équipes",
          features: [
            "Tout dans Essentiels",
            "Analyses et rapports personnalisés",
            "Contrôle d'accès basé sur les rôles",
            "Droits de vote",
            "Gestion multi-projets",
            "Accès API",
            "Support téléphonique 24/7"
          ],
          button: "Commencer Essai Gratuit"
        },
        executive: {
          name: "Exécutif",
          description: "Contrôle complet et personnalisation",
          features: [
            "Tout dans Premium",
            "Accès complet à la plateforme",
            "Vote sur les décisions politiques",
            "Gestion inter-niveaux",
            "Visibilité de la gouvernance",
            "Outils d'allocation de capital",
            "Intégrations personnalisées",
            "Gestionnaire de compte dédié"
          ],
          button: "Contacter les Ventes"
        }
      },
      business: {
        title: "Partenariat d'Entreprise Premium",
        description: "Rejoignez notre réseau exclusif de fournisseurs de services vérifiés. Commencez avec notre essai sans risque de 3 mois.",
        features: ["Période d'essai de 3 mois", "Garantie de remboursement complet", "Avantages de listage premium", "Support dédié"],
        button: "Commencer Essai de Partenariat",
        disclaimer: "Aucune carte de crédit requise • Annulez à tout moment"
      }
    },
    about: {
      title: "À propos d'Atenra",
      mission: "Notre mission est de révolutionner la façon dont les gens se connectent avec des fournisseurs de services de confiance grâce à une correspondance centrée sur l'humain, une technologie de pointe et un engagement inébranlable envers la confidentialité et les résultats.",
      ourStory: "Notre Histoire",
      foundedOnTrust: {
        title: "Fondé sur la Confiance",
        description: "Atenra est né de la frustration des recherches interminables, des comparaisons et de l'incertitude lors de la recherche de fournisseurs de services fiables. Nous avons reconnu que les gens méritaient une meilleure voie—une qui priorisait la connexion humaine et la curation experte plutôt que les algorithmes automatisés."
      },
      humanFirst: {
        title: "Approche Centrée sur l'Humain",
        description: "Chaque correspondance est soigneusement évaluée par notre équipe d'experts qui comprennent les marchés locaux, la qualité des services et les besoins des clients. Nous combinons cette perspicacité humaine avec une technologie avancée pour fournir des résultats qui dépassent les attentes."
      },
      ourValues: "Nos Valeurs",
      values: {
        privacy: { title: "Confidentialité d'Abord", description: "Vos données ne sont jamais vendues ou compromises" },
        human: { title: "Connexion Humaine", description: "De vraies personnes guidant chaque correspondance" },
        efficiency: { title: "Efficacité", description: "Résultats livrés en minutes, pas en jours" },
        reliability: { title: "Fiabilité", description: "Qualité constante sur laquelle vous pouvez compter" }
      },
      supportedServices: "Services Supportés",
      services: {
        home: { title: "Réparations Domestiques", description: "Maintenance et réparations professionnelles de la maison" },
        logistics: { title: "Logistique", description: "Services de déménagement, livraison et transport" },
        wellness: { title: "Bien-être", description: "Entraînement personnel, thérapie et services de santé" },
        vehicle: { title: "Services Véhiculaires", description: "Réparation, détaillage et maintenance automobile" },
        professional: { title: "Services Professionnels", description: "Services juridiques, financiers et de conseil" },
        more: { title: "Et Plus", description: "Catalogue en expansion de fournisseurs de services de confiance" }
      }
    },
    contact: {
      title: "Entrer en Contact",
      subtitle: "Vous avez des questions? Besoin de support? Voulez-vous vous associer avec nous? Nous aimerions avoir de vos nouvelles.",
      form: {
        title: "Envoyez-nous un message",
        name: "Nom",
        email: "Email",
        subject: "Sujet", 
        message: "Message",
        send: "Envoyer le Message",
        sending: "Envoi...",
        success: "Message Envoyé!",
        successMessage: "Merci de nous avoir contactés. Nous vous répondrons dans les 24 heures.",
        sendAnother: "Envoyer un Autre Message",
        subjects: {
          general: "Demande Générale",
          support: "Support Technique",
          billing: "Question de Facturation",
          partnership: "Partenariat d'Entreprise", 
          feedback: "Commentaires et Suggestions",
          media: "Demande Média"
        }
      },
      info: {
        title: "Entrer en contact",
        email: { title: "Support par Email", description: "Nous répondons généralement dans les 24 heures" },
        phone: { title: "Support Téléphonique", description: "Disponible Lun-Ven, 9h-18h EST" },
        location: { title: "Emplacement du Bureau", description: "Au service des clients à l'échelle nationale" },
        response: { title: "Temps de Réponse", description: "Les niveaux premium obtiennent un support prioritaire" },
        community: { title: "Préférez-vous chatter?", description: "Rejoignez nos forums communautaires pour des questions rapides et le support par les pairs.", link: "Visiter les Forums Communautaires →" }
      }
    },
    social: {
      title: "Connectez-vous avec Atenra",
      subtitle: "Suivez notre parcours alors que nous révolutionnons la découverte de services. Rejoignez notre communauté sur toutes les plateformes pour des insights, mises à jour et conseils d'experts.",
      followUs: "Suivez-nous Partout",
      followUsSubtitle: "Restez connecté sur toutes vos plateformes préférées pour les dernières mises à jour et insights.",
      joinCommunity: "Rejoignez Notre Communauté",
      joinCommunitySubtitle: "Au-delà des réseaux sociaux, engagez-vous avec notre communauté à travers diverses plateformes interactives.",
      stayUpdated: "Restez à Jour",
      stayUpdatedSubtitle: "Recevez les dernières mises à jour, insights de l'industrie et conseils exclusifs directement dans votre boîte de réception.",
      subscribe: "S'abonner",
      emailPlaceholder: "Entrez votre email",
      disclaimer: "Nous respectons votre vie privée. Désabonnez-vous à tout moment."
    },
    more: {
      title: "Plus d'Informations",
      subtitle: "Tout ce que vous devez savoir sur l'utilisation d'Atenra, nos politiques et informations légales.",
      faq: "Questions Fréquemment Posées",
      legalPrivacy: "Légal et Confidentialité",
      privacyGuarantees: "Garanties de Confidentialité",
      legalInformation: "Information Légale",
      legalQuestions: "Questions Légales?",
      legalQuestionsText: "Contactez notre équipe légale pour toute question concernant les termes, la confidentialité ou la conformité."
    },
    footer: {
      contact: "Contact",
      connect: "Connecter",
      copyright: "© 2025 Atenra. Construit pour la transparence."
    },
    auth: {
      signIn: {
        title: "Bon retour",
        subtitle: "Connectez-vous à votre compte pour continuer",
        email: "E-mail",
        password: "Mot de passe",
        rememberMe: "Se souvenir de moi",
        forgotPassword: "Mot de passe oublié ?",
        signInButton: "Se connecter",
        signInWithGoogle: "Continuer avec Google",
        or: "ou",
        noAccount: "Vous n'avez pas de compte ?",
        signUp: "S'inscrire",
        errors: {
          invalidCredentials: "E-mail ou mot de passe invalide",
          googleSignInFailed: "Échec de la connexion Google. Veuillez réessayer.",
          somethingWentWrong: "Quelque chose s'est mal passé. Veuillez réessayer."
        }
      },
      signUp: {
        title: "Créer votre compte",
        subtitle: "Rejoignez des milliers d'utilisateurs qui trouvent des services de confiance",
        fullName: "Nom complet",
        email: "E-mail",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        createAccount: "Créer un compte",
        continueWithGoogle: "Continuer avec Google",
        or: "ou",
        alreadyHaveAccount: "Vous avez déjà un compte ?",
        signIn: "Se connecter",
        agreeToTerms: "J'accepte les",
        termsOfService: "Conditions d'utilisation",
        and: "et",
        privacyPolicy: "Politique de confidentialité",
        placeholders: {
          fullName: "Jean Dupont",
          email: "votre.email@exemple.com",
          password: "Créez un mot de passe fort",
          confirmPassword: "Confirmez votre mot de passe"
        },
        emailSent: {
          title: "Vérifiez votre e-mail",
          message: "Nous avons envoyé un lien de vérification à votre adresse e-mail. Veuillez cliquer sur le lien pour terminer votre inscription.",
          resendVerification: "Renvoyer la vérification",
          didNotReceive: "Vous n'avez pas reçu l'e-mail ?"
        },
        errors: {
          nameRequired: "Le nom doit contenir au moins 2 caractères",
          invalidEmail: "Veuillez saisir une adresse e-mail valide",
          passwordLength: "Le mot de passe doit contenir au moins 8 caractères",
          passwordMismatch: "Les mots de passe ne correspondent pas",
          emailExists: "Cette adresse e-mail est déjà utilisée",
          registrationFailed: "Échec de l'inscription",
          somethingWentWrong: "Quelque chose s'est mal passé. Veuillez réessayer.",
          googleSignInFailed: "Échec de la connexion Google. Veuillez réessayer."
        }
      }
    }
  },
  de: {
    navigation: {
      home: "Startseite",
      pricing: "Preise",
      about: "Über uns",
      more: "Mehr",
      faq: "FAQ",
      careers: "Karriere",
      contact: "Kontakt",
      signIn: "Anmelden",
      getStarted: "Loslegen"
    },
    hero: {
      title: "Atenra",
      subtitle: "Atenra",
      tagline: "Ihr Persönlicher und Geschäftlicher Assistent, Auf Abruf",
      subheadline: "Entdecken Sie vertrauenswürdige Fachleute durch intelligente Vermittlung — wo Technologie auf echte menschliche Einsicht trifft.",
      bodyText: "Bei Atenra ist jede Verbindung von Hand überprüft, sorgfältig abgestimmt und darauf ausgelegt, Ihr Leben einfacher zu machen. Ob Sie Ihr Unternehmen, Ihr Zuhause oder Ihr nächstes großes Projekt verwalten — wir verbinden Sie mit Fachleuten, die Ergebnisse liefern.",
      getStarted: "Beginnen",
      partnerWithUs: "Partner Werden",
      trustIndicators: {
        professionals: "1000+ Verifizierte Fachleute",
        categories: "20+ Service-Kategorien"
      }
    },
    pricing: {
      title: "Einfache, transparente Preise",
      subtitle: "Wählen Sie den perfekten Plan für Ihre Bedürfnisse. Immer flexibel skalierbar",
      mostPopular: "AM BELIEBTESTEN",
      perMonth: "pro Monat",
      freeForever: "Für immer kostenlos",
      tiers: {
        guest: {
          name: "Gast",
          description: "Perfekt für Einzelpersonen die beginnen",
          features: [
            "Basis Dashboard-Zugang",
            "Community-Forum-Zugang",
            "Öffentliche Dokumentation",
            "Tutorial-Bibliothek",
            "E-Mail-Support"
          ],
          button: "Beginnen"
        },
        essentials: {
          name: "Grundlagen",
          description: "Alles was Sie zum Wachsen brauchen", 
          features: [
            "Alles in Gast",
            "Projekt-Teilnahme-Tools",
            "Interne Dashboards",
            "KPI-Tracking & Analysen",
            "Direkter Priority-Support",
            "Team-Kollaborations-Tools"
          ],
          button: "Kostenlose Testversion Starten"
        },
        premium: {
          name: "Premium",
          description: "Erweiterte Funktionen für Teams",
          features: [
            "Alles in Grundlagen",
            "Benutzerdefinierte Analysen & Berichte",
            "Rollenbasierte Zugriffskontrolle",
            "Stimmrechte",
            "Multi-Projekt-Management",
            "API-Zugang",
            "24/7 Telefon-Support"
          ],
          button: "Kostenlose Testversion Starten"
        },
        executive: {
          name: "Führungskraft",
          description: "Vollständige Kontrolle & Anpassung",
          features: [
            "Alles in Premium",
            "Vollständiger Plattform-Zugang",
            "Politik-Entscheidungs-Abstimmung",
            "Ebenen-übergreifendes Management",
            "Governance-Sichtbarkeit",
            "Kapitalzuteilungs-Tools",
            "Benutzerdefinierte Integrationen", 
            "Dedizierter Account-Manager"
          ],
          button: "Vertrieb Kontaktieren"
        }
      },
      business: {
        title: "Premium Business-Partnerschaft",
        description: "Treten Sie unserem exklusiven Netzwerk verifizierter Service-Anbieter bei. Beginnen Sie mit unserem risikofreien 3-Monats-Test.",
        features: ["3-Monats-Testzeit", "Vollständige Rückerstattungsgarantie", "Premium-Listing-Vorteile", "Dedizierter Support"],
        button: "Partnerschaftstest Starten",
        disclaimer: "Keine Kreditkarte erforderlich • Jederzeit kündbar"
      }
    },
    about: {
      title: "Über Atenra",
      mission: "Unsere Mission ist es, zu revolutionieren, wie Menschen sich mit vertrauenswürdigen Service-Anbietern verbinden durch menschenzentrierte Vermittlung, modernste Technologie und unerschütterliches Engagement für Datenschutz und Ergebnisse.",
      ourStory: "Unsere Geschichte",
      foundedOnTrust: {
        title: "Auf Vertrauen Gegründet",
        description: "Atenra entstand aus der Frustration endloser Suchen, Vergleiche und Unsicherheit beim Finden zuverlässiger Service-Anbieter. Wir erkannten, dass Menschen einen besseren Weg verdienten—einen der menschliche Verbindung und Experten-Kuration über automatisierte Algorithmen priorisierte."
      },
      humanFirst: {
        title: "Menschenzentrierter Ansatz",
        description: "Jede Vermittlung wird sorgfältig von unserem Expertenteam bewertet, das lokale Märkte, Service-Qualität und Kundenbedürfnisse versteht. Wir kombinieren diese menschliche Einsicht mit fortschrittlicher Technologie, um Ergebnisse zu liefern, die Erwartungen übertreffen."
      },
      ourValues: "Unsere Werte",
      values: {
        privacy: { title: "Datenschutz Zuerst", description: "Ihre Daten werden nie verkauft oder kompromittiert" },
        human: { title: "Menschliche Verbindung", description: "Echte Menschen leiten jede Vermittlung" },
        efficiency: { title: "Effizienz", description: "Ergebnisse in Minuten geliefert, nicht Tagen" },
        reliability: { title: "Zuverlässigkeit", description: "Konsistente Qualität auf die Sie sich verlassen können" }
      },
      supportedServices: "Unterstützte Services",
      services: {
        home: { title: "Hausreparaturen", description: "Professionelle Hauswartung und Reparaturen" },
        logistics: { title: "Logistik", description: "Umzug-, Liefer- und Transportservices" },
        wellness: { title: "Wellness", description: "Personaltraining, Therapie und Gesundheitsservices" },
        vehicle: { title: "Fahrzeugservices", description: "Auto-Reparatur, Detailing und Wartung" },
        professional: { title: "Professionelle Services", description: "Rechts-, Finanz- und Beratungsservices" },
        more: { title: "& Mehr", description: "Erweiternder Katalog vertrauenswürdiger Service-Anbieter" }
      }
    },
    contact: {
      title: "Kontakt Aufnehmen",
      subtitle: "Haben Sie Fragen? Brauchen Sie Support? Möchten Sie Partner werden? Wir würden gerne von Ihnen hören.",
      form: {
        title: "Senden Sie uns eine Nachricht",
        name: "Name",
        email: "E-Mail",
        subject: "Betreff",
        message: "Nachricht",
        send: "Nachricht Senden",
        sending: "Senden...",
        success: "Nachricht Gesendet!",
        successMessage: "Danke für Ihre Kontaktaufnahme. Wir melden uns innerhalb von 24 Stunden.",
        sendAnother: "Weitere Nachricht Senden",
        subjects: {
          general: "Allgemeine Anfrage",
          support: "Technischer Support", 
          billing: "Rechnungsfrage",
          partnership: "Geschäftspartnerschaft",
          feedback: "Feedback & Vorschläge",
          media: "Medienanfrage"
        }
      },
      info: {
        title: "Kontakt aufnehmen",
        email: { title: "E-Mail-Support", description: "Wir antworten normalerweise innerhalb von 24 Stunden" },
        phone: { title: "Telefon-Support", description: "Verfügbar Mo-Fr, 9-18 Uhr EST" },
        location: { title: "Bürostandort", description: "Bundesweite Kundenbetreuung" },
        response: { title: "Antwortzeiten", description: "Premium-Stufen erhalten Priority-Support" },
        community: { title: "Bevorzugen Sie zu chatten?", description: "Treten Sie unseren Community-Foren für schnelle Fragen und Peer-Support bei.", link: "Community-Foren Besuchen →" }
      }
    },
    social: {
      title: "Verbinden Sie sich mit Atenra",
      subtitle: "Verfolgen Sie unsere Reise, während wir die Service-Entdeckung revolutionieren. Treten Sie unserer Community auf allen Plattformen für Insights, Updates und Experten-Tipps bei.",
      followUs: "Folgen Sie Uns Überall",
      followUsSubtitle: "Bleiben Sie auf allen Ihren Lieblingsplattformen für die neuesten Updates und Insights verbunden.",
      joinCommunity: "Treten Sie Unserer Community Bei",
      joinCommunitySubtitle: "Jenseits sozialer Medien, engagieren Sie sich mit unserer Community durch verschiedene interaktive Plattformen.",
      stayUpdated: "Bleiben Sie Auf dem Laufenden",
      stayUpdatedSubtitle: "Erhalten Sie die neuesten Updates, Branche-Insights und exklusive Tipps direkt in Ihren Posteingang.",
      subscribe: "Abonnieren",
      emailPlaceholder: "E-Mail eingeben",
      disclaimer: "Wir respektieren Ihre Privatsphäre. Jederzeit abbestellbar."
    },
    more: {
      title: "Mehr Informationen", 
      subtitle: "Alles was Sie über die Nutzung von Atenra, unsere Richtlinien und rechtliche Informationen wissen müssen.",
      faq: "Häufig Gestellte Fragen",
      legalPrivacy: "Rechtliches & Datenschutz",
      privacyGuarantees: "Datenschutz-Garantien",
      legalInformation: "Rechtliche Informationen",
      legalQuestions: "Rechtliche Fragen?",
      legalQuestionsText: "Kontaktieren Sie unser Rechtsteam für Fragen zu Bedingungen, Datenschutz oder Compliance."
    },
    footer: {
      contact: "Kontakt",
      connect: "Verbinden",
      copyright: "© 2025 Atenra. Gebaut für Transparenz."
    },
    auth: {
      signIn: {
        title: "Willkommen zurück",
        subtitle: "Melden Sie sich bei Ihrem Konto an, um fortzufahren",
        email: "E-Mail",
        password: "Passwort",
        rememberMe: "Angemeldet bleiben",
        forgotPassword: "Passwort vergessen?",
        signInButton: "Anmelden",
        signInWithGoogle: "Mit Google fortfahren",
        or: "oder",
        noAccount: "Haben Sie kein Konto?",
        signUp: "Registrieren",
        errors: {
          invalidCredentials: "Ungültige E-Mail oder Passwort",
          googleSignInFailed: "Google-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
          somethingWentWrong: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."
        }
      },
      signUp: {
        title: "Ihr Konto erstellen",
        subtitle: "Schließen Sie sich Tausenden von Nutzern an, die vertrauenswürdige Services finden",
        fullName: "Vollständiger Name",
        email: "E-Mail",
        password: "Passwort",
        confirmPassword: "Passwort bestätigen",
        createAccount: "Konto erstellen",
        continueWithGoogle: "Mit Google fortfahren",
        or: "oder",
        alreadyHaveAccount: "Haben Sie bereits ein Konto?",
        signIn: "Anmelden",
        agreeToTerms: "Ich stimme den",
        termsOfService: "Nutzungsbedingungen",
        and: "und",
        privacyPolicy: "Datenschutzrichtlinie",
        placeholders: {
          fullName: "Max Mustermann",
          email: "ihre.email@beispiel.com",
          password: "Erstellen Sie ein starkes Passwort",
          confirmPassword: "Bestätigen Sie Ihr Passwort"
        },
        emailSent: {
          title: "Überprüfen Sie Ihre E-Mail",
          message: "Wir haben einen Bestätigungslink an Ihre E-Mail-Adresse gesendet. Bitte klicken Sie auf den Link, um Ihre Registrierung abzuschließen.",
          resendVerification: "Bestätigung erneut senden",
          didNotReceive: "E-Mail nicht erhalten?"
        },
        errors: {
          nameRequired: "Name muss mindestens 2 Zeichen lang sein",
          invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
          passwordLength: "Passwort muss mindestens 8 Zeichen lang sein",
          passwordMismatch: "Passwörter stimmen nicht überein",
          emailExists: "Diese E-Mail-Adresse wird bereits verwendet",
          registrationFailed: "Registrierung fehlgeschlagen",
          somethingWentWrong: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
          googleSignInFailed: "Google-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut."
        }
      }
    }
  },
  zh: {
    navigation: {
      home: "首页",
      pricing: "价格",
      about: "关于我们",
      more: "更多",
      faq: "常见问题",
      careers: "职业",
      contact: "联系我们",
      signIn: "登录",
      getStarted: "开始使用"
    },
    hero: {
      title: "Atenra",
      subtitle: "Atenra",
      tagline: "您的个人和商业助手，随需而至",
      subheadline: "通过智能匹配发现值得信赖的专业人士 —— 技术与真正的人类洞察力相遇。",
      bodyText: "在Atenra，每个连接都经过人工验证、精心匹配，旨在让您的生活更轻松。无论是管理您的业务、您的家庭还是您的下一个大项目 —— 我们将您与提供成果的专业人士联系起来。",
      getStarted: "开始使用",
      partnerWithUs: "与我们合作",
      trustIndicators: {
        professionals: "1000+ 认证专业人士",
        categories: "20+ 服务类别"
      }
    },
    pricing: {
      title: "简单透明的定价",
      subtitle: "选择最适合您需求的计划。始终灵活扩展",
      mostPopular: "最受欢迎",
      perMonth: "每月",
      freeForever: "永久免费",
      tiers: {
        guest: {
          name: "访客",
          description: "适合个人用户开始使用",
          features: [
            "基本仪表板访问",
            "社区论坛访问",
            "公共文档",
            "教程库",
            "邮件支持"
          ],
          button: "开始使用"
        },
        essentials: {
          name: "基础版",
          description: "成长所需的一切",
          features: [
            "包含访客版所有功能",
            "项目参与工具",
            "内部仪表板",
            "KPI跟踪和分析",
            "直接优先支持",
            "团队协作工具"
          ],
          button: "开始免费试用"
        },
        premium: {
          name: "高级版",
          description: "团队的高级功能",
          features: [
            "包含基础版所有功能",
            "自定义分析和报告",
            "基于角色的访问控制",
            "投票权",
            "多项目管理",
            "API访问",
            "24/7电话支持"
          ],
          button: "开始免费试用"
        },
        executive: {
          name: "执行版",
          description: "完全控制和定制",
          features: [
            "包含高级版所有功能",
            "完整平台访问",
            "政策决策投票",
            "跨层级管理",
            "治理可见性",
            "资本配置工具",
            "自定义集成",
            "专属客户经理"
          ],
          button: "联系销售"
        }
      },
      business: {
        title: "高级商业合作伙伴关系",
        description: "加入我们经过验证的服务提供商专属网络。从我们无风险的3个月试用开始。",
        features: ["3个月试用期", "全额退款保证", "高级列表优势", "专属支持"],
        button: "开始合作伙伴试用",
        disclaimer: "无需信用卡 • 随时取消"
      }
    },
    about: {
      title: "关于Atenra",
      mission: "我们的使命是通过以人为本的匹配、尖端技术，以及对隐私和结果坚定不移的承诺，来革命化人们与值得信赖的服务提供商的连接方式。",
      ourStory: "我们的故事",
      foundedOnTrust: {
        title: "建立在信任之上",
        description: "Atenra诞生于寻找可靠服务提供商时无休止的搜索、比较和不确定性的挫折感。我们认识到人们应该有更好的方式——一种优先考虑人际关系和专家策划而非自动化算法的方式。"
      },
      humanFirst: {
        title: "以人为本的方法",
        description: "每个匹配都由我们了解本地市场、服务质量和客户需求的专家团队仔细评估。我们将这种人类洞察力与先进技术相结合，提供超出期望的结果。"
      },
      ourValues: "我们的价值观",
      values: {
        privacy: { title: "隐私至上", description: "您的数据永远不会被出售或泄露" },
        human: { title: "人际关系", description: "真人指导每个匹配" },
        efficiency: { title: "效率", description: "在几分钟内交付结果，而不是几天" },
        reliability: { title: "可靠性", description: "您可以信赖的一致质量" }
      },
      supportedServices: "支持的服务",
      services: {
        home: { title: "家庭维修", description: "专业的家庭维护和维修" },
        logistics: { title: "物流", description: "搬家、送货和运输服务" },
        wellness: { title: "健康", description: "个人训练、治疗和健康服务" },
        vehicle: { title: "车辆服务", description: "汽车维修、美容和保养" },
        professional: { title: "专业服务", description: "法律、金融和咨询服务" },
        more: { title: "更多", description: "不断扩展的可信服务提供商目录" }
      }
    },
    contact: {
      title: "联系我们",
      subtitle: "有问题吗？需要支持？想要合作？我们很乐意听到您的声音。",
      form: {
        title: "给我们发送消息",
        name: "姓名",
        email: "邮箱",
        subject: "主题",
        message: "消息",
        send: "发送消息",
        sending: "发送中...",
        success: "消息已发送！",
        successMessage: "感谢您的联系。我们将在24小时内回复您。",
        sendAnother: "发送另一条消息",
        subjects: {
          general: "一般咨询",
          support: "技术支持",
          billing: "账单问题",
          partnership: "商业合作",
          feedback: "反馈和建议",
          media: "媒体咨询"
        }
      },
      info: {
        title: "联系我们",
        email: { title: "邮件支持", description: "我们通常在24小时内回复" },
        phone: { title: "电话支持", description: "周一至周五上午9点至下午6点EST可用" },
        location: { title: "办公地点", description: "为全国客户提供服务" },
        response: { title: "响应时间", description: "高级层级获得优先支持" },
        community: { title: "更喜欢聊天？", description: "加入我们的社区论坛，获得快速问题解答和同行支持。", link: "访问社区论坛 →" }
      }
    },
    social: {
      title: "与Atenra连接",
      subtitle: "跟随我们革命化服务发现的旅程。加入我们在所有平台上的社区，获取见解、更新和专家提示。",
      followUs: "在各处关注我们",
      followUsSubtitle: "在您最喜欢的所有平台上保持连接，获取最新更新和见解。",
      joinCommunity: "加入我们的社区",
      joinCommunitySubtitle: "除了社交媒体，通过各种互动平台与我们的社区互动。",
      stayUpdated: "保持更新",
      stayUpdatedSubtitle: "直接在您的收件箱中获取最新更新、行业见解和独家提示。",
      subscribe: "订阅",
      emailPlaceholder: "输入您的邮箱",
      disclaimer: "我们尊重您的隐私。随时取消订阅。"
    },
    more: {
      title: "更多信息",
      subtitle: "关于使用Atenra、我们的政策和法律信息，您需要了解的一切。",
      faq: "常见问题",
      legalPrivacy: "法律和隐私",
      privacyGuarantees: "隐私保证",
      legalInformation: "法律信息",
      legalQuestions: "法律问题？",
      legalQuestionsText: "就条款、隐私或合规的任何问题联系我们的法律团队。"
    },
    footer: {
      contact: "联系",
      connect: "连接",
      copyright: "© 2025 Atenra. 为透明而建。"
    },
    auth: {
      signIn: {
        title: "欢迎回来",
        subtitle: "登录您的账户以继续",
        email: "邮箱",
        password: "密码",
        rememberMe: "记住我",
        forgotPassword: "忘记密码？",
        signInButton: "登录",
        signInWithGoogle: "使用Google继续",
        or: "或",
        noAccount: "没有账户？",
        signUp: "注册",
        errors: {
          invalidCredentials: "邮箱或密码无效",
          googleSignInFailed: "Google登录失败。请重试。",
          somethingWentWrong: "出现了问题。请重试。"
        }
      },
      signUp: {
        title: "创建您的账户",
        subtitle: "加入数千名寻找可信服务的用户",
        fullName: "全名",
        email: "邮箱",
        password: "密码",
        confirmPassword: "确认密码",
        createAccount: "创建账户",
        continueWithGoogle: "使用Google继续",
        or: "或",
        alreadyHaveAccount: "已有账户？",
        signIn: "登录",
        agreeToTerms: "我同意",
        termsOfService: "服务条款",
        and: "和",
        privacyPolicy: "隐私政策",
        placeholders: {
          fullName: "张三",
          email: "your.email@example.com",
          password: "创建强密码",
          confirmPassword: "确认您的密码"
        },
        emailSent: {
          title: "检查您的邮箱",
          message: "我们已经向您的邮箱地址发送了一个验证链接。请点击链接完成您的注册。",
          resendVerification: "重新发送验证",
          didNotReceive: "没有收到邮件？"
        },
        errors: {
          nameRequired: "姓名至少需要2个字符",
          invalidEmail: "请输入有效的邮箱地址",
          passwordLength: "密码至少需要8个字符",
          passwordMismatch: "密码不匹配",
          emailExists: "该邮箱地址已被使用",
          registrationFailed: "注册失败",
          somethingWentWrong: "出现了问题。请重试。",
          googleSignInFailed: "Google登录失败。请重试。"
        }
      }
    }
  }
};

export type LanguageCode = keyof typeof translations;