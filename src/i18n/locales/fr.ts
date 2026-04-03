export default {
    brand: {
      name: 'Eventra'
    },
    common: {
      pagination: {
        previous: 'Précédent',
        next: 'Suivant'
      }
    },
    nav: {
      communities: {
        label: 'Communautes',
        items: [
          'Etudiants',
          'Chercheurs',
          'Coachs & Formateurs',
          'Experts & Consultants',
          'Employes & Professionnels',
          'Entrepreneurs & Startups',
          'Developpeurs & Ingenieurs',
          'Marketing & Communication',
          'Audit, Comptabilite & Finance',
          'Investissement & Banque',
          'Assurance & Microfinance',
          'Juridique & Avocats',
          'IA, IoT & Tech Emergentes',
          'Audiovisuel & Industries Creatives',
          'Medias & Journalistes',
          'Universites & Academies',
          'ONG & Societe Civile',
          'Secteur Public & Gouvernement'
        ]
      },
      marketplace: 'Marketplace',
      browseEvents: 'Parcourir les evenements',
      logistics: {
        label: 'Solutions Logistiques',
        items: [
          'Calculateur de Fret: MENA & AFRIQUE',
          'Calculateur de Charge: MENA & AFRIQUE',
          'Couts de Transport Conteneur: Informations'
        ]
      },
      auth: {
        login: 'Connexion',
        signUp: "S'inscrire"
      },
      language: {
        label: 'Langue',
        en: 'Anglais',
        fr: 'Francais',
        ar: 'Arabe'
      },
      userMenu: {
        myProfile: 'Mon Profil',
        businessProfile: 'Profil Business',
        myEvents: 'Mes Evenements',
        myB2bArea: 'Mon Espace B2B',
        myNetworking: 'Mon Reseautage',
        messages: 'Messages',
        viewMessages: 'Voir les messages',
        logout: 'Deconnexion'
      },
      placeholders: {
        userName: 'Utilisateur',
        userEmail: 'utilisateur@exemple.com'
      }
    },
    browseEventsPage: {
      hero: {
        title: 'Decouvrez votre prochaine experience',
        searchPlaceholder: 'Recherchez des evenements, sujets ou intervenants...',
        locationPlaceholder: 'Ville ou en ligne',
        datePlaceholder: 'Toute date'
      },
      filters: {
        title: 'Filtres',
        clearAll: 'Tout effacer',
        clearFilters: 'Effacer les filtres',
        format: {
          title: 'Format',
          all: 'Tous les formats',
          'in-person': 'En presentiel',
          virtual: 'Virtuel',
          hybrid: 'Hybride'
        },
        category: {
          title: 'Categorie',
          business: 'Business',
          technology: 'Technologie',
          musicArts: 'Musique & Arts',
          education: 'Education',
          health: 'Sante & Bien-etre'
        },
        price: {
          title: 'Prix',
          free: 'Gratuit',
          paid: 'Payant'
        },
        date: {
          title: 'Date',
          today: "Aujourd'hui",
          'this-weekend': 'Ce week-end',
          custom: 'Choisir une plage de dates...'
        }
      },
      sort: {
        upcoming: 'Trier : Prochains',
        popular: 'Trier : Populaires',
        priceLow: 'Trier : Prix (croissant)',
        priceHigh: 'Trier : Prix (decroissant)'
      },
      results: {
        count: '{count} evenements trouves',
        loadMore: "Charger plus d'evenements"
      },
      states: {
        loadError: "Impossible de charger les evenements pour le moment.",
        errorTitle: "Impossible de charger les evenements",
        loadingTitle: 'Chargement des evenements...',
        emptyTitle: 'Aucun evenement trouve',
        loadingBody: 'Chargement des derniers evenements. Merci de patienter.',
        emptyBody: "Essayez d'ajuster vos filtres ou votre recherche"
      },
      event: {
        tbd: 'A definir',
        online: 'En ligne',
        free: 'Gratuit',
        untitled: 'Evenement sans titre',
        timeTbd: 'Heure a definir',
        startsAt: 'Debute a {time}',
        fromPrice: 'A partir de {currency} {price}'
      }
    },
    communityPage: {
      hero: {
        title: 'Communaute & Reseautage',
        subtitle: 'Decouvrez des professionnels, trouvez votre prochain partenaire et planifiez des reunions',
        searchPlaceholder: 'Rechercher par nom, poste ou entreprise...'
      },
      filters: {
        title: 'Filtres',
        status: {
          label: 'Statut',
          online: 'En ligne',
          openToMeetings: 'Ouvert aux reunions'
        },
        industries: {
          label: 'Industries'
        }
      },
      results: {
        count: '{count} professionnels affiches',
        matchLabel: '{score}% de match',
        atCompany: '@ {company}'
      },
      actions: {
        viewProfile: 'Voir le profil'
      },
      errors: {
        loadMembers: 'Impossible de charger les membres de la communaute',
        selectTime: 'Veuillez selectionner un creneau'
      },
      toasts: {
        requestSent: 'Demande de connexion envoyee a {name}',
        meetingSent: 'Demande de reunion envoyee a {name}'
      },
      defaults: {
        member: 'Membre Eventra',
        position: 'Professionnel',
        company: 'Organisation',
        location: 'A distance',
        bio: 'Reseautage professionnel sur Eventra.',
        tag: 'Reseautage',
        role: 'Autre',
        industry: 'General'
      },
      roles: {
        technology: 'Technologie',
        marketing: 'Marketing',
        consulting: 'Conseil',
        finance: 'Finance',
        education: 'Education'
      },
      industries: {
        saas: 'SaaS',
        fintech: 'FinTech',
        healthcare: 'Sante',
        eventtech: 'EventTech',
        media: 'Medias'
      },
      interests: {
        ai: 'IA',
        marketing: 'Marketing',
        sales: 'Ventes',
        product: 'Produit',
        engineering: 'Ingenierie',
        leadership: 'Leadership',
        growth: 'Croissance',
        b2b: 'B2B'
      },
      dates: {
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        fri17: 'Ven 17',
        mon20: 'Lun 20',
        tue21: 'Mar 21',
        days: {
          wed: 'Mer',
          thu: 'Jeu',
          fri: 'Ven',
          mon: 'Lun',
          tue: 'Mar'
        }
      },
      timeSlots: {
        slot0900: '09:00',
        slot0930: '09:30',
        slot1000: '10:00',
        slot1030: '10:30',
        slot1100: '11:00',
        slot1130: '11:30',
        slot1400: '14:00',
        slot1430: '14:30',
        slot1500: '15:00',
        slot1530: '15:30',
        slot1600: '16:00',
        slot1630: '16:30'
      }
    },
    networking: {
      title: 'Centre de reseautage',
      subtitle: 'Gerez vos rendez-vous et connexions.',
      stats: {
        meetingsToday: "Rendez-vous aujourd'hui",
        newRequests: 'Nouvelles demandes',
        newMatches: 'Nouveaux matchs IA'
      },
      tabs: {
        schedule: 'Mon planning',
        matches: 'Matchs intelligents',
        requests: 'Demandes',
        connections: 'Mes connexions'
      },
      filters: {
        allEvents: 'Tous les evenements',
        showPastMeetings: 'Afficher les rendez-vous passes'
      },
      common: {
        tbd: 'A definir'
      },
      relative: {
        justNow: "A l'instant",
        minute: 'Il y a 1 min',
        minutes: 'Il y a {count} min',
        hour: 'Il y a 1 h',
        hours: 'Il y a {count} h',
        day: 'Il y a 1 jour',
        days: 'Il y a {count} jours'
      },
      defaults: {
        unknownUser: 'Utilisateur inconnu',
        professional: 'Professionnel',
        event: 'Evenement',
        generalNetworking: 'Reseautage general',
        networkingMeeting: 'Rendez-vous de reseautage',
        onSite: 'Sur place',
        inPerson: 'En personne',
        unknownCountry: 'Inconnu',
        user: 'Utilisateur',
        someone: "Quelqu'un"
      },
      matches: {
        reasonFallback: 'Base sur votre profil et vos interets',
        subtitle: 'Recommandations basees sur votre profil, vos interets et vos objectifs de reseautage.',
        requestedByThem: 'Demande de leur part',
        noMatches: 'Aucun match disponible pour le moment'
      },
      requests: {
        defaultMessage: 'Echangeons pour explorer des opportunites.',
        receivedTitle: 'Demandes recues ({count})',
        sentTitle: 'Demandes envoyees ({count})',
        noPending: 'Aucune demande en attente'
      },
      actions: {
        joinCall: "Rejoindre l'appel",
        confirm: 'Confirmer',
        decline: 'Refuser',
        cancel: 'Annuler',
        viewProfile: 'Voir le profil',
        connect: 'Se connecter',
        reschedule: 'Replanifier',
        scheduleMeeting: 'Planifier un rendez-vous',
        accept: 'Accepter',
        withdraw: 'Retirer',
        message: 'Message'
      },
      status: {
        confirmed: 'Confirme',
        pending: 'En attente',
        cancelled: 'Annule',
        connected: 'Connecte',
        requestClosed: 'Demande fermee',
        requestSent: 'Demande envoyee'
      },
      labels: {
        event: 'Evenement : {event}'
      },
      connections: {
        total: '{count} connexions',
        connectedOn: 'Connecte le {date}'
      },
      meetings: {
        videoCall: 'Appel video',
        noMeetings: 'Aucun rendez-vous prévu',
        noMeetingsSubtitle: 'Vous n\'avez aucun rendez-vous prévu pour le moment.',
        types: {
          online: 'En ligne',
          inPerson: 'En personne',
          hybrid: 'Hybride'
        },
        validation: {
          selectType: 'Selectionnez un type de rendez-vous.',
          selectDateTime: 'Selectionnez une date et une heure.',
          selectEvent: 'Selectionnez un evenement pour les rendez-vous en personne ou hybrides.',
          selectSlot: 'Selectionnez un creneau.',
          invalidDateTime: 'Date/heure invalide.',
          slotNoTime: "Le creneau selectionne n'a pas d'heure.",
          slotFull: 'Le creneau selectionne est complet.'
        }
      },
      errors: {
        loadData: 'Impossible de charger les donnees de reseautage',
        generateMatches: 'Impossible de generer les matchs',
        loadEvents: 'Impossible de charger les evenements',
        rescheduleMeeting: 'Impossible de replanifier le rendez-vous',
        scheduleMeeting: 'Impossible de planifier le rendez-vous',
        sendRequest: "Impossible d'envoyer la demande",
        openConversation: "Impossible d'ouvrir la conversation",
        noMeetingLink: "Aucun lien de reunion pour l'instant."
      },
      notifications: {
        meetingRescheduled: {
          title: 'Rendez-vous replanifie',
          body: '{name} a replanifie le rendez-vous.'
        },
        meetingRequested: {
          title: 'Rendez-vous demande',
          body: '{name} a planifie un rendez-vous avec vous.'
        },
        meetingCancelled: {
          title: 'Rendez-vous annule',
          body: '{name} a annule le rendez-vous.'
        },
        meetingConfirmed: {
          title: 'Rendez-vous confirme',
          body: '{name} a confirme le rendez-vous.'
        },
        meetingDeclined: {
          title: 'Rendez-vous refuse',
          body: '{name} a refuse le rendez-vous.'
        },
        newRequest: {
          title: 'Nouvelle demande de connexion',
          body: '{name} souhaite se connecter avec vous.'
        },
        connectionAccepted: {
          title: 'Connexion acceptee',
          body: '{name} a accepte votre demande de connexion.'
        },
        connectionDeclined: {
          title: 'Connexion refusee',
          body: '{name} a refuse votre demande de connexion.'
        },
        connectionRemoved: {
          title: 'Connexion supprimee',
          body: '{name} a supprime la connexion.'
        }
      },
      toasts: {
        meetingRescheduled: 'Rendez-vous replanifie',
        meetingRequested: 'Rendez-vous demande',
        meetingCancelled: 'Rendez-vous annule',
        meetingConfirmed: 'Rendez-vous confirme',
        meetingDeclined: 'Rendez-vous refuse',
        requestSent: 'Demande envoyee'
      },
      modals: {
        rescheduleTitle: 'Replanifier le rendez-vous',
        scheduleTitle: 'Planifier un rendez-vous',
        with: 'Avec {name}',
        meetingType: 'Type de rendez-vous',
        filterCountry: 'Filtrer par pays',
        filterDate: 'Filtrer par date',
        allCountries: 'Tous les pays',
        loadingEvents: 'Chargement des evenements...',
        noEvents: 'Aucun evenement disponible pour les rendez-vous en personne.',
        noCapacityLimit: 'Aucune limite de capacite',
        slotsLeft: '{count} places restantes',
        full: 'Complet',
        meetingSlot: 'Creneau',
        selectSlot: 'Selectionner un creneau',
        remainingShort: ' ({count} restantes)',
        meetingDate: 'Date du rendez-vous',
        meetingTime: 'Heure du rendez-vous'
      }
    },
    messages: {
      title: 'Messages',
      tabs: {
        chats: 'Historique',
        suggestions: 'Suggestions'
      },
      search: {
        conversations: 'Rechercher des conversations...'
      },
      loading: {
        conversations: 'Chargement des conversations...',
        suggestions: 'Chargement des suggestions...',
        messages: 'Chargement des messages...'
      },
      empty: {
        conversations: 'Aucune conversation pour le moment.',
        suggestions: 'Aucune suggestion pour le moment.',
        selectConversation: 'Selectionnez une conversation pour commencer a discuter',
        lastMessage: 'Aucun message pour le moment.',
        startConversation: 'Commencez une conversation'
      },
      actions: {
        start: 'Commencer',
        viewProfile: 'Voir le profil'
      },
      composer: {
        placeholder: 'Ecrivez un message...'
      },
      dateDivider: "Aujourd'hui, {date}",
      newMessage: {
        title: 'Nouveau message',
        searchPlaceholder: 'A: Rechercher un nom ou une entreprise...',
        startTyping: 'Commencez a taper pour rechercher des personnes'
      },
      defaults: {
        user: 'Utilisateur',
        unknownUser: 'Utilisateur inconnu'
      },
      errors: {
        loadConversations: 'Impossible de charger les conversations',
        loadMessages: 'Impossible de charger les messages',
        sendMessage: "Impossible d'envoyer le message",
        createConversation: 'Impossible de creer la conversation',
        loadSuggestions: 'Impossible de charger les suggestions'
      }
    },
    landing: {
      digest: {
        tagline: 'Personnalise pour vous',
        title: 'Votre Digest Hebdomadaire',
        subtitle: 'Une selection d\'evenements correspondant a vos interets.',
        viewAll: 'Voir tous les evenements'
      },
      hero: {
        title: 'Creez des Evenements Inoubliables',
        subtitle: 'Plateforme de gestion d\'evenements professionnelle approuvee par les entreprises du monde entier',
        primaryCta: 'Creer un Evenement',
        secondaryCta: 'Voir la Demo',
        trustLine: 'Approuve par plus de 10 000 organisateurs',
        logos: ['ACME Corp', 'TechStart', 'Innovate Co', 'GlobalEvents']
      },
      features: {
        title: 'Tout ce dont vous avez besoin pour reussir',
        subtitle: 'Des outils puissants pour une gestion professionnelle',
        cta: 'En savoir plus',
        items: [
          {
            title: 'Studio de Design',
            description:
              'Creez de magnifiques pages d\'evenement avec notre editeur glisser-deposer intuitif. Personnalisez chaque detail pour correspondre a votre image de marque.'
          },
          {
            title: 'Hub d\'Inscription',
            description:
              'Simplifiez l\'inscription des participants avec des formulaires intelligents, des confirmations automatisees et un traitement des paiements integre.'
          },
          {
            title: 'Suite Analytique',
            description:
              'Suivez les performances en temps reel. Surveillez les inscriptions, l\'engagement et le ROI avec des outils de reporting complets.'
          }
        ]
      },
      howItWorks: {
        title: 'Creez des Evenements en 4 Etapes Simples',
        steps: [
          {
            title: 'Ajouter les details',
            description:
              'Entrez les informations, la date, le lieu et les details cles pour demarrer rapidement.'
          },
          {
            title: 'Design de la page',
            description:
              'Personnalisez votre page d\'evenement avec notre constructeur et nos modeles de marque.'
          },
          {
            title: 'Configuration inscription',
            description:
              'Configurez la billetterie, les tarifs et les formulaires pour capturer les informations.'
          },
          {
            title: 'Lancer l\'evenement',
            description:
              'Publiez votre evenement et partagez-le avec votre audience. Suivez les inscriptions en temps reel.'
          }
        ]
      },
      testimonials: {
        title: 'Approuve par les Professionnels de l\'Evenementiel',
        items: [
          {
            quote:
              'Cette plateforme a transforme notre gestion d\'evenements. L\'interface intuitive et les fonctionnalites puissantes nous ont aide a augmenter la frequentation de 40%.',
            authorName: 'Sarah Johnson',
            authorTitle: 'Responsable Evenementiel',
            authorCompany: 'TechStart Inc.',
            authorInitials: 'SJ'
          },
          {
            quote:
              'Eventra a rendu notre conference annuelle fluide. De l\'inscription aux analyses, tout a fonctionne parfaitement. Nos participants ont adore le professionnalisme.',
            authorauthorName: 'Michael Chen',
            authorTitle: 'Directeur Marketing',
            authorCompany: 'Innovate Co.',
            authorInitials: 'MC'
          },
          {
            quote:
              "La meilleure plateforme de gestion d'evenements que nous ayons utilisee. Les options de personnalisation sont incroyables, et l'equipe de support est toujours la.",
            authorName: 'Emily Rodriguez',
            authorTitle: 'Coordinatrice Evenementiel',
            authorCompany: 'Global Events Ltd.',
            authorInitials: 'ER'
          }
        ]
      },
      finalCta: {
        title: 'Pret a Creer Votre Premier Evenement ?',
        subtitle: 'Rejoignez des milliers d\'organisateurs utilisant Eventra',
        button: 'Commencer Gratuitement'
      },
      footer: {
        description: 'Plateforme de gestion d\'evenements professionnelle pour les entreprises du monde entier',
        product: {
          title: 'Produit',
          items: ['Fonctionnalites', 'Tarifs', 'Modeles', 'Integrations']
        },
        company: {
          title: 'Entreprise',
          items: ['A propos', 'Blog', 'Carrieres', 'Contact']
        },
        newsletter: {
          title: 'Restez informe',
          subtitle: 'Recevez les dernieres nouvelles et mises a jour',
          placeholder: 'Votre email'
        },
        legal: {
          copyright: '(c) 2024 Eventra. Tous droits reserves.',
          privacyPolicy: 'Politique de Confidentialite',
          terms: 'Conditions d\'Utilisation'
        }
      },
      testing: {
        resetSentButton: 'Test Reset Envoye'
      }
    },
    auth: {
      registrationEntry: {
        title: 'Creez votre compte',
        subtitle: 'Rejoignez Eventra pour vous inscrire a des evenements et vous connecter avec des professionnels',
        continueWithGoogle: 'Continuer avec Google',
        continueWithEmail: 'Continuer avec Email',
        divider: 'OU',
        alreadyAccount: 'Vous avez deja un compte ?',
        login: 'Se connecter',
        errors: {
          googleSignupFailed: 'Echec de l\'inscription Google',
          accountExists: 'Le compte existe deja. Veuillez vous connecter.',
          accountExistsReset: 'Le compte existe deja. Veuillez vous connecter ou reinitialiser votre mot de passe.',
          resendFailed: 'Impossible de renvoyer l\'email de confirmation.',
          registrationIncomplete: 'Inscription incomplete. Veuillez reessayer.',
          registrationFailed: 'Echec de l\'inscription',
          signInToComplete: 'Veuillez vous connecter pour completer votre profil.',
          saveProfileFailed: 'Echec de l\'enregistrement du profil',
          signInToContinue: 'Veuillez vous connecter pour continuer.'
        }
      },
      login: {
        title: 'Bon retour',
        subtitle: 'Connectez-vous a votre compte Eventra',
        continueWithGoogle: 'Continuer avec Google',
        divider: 'OU',
        emailLabel: 'Adresse email',
        emailPlaceholder: 'vous@exemple.com',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: 'Entrez votre mot de passe',
        rememberMe: 'Se souvenir de moi',
        forgotPassword: 'Mot de passe oublie ?',
        submit: 'Se connecter',
        loggingIn: 'Connexion...', 
        newToEventra: 'Nouveau sur Eventra ?',
        signUp: "S'inscrire",
        errors: {
          invalidCredentials: 'Email ou mot de passe invalide. Veuillez reessayer.',
          googleInitFailed: 'Echec de l\'initialisation de la connexion Google'
        }
      },
      forgotPassword: {
        title: 'Reinitialiser votre mot de passe',
        subtitle: 'Entrez votre email et nous vous enverrons un lien de reinitialisation',
        emailLabel: 'Adresse email',
        emailPlaceholder: 'vous@exemple.com',
        submit: 'Envoyer le lien',
        sending: 'Envoi...', 
        backToLogin: 'Retour a la connexion',
        toastSuccess: 'Lien envoye a votre email',
        toastError: 'Echec de l\'envoi du lien'
      },
      passwordResetSent: {
        title: 'Verifiez votre email',
        subtitle: 'Nous avons envoye un lien de reinitialisation a :',
        instructions: 'Cliquez sur le lien dans l\'email pour creer un nouveau mot de passe',
        resend: 'Renvoyer l\'email',
        resending: 'Renvoi...', 
        backToLogin: 'Retour a la connexion',
        help: "Vous n'avez pas recu l\'email ? Verifiez vos spams"
      },
      emailRegistration: {
        title: 'Creez votre compte',
        subtitle: 'Entrez vos details pour commencer',
        emailLabel: 'Adresse email',
        emailPlaceholder: 'vous@exemple.com',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: 'Creez un mot de passe fort',
        strength: {
          weak: 'Faible',
          medium: 'Moyen',
          strong: 'Fort'
        },
        requirements: {
          length: 'Au moins 8 caracteres',
          uppercase: 'Une lettre majuscule',
          number: 'Un chiffre'
        },
        terms: {
          prefix: "J'accepte les",
          termsOfService: 'Conditions d\'Utilisation',
          and: 'et la',
          privacyPolicy: 'Politique de Confidentialite'
        },
        submit: 'Creer un compte',
        submitting: 'Creation...', 
        alreadyAccount: 'Vous avez deja un compte ?',
        login: 'Se connecter',
        errors: {
          invalidEmail: 'Veuillez entrer une adresse email valide'
        }
      },
      emailVerification: {
        title: 'Verifiez votre email',
        subtitle: 'Nous avons envoye un lien de verification a :',
        instructions: 'Cliquez sur le lien dans l\'email pour verifier votre compte et continuer',
        resend: 'Renvoyer l\'email',
        resending: 'Envoi...', 
        changeEmail: 'Changer d\'email',
        timer: 'Renvoi disponible dans {time}',
        helpPrefix: "Vous n'avez pas recu l\'email ? Verifiez vos spams ou",
        helpLink: 'contactez le support',
        resendSuccess: 'Email de verification renvoye',
        resendError: 'Echec du renvoi de l\'email de verification'
      },
      demoEmail: 'demo@exemple.com'
    },
    profileSetup: {
      progress: {
        stepLabel: 'Etape {current} sur {total}',
        percentLabel: '{percent}%'
      },
      step1: {
        title: 'Completez votre profil',
        subtitle: 'Quelques details pour personnaliser votre experience'
      },
      step2: {
        title: 'Completez votre profil professionnel',
        subtitle:
          'Titre du poste | Entreprise / Organisation | Industrie | Departement | Annees d\'experience | Taille de l\'entreprise'
      },
      labels: {
        firstName: 'Prenom',
        lastName: 'Nom',
        phoneNumber: 'Numero de telephone',
        country: 'Pays',
        jobTitle: 'Titre du poste',
        company: 'Entreprise / Organisation',
        industry: 'Industrie',
        department: 'Departement',
        yearsExperience: 'Annees d\'experience',
        companySize: 'Taille de l\'entreprise'
      },
      placeholders: {
        firstName: 'Jean',
        lastName: 'Dupont',
        phoneNumber: '06 12 34 56 78',
        country: 'Selectionnez votre pays',
        searchCountry: 'Rechercher un pays...',
        jobTitle: 'ex: Chef de Produit',
        company: 'ex: Acme Inc.',
        industry: 'Selectionnez votre industrie',
        searchIndustry: 'Rechercher une industrie...',
        industryOther: 'Entrez votre industrie',
        department: 'ex: Marketing',
        yearsExperience: 'Selectionnez vos annees d\'experience',
        companySize: 'Selectionnez la taille de l\'entreprise'
      },
      noResults: 'Aucun résultat trouvé',
      errors: {
        phoneTooShort: 'Numero de telephone trop court'
      },
      requiredFields: '* Champs obligatoires',
      buttons: {
        back: 'Retour',
        continue: 'Continuer',
        completeProfile: 'Completer votre profil',
        skip: 'Passer pour le moment'
      },
      industries: [
        'Technologie & Logiciels',
        'Services Financiers & Banque',
        'Sante & Pharmaceutique',
        'Fabrication & Production',
        'Commerce de Detail & E-commerce',
        'Conseil & Services Professionnels',
        'Education & Formation',
        'Medias & Divertissement',
        'Transport & Logistique',
        'Energie & Services Publics',
        'Immobilier & Construction',
        'Hotellerie & Tourisme',
        'Telecommunications',
        'Agriculture & Production Alimentaire',
        'Automobile',
        'Aerospatiale & Defense',
        'Services Juridiques',
        'Marketing & Publicite',
        'Non-Lucratif & ONG',
        'Gouvernement & Secteur Public',
        'Organisation de soutien aux entreprises',
        'Autre'
      ],
      yearsOfExperience: [
        '0-1 ans',
        '1-3 ans',
        '3-5 ans',
        '5-10 ans',
        '10-15 ans',
        '15+ ans'
      ],
      companySizes: [
        '1-10 employes',
        '11-50 employes',
        '51-200 employes',
        '201-500 employes',
        '501-1000 employes',
        '1001-5000 employes',
        '5000+ employes'
      ]
    },
    registrationFlow: {
      help: 'Besoin d\'aide ? Contactez l\'organisateur de l\'événement.',
      welcomeBack: 'Bon retour',
      guest: 'Invité',
      confirmDetails: 'Confirmez vos informations',
      locked: 'Verrouillé',
      selectOption: 'Sélectionner une option...',
      selectCountry: 'Sélectionner un pays',
      phoneNumber: 'Numéro de téléphone',
      fileUploaded: 'Fichier téléchargé',
      clickToUpload: 'Cliquer pour télécharger',
      customizeAgenda: 'Personnalisez votre agenda',
      selectSessionsOptional: 'Sélectionnez les sessions auxquelles vous souhaitez assister (optionnel)',
      noSessionsAvailable: 'Aucune session disponible pour cet événement.',
      preRegistrationComplete: 'Pré-inscription terminée !',
      allSet: 'Vous êtes prêt !',
      paidConfirmationDesc: 'Votre inscription est confirmée. Veuillez compléter le paiement pour garantir votre place.',
      freeConfirmationDesc: 'Votre inscription est confirmée. Présentez votre QR code à l\'entrée.',
      finalStepTitle: 'Dernière étape',
      finalStepDesc: 'Parcourez et réservez votre billet pour finaliser l\'inscription.',
      browseSecureTicket: 'Parcourir et réserver votre billet',
      downloadTicketVoucher: 'Télécharger le bon de billet',
      backToEventPage: 'Retour à la page de l\'événement',
      back: 'Retour',
      completeRegistration: 'Finaliser l\'inscription',
      continue: 'Continuer',
      selectedSessions: 'Sessions sélectionnées',
      itemsCount: '{count} éléments',
      mainHall: 'Salle principale',
      registrationStatus: 'Statut d\'inscription',
      ticketPurchaseRequired: 'Achat de billet requis',
      free: 'Gratuit',
      steps: {
        details: 'Détails',
        sessions: 'Sessions',
        done: 'Terminé'
      },
      voucher: {
        officialEntryTicket: 'Billet d\'entrée officiel',
        date: 'Date',
        tbd: 'À définir',
        time: 'Heure',
        attendee: 'Participant',
        confCode: 'Code de confirmation',
        presentQR: 'Présentez ce QR code à l\'entrée'
      },
      toasts: {
        loadFailed: 'Échec du chargement des détails de l\'événement',
        nameEmailRequired: 'Le nom et l\'email sont requis',
        alreadyRegistered: 'Vous êtes déjà inscrit à cet événement',
        registrationFailed: 'L\'inscription a échoué. Veuillez réessayer.',
        fileUploaded: 'Fichier téléchargé avec succès',
        fileUploadFailed: 'Échec du téléchargement du fichier',
        fileUploadError: 'Erreur lors du téléchargement du fichier'
      }
    },
    profile: {
      header: {
        title: 'Mon Profil',
        subtitle: 'Gerez vos informations personnelles et votre profil de reseautage',
        preview: 'Apercu Profil Public',
        save: 'Enregistrer'
      },
      card: {
        changePhoto: 'Changer Photo',
        memberSince: 'Membre depuis {date}',
        profileCompletion: 'Completion du Profil',
        completion: '{percent}% Complete',
        addLinkedInHint: 'Ajoutez LinkedIn pour atteindre {percent}%',
        social: {
          linkedin: 'LinkedIn',
          twitter: 'Twitter',
          website: 'Site Web'
        },
        connected: 'Connecte',
        connect: 'Se connecter',
        edit: 'Editer',
        add: 'Ajouter'
      },
      stats: {
        title: 'Statistiques d\'Activite',
        eventsAttended: 'Evenements Assistes',
        b2bMeetings: 'Reunions B2B',
        connectionsMade: 'Connexions Etablies',
        profileViews: 'Vues du Profil'
      },
      tabs: {
        basic: 'Infos de base',
        professional: 'Details Professionnels',
        b2b: 'Reseautage B2B',
        preferences: 'Preferences'
      },
      common: {
        select: 'Selectionner...',
        selectSector: '+ Ajouter un Secteur Professionnel'
      },
      sections: {
        personal: {
          title: 'Informations Personnelles',
          firstName: 'Prenom',
          lastName: 'Nom',
          email: 'Adresse Email',
          emailHelper: 'Cet email sert a la connexion et aux notifications',
          phone: 'Numero de Telephone',
          dateOfBirth: 'Date de Naissance',
          dobHelper: 'Non visible publiquement',
          gender: 'Genre',
          location: 'Localisation',
          timezone: 'Fuseau Horaire'
        },
        about: {
          title: 'A Propos de Moi',
          bioLabel: 'Bio / Description',
          bioHelper: 'Apparait sur votre profil public et page B2B',
          counter: '{current}/{max}',
          showBio: 'Afficher la bio sur le profil public'
        },
        professional: {
          title: 'Informations Professionnelles',
          jobTitle: 'Titre du Poste Actuel',
          company: 'Entreprise / Organisation',
          industry: 'Industrie',
          sector: 'Secteur Professionnel',
          industryOther: 'Autre Industrie',
          department: 'Departement',
          yearsExperience: 'Annees d\'experience',
          companySize: 'Taille de l\'Entreprise'
        },
        skills: {
          title: 'Domaines d\'Expertise',
          skillsLabel: 'Competences & Expertise',
          addSkill: 'Ajouter competence',
          skillsLimit: 'Ajoutez jusqu\'a 10 competences',
          interestsLabel: 'Interets Professionnels',
          addInterest: 'Ajouter interet'
        },
        education: {
          title: 'Education',
          add: 'Ajouter Education'
        },
        certifications: {
          label: 'Certifications',
          add: 'Ajouter Certification'
        }
      },
      b2b: {
        title: 'Profil de Reseautage B2B',
        subtitle: 'Ces informations aident a vous jumeler avec des connexions pertinentes',
        enableTitle: 'Activer le Reseautage B2B',
        enableHelper: 'Permettre aux autres participants de voir votre profil et demander des reunions',
        meetingPreferences: 'Preferences de Reunion',
        meetingGoalsLabel: 'Que recherchez-vous ?',
        industriesLabel: "Industries qui m'interessent",
        addIndustry: 'Ajouter industrie',
        companyStagesLabel: "Stades d'entreprise qui m'interessent",
        topicsLabel: 'Sujets que je peux aborder',
        addTopic: 'Ajouter sujet',
        availabilityTitle: 'Disponibilite',
        availabilityLabel: 'Je suis disponible pour des reunions',
        meetingFormatLabel: 'Format de reunion prefere',
        meetingDurationLabel: 'Duree preferee',
        meetingNotesLabel: 'Informations supplementaires pour les demandes',
        meetingNotesPlaceholder: 'ex: Mentionnez des sujets specifiques, disponible en semaine, etc.'
      },
      ai: {
        title: 'Preferences de Jumelage AI',
        proBadge: 'PRO',
        lockedMessage: 'Passez a Pro pour debloquer le jumelage par IA',
        upgrade: 'Passer a Pro',
        receiveTitle: 'Recevoir des suggestions de reunions par IA',
        receiveHelper: 'Obtenez des recommandations intelligentes basees sur votre profil',
        frequencyLabel: 'Frequence des suggestions ?',
        prioritiesLabel: 'Prioriser les correspondances basees sur :',
        criteria: {
          industry: 'Alignement industrie',
          role: 'Similitude de poste',
          stage: 'Correspondance stade entreprise',
          interests: 'Interets partages'
        }
      },
      preferences: {
        notificationsTitle: 'Notifications',
        privacyTitle: 'Confidentialite & Visibilite',
        profileVisibilityLabel: 'Qui peut voir mon profil ?',
        contactVisibilityLabel: 'Qui peut voir mes details de contact ?',
        activityTitle: 'Afficher mon activite sur le profil public',
        activityHelper: 'Afficher les evenements assistes et connexions faites',
        accountTitle: 'Compte',
        changePassword: 'Changer le mot de passe',
        twoFactor: 'Authentification a deux facteurs',
        recommended: 'Recommande',
        language: 'Langue',
        dangerTitle: 'Zone de Danger',
        dangerHelper: 'Supprimer definitivement votre compte et toutes les donnees',
        deleteAccount: 'Supprimer le compte'
      },
      sticky: {
        unsaved: 'Modifications non enregistrees',
        discard: 'Annuler',
        save: 'Enregistrer'
      },
      modals: {
        common: {
          cancel: 'Annuler',
          save: 'Enregistrer',
          saving: 'Enregistrement...'
        },
        education: {
          addTitle: 'Ajouter Education',
          editTitle: 'Editer Education',
          degree: 'Diplome',
          institution: 'Etablissement',
          years: 'Annees',
          yearsPlaceholder: 'ex: 2016 - 2020'
        },
        password: {
          title: 'Changer le mot de passe',
          current: 'Mot de passe actuel',
          new: 'Nouveau mot de passe',
          confirm: 'Confirmer le nouveau mot de passe',
          updating: 'Mise a jour...', 
          update: 'Mettre a jour',
          requirements: {
            length: 'Au moins 8 caracteres',
            uppercase: 'Une lettre majuscule',
            number: 'Un chiffre',
            special: 'Un caractere special'
          }
        },
        twoFactor: {
          title: 'Activer 2FA',
          instructions: 'Scannez le QR code avec votre application d\'authentification, puis entrez le code a 6 chiffres.',
          qrUnavailable: 'QR code indisponible',
          codeLabel: 'Code de Verification',
          codePlaceholder: '123456',
          verifying: 'Verification...', 
          verify: 'Verifier & Activer'
        },
        deleteConfirm: {
          title: 'Confirmer les suppressions',
          message: 'Vous allez effacer des champs qui contiennent des donnees. Cela ne peut pas etre annule.',
          accept: 'Je comprends que ces champs seront effaces.',
          confirm: 'Confirmer & Enregistrer'
        }
      },
      preview: {
        avatarAlt: 'Profil',
        about: 'A Propos',
        skills: 'Competences & Expertise',
        interests: 'Interets Professionnels',
        hint: 'Voici comment les autres participants voient votre profil',
        close: 'Fermer l\'Apercu'
      },
      crop: {
        title: 'Recadrer Photo',
        zoom: 'Zoom',
        apply: 'Appliquer & Telecharger'
      },
      prompts: {
        linkedin: 'URL LinkedIn',
        twitter: 'URL Twitter',
        website: 'URL Site Web',
        addSkill: 'Ajouter competence',
        addInterest: 'Ajouter interet',
        addIndustry: 'Ajouter industrie',
        addTopic: 'Ajouter sujet',
        certificationName: 'Certification',
        certificationOrganization: 'Organisation',
        certificationYear: 'Annee'
      },
      fields: {
        phoneNumber: 'Numero de telephone',
        dateOfBirth: 'Date de naissance',
        location: 'Localisation',
        timezone: 'Fuseau horaire',
        jobTitle: 'Titre du poste',
        company: 'Entreprise',
        department: 'Departement',
        industry: 'Industrie',
        gender: 'Genre',
        yearsExperience: "Annees d'experience",
        companySize: "Taille de l'entreprise",
        bio: 'Bio',
        linkedinUrl: 'URL LinkedIn',
        twitterUrl: 'URL Twitter',
        websiteUrl: 'URL Site Web',
        customIndustry: 'Industrie personnalisee',
        meetingTopics: 'Sujets de reunion',
        meetingGoals: 'Objectifs de reunion',
        companyStages: "Stades d'entreprise",
        meetingFormats: 'Formats de reunion',
        availabilityPreference: 'Preference de disponibilite',
        meetingDuration: 'Duree de reunion',
        meetingNotes: 'Notes de reunion',
        notificationPreferences: 'Preferences de notification',
        contactVisibility: 'Visibilite du contact',
        profileVisibility: 'Visibilite du profil',
        language: 'Langue'
      },
      toasts: {
        updateSuccess: 'Profil mis a jour avec succes',
        updateFailed: 'Echec de la mise a jour du profil',
        changesDiscarded: 'Modifications annulees',
        educationMissing: 'Veuillez completer tous les champs education.',
        educationUpdated: 'Education mise a jour.',
        educationAdded: 'Education ajoutee.',
        educationFailed: 'Echec de l\'enregistrement de l\'education.',
        passwordSignIn: 'Veuillez vous connecter pour mettre a jour le mot de passe.',
        passwordFields: 'Veuillez completer tous les champs mot de passe.',
        passwordMismatch: 'Les nouveaux mots de passe ne correspondent pas.',
        passwordIncorrect: 'Le mot de passe actuel est incorrect.',
        passwordUpdated: 'Mot de passe mis a jour avec succes.',
        passwordFailed: 'Echec de la mise a jour du mot de passe.',
        twoFactorUnavailable: "L'authentification a deux facteurs est indisponible.",
        twoFactorDisableFailed: 'Impossible de desactiver 2FA.',
        twoFactorDisabled: 'Authentification a deux facteurs desactivee.',
        twoFactorFailed: 'Echec 2FA.',
        twoFactorEnterCode: 'Entrez le code de verification.',
        twoFactorEnabled: 'Authentification a deux facteurs activee.',
        twoFactorVerifyFailed: 'Verification echouee.',
        photoSignIn: 'Veuillez vous connecter pour changer la photo',
        photoUploadFailed: 'Echec du telechargement de la photo',
        photoUpdated: 'Photo de profil mise a jour',
        photoSaveFailed: 'Echec de l\'enregistrement de la photo'
      },
      options: {
        industryOtherValue: 'Autre',
        gender: [
          { value: 'male', label: 'Homme' },
          { value: 'female', label: 'Femme' },
          { value: 'non-binary', label: 'Non-binaire' },
          { value: 'prefer-not-to-say', label: 'Prefere ne pas dire' },
          { value: 'custom', label: 'Personnalise' }
        ],
        timezones: [
          { value: 'pt', label: 'Heure du Pacifique (PT) - UTC-8' },
          { value: 'mt', label: 'Heure des Montagnes (MT) - UTC-7' },
          { value: 'ct', label: 'Heure Centrale (CT) - UTC-6' },
          { value: 'et', label: 'Heure de l\'Est (ET) - UTC-5' }
        ],
        industries: [
          { value: 'Technology & Software', label: 'Technologie & Logiciels' },
          { value: 'Financial Services & Banking', label: 'Services Financiers & Banque' },
          { value: 'Healthcare & Pharmaceuticals', label: 'Sante & Pharmaceutique' },
          { value: 'Manufacturing & Production', label: 'Fabrication & Production' },
          { value: 'Retail & E-commerce', label: 'Commerce de Detail & E-commerce' },
          { value: 'Consulting & Professional Services', label: 'Conseil & Services Pro' },
          { value: 'Education & Training', label: 'Education & Formation' },
          { value: 'Media & Entertainment', label: 'Medias & Divertissement' },
          { value: 'Transportation & Logistics', label: 'Transport & Logistique' },
          { value: 'Energy & Utilities', label: 'Energie & Services Publics' },
          { value: 'Real Estate & Construction', label: 'Immobilier & Construction' },
          { value: 'Hospitality & Tourism', label: 'Hotellerie & Tourisme' },
          { value: 'Telecommunications', label: 'Telecommunications' },
          { value: 'Agriculture & Food Production', label: 'Agriculture & Agroalimentaire' },
          { value: 'Automotive', label: 'Automobile' },
          { value: 'Aerospace & Defense', label: 'Aerospatiale & Defense' },
          { value: 'Legal Services', label: 'Services Juridiques' },
          { value: 'Marketing & Advertising', label: 'Marketing & Publicite' },
          { value: 'Non-Profit & NGO', label: 'Non-Lucratif & ONG' },
          { value: 'Government & Public Sector', label: 'Gouvernement & Secteur Public' },
          { value: 'Business enabling organisation', label: 'Organisation de soutien aux entreprises' },
          { value: 'Other', label: 'Autre' }
        ],
        companySizes: [
          { value: '1-10', label: '1-10 employes' },
          { value: '11-50', label: '11-50 employes' },
          { value: '51-200', label: '51-200 employes' },
          { value: '201-500', label: '201-500 employes' },
          { value: '501-1000', label: '501-1000 employes' },
          { value: '1000+', label: '1000+ employes' }
        ],
        meetingGoals: [
          { value: 'Find potential clients/customers', label: 'Trouver des clients potentiels', checked: true },
          { value: 'Explore partnership opportunities', label: 'Explorer des partenariats', checked: true },
          { value: 'Investment/Funding', label: 'Investissement/Financement', checked: false },
          { value: 'Learn from industry experts', label: 'Apprendre d\'experts', checked: true },
          { value: 'Hire talent', label: 'Recruter des talents', checked: false },
          { value: 'Share knowledge/expertise', label: 'Partager des connaissances', checked: true },
          { value: 'Other (specify)', label: 'Autre (preciser)', checked: false }
        ],
        companyStages: [
          { value: 'Startup (Seed stage)', label: 'Startup (Amorcage)', checked: true },
          { value: 'Early stage (Series A/B)', label: 'Early stage (Serie A/B)', checked: true },
          { value: 'Growth stage (Series C+)', label: 'Croissance (Serie C+)', checked: false },
          { value: 'Enterprise', label: 'Grande Entreprise', checked: true }
        ],
        availability: [
          { value: 'Always open to meeting requests', label: 'Toujours ouvert aux demandes', checked: true },
          { value: "Only at events I'm attending", label: "Uniquement aux evenements presents" },
          { value: 'Not currently accepting meetings', label: 'Pas de reunions actuellement' }
        ],
        meetingFormats: [
          { value: 'In-person', label: 'En personne', checked: true },
          { value: 'Virtual (video call)', label: 'Virtuel (video)', checked: true },
          { value: 'Phone call', label: 'Appel telephonique', checked: false }
        ],
        meetingDurations: [
          { value: '15 minutes', label: '15 minutes' },
          { value: '30 minutes', label: '30 minutes', checked: true },
          { value: '45 minutes', label: '45 minutes' },
          { value: '60 minutes', label: '60 minutes' }
        ],
        notificationPrefs: [
          {
            value: 'Event Updates',
            label: 'Mises a jour evenements',
            helper: "Recevoir des mises a jour sur vos evenements",
            checked: true
          },
          {
            value: 'B2B Meeting Requests',
            label: 'Demandes de reunion B2B',
            helper: 'Etre notifie lors d\'une demande de reunion',
            checked: true
          },
          {
            value: 'Marketing Emails',
            label: 'Emails Marketing',
            helper: 'Contenu promotionnel et recommandations',
            checked: false
          },
          {
            value: 'Weekly Digest',
            label: 'Resume Hebdomadaire',
            helper: 'Resume d\'activite et evenements a venir',
            checked: true
          }
        ],
        profileVisibility: [
          { value: 'Everyone (Public)', label: 'Tout le monde (Public)', checked: true },
          { value: 'Only event attendees', label: 'Uniquement participants' },
          { value: "Only people I've connected with", label: "Uniquement mes connexions" },
          { value: 'Private (Hidden)', label: 'Prive (Masque)' }
        ],
        contactVisibility: [
          { value: 'Email address', label: 'Adresse email', checked: true },
          { value: 'Phone number', label: 'Numero de telephone', checked: true },
          { value: 'LinkedIn profile', label: 'Profil LinkedIn', checked: false },
          { value: 'Company information', label: 'Informations entreprise', checked: true }
        ],
        aiSuggestionFrequency: [
          { value: 'daily', label: 'Quotidien' },
          { value: 'weekly', label: 'Hebdomadaire', checked: true },
          { value: 'before-event', label: 'Avant chaque evenement' }
        ],
        languages: [
          { value: 'en-us', label: 'Anglais (US)', checked: true },
          { value: 'en-uk', label: 'Anglais (UK)' },
          { value: 'fr', label: 'Francais' },
          { value: 'es', label: 'Espagnol' },
          { value: 'de', label: 'Allemand' },
          { value: 'ar', label: 'Arabe' }
        ]
      }
    },
        dashboard: {
      breadcrumb: {
        home: 'Accueil',
        current: 'Mes Evenements'
      },
      header: {
        title: 'Mes Evenements',
        subtitle: 'Gerez et suivez votre portefeuille d\'evenements',
        initializing: 'Initialisation...', 
        create: 'Creer un Evenement'
      },
      stats: {
        totalEvents: 'Total Evenements',
        totalAttendees: 'Total Participants',
        activeEvents: 'Evenements Actifs',
        revenue: 'Revenus',
        trendSuffix: 'depuis le mois dernier'
      },
      filters: {
        tabs: {
          all: 'Tous',
          live: 'En ligne',
          draft: 'Brouillons',
          archived: 'Archives'
        },
        searchPlaceholder: 'Rechercher des evenements...', 
        sortLabel: 'Trier par : {option}',
        sortOptions: {
          recent: 'Recent',
          oldest: 'Ancien'
        }
      },
      event: {
        typeFallback: 'Evenement',
        noDate: 'Date non definie',
        locationTbd: 'A definir',
        copyName: '{name} (Copie)'
      },
      status: {
        live: 'En ligne',
        draft: 'Brouillon',
        upcoming: 'A venir',
        archived: 'Archive'
      },
      card: {
        registered: '{count} inscrits',
        views: '{count} vues',
        sold: '{percent} vendus',
        pro: 'PRO',
        edit: 'Editer',
        duplicate: 'Dupliquer',
        more: 'Plus d\'actions'
      },
      empty: {
        create: 'Creer un Nouvel Evenement',
        waiting: 'Veuillez patienter un instant',
        subtitle: 'Commencez a construire votre prochain evenement'
      }
    },
    manageEvent: {
      loading: 'Chargement evenement...', 
      notFound: {
        title: 'Evenement non trouve',
        return: 'Retour au tableau de bord'
      },
      header: {
        viewLive: 'Voir site en ligne',
        editDetails: 'Modifier details',
        tbd: 'A definir',
        noDate: 'Pas de date definie'
      },
      nav: {
        overview: { label: 'Apercu', desc: 'Resume evenement' },
        agenda: { label: 'Agenda', desc: 'Gerer sessions' },
        speakers: { label: 'Intervenants', desc: 'Gerer profils' },
        attendees: { label: 'Participants', desc: 'Gerer inscriptions' },
        exhibitors: { label: 'Exposants', desc: 'Gerer stands' },
        ticketing: { label: 'Billetterie', desc: 'Gerer tarifs' },
        b2b: { label: 'Jumelage B2B', desc: 'Connexions' },
        marketing: { label: 'Marketing', desc: 'Outils promotionnels' },
        dayof: { label: 'Jour J', desc: 'QR & Check-in' },
        reporting: { label: 'Rapports', desc: 'Analyses' },
        notifications: { label: 'Notifications', desc: 'Emails et alertes' }
      },
      dayOf: {
        header: {
          title: 'Outils du jour J',
          subtitle: 'Check-in et suivi de presence en temps reel',
          live: 'EVENEMENT EN DIRECT',
          reports: 'Telecharger les rapports'
        },
        stats: {
          checkedIn: 'Presents actuellement',
          live: 'En direct',
          registered: '{percent}% inscrits ({total})',
          today: 'Check-ins aujourd\'hui',
          lastHour: '+{count} la derniere heure',
          activeSessions: 'Sessions actives',
          upcomingSessions: '{count} a venir aujourd\'hui',
          activeMeetings: 'Rendez-vous B2B actifs',
          scheduledMeetings: '{count} prevus aujourd\'hui'
        },
        tools: {
          title: 'Outils de check-in',
          event: {
            title: 'Check-in evenement',
            desc: 'Scanner les QR des participants pour l\'entree generale',
            checkedIn: 'Check-in',
            pending: 'En attente'
          },
          session: {
            title: 'Check-in session',
            desc: 'Suivre la presence des sessions et ateliers',
            active: 'Sessions actives',
            scans: 'Scans totaux'
          },
          b2b: {
            title: 'Check-in rendez-vous B2B',
            desc: 'Verifier les participants aux reunions planifiees',
            active: 'Reunions actives',
            completed: 'Terminees'
          },
          action: 'Ouvrir le scanner'
        },
        recent: {
          title: 'Check-ins recents',
          autoUpdate: 'Mise a jour auto',
          viewAll: 'Voir tous les check-ins'
        },
        metrics: {
          totalToday: 'Total aujourd\'hui',
          scanRate: 'Taux de scan',
          perHour: '{count}/h',
          scannedNow: 'Scanne maintenant'
        },
        lastScan: {
          registration: 'Inscription',
          checkInTime: 'Heure de check-in',
          previous: 'Check-ins precedents',
          email: 'Email'
        },
        settings: {
          title: 'Parametres du scanner',
          reset: 'Reinitialiser',
          cancel: 'Annuler',
          save: 'Enregistrer',
          saving: 'Enregistrement...',
          duplicatePolicy: 'Politique de doublon',
          policyOptions: {
            allow: 'Autoriser la re-entree',
            block: 'Bloquer les doublons',
            confirm: 'Demander confirmation pour doublons'
          },
          toggles: {
            autoAdvance: 'Avancer automatiquement apres un scan reussi',
            offline: 'Activer le scan hors ligne',
            sound: 'Jouer un son apres un scan reussi',
            vibrate: 'Vibrer au scan (mobile)'
          }
        },
        reportsModal: {
          title: 'Telecharger les rapports de check-in',
          reportType: 'Type de rapport',
          include: 'Inclure dans le rapport',
          download: 'Telecharger le rapport',
          types: {
            general: 'Check-ins generaux de l\'evenement',
            session: 'Presence des sessions',
            b2b: 'Check-ins des reunions B2B',
            all: 'Tous les check-ins (combine)'
          },
          fields: {
            attendee: 'Noms & emails des participants',
            timestamps: 'Horodatages de check-in',
            ticketTypes: 'Types de ticket',
            details: 'Details session/reunion',
            summary: 'Statistiques recapitulatives'
          }
        },
        empty: {
          scanPrompt: 'Scanner un QR code pour faire le check-in d\'un participant'
        },
        scanner: {
          status: 'Actif',
          close: 'Fermer',
          minimize: 'Reduire',
          switchCamera: 'Changer de camera',
          manualEntry: 'Saisie manuelle',
          checkIn: 'Check-in',
          placeholder: 'Entrer le code ticket/confirmation',
          ready: 'Pret a scanner',
          initializing: 'Initialisation de la camera...',
          complete: 'Scan termine',
          error: {
            unsupported: 'Le scan QR n\'est pas supporte sur cet appareil',
            denied: 'Acces camera refuse',
            unable: 'Impossible d\'acceder a la camera',
            invalid: 'QR code invalide',
            invalidDesc: 'Ce code n\'est pas valide pour cet evenement',
            session: 'Selectionner une session',
            meeting: 'Selectionner une reunion',
            meetingNotFound: 'Reunion introuvable',
            notAssigned: 'Le participant n\'est pas affecte a cette reunion',
            tryAgain: 'Reessayer'
          },
          success: {
            title: 'Check-in reussi !',
            reentry: 'Re-entree enregistree',
            prior: '{count} precedent(s)',
            firstTime: 'Premiere fois',
            viewProfile: 'Voir le profil',
            next: 'Scan suivant'
          },
          duplicate: {
            title: 'Deja check-in',
            first: 'Premier check-in : {time}',
            allow: 'Autoriser la re-entree',
            blocked: 'Doublon bloque'
          },
          offline: 'Check-in mis en file hors ligne',
          synced: 'Check-ins en attente synchronises'
        },
        sessions: {
          noSessions: 'Aucune session disponible'
        },
        meetings: {
          noMeetings: 'Aucune reunion disponible'
        },
        toasts: {
          settingsSaved: 'Paramètres du scanner enregistrés',
          settingsFailed: 'Échec de l\'enregistrement des paramètres',
          synced: 'Check-ins en attente synchronisés',
          cameraUnavailable: 'Accès caméra non disponible',
          cameraDenied: 'Accès caméra refusé',
          cameraInactive: 'La caméra n\'est pas active',
          torchUnsupported: 'Lampe torche non supportée sur cet appareil',
          torchFailed: 'Échec de la lampe torche',
          qrUnsupported: 'Scan QR non supporté sur cet appareil',
          enterCode: 'Veuillez entrer un code',
          invalidCode: 'QR code invalide — participant non trouvé',
          selectSession: 'Veuillez sélectionner une session',
          selectMeeting: 'Veuillez sélectionner une réunion',
          meetingNotFound: 'Réunion introuvable',
          notAssigned: 'Le participant n\'est pas affecté à cette réunion',
          duplicateBlocked: 'Doublon de check-in bloqué',
          queuedOffline: 'Check-in mis en file — synchronisation quand en ligne',
          reentryLogged: 'Ré-entrée enregistrée avec succès',
          checkInSuccess: 'Check-in réussi !',
          checkInFailed: 'Échec du check-in — veuillez réessayer',
          noDuplicate: 'Aucun doublon en attente à confirmer',
          reportDownloaded: 'Rapport téléchargé',
          reportFailed: 'Échec du téléchargement du rapport'
        }
      },
      reporting: {
        header: {
          title: 'Rapports & Analyses',
          subtitle: 'Insights complets et exports de donnees',
          exportAll: 'Exporter tous les rapports',
          share: 'Partager le rapport'
        },
        filters: {
          eventDuration: "Duree de l'evenement",
          last7: '7 derniers jours',
          last30: '30 derniers jours',
          custom: 'Plage personnalisee'
        },
        quickExport: {
          title: 'Exports rapides',
          attendees: 'Contacts des participants',
          checkins: 'Heures de check-in',
          sessions: 'Engagement par session',
          b2b: 'Reunions et resultats',
          descriptions: {
            attendees: 'Exporter les contacts des participants (CSV)',
            checkins: 'Exporter les horodatages et types de check-in (CSV)',
            sessions: 'Exporter la presence et taux de remplissage (CSV)',
            b2b: 'Exporter les reunions, participants et statuts (CSV)'
          },
          action: 'Exporter',
          counts: {
            attendees: '{count} participants',
            checkins: '{count} check-in ({percent}%)',
            sessions: '{count} sessions',
            meetings: '{count} reunions'
          }
        },
        performance: {
          title: "Performance de l'evenement",
          attendance: {
            label: 'Taux de presence global',
            desc: '{checkedIn} sur {total} inscrits',
            target: '+{percent}% vs objectif'
          },
          revenue: {
            label: 'Revenu total',
            desc: 'Depuis {count} billets payants',
            forecast: '+{percent}% vs prevision'
          },
          engagement: {
            label: "Score d'engagement",
            desc: 'Base sur plusieurs facteurs',
            status: 'Excellent',
            basis: 'Base sur sessions, reunions, reseautage'
          },
          nps: {
            label: 'Net Promoter Score',
            desc: '{count} reponses au sondage',
            status: 'Excellent'
          }
        },
        analytics: {
          title: 'Analyses de presence',
          subtitle: "Tendances d'inscription et de check-in",
          peak: "Jour de pic d'inscriptions",
          avg: 'Moyenne par jour',
          conversion: 'Taux de conversion',
          conversionDesc: 'Inscrits vers check-ins',
          registrations: '{count} inscriptions',
          noData: 'Pas de donnees'
        },
        tickets: {
          title: 'Repartition des ventes de billets',
          totalRevenue: 'Revenu total'
        },
        sessions: {
          title: 'Performance des sessions',
          subtitle: 'Meilleures et moins bonnes sessions',
          top: 'Top 5 sessions',
          insights: {
            high: 'Forte demande',
            low: 'Faible interet',
            normal: 'Normal'
          },
          headers: {
            name: 'Nom de la session',
            attendance: 'Presence',
            capacity: 'Capacite',
            rating: 'Note'
          },
          underperforming: 'Voir les sessions sous-performantes',
          insight: 'Insight'
        },
        b2b: {
          title: 'Insights reseautage B2B',
          stats: {
            title: 'Statistiques des reunions',
            scheduled: '{count} reunions planifiees',
            completed: '{count} reunions terminees ({percent}%)',
            cancelled: '{count} reunions annulees ({percent}%)',
            avgDuration: '{count} minutes (moyenne)',
            labels: {
              scheduled: 'Planifiees',
              avgDuration: 'Duree moyenne'
            }
          },
          types: {
            title: 'Types de reunions',
            partnership: 'Partenariat',
            salesDemo: 'Vente / Demo',
            investment: 'Investissement',
            networking: 'Reseautage',
            other: 'Autre'
          },
          active: {
            title: 'Plus actifs',
            meetings: '{count} reunions',
            defaultRole: 'Participant reseautage'
          }
        },
        engagement: {
          title: "Metriques d'engagement",
          sessionAvg: 'Moy. presence session',
          sessionAvgSub: 'sessions par participant',
          networking: 'Score reseautage',
          networkingSub: 'Base sur connexions creees',
          app: "Utilisation de l'app",
          appSub: 'Participants ayant utilise l’app',
          downloads: 'Telechargements',
          downloadsSub: 'Materiels & ressources'
        },
        feedback: {
          title: 'Avis des participants',
          responses: '{count} reponses ({percent}%)',
          overall: "Note globale de l'evenement",
          stars: '{count} etoiles',
          satisfaction: 'Satisfaction par categorie',
          categories: {
            venue: 'Lieu & installations',
            content: 'Contenu & intervenants',
            networking: 'Opportunites de reseautage',
            organization: "Organisation de l'evenement",
            value: 'Rapport qualite/prix'
          },
          featured: 'Commentaires en vedette'
        },
        builder: {
          title: 'Constructeur de rapport',
          subtitle: 'Creez un rapport personnalise',
          sections: {
            overview: "Apercu & resume",
            attendance: 'Analyses de presence',
            revenue: 'Repartition des revenus',
            sessions: 'Performance des sessions',
            tickets: 'Analyse des ventes',
            b2b: 'Insights reunions B2B',
            engagement: "Metriques d'engagement",
            feedback: 'Avis & sondages',
            attendeeList: 'Liste detaillee des participants',
            marketing: 'Performance marketing'
          },
          format: 'Format',
          formats: {
            pdf: 'Rapport PDF',
            xlsx: 'Classeur Excel (.xlsx)',
            pptx: 'Presentation PowerPoint (.pptx)',
            csv: 'Export CSV'
          },
          options: {
            charts: 'Inclure graphiques',
            branding: 'Ajouter logo & marque'
          },
          actions: {
            preview: 'Apercu',
            generate: 'Generer'
          }
        },
        modals: {
          export: {
            title: 'Exporter le rapport',
            format: "Format d'export",
            options: 'Options de donnees',
            fields: {
              columns: 'Inclure toutes les colonnes',
              summary: 'Inclure les statistiques',
              charts: 'Inclure graphiques/visualisations',
              timestamps: 'Inclure les horodatages'
            },
            actions: {
              cancel: 'Annuler',
              confirm: 'Exporter'
            }
          },
          share: {
            title: 'Partager le rapport',
            link: 'Lien partageable',
            copy: 'Copier',
            password: 'Proteger par mot de passe',
            expiration: "Definir une date d'expiration",
            email: 'Envoyer par email',
            emailPlaceholder: 'Saisir des adresses email...',
            message: 'Ajouter un message... (optionnel)',
            actions: {
              cancel: 'Annuler',
              share: 'Partager le rapport'
            }
          }
        },
        toasts: {
          exported: 'Tous les rapports ont ete exportes',
          attendeesExported: 'Rapport participants exporte',
          checkinsExported: 'Rapport check-in exporte',
          sessionsExported: 'Rapport sessions exporte',
          b2bExported: 'Rapport B2B exporte',
          generated: 'Rapport genere avec succes',
          shared: 'Rapport partage avec succes',
          unsupported: "Type d'export non supporte",
          failed: "Echec de l'export"
        }
      },
      overview: {
        header: {
          title: 'Apercu Evenement',
          subtitle: "Surveillez les performances et metriques cles"
        },
        metrics: {
          registrations: {
            label: 'Total Inscriptions',
            active: 'Actif',
            none: 'Aucune inscription'
          },
          revenue: {
            label: 'Revenus',
            fromSales: 'Ventes de billets',
            none: 'Aucun revenu'
          },
          ticketsSold: {
            label: 'Billets Vendus',
            capacity: '{percent}% capacite',
            noCapacity: 'Pas de limite'
          },
          avgPrice: {
            label: 'Prix Moyen',
            acrossTypes: 'Tous types',
            setPrice: 'Definir prix'
          }
        },
        charts: {
          registrationTrends: {
            title: 'Tendances Inscriptions',
            subtitle: 'Activite des 30 derniers jours',
            viewDetails: 'Voir details',
            visualization: 'Graphique inscriptions'
          }
        },
        activity: {
          title: 'Activite Recente',
          noActivity: 'Aucune activite',
          noActivityDesc: 'Creez billets, sessions, intervenants ou exposants pour commencer.',
          viewAll: 'Voir toute l\'activite',
          items: {
            speaker: 'Intervenant',
            session: 'Session',
            ticket: 'Billet',
            exhibitor: 'Exposant',
            registrationForm: 'Formulaire inscription',
            emailCampaign: 'Campagne email',
            marketingLink: 'Lien marketing',
            update: 'Mise a jour',
            created: 'cree',
            updated: 'mis a jour',
            deleted: 'supprime'
          }
        },
        tasks: {
          title: 'Taches a Venir',
          pending: '{count} en attente',
          viewAll: 'Voir toutes les taches',
          items: {
            tickets: 'Creer billets',
            sessions: 'Creer sessions',
            speakers: 'Ajouter intervenants',
            exhibitors: 'Creer exposants'
          }
        },
        actions: {
          title: 'Actions Rapides',
          sendEmail: 'Envoyer Email',
          addSession: 'Ajouter Session',
          addSpeaker: 'Ajouter Intervenant',
          previewSite: 'Voir Site'
        },
        health: {
          title: 'Score Sante Evenement',
          setupIncomplete: 'Configuration incomplete. Commencez par ajouter billets, sessions, intervenants et exposants.',
          setupIncompleteNext: 'Configuration incomplete. Suivant : {items}.',
          goodStart: 'Bon debut. Continuez sur votre lancee.',
          goodStartNext: 'Bon debut. Terminez {count} elements cles pour booster la preparation.',
          almostThere: 'Presque la. Finalisez la configuration restante.',
          almostThereNext: 'Presque la. Completez {count} elements cles pour un lancement reussi.',
          greatProgress: 'Excellent progres ! Votre evenement est pret au lancement.',
          greatProgressNext: 'Excellent progres ! Completez {count} elements cles pour 100%.'
        },
        toasts: {
          publishSuccess: 'Evenement publie avec succes !',
          publishError: 'Echec de la publication.'
        }
      },
      agenda: {
        header: {
          title: 'Agenda & Planning',
          subtitle: 'Gerez les sessions, intervenants et le planning.'
        },
        viewModes: {
          timeline: 'Vue Chrono',
          list: 'Vue Liste'
        },
        filter: {
          button: 'Filtrer',
          title: 'Filtrer Sessions',
          track: 'Piste',
          room: 'Salle',
          status: 'Statut',
          allTracks: 'Toutes Pistes',
          allRooms: 'Toutes Salles',
          allStatus: 'Tous Statuts',
          reset: 'Reinitialiser',
          apply: 'Appliquer'
        },
        builder: 'Ouvrir Constructeur Planning',
        stats: {
          total: 'Total Sessions',
          days: 'Sur {count} jours',
          day: 'Sur 1 jour',
          confirmed: 'Confirme',
          confirmedPct: '{percent}% confirme',
          nearlyFull: 'Presque Plein',
          capacityHint: '>90% capacite',
          avgAttendance: 'Presence Moy.',
          attendanceHint: 'Base sur check-in'
        },
        timeline: {
          dayLabel: 'Jour {day}: {date}',
          noSessions: 'Aucune session ne correspond aux filtres.'
        },
        list: {
          columns: {
            time: 'Heure',
            title: 'Titre Session',
            speakers: 'Intervenant(s)',
            location: 'Lieu/Salle',
            capacity: 'Capacite',
            attendees: 'Participants Inscrits',
            status: 'Statut',
            actions: 'Actions'
          },
          rowActions: {
            edit: 'Editer Session',
            viewAttendees: 'Voir Participants',
            sendNotification: 'Envoyer Notification'
          }
        },
        status: {
          confirmed: 'Confirme',
          full: 'Complet',
          pending: 'En attente',
          cancelled: 'Annule'
        },
        modals: {
          attendees: {
            title: 'Participants',
            loading: 'Chargement participants...', 
            columns: {
              attendee: 'Participant',
              company: 'Entreprise',
              email: 'Email'
            },
            empty: 'Aucun participant.'
          },
          notification: {
            title: 'Envoyer Notification',
            fields: {
              title: 'Titre',
              channel: 'Canal',
              message: 'Message'
            },
            channels: {
              inApp: 'In-app',
              email: 'Email',
              sms: 'SMS',
              push: 'Push'
            },
            actions: {
              cancel: 'Annuler',
              send: 'Envoyer',
              sending: 'Envoi...'
            }
          },
          edit: {
            title: 'Editer Session',
            fields: {
              title: 'Titre',
              speaker: 'Intervenant',
              speakerPhoto: 'URL Photo Intervenant',
              location: 'Lieu',
              track: 'Piste',
              day: 'Jour',
              startTime: 'Heure Debut',
              endTime: 'Heure Fin',
              capacity: 'Capacite',
              status: 'Statut',
              description: 'Description'
            },
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer',
              saving: 'Enregistrement...'
            }
          }
        },
        toasts: {
          notifRequired: 'Titre et message requis',
          notifSuccess: 'Notification creee',
          notifError: 'Echec creation notification',
          titleRequired: 'Titre session requis',
          updateSuccess: 'Session mise a jour',
          updateError: 'Echec mise a jour session'
        }
      },
      speakers: {
        header: {
          title: 'Gestion Intervenants',
          subtitle: 'Coordonner intervenants, sessions et materiel',
          sendUpdate: 'Envoyer Mise a jour',
          import: 'Importer',
          add: 'Ajouter'
        },
        stats: {
          total: 'Total Intervenants',
          trainerCount: '{count} formateur',
          lectureCount: '{count} conferencier',
          pendingCount: '+{count} en attente',
          confirmed: 'Confirme',
          confirmedPct: '{percent}% confirme',
          sessionsAssigned: 'Sessions Assignees',
          allAssigned: 'Toutes sessions ont intervenants',
          needSpeakers: '{count} session(s) sans intervenant',
          noSessions: 'Aucune session',
          materialsSubmitted: 'Materiaux Soumis',
          pendingUploads: '{count} en attente',
          sendReminder: 'Envoyer Rappel',
          rating: 'Note Intervenant',
          basedOnFeedback: 'Base sur retours'
        },
        tabs: {
          all: 'Tous Intervenants',
          bySession: 'Par Session',
          materials: 'Suivi Materiaux',
          communication: 'Journal Comms',
          analytics: 'Analyses'
        },
        allSpeakers: {
          filters: {
            all: 'Tous',
            trainer: 'Formateur',
            coach: 'Coach',
            expert: 'Expert',
            confirmed: 'Confirme',
            pending: 'En attente'
          },
          search: 'Rechercher...', 
          sort: 'Trier: Nom {order}',
          sortAsc: 'A-Z',
          sortDesc: 'Z-A',
          card: {
            sessions: '{count} sessions',
            materials: 'Materiaux',
            speakingAt: 'Intervient a',
            noSessions: 'Aucune session',
            materialsSubmitted: 'Materiaux soumis',
            materialsPending: 'Materiaux en attente',
            more: 'plus',
            moreSessions: 'sessions en plus',
            viewProfile: 'Voir Profil',
            contact: 'Contact',
            edit: 'Editer',
            remove: 'Supprimer',
            email: 'Email'
          },
          badges: {
            trainer: 'Formateur',
            coach: 'Coach',
            expert: 'Expert'
          },
          empty: {
            title: 'Ajouter Nouvel Intervenant',
            subtitle: 'Etendre votre liste',
            cta: 'Ajouter'
          }
        },
        bySession: {
          columns: {
            session: 'Session',
            dateTime: 'Date & Heure',
            location: 'Lieu',
            speakers: 'Intervenants',
            actions: 'Actions'
          },
          actions: {
            assign: 'Assigner',
            contact: 'Contacter',
            view: 'Voir',
            addSession: 'Ajouter Session'
          },
          empty: 'Aucune session trouvee.'
        },
        materials: {
          columns: {
            speaker: 'Intervenant',
            presentation: 'Presentation',
            deadline: 'Date Limite',
            status: 'Statut',
            action: 'Action'
          },
          status: {
            submitted: 'Soumis',
            pending: 'En attente',
            overdue: 'En retard'
          },
          actions: {
            remind: 'Rappeler',
            download: 'Telecharger',
            remindAll: 'Rappeler Tous'
          },
          empty: 'Aucune donnee materiel.'
        },
        communication: {
          columns: {
            date: 'Date',
            recipient: 'Destinataire',
            subject: 'Sujet',
            channel: 'Canal',
            status: 'Statut'
          },
          empty: 'Aucun journal de communication.'
        },
        analytics: {
          popularity: 'Popularite Session',
          materialCompletion: 'Taux Completion Materiel',
          feedbackTrends: 'Tendances Feedback'
        },
        bulk: {
          selected: '{count} selectionnes',
          deselect: 'Tout Deselectionner',
          sendEmail: 'Envoyer Email',
          export: 'Exporter Selection',
          changeStatus: 'Changer Statut',
          delete: 'Supprimer'
        },
        modals: {
          compose: {
            title: 'Envoyer Message',
            noRecipients: 'Aucun destinataire',
            others: '+{count} autres',
            fields: {
              subject: 'Sujet',
              channel: 'Canal',
              message: 'Message'
            },
            actions: {
              cancel: 'Annuler',
              send: 'Envoyer',
              sending: 'Envoi...'
            }
          },
          status: {
            title: 'Changer Statut',
            count: '{count} selectionne(s)',
            fields: {
              status: 'Statut'
            },
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer',
              saving: 'Enregistrement...'
            }
          },
          assign: {
            title: 'Assigner Intervenants',
            empty: 'Aucun intervenant disponible.',
            selected: '{count} selectionne(s)',
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer',
              saving: 'Enregistrement...'
            }
          }
        },
        toasts: {
          notifRequired: 'Titre et message requis',
          notifError: 'Echec envoi notification',
          notifSuccess: 'Notification envoyee',
          selectRecipient: 'Selectionnez au moins un intervenant',
          noMaterials: 'Pas de materiaux en attente',
          reminderSent: 'Rappel envoye',
          removeConfirm: 'Supprimer {name} ?',
          removeError: 'Echec suppression',
          removeSuccess: 'Intervenant supprime',
          deleteConfirm: 'Supprimer {count} intervenant(s) ?',
          deleteError: 'Echec suppression',
          deleteSuccess: 'Intervenants supprimes',
          noExport: 'Rien a exporter',
          statusUpdateError: 'Echec mise a jour statut',
          statusUpdateSuccess: 'Statut mis a jour',
          assignError: 'Echec assignation',
          assignSuccess: 'Intervenants assignes',
          csvError: 'Veuillez uploader un fichier CSV',
          csvEmpty: 'CSV doit avoir un en-tete et une ligne',
          importEmpty: 'Aucune ligne valide',
          importSuccess: 'Intervenants importes',
          nameRequired: 'Nom requis',
          updateError: 'Echec mise a jour',
          updateSuccess: 'Intervenant mis a jour',
          addError: 'Echec ajout',
          addSuccess: 'Intervenant ajoute',
          emailCopied: 'Email copie',
          noEmail: 'Pas d\'email a copier'
        },
        detailModal: {
          tabs: {
            overview: 'Apercu',
            sessions: 'Sessions',
            materials: 'Materiaux',
            communication: 'Communication',
            analytics: 'Analyses'
          },
          overview: {
            about: 'A propos',
            expertise: 'Expertise & Sujets',
            experience: 'Experience',
            eventsSpoken: 'Evenements Precedents',
            avgRating: 'Note Moyenne',
            yearsExperience: 'Annees Experience',
            contact: 'Details Contact',
            copy: 'Copier'
          },
          sessions: {
            empty: 'Aucune session assignee.'
          },
          footer: {
            remove: 'Supprimer',
            sendEmail: 'Envoyer Email',
            edit: 'Editer Details'
          }
        }
      },
      attendees: {
        header: {
          title: 'Gestion Participants',
          subtitle: 'Voir et gerer toutes les inscriptions',
          import: 'Importer',
          add: 'Ajouter',
          export: 'Exporter Excel'
        },
        stats: {
          total: 'Total Participants',
          capacity: '{percent}% capacite ({total})',
          capacityUnset: 'Pas de capacite',
          growth: '+{count} cette semaine',
          pending: 'En Attente',
          awaiting: 'En attente action',
          review: 'Revoir',
          checkedIn: 'Check-in',
          attendanceRate: '{percent}% taux presence',
          noShows: 'No-Shows',
          noShowRate: '{percent}% des inscrits'
        },
        filters: {
          all: 'Tous',
          approved: 'Approuve',
          pending: 'En attente',
          declined: 'Refuse',
          checkedIn: 'Check-in',
          vip: 'VIP',
          search: 'Rechercher nom, email...', 
          sort: 'Trier: {option}',
          sortOptions: {
            recent: 'Recent',
            name: 'Nom A-Z',
            status: 'Statut',
            checkin: 'Check-in',
            ticket: 'Prix Billet'
          }
        },
        table: {
          headers: {
            attendee: 'Participant',
            date: 'Date Inscription',
            status: 'Statut',
            checkin: 'Check-in',
            actions: 'Actions'
          },
          rows: {
            groupLeader: 'Chef Groupe',
            groupSize: 'Groupe de {count}',
            new: 'NOUVEAU',
            checkedIn: 'Present',
            notYet: 'Pas encore'
          },
          actions: {
            view: 'Voir Details',
            approve: 'Approuver',
            decline: 'Refuser',
            edit: 'Editer',
            email: 'Envoyer Email',
            resend: 'Renvoyer Confirmation',
            checkin: 'Check-in Manuel',
            vip: 'Marquer VIP',
            qr: 'Voir QR',
            delete: 'Supprimer'
          }
        },
        pagination: {
          previous: 'Precedent',
          next: 'Suivant',
          showing: 'Affichage {start}-{end} sur {total}'
        },
        bulk: {
          selected: '{count} selectionnes',
          deselect: 'Tout Deselectionner',
          email: 'Envoyer Email',
          approve: 'Approuver',
          export: 'Exporter',
          delete: 'Supprimer'
        },
        modals: {
          add: {
            titleAdd: 'Ajouter Participant',
            titleEdit: 'Editer Participant',
            fields: {
              name: 'Nom Complet *',
              email: 'Email',
              company: 'Entreprise',
              phone: 'Telephone',
              ticketType: 'Type Billet',
              ticketColor: 'Couleur Billet',
              price: 'Prix Paye',
              status: 'Statut',
              vip: 'VIP',
              checkin: 'Check-in'
            },
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer'
            }
          },
          export: {
            title: 'Exporter Participants',
            subtitle: 'Choisir format et champs',
            format: 'Format Export',
            fields: 'Champs Inclus',
            filter: 'Filtrer par Statut',
            actions: {
              cancel: 'Annuler',
              export: 'Exporter'
            },
            options: {
              all: 'Tous',
              approved: 'Approuves Seuls',
              pending: 'En Attente Seuls',
              checkedIn: 'Presents Seuls'
            },
            fieldLabels: {
              nameEmail: 'Nom & Email',
              ticketPrice: 'Billet & Prix',
              registrationDate: 'Date Inscription',
              checkInStatus: 'Statut Check-in',
              contact: 'Infos Contact',
              dietary: 'Regime & Accessibilite',
              notes: 'Notes'
            }
          },
          detail: {
            title: 'Details Participant',
            status: 'Statut',
            ticket: 'Billet',
            contact: 'Information Contact',
            registration: 'Details Inscription',
            additional: 'Infos Supplementaires',
            fields: {
              company: 'Entreprise',
              phone: 'Telephone',
              linkedin: 'LinkedIn',
              orderId: 'ID Commande',
              date: 'Date',
              price: 'Prix',
              dietary: 'Regime',
              accessibility: 'Accessibilite',
              notes: 'Notes'
            },
            actions: {
              close: 'Fermer',
              edit: 'Editer',
              checkin: 'Check In'
            }
          }
        },
        toasts: {
          loadError: 'Echec chargement',
          saveError: 'Echec enregistrement',
          saveBlocked: 'Enregistrement bloque',
          deleteError: 'Echec suppression',
          deleteBlocked: 'Suppression bloquee',
          missingEvent: 'Evenement manquant',
          nameRequired: 'Nom requis',
          updateSuccess: 'Mis a jour',
          addError: 'Echec ajout',
          addBlocked: 'Ajout bloque',
          addSuccess: 'Ajoute',
          csvError: 'Fichier CSV requis',
          noRows: 'Aucune ligne trouvee',
          importSuccess: 'Importe {count}',
          importFailed: 'Echec import',
          selectField: 'Selectionnez un champ',
          noExport: 'Rien a exporter',
          exportSuccess: 'Exporte avec succes !',
          bulkUpdateError: 'Echec mise a jour groupee',
          bulkUpdateSuccess: 'Participants {status}',
          bulkDeleteError: 'Echec suppression groupee',
          bulkDeleteSuccess: 'Participants supprimes',
          filterReset: 'Filtres reinitialises',
          resendSuccess: 'Confirmation renvoyee a {name}',
          checkinSuccess: '{name} {status}',
          vipSuccess: '{name} {status}',
          qrInfo: 'QR code pour {name}',
          deleteSuccess: '{name} supprime',
          declined: '{name} refuse',
          approved: '{name} approuve',
          noEmail: 'Pas d\'email'
        }
      },
      forms: {
        title: 'Formulaires et reponses',
        subtitle: 'Consultez tous vos formulaires et suivez les reponses des participants.',
        anonymous: 'Participant anonyme',
        empty: 'Aucun formulaire cree. Rendez-vous dans Inscription pour en creer un !',
        table: {
          formName: 'Nom du formulaire',
          type: 'Type',
          created: 'Date de creation',
          actions: 'Actions'
        },
        buttons: {
          copyLink: 'Copier le lien',
          viewSubmissions: 'Voir les reponses',
          exportCsv: 'Exporter en CSV'
        },
        submissions: {
          viewing: '{count} reponses recues',
          submittedAt: 'Date de soumission',
          attendee: 'Repondant',
          attendeeName: 'Nom du repondant',
          attendeeEmail: 'Adresse email',
          data: 'Donnees de reponse',
          noSubmissions: 'Aucune reponse pour le moment — partagez votre formulaire !'
        },
        toasts: {
          loadFormsFailed: 'Impossible de charger les formulaires.',
          loadSubmissionsFailed: 'Impossible de charger les reponses.',
          linkCopied: 'Lien copie dans le presse-papiers !'
        }
      },
      exhibitors: {
        termExhibitor: 'Exposant',
        termSponsor: 'Sponsor',
        header: {
          title: 'Exposants & Sponsors',
          shareLink: 'Partager Lien Auto',
          add: 'Ajouter Manuel'
        },
        tabs: {
          exhibitors: 'Exposants',
          sponsors: 'Sponsors'
        },
        stats: {
          totalExhibitors: 'Total Exposants',
          boothsAssigned: 'Stands Assignes',
          pendingSetup: 'En Attente Config',
          profilesComplete: 'Profils Complets',
          totalSponsors: 'Total Sponsors',
          platinum: 'Platine',
          gold: 'Or',
          silver: 'Argent'
        },
        managementMode: {
          title: 'Choisir Mode Gestion',
          subtitle: 'Ajoutez manuellement ou envoyez un lien',
          manual: 'Remplissage Manuel',
          selfFill: 'Liens Auto'
        },
        selfFill: {
          title: 'Lien Formulaire Auto',
          subtitle: 'Partagez ce lien pour que {type} completent leur profil.',
          copy: 'Copier Lien',
          copied: 'Copie',
          preview: 'Apercu Formulaire'
        },
        filters: {
          search: 'Rechercher entreprise, stand...', 
          booth: {
            all: 'Tous Stands',
            assigned: 'Assigne',
            unassigned: 'Non Assigne',
            premium: 'Premium'
          },
          profile: {
            all: 'Tous Profils',
            complete: 'Complet',
            incomplete: 'Incomplet',
            pending: 'En Attente'
          },
          tier: {
            all: 'Tous Niveaux',
            platinum: 'Platine',
            gold: 'Or',
            silver: 'Argent',
            bronze: 'Bronze'
          },
          sort: {
            company: 'Entreprise A-Z',
            booth: 'Numero Stand',
            date: 'Date Ajout',
            profile: 'Profil %'
          }
        },
        bulk: {
          selected: '{count} {type} selectionnes',
          assignBooths: 'Assigner Stands',
          sendMessage: 'Envoyer Message',
          updateStatus: 'Changer Statut',
          exportData: 'Exporter',
          remove: 'Supprimer',
          updateTier: 'Changer Niveau',
          sendMaterials: 'Envoyer Materiaux'
        },
        viewModes: {
          cards: 'Cartes',
          list: 'Liste',
          map: 'Carte Stands'
        },
        cards: {
          booth: 'Stand #{number}',
          noBooth: 'Pas de stand',
          assign: 'Assigner Stand',
          moreTags: '+{count} plus',
          sponsorship: 'Sponsoring {tier}',
          benefits: '+{count} avantages'
        },
        list: {
          headers: {
            company: 'ENTREPRISE',
            booth: 'ASSIGNATION STAND',
            contact: 'CONTACT PRINCIPAL',
            category: 'CATEGORIE',
            status: 'STATUT PROFIL',
            tier: 'NIVEAU SPONSORING',
            benefits: 'AVANTAGES'
          },
          assignNow: 'Assigner',
          unassigned: 'Non Assigne'
        },
        status: {
          complete: 'Complet',
          incomplete: 'Incomplet',
          pending: 'En Attente'
        },
        toasts: {
          linkCopied: 'Lien copie',
          noEmail: 'Pas d\'email',
          noPhone: 'Pas de telephone'
        },
        map: {
          title: 'Plan de l\'exposition',
          mainHall: 'Hall Principal',
          legend: 'Legende',
          legendItems: {
            assigned: 'Stand Assigne',
            available: 'Stand Disponible',
            premium: 'Emplacement Premium',
            entry: 'Entree/Sortie',
            food: 'Restauration',
            restrooms: 'Toilettes'
          },
          empty: {
            title: 'Aucun stand assigne',
            subtitle: 'Assignez des stands pour remplir la carte'
          },
          boothLabel: 'Stand {number}',
          standardLocation: 'Emplacement standard',
          assignPanel: {
            title: 'Assigner Stand {number}',
            size: 'Taille: 3m × 3m (9m²)',
            location: 'Lieu: {hall}, {location}',
            typeAssigned: 'Type: Stand Assigne',
            typeStandard: 'Type: Stand Standard',
            selectLabel: 'Selectionner Exposant',
            searchPlaceholder: 'Rechercher exposants...',
            cancel: 'Annuler',
            assign: 'Assigner Stand'
          }
        },
        modals: {
          add: {
            edit: 'Editer',
            add: 'Ajouter',
            subtitle: 'Remplissez les details ou envoyez un lien auto',
            uploadLogo: 'Televerser Logo',
            logoHint: 'PNG ou JPG, max 5MB, format carre',
            fields: {
              companyName: 'Nom Entreprise*',
              website: 'Site Web',
              category: 'Industrie/Categorie*',
              description: 'Description Entreprise',
              contactName: 'Nom Contact Principal*',
              contactRole: 'Titre/Role',
              email: 'Adresse Email*',
              phone: 'Telephone',
              assignBooth: 'Assigner stand maintenant (optionnel)',
              hall: 'Hall/Zone',
              boothNumber: 'Numero Stand'
            },
            placeholders: {
              companyName: 'ex: TechCorp Solutions',
              website: 'https://www.entreprise.com',
              category: 'Selectionner categorie...',
              description: 'Breve description...'
            },
            sections: {
              contact: 'Informations Contact',
              booth: 'Assignation Stand',
              sponsorship: 'Details Sponsoring',
              benefits: 'Avantages Package'
            },
            options: {
              welcomeEmail: 'Envoyer email bienvenue avec instructions',
              publicDirectory: 'Ajouter au repertoire public immediatement'
            },
            actions: {
              draft: 'Enregistrer Brouillon',
              save: 'Enregistrer',
              add: 'Ajouter {type}'
            }
          },
          share: {
            title: 'Partager Lien Auto {type}',
            subtitle: 'Envoyez ce lien pour qu\'ils completent leur profil',
            tabs: {
              exhibitor: 'Lien Exposant',
              sponsor: 'Lien Sponsor'
            },
            description: 'Les entreprises pourront s\'inscrire et personnaliser leur profil. Vous recevrez une notification a chaque soumission.',
            copy: 'Copier',
            copied: 'Copie !',
            scan: 'Scanner pour acceder au formulaire',
            downloadQr: 'Telecharger QR',
            shareVia: 'Partager via :',
            options: {
              approval: 'Exiger approbation admin avant mise en ligne',
              notification: 'Recevoir notification par email'
            },
            actions: {
              done: 'Termine'
            }
          }
        }
      },
      ticketing: {
        header: {
          title: 'Billetterie & Tarifs',
          subtitle: 'Surveillez les ventes et gerez les stocks'
        },
        stats: {
          totalRevenue: 'Revenu Total',
          netRevenue: 'Net: ${amount} apres frais',
          ticketsSold: 'Billets Vendus',
          acrossTypes: 'Sur {count} types',
          sellThroughRate: 'Taux ecoulement',
          soldOfTotal: '{sold} sur {total} billets',
          totalOrders: 'Total Commandes',
          avgPerOrder: 'Moy. {count} billets/commande'
        },
        ticketTypes: {
          title: 'Types de Billets',
          add: 'Ajouter Nouveau Type',
          soldCount: '{sold} / {total} Vendus',
          salesEnd: 'Fin ventes le {date}',
          price: 'Prix',
          revenue: 'Revenu',
          status: 'Statut',
          actions: {
            edit: 'Editer',
            orders: 'Commandes',
            duplicate: 'Dupliquer',
            archive: 'Archiver'
          }
        },
        settings: {
          title: 'Parametres Evenement',
          globalLimit: 'Limite Globale',
          limitLabel: 'Limite Globale Billets',
          limitPlaceholder: 'Entrez capacite totale',
          limitHint: 'Max total billets vendables tous types confondus'
        },
        status: {
          onSale: 'En Vente',
          soldOut: 'Epuise',
          offSale: 'Ventes Fermees',
          scheduled: 'Planifie'
        },
        modals: {
          add: {
            titleAdd: 'Ajouter Billet',
            titleEdit: 'Editer: {name}',
            simulatePro: 'Simuler Plan Pro',
            proMode: 'MODE PRO',
            fields: {
              name: 'Nom Billet *',
              namePlaceholder: 'ex: Pass VIP, Admission Generale',
              tier: 'Niveau Billet',
              standard: 'Standard',
              standardDesc: 'Pour participants generaux',
              vip: 'VIP',
              vipDesc: 'Niveau premium avec avantages',
              price: 'Prix Billet *',
              quantity: 'Quantite Dispo *',
              earlyBird: 'Activer Tarif Early Bird',
              earlyBirdPrice: 'Prix Early Bird',
              earlyBirdUntil: 'Valide Jusqu\'au',
              saleStarts: 'Debut Vente',
              saleEnds: 'Fin Vente',
              description: 'Description Billet',
              descriptionPlaceholder: "Decrivez ce qui est inclus...",
              advanced: 'Options Avancees',
              minPerOrder: 'Min par Commande',
              maxPerOrder: 'Max par Commande',
              visibility: 'Visibilite',
              public: 'Public',
              hidden: 'Cache/Prive',
              hiddenHint: 'Accessible uniquement via lien direct',
              status: 'Statut'
            },
            warnings: {
              upgradeRequired: 'Mise a niveau requise',
              upgradeDesc: 'Passez a Pro pour billets payants.',
              vipUpgrade: 'Passez a Pro pour billets VIP'
            },
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer',
              create: 'Creer Billet'
            }
          }
        },
        toasts: {
          loadError: 'Echec chargement',
          saveSuccess: 'Modifications enregistrees',
          createSuccess: 'Billet cree',
          saveError: 'Echec enregistrement',
          duplicateSuccess: 'Duplique',
          duplicateError: 'Echec duplication',
          archiveSuccess: 'Archive',
          archiveError: 'Echec archivage',
          missingEvent: 'Evenement manquant'
        }
      },
      b2b: {
        header: {
          title: 'Hub Jumelage B2B',
          subtitle: 'Reseautage par IA et facilitation reunions',
          aiMatchmaker: 'Matchmaker IA',
          createMeeting: 'Creer Reunion'
        },
        stats: {
          activeConnections: 'Connexions Actives',
          totalMeetings: 'Total reunions planifiees',
          newThisWeek: '+{count} cette semaine',
          aiMatchSuccess: 'Succes Match IA',
          ofAiAccepted: 'Des matchs IA acceptes',
          pendingSuggestions: 'Suggestions en Attente',
          awaitingResponse: 'En attente reponse',
          sendReminders: 'Envoyer Rappels',
          completed: 'Complete',
          completionRate: '{percent}% taux completion',
          networkingScore: 'Score Reseautage',
          overallEngagement: 'Engagement global'
        },
        tabs: {
          aiMatchmaker: 'Matchmaker IA',
          allMeetings: 'Toutes Reunions',
          analytics: 'Analyses Reseautage',
          suggestions: 'Suggestions Match'
        },
        aiMatchmaker: {
          title: 'Moteur Jumelage IA',
          subtitle: 'Reseautage intelligent',
          whoToMatch: 'Qui jumeler ?',
          options: {
            all: {
              label: 'Tous Participants',
              desc: "Generer matchs pour tous ceux non connectes",
              count: '{count} dispos'
            },
            category: {
              label: 'Categorie Specifique',
              desc: 'Cibler groupes specifiques',
              count: '{count} avec categories'
            },
            individuals: {
              label: 'Individus Selectionnes',
              desc: 'Choisir participants specifiques',
              count: '{count} opt-in'
            },
            recommended: 'Recommande',
            noAttendees: 'Aucun participant',
            noCategories: 'Aucune categorie',
            noOptIn: 'Aucun opt-in'
          },
          criteria: {
            title: 'Criteres Match',
            industry: 'Alignement Industrie',
            industryDesc: 'Haute priorite - Industries similaires',
            role: 'Compatibilite Role',
            roleDesc: 'Moyenne priorite',
            stage: 'Alignement Stade Entreprise',
            stageDesc: 'Moyenne-haute priorite',
            interests: 'Interets Communs',
            interestsDesc: 'Haute priorite - Focus interets',
            goals: 'Alignement Objectifs',
            goalsDesc: 'Haute priorite - Objectifs reseautage'
          },
          threshold: {
            title: 'Score Min Match',
            subtitle: 'Suggérer seulement si compatibilité > {percent}%',
            recommended: 'Recommandé: 70-80%'
          },
          generate: {
            info: 'IA analysera {total} participants et générera ~{count} matchs',
            time: 'Temps traitement: ~30 sec',
            button: 'Générer Matchs IA'
          },
          insights: {
            title: 'Insights Jumelage',
            subtitle: 'Analyse temps réel',
            potential: 'Potentiel Réseautage Élevé',
            potentialDesc: '{percent}% participants ont potentiel',
            industries: 'Top Industries',
            goals: 'Objectifs Réseautage',
            lastRun: 'Dernier Run IA',
            noRun: 'Jamais',
            generated: 'Généré {count} matchs',
            accepted: '{percent}% acceptés',
            viewResults: 'Voir Résultats'
          }
        },
        allMeetings: {
          filters: {
            all: 'Tout',
            today: 'Aujourd\'hui',
            ai: 'Généré par IA',
            manual: 'Manuel',
            pending: 'En Attente',
            completed: 'Terminé',
            search: 'Rechercher...', 
            allDates: 'Toutes Dates',
            thisWeek: 'Cette Semaine',
            recent: 'Recents',
            score: 'Score: Decroissant',
            upcoming: 'Date: Prochainement'
          },
          table: {
            headers: {
              id: 'ID Reunion',
              participants: 'Participants',
              score: 'Score Match',
              dateTime: 'Date & Heure',
              status: 'Statut',
              actions: 'Actions'
            },
            manual: 'Manuel',
            view: 'Voir',
            empty: 'Aucune reunion trouvee.'
          }
        },
        analytics: {
          title: 'Analyses Reseautage',
          summary: '{total} reunions · {avg}% score moyen · {rate}% taux succes',
          topIndustry: 'Top industrie: {industry} · Top objectif: {goal}'
        },
        suggestions: {
          title: 'Suggestions Match IA',
          subtitle: '{count} matchs en attente de revue',
          card: {
            match: 'MATCH IA',
            why: 'Pourquoi ce match ?',
            noCriteria: 'Aucun critere de match',
            createMeeting: 'Creer Reunion',
            dismiss: 'Ignorer',
            sent: 'Envoye le {date}',
            sentRecently: 'Envoye recemment'
          },
          empty: 'Aucune suggestion pour le moment. Generez des matchs pour voir les resultats.'
        },
        modals: {
          processing: {
            analyzing: {
              title: 'L\'IA analyse les participants',
              subtitle: 'Analyse de {count} profils...'
            },
            generating: {
              title: 'Generation des matchs optimaux',
              subtitle: 'Creation de connexions intelligentes...'
            },
            complete: {
              title: 'Matchs generes avec succes !',
              subtitle: 'L\'IA a cree des correspondances de haute qualite',
              stats: {
                created: 'Matchs Crees',
                avgScore: 'Score Moyen',
                matched: 'Participants Jumeles'
              },
              actions: {
                viewAll: 'Voir tous les matchs',
                sendNotif: 'Envoyer Notifications'
              }
            },
            progress: {
              analyzing: 'Analyse des alignements industries...',
              generating: 'Construction des recommandations...',
              remaining: 'Temps estime: {count} secondes restantes'
            }
          },
          details: {
            title: 'Analyse de Match IA',
            score: '{percent}% Score de Match',
            breakdown: 'Detail du Score',
            noDetails: 'Details indisponibles. Generez des matchs pour voir les analyses.',
            overall: '{percent}% Match Global',
            insights: 'Insights IA',
            noInsights: 'Aucun insight IA disponible.',
            topics: 'Sujets de discussion suggeres',
            noTopics: 'Aucun sujet suggere.',
            actions: {
              schedule: 'Planifier Reunion',
              sendBoth: 'Envoyer aux deux participants'
            }
          },
          create: {
            title: 'Planifier Reunion Jumellee',
            matchInfo: 'MATCH IA · {percent}% Score',
            perfectMatch: 'Match parfait pour: {tags}',
            fields: {
              dateTime: 'Date & Heure',
              duration: 'Duree',
              location: 'Lieu'
            },
            placeholders: {
              location: 'Salle B-12 ou lien Zoom'
            },
            durations: {
              m30: '30 minutes',
              m45: '45 minutes',
              m60: '60 minutes'
            },
            actions: {
              cancel: 'Annuler',
              create: 'Creer & Notifier'
            }
          }
        },
        toasts: {
          addTwo: 'Ajoutez au moins 2 participants',
          noMatches: 'Aucun match trouvé',
          matchesSuccess: '{count} matchs IA générés !',
          matchesComplete: 'Jumelage IA terminé',
          noSuggestionsExport: 'Rien à exporter',
          suggestionsExported: 'Suggestions exportées',
          suggestionsDismissed: 'Suggestion ignorée',
          noMeetingsExport: 'Rien à exporter',
          meetingsExported: 'Réunions exportées',
          settingsSaved: 'Paramètres enregistrés',
          noPendingRemind: 'Aucun rappel en attente',
          remindersSent: 'Rappels envoyés',
          selectMatchFirst: 'Sélectionnez un match',
          matchNotifSent: 'Notif match envoyée',
          notifSent: 'Notifications envoyées',
          selectSuggestion: 'Sélectionnez une suggestion',
          meetingCreated: 'Réunion créée',
          meetingUpdated: 'Réunion mise à jour',
          invitationsSent: 'Réunion créée et invitations envoyées !',
          notificationsSent: 'Réunion mise à jour et notifications envoyées !'
        }
      },
      marketing: {
        header: {
          title: 'Outils marketing',
          subtitle: 'Promouvez votre événement et boostez la vente de billets'
        },
        tabs: {
          email: 'Campagnes e-mail',
          promo: 'Codes promo'
        },
        email: {
          customDomain: {
            title: 'Domaine personnalisé',
            subtitle: 'Utilisez votre propre domaine pour l’inscription et les emails',
            url: 'URL d’inscription personnalisée',
            urlDesc: 'events.votredomaine.com au lieu de eventra.com/votre-evenement',
            domain: 'Domaine email de marque',
            domainDesc: 'Envoyez des emails depuis @votredomaine.com pour une meilleure délivrabilité',
            ssl: 'Certificat SSL inclus',
            sslDesc: 'HTTPS automatique pour votre domaine',
            branding: 'Image professionnelle',
            brandingDesc: 'Gagnez la confiance des participants avec votre domaine',
            upgrade: 'Passer à Pro',
            learnMore: 'En savoir plus sur les domaines personnalisés'
          },
          stats: {
            totalSent: 'Total d’emails envoyés',
            openRate: 'Taux d’ouverture moyen',
            clickRate: 'Taux de clic moyen',
            basedOn: 'Basé sur les campagnes envoyées',
            noSent: 'Aucune campagne envoyée pour le moment',
            across: 'Sur {count} campagnes'
          },
          table: {
            title: 'Campagnes e-mail',
            create: 'Créer une nouvelle campagne',
            headers: {
              name: 'NOM DE CAMPAGNE',
              status: 'STATUT',
              audience: 'AUDIENCE',
              open: 'TAUX D’OUVERTURE',
              click: 'TAUX DE CLIC',
              sent: 'ENVOYÉE LE',
              actions: 'ACTIONS'
            },
            status: {
              sent: 'Envoyée',
              draft: 'Brouillon',
              scheduled: 'Planifiée'
            },
            actions: {
              edit: 'Modifier',
              view: 'Voir le rapport',
              duplicate: 'Dupliquer',
              delete: 'Supprimer'
            },
            empty: 'Aucune campagne pour le moment. Créez votre première campagne e-mail.'
          }
        },
        promo: {
          stats: {
            activeCodes: 'Codes actifs',
            totalCodes: 'Sur {count} codes au total',
            totalUses: 'Total des utilisations',
            redemptions: 'Utilisations des promos',
            revenue: 'Revenus via promotions',
            revenueDesc: 'Revenus estimés générés',
            revenueNoPrice: 'Ajoutez le prix des billets pour estimer le revenu'
          },
          table: {
            title: 'Codes promotionnels',
            create: 'Créer un nouveau code',
            headers: {
              code: 'CODE',
              discount: 'RÉDUCTION',
              usage: 'UTILISATION',
              status: 'STATUT',
              applies: 'S’APPLIQUE À',
              actions: 'ACTIONS'
            },
            status: {
              active: 'Actif',
              expired: 'Expiré',
              inactive: 'Inactif'
            },
            usage: {
              used: '{count} / {total} utilisés',
              unlimited: 'Illimité',
              onePerCustomer: '1 par client'
            },
            applies: {
              all: 'Tous les types de billets',
              specific: '{count} type(s) de billets'
            },
            actions: {
              edit: 'Modifier',
              deactivate: 'Désactiver',
              delete: 'Supprimer'
            },
            empty: 'Aucun code promo pour le moment. Créez votre premier code.'
          }
        },
        modals: {
          promo: {
            titleAdd: 'Créer un nouveau code promo',
            titleEdit: 'Modifier : {code}',
            fields: {
              code: 'Code promo *',
              codePlaceholder: 'ex. SAVE20, EARLYBIRD',
              type: 'Type de réduction *',
              typePercent: 'Pourcentage',
              typeFixed: 'Montant fixe',
              value: 'Valeur de la réduction *',
              applies: 'S’applique à *',
              appliesAll: 'Tous les types de billets',
              appliesSpecific: 'Types de billets spécifiques',
              noTickets: 'Aucun type de billet trouvé. Créez d’abord des billets.',
              usage: 'Limites d’utilisation',
              limitTotal: 'Limiter le nombre total d’utilisations',
              limitTotalDesc: 'Définissez un maximum d’utilisations',
              limitCustomer: 'Limiter à une utilisation par client',
              limitCustomerDesc: 'Chaque client ne peut utiliser ce code qu’une seule fois',
              dates: 'Dates d’activation',
              start: 'Date de début *',
              end: 'Date de fin (optionnel)'
            },
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer le code'
            }
          },
          campaign: {
            titleAdd: 'Créer une nouvelle campagne e-mail',
            titleEdit: 'Modifier : {name}',
            fields: {
              name: 'Nom de campagne *',
              namePlaceholder: 'ex. Rappel Early Bird',
              status: 'Statut',
              audience: 'Audience',
              date: 'Envoyée/Planifiée le',
              total: 'Total envoyés',
              open: 'Taux d’ouverture (%)',
              click: 'Taux de clic (%)'
            },
            actions: {
              cancel: 'Annuler',
              save: 'Enregistrer la campagne'
            }
          },
          upgrade: {
            title: 'Passer à Eventra Pro',
            subtitle: 'Débloquez les fonctionnalités de domaine personnalisé incluant les URL d’inscription, les domaines email et les certificats SSL pour inspirer confiance à vos participants.',
            cancel: 'Annuler',
            upgrade: 'Mettre à niveau'
          }
        }
      },
      notifications: {
        header: {
          title: 'Centre de Notifications',
          subtitle: 'Configurez les emails automatiques, les alertes dans l\'application et les messages de diffusion pour vos participants.'
        },
        tabs: {
          settings: 'Paramètres',
          broadcast: 'Diffusion',
          log: 'Journal'
        },
        triggers: {
          meetingBooked: {
            label: 'Réunion Réservée',
            description: 'Envoyé lorsqu\'une réunion B2B est planifiée entre participants.'
          },
          eventRegistration: {
            label: 'Inscription à l\'événement',
            description: 'Confirmation envoyée après une inscription réussie avec code QR.'
          },
          formSubmitted: {
            label: 'Formulaire Soumis',
            description: 'Accusé de réception envoyé quand un participant remplit un formulaire personnalisé.'
          },
          sessionReminder: {
            label: 'Rappel de Session',
            description: 'Rappel envoyé avant le début d\'une session.'
          }
        },
        settings: {
          custom: 'Personnalisé',
          email: 'Email',
          bell: 'Cloche',
          editEmail: 'Modifier Email',
          variablesHint: 'Utilisez les espaces réservés {{variable}} — ils sont remplacés automatiquement lors de l\'envoi.',
          edit: 'Modifier',
          preview: 'Aperçu',
          resetDefault: 'Réinitialiser par défaut',
          save: 'Enregistrer le modèle',
          subjectLine: 'Ligne d\'objet',
          subjectPlaceholder: 'Entrez l\'objet de l\'email...',
          emailBody: 'Corps de l\'email',
          bodyPlaceholder: 'Écrivez le corps de votre email ici...',
          availableVars: 'Variables disponibles :',
          clickAppend: 'Cliquez pour ajouter au corps',
          livePreview: 'Aperçu en direct'
        },
        broadcast: {
          title: 'Envoyer un Message de Diffusion',
          subject: 'Objet',
          subjectPlaceholder: 'Entrez l\'objet de la diffusion...',
          message: 'Message',
          messagePlaceholder: 'Écrivez votre message à tous les participants...',
          sendVia: 'Envoyer via',
          email: 'Email',
          bellNotification: 'Notification Cloche',
          target: 'Sera envoyé à {count} participants',
          sending: 'Envoi {sent}/{total}...',
          sendBroadcast: 'Envoyer la Diffusion'
        },
        log: {
          allTriggers: 'Tous les déclencheurs',
          broadcastLabel: 'Diffusion',
          allChannels: 'Tous les canaux',
          email: 'Email',
          bell: 'Cloche',
          refresh: 'Actualiser',
          noLogs: 'Aucune notification envoyée pour le moment.',
          headers: {
            dateTime: 'Date et Heure',
            trigger: 'Déclencheur',
            channel: 'Canal',
            recipientId: 'ID Destinataire',
            status: 'Statut'
          }
        },
        toasts: {
          updateFailed: 'Échec de la mise à jour du paramètre de notification',
          templateSaveFailed: 'Échec de l\'enregistrement du modèle d\'email',
          templateSaved: 'Modèle d\'email enregistré',
          resetFailed: 'Échec de la réinitialisation du modèle d\'email',
          resetSuccess: 'Modèle d\'email réinitialisé par défaut',
          fillFields: 'Veuillez remplir l\'objet et le message',
          selectChannel: 'Sélectionnez au moins un canal',
          noAttendees: 'Aucun participant à qui envoyer',
          broadcastSent: 'Diffusion envoyée à {count} participants'
        }
      },
      b2b: {
        header: {
          title: 'Hub de Jumelage B2B',
          subtitle: 'Réseautage propulsé par l\'IA — connectez les bonnes personnes au bon moment',
          aiMatchmaker: 'IA Jumeleur',
          createMeeting: 'Créer une réunion'
        },
        tabs: {
          aiMatchmaker: 'IA Jumeleur',
          allMeetings: 'Toutes les réunions',
          logistics: 'Logistique',
          analytics: 'Analytiques',
          suggestions: 'Suggestions'
        },
        stats: {
          activeConnections: 'Connexions actives',
          totalMeetings: 'Total des réunions',
          newThisWeek: '+{count} cette semaine',
          aiMatchSuccess: 'Succès IA',
          ofAiAccepted: 'des jumelages IA acceptés',
          pendingSuggestions: 'Suggestions en attente',
          awaitingResponse: 'En attente de réponse',
          sendReminders: 'Envoyer des rappels',
          completed: 'Terminées',
          completionRate: 'Taux de complétion de {percent}%',
          networkingScore: 'Score de réseautage',
          overallEngagement: 'Engagement global'
        },
        toasts: {
          suggestionsDismissed: 'Suggestion rejetée',
          notificationsSent: 'Notifications envoyées',
          invitationsSent: 'Invitations envoyées',
          meetingUpdated: 'Réunion mise à jour',
          meetingCreated: 'Réunion créée',
          meetingCreateError: 'Erreur lors de la création',
          matchesSuccess: '{count} jumelages créés',
          matchesComplete: 'Jumelage terminé',
          noSuggestionsExport: 'Aucune suggestion à exporter',
          suggestionsExported: 'Suggestions exportées',
          noMeetingsExport: 'Aucune réunion à exporter',
          meetingsExported: 'Réunions exportées',
          settingsSaved: 'Paramètres sauvegardés',
          noPendingRemind: 'Aucune réunion en attente à rappeler',
          remindersSent: 'Rappels envoyés',
          selectMatchFirst: 'Sélectionnez un jumelage d\'abord',
          matchNotifSent: 'Notification de jumelage envoyée',
          selectSuggestion: 'Sélectionnez une suggestion d\'abord',
          notifSent: 'Notification envoyée',
          addTwo: 'Ajoutez au moins deux participants pour utiliser le jumelage'
        },
        aiMatchmaker: {
          title: 'IA Jumeleur',
          subtitle: 'Notre IA analyse les profils et suggère les connexions les plus pertinentes',
          whoToMatch: 'Qui jumeler ?',
          options: {
            all: { label: 'Tous les participants', desc: 'Jumeler tous les inscrits', count: '{count} participants disponibles' },
            category: { label: 'Par catégorie', desc: 'Jumeler par catégorie', count: '{count} catégories' },
            individuals: { label: 'Individus spécifiques', desc: 'Sélectionner des personnes', count: '{count} inscrits' },
            noAttendees: 'Aucun participant',
            noCategories: 'Aucune catégorie',
            noOptIn: 'Aucun inscrit',
            recommended: 'Recommandé'
          },
          criteria: {
            title: 'Critères de jumelage',
            industry: 'Industrie',
            industryDesc: 'Prioriser les industries similaires ou complémentaires',
            role: 'Compatibilité des rôles',
            roleDesc: 'Jumeler les décideurs avec les bons interlocuteurs',
            stage: 'Stade de l\'entreprise',
            stageDesc: 'Jumeler startups avec investisseurs, etc.',
            interests: 'Intérêts communs',
            interestsDesc: 'Trouver des intérêts professionnels communs',
            goals: 'Objectifs de réseautage',
            goalsDesc: 'Aligner selon les objectifs déclarés'
          },
          threshold: {
            title: 'Score minimum de compatibilité',
            subtitle: 'Suggérer uniquement les jumelages au-dessus de {percent}%',
            recommended: 'Recommandé : 60-80%'
          },
          generate: {
            info: '{total} participants seront analysés, environ {count} jumelages attendus',
            time: 'Le traitement prend généralement 15-30 secondes',
            button: 'Générer les jumelages IA'
          }
        },
        allMeetings: {
          filters: {
            all: 'Toutes',
            today: 'Aujourd\'hui',
            ai: 'IA',
            manual: 'Manuelles',
            pending: 'En attente',
            completed: 'Terminées',
            search: 'Rechercher par nom, entreprise...',
            allDates: 'Toutes les dates',
            thisWeek: 'Cette semaine',
            recent: 'Plus récentes',
            score: 'Score de jumelage',
            upcoming: 'À venir'
          },
          table: {
            headers: { id: 'ID', participants: 'Participants', score: 'Score', dateTime: 'Date et heure', status: 'Statut', actions: 'Actions' },
            manual: 'Créée manuellement',
            empty: 'Aucune réunion ne correspond à vos filtres'
          }
        },
        logistics: {
          venueCapacity: {
            title: 'Capacité du lieu',
            subtitle: 'Configurez l\'agencement et la disposition des tables',
            tableCount: 'Nombre de tables',
            tablePrefix: 'Préfixe des tables',
            tablePrefixPlaceholder: 'ex. Table, Bureau, Stand',
            slotDuration: 'Durée des créneaux'
          },
          capacityCalc: {
            title: 'Aperçu de la capacité',
            tableSetup: 'Disposition des tables',
            slotDuration: 'Durée des créneaux',
            totalTimeSlots: 'Créneaux totaux',
            maxMeetings: 'Réunions max.'
          },
          schedule: {
            title: 'Planning des réunions',
            subtitle: 'Définissez les dates et créneaux disponibles pour les réunions B2B',
            addDate: 'Ajouter un créneau',
            to: 'à',
            duplicateBlock: 'Dupliquer ce créneau',
            noDates: 'Aucun créneau configuré',
            noDatesHint: 'Ajoutez des créneaux pour définir les horaires de réunion',
            saving: 'Enregistrement...',
            saveConfig: 'Sauvegarder la configuration'
          }
        },
        analytics: {
          title: 'Tableau de bord analytique',
          summary: '{total} réunions avec un score moyen de {avg}% et un taux de succès de {rate}%',
          topIndustry: 'Industrie principale : {industry} — Objectif principal : {goal}'
        },
        suggestions: {
          title: 'Suggestions IA',
          subtitle: '{count} suggestions en attente de validation',
          empty: 'Aucune suggestion. Lancez le jumeleur IA pour générer des correspondances.'
        },
        modals: {
          processing: {
            analyzing: { title: 'Analyse des profils', subtitle: 'Scan de {count} profils...' },
            generating: { title: 'Génération des jumelages', subtitle: 'Recherche des meilleures connexions...' },
            complete: {
              title: 'Jumelage terminé !',
              subtitle: 'Voici les résultats',
              stats: { created: 'Jumelages créés', avgScore: 'Score moyen', matched: 'Participants jumelés' },
              actions: { viewAll: 'Voir tous les jumelages', sendNotif: 'Envoyer les notifications' }
            },
            progress: { analyzing: 'Analyse des profils...', generating: 'Génération des jumelages...', remaining: 'Environ {count} secondes restantes' }
          },
          details: {
            title: 'Détails du jumelage',
            score: 'Score de {percent}%',
            breakdown: 'Détail du score',
            noDetails: 'Aucun détail disponible',
            overall: 'Global : {percent}%',
            insights: 'Points clés',
            noInsights: 'Aucun point clé',
            topics: 'Sujets de discussion suggérés',
            noTopics: 'Aucun sujet suggéré',
            actions: { schedule: 'Planifier une réunion', sendBoth: 'Notifier les deux parties' }
          },
          create: {
            title: 'Planifier une réunion',
            matchInfo: 'Compatibilité de {percent}%',
            perfectMatch: 'Connexion de personnes partageant des intérêts en {tags}',
            fields: { dateTime: 'Date et heure', duration: 'Durée', location: 'Lieu / Table' },
            durations: { m30: '30 minutes', m45: '45 minutes', m60: '60 minutes' },
            placeholders: { location: 'ex. Table A3, Salle de réunion 2' },
            actions: { cancel: 'Annuler', create: 'Créer la réunion' }
          }
        }
      }
    },
    wizard: {
      common: {
        back: 'Retour',
        saveContinue: 'Enregistrer et continuer',
        saveDraft: 'Enregistrer le brouillon',
        cancel: 'Annuler',
        untitledEvent: 'Evenement sans titre',
        statusDraft: 'BROUILLON',
        eventLabel: 'Evenement',
        yourEvent: 'votre evenement'
      },
      stepLabels: {
        step1: 'Etape 1 sur 4',
        step3: 'Etape {current} sur {total}',
        step4: 'Etape 4 sur 4'
      },
      step1: {
        title: "Informations sur l'evenement",
        subtitle: "Indiquez les details de base de votre evenement : nom, date, lieu et description."
      },
      step3: {
        subSteps: {
          tickets: 'Billets',
          speakers: 'Intervenants',
          attendees: 'Participants',
          exhibitors: 'Exposants',
          schedule: 'Programme',
          sponsors: 'Sponsors',
          qrBadges: 'Badges QR',
          customForms: 'Formulaires personnalises',
          marketingTools: 'Outils marketing'
        },
        descriptions: {
          tickets: 'Configurez les types de billets, tarifs et disponibilites.',
          speakers: 'Ajoutez des intervenants, gerez les profils et les sessions.',
          attendees: "Configurez la capacite, les inscriptions et les formulaires.",
          exhibitors: 'Gerez les exposants, stands et niveaux de sponsoring.',
          schedule: "Construisez l'agenda et le planning des sessions.",
          sponsors: 'Mettez en avant les sponsors et leurs formules.',
          qrBadges: 'Generez des badges QR pour un check-in rapide.',
          customForms: 'Collectez des informations avec des formulaires flexibles.',
          marketingTools: "Faites la promotion avec les outils marketing integres."
        },
        errors: {
          saveFirst: "Enregistrez les details de l'evenement avant de continuer.",
          continueFirst: "Veuillez continuer depuis l'etape precedente."
        },
        loading: 'Chargement de la configuration des inscriptions...',
        missingStep1: "Completez les details de l'evenement avant de continuer.",
        continueReview: 'Continuer vers la revue',
        ticketsTab: {
          title: 'Types de billets',
          subtitle: 'Creez et gerez les options de billets pour votre evenement',
          addTicket: 'Ajouter un billet',
          loading: 'Chargement des billets...',
          confirmDelete: 'Voulez-vous vraiment supprimer ce billet ?',
          toasts: {
            statusUpdated: 'Statut du billet mis a jour',
            updated: 'Billet mis a jour avec succes',
            created: 'Billet cree avec succes',
            deleted: 'Billet supprime'
          },
          pro: {
            title: 'Fonctionnalite PRO',
            subtitle: 'Passez a Pro pour creer des billets VIP',
            cta: 'Passer a Pro'
          },
          status: {
            active: 'Actif',
            expired: 'Expire',
            enabled: 'Active',
            disabled: 'Desactive'
          },
          card: {
            price: 'Prix',
            perAttendee: 'par participant',
            totalAvailable: 'Total disponible',
            unlimited: 'Illimite',
            tickets: 'billets',
            saleEnds: 'Fin des ventes : {date}',
            noEndDate: 'N/A',
            includes: 'Inclut : {count} elements',
            edit: 'Modifier le billet',
            archive: 'Archiver'
          },
          empty: {
            title: 'Ajouter un billet gratuit',
            subtitle: 'Ideal pour le reseautage ou les meetups',
            cta: 'Ajouter un billet gratuit'
          },
          settings: {
            title: 'Parametres des billets',
            globalLimit: {
              title: 'Limite globale de billets',
              subtitle: "Limiter le total de billets qu'une personne peut acheter",
              toggle: 'Activer la limite globale',
              maxPerPerson: 'Billets maximum par personne',
              placeholder: 'ex. 10',
              exampleLabel: 'Exemple :',
              exampleBody: "Si fixe a {count}, une personne peut acheter jusqu'a {count} billets au total."
            }
          },
          bulk: {
            selected: '{count} selectionne(s)',
            deselectAll: 'Tout deselectionner',
            enableAll: 'Tout activer',
            disableAll: 'Tout desactiver',
            duplicate: 'Dupliquer',
            delete: 'Supprimer'
          }
        },
        ticketsModal: {
          title: 'Creer un type de billet',
          subtitle: 'Configurer les tarifs et disponibilites',
          eventType: {
            paidTitle: 'Billet evenement payant',
            freeTitle: 'Billet evenement gratuit',
            paidBody: "Cet evenement est configure comme payant a l'etape 1. Tous les billets necessitent un paiement.",
            freeBody: "Cet evenement est configure comme gratuit a l'etape 1. Tous les billets sont gratuits."
          },
          fields: {
            name: {
              label: 'Nom du billet *',
              placeholder: 'ex. Acces general, Pass VIP, Early Bird'
            },
            description: {
              label: 'Description du billet *',
              placeholder: 'Decrivez ce qui est inclus...'
            },
            vip: {
              label: 'Billet VIP',
              helper: "Les billets VIP ont des quotas. Les billets standards n'ont pas de limite.",
              lockedHelper: 'Billets VIP avec avantages exclusifs (fonction Pro)'
            },
            currency: {
              label: 'Devise *'
            },
            price: {
              label: 'Prix *',
              placeholder: '0.00'
            },
            vipQuantity: {
              label: 'Quantite de billets VIP *',
              placeholder: 'ex. 50',
              helper: 'Limiter le nombre de billets VIP disponibles',
              warningTitle: 'Avertissement : billets VIP ({quantity}) depassent la capacite ({capacity})',
              warningBody: 'Ajustez les quantites ou augmentez la capacite'
            },
            salesPeriod: {
              label: 'Periode de vente *',
              start: 'Debut date et heure',
              end: 'Fin date et heure'
            },
            earlyBird: {
              label: 'Reduction Early Bird',
              discountLabel: 'Pourcentage de reduction *',
              discountPlaceholder: 'ex. 20',
              start: 'Debut Early Bird',
              end: 'Fin Early Bird',
              helper: 'Le prix Early Bird se declenche automatiquement pendant la periode'
            },
            includes: {
              label: 'Ce qui est inclus (optionnel)',
              placeholder: 'Ajouter des elements inclus...'
            }
          },
          proWarning: {
            title: 'Mise a niveau vers Pro requise',
            message: 'Les comptes gratuits ne peuvent creer que des billets gratuits. Passez a Pro pour vendre des billets payants et acceder aux fonctions VIP.'
          },
          actions: {
            saveDraft: 'Enregistrer en brouillon',
            addTicket: 'Ajouter le billet'
          }
        },
        speakers: {
          title: 'Intervenants et presentateurs',
          subtitle: "Gerez les intervenants et leurs profils",
          add: 'Ajouter un intervenant',
          loading: 'Chargement des intervenants...',
          confirmDelete: 'Voulez-vous vraiment supprimer cet intervenant ?',
          toasts: {
            updated: 'Intervenant mis a jour avec succes',
            created: 'Intervenant ajoute avec succes',
            deleted: 'Intervenant supprime',
            imported: 'Intervenants importes avec succes'
          },
          filters: {
            all: 'Tous les intervenants',
            trainer: 'Formateur',
            coach: 'Coach',
            expert: 'Expert'
          },
          searchPlaceholder: 'Rechercher des intervenants...',
          sortBy: 'Trier par : Nom',
          badges: {
            trainer: 'FORMATEUR',
            coach: 'COACH',
            expert: 'EXPERT'
          },
          status: {
            confirmed: 'Confirme',
            pending: 'En attente',
            declined: 'Refuse'
          },
          empty: {
            title: 'Ajouter un intervenant',
            subtitle: 'Construisez votre liste',
            cta: '+ Ajouter un intervenant'
          },
          modal: {
            titleCreate: 'Ajouter un intervenant',
            titleEdit: "Modifier l'intervenant",
            subtitle: 'Ajoutez les informations et assignez aux sessions',
            sections: {
              basic: 'Informations de base',
              professional: 'Informations professionnelles',
              details: "Details de l'intervenant",
              type: "Type d'intervenant *"
            },
            fields: {
              photo: {
                label: 'Photo de profil',
                uploading: 'Televersement...',
                cta: 'Televerser une photo',
                helper: '400x400px, max 2MB'
              },
              name: {
                label: 'Nom complet *',
                placeholder: 'ex. John Smith'
              },
              email: {
                label: 'Adresse email *',
                placeholder: 'speaker@email.com',
                helper: 'Utilise pour la communication, non public'
              },
              phone: {
                label: 'Telephone (optionnel)',
                placeholder: '+1 (555) 123-4567'
              },
              title: {
                label: 'Poste *',
                placeholder: 'ex. CEO, CTO, Senior Product Manager'
              },
              company: {
                label: 'Entreprise/Organisation *',
                placeholder: 'ex. Tech Innovations Inc.'
              },
              linkedin: {
                label: 'Profil LinkedIn (optionnel)',
                placeholder: 'https://linkedin.com/in/...'
              },
              twitter: {
                label: 'Twitter/X (optionnel)',
                placeholder: '@username'
              },
              website: {
                label: 'Site web (optionnel)',
                placeholder: 'https://...'
              },
              bio: {
                label: 'Biographie *',
                placeholder: "Decrivez l'experience et l'expertise de l'intervenant...",
                helper: "Affiche sur la page profil de l'intervenant"
              },
              shortBio: {
                label: 'Bio courte (optionnel)',
                placeholder: 'Phrase courte pour les cartes...'
              },
              tags: {
                label: 'Sujets/Tags *',
                placeholder: 'Ajoutez un sujet et validez',
                helper: 'Ajoutez 2 a 5 sujets'
              }
            },
            types: {
              trainer: {
                label: 'Formateur',
                desc: 'Anime des sessions de formation et de perfectionnement'
              },
              coach: {
                label: 'Coach',
                desc: 'Propose des sessions de coaching et de mentorat'
              },
              expert: {
                label: 'Expert',
                desc: 'Expert partageant des connaissances approfondies'
              },
              lecture: {
                label: 'Conferencier',
                desc: 'Donne des conferences academiques ou educatives'
              }
            },
            actions: {
              saveDraft: 'Enregistrer en brouillon',
              saved: 'Enregistre',
              save: "Enregistrer l'intervenant"
            }
          },
          profileModal: {
            about: 'A propos',
            expertise: 'Expertise',
            speakingAt: 'Intervient a',
            contact: 'Contact',
            sampleSessions: {
              keynote: {
                title: "Keynote d'ouverture : le futur de l'IA",
                date: '15 dec 2024 a 9:00',
                location: 'Salle principale A',
                duration: '45 minutes',
                attendees: '500+ inscrits'
              },
              panel: {
                title: 'Panel : innovation en SaaS',
                date: '15 dec 2024 a 14:00',
                location: 'Salle de conference B',
                duration: '60 minutes',
                attendees: '200+ inscrits'
              }
            },
            actions: {
              email: 'Email',
              linkedin: 'LinkedIn',
              website: 'Site web',
              close: 'Fermer'
            }
          },
          importModal: {
            title: 'Importer des intervenants',
            subtitle: 'Televersez un fichier CSV avec les informations des intervenants',
            dropzone: {
              title: 'Deposez le fichier CSV ici ou cliquez pour parcourir',
              helper: 'Formats pris en charge : .csv, .xlsx'
            },
            template: {
              title: "Besoin d'un modele ?",
              subtitle: 'Utilisez notre modele pour assurer le bon format',
              cta: 'Telecharger le modele CSV'
            },
            fields: {
              requiredLabel: 'Champs obligatoires :',
              required: 'Nom, Email, Poste, Entreprise, Bio',
              optionalLabel: 'Champs optionnels :',
              optional: 'Telephone, LinkedIn, Twitter, Site web, Tags, Type, Statut'
            },
            actions: {
              import: 'Importer les intervenants'
            }
          }
        },
        attendees: {
          title: 'Configuration des participants',
          subtitle: 'Configurez les groupes, permissions et parametres',
          infoTitle: 'Configurer l organisation des participants',
          loading: 'Chargement des parametres...',
          toasts: {
            categoryDeleted: 'Categorie supprimee',
            categoryDeleteFailed: 'Echec de la suppression',
            categoryNameRequired: 'Le nom de categorie est obligatoire',
            categoryUpdated: 'Categorie mise a jour',
            categoryCreated: 'Categorie creee',
            categorySaveFailed: "Echec de l'enregistrement de la categorie"
          },
          permissions: {
            title: 'Permissions des participants',
            subtitle: 'Controlez ce que les participants peuvent faire',
            selfCheckin: {
              title: 'Autoriser le self check-in',
              subtitle: "Laisser les participants se declarer presents",
              note: "Necessite l'app ou des bornes"
            },
            profileEditing: {
              title: 'Autoriser la modification du profil',
              subtitle: 'Les participants peuvent mettre a jour leurs infos',
              options: {
                contact: 'Peut modifier les coordonnees',
                dietary: 'Peut modifier les preferences alimentaires',
                requirements: 'Peut modifier les besoins speciaux',
                company: 'Peut modifier entreprise/poste'
              }
            },
            sessionRegistration: {
              title: 'Inscription aux sessions requise',
              subtitle: 'Obliger les participants a s inscrire aux sessions'
            },
            b2b: {
              title: 'Acces reseautage B2B',
              subtitle: 'Autoriser le matchmaking B2B',
              options: {
                all: 'Tous les participants',
                categories: 'Categories specifiques',
                approval: 'Validation requise'
              }
            },
            download: {
              title: 'Acces aux telechargements',
              subtitle: 'Autoriser le telechargement de ressources'
            },
            publicDirectory: {
              title: 'Annuaire public des participants',
              subtitle: 'Afficher la liste publiquement',
              upgrade: 'Passer a Pro'
            }
          },
          communication: {
            title: 'Parametres de communication',
            subtitle: 'Configurez vos communications',
            automatedEmails: {
              title: 'Emails automatiques',
              subtitle: 'Envoyer des emails automatiques',
              triggers: {
                registration: {
                  label: "Confirmation d'inscription",
                  sub: "Envoye immediatement apres l'inscription"
                },
                reminder: {
                  label: 'Rappel evenement',
                  sub: "Envoye 24h avant l'evenement"
                },
                checkin: {
                  label: 'Confirmation de check-in',
                  sub: 'Envoye lors du check-in'
                },
                thankYou: {
                  label: 'Merci apres evenement',
                  sub: "Envoye 2h apres la fin"
                }
              },
              editTemplate: 'Modifier le modele'
            },
            sms: {
              title: 'Notifications SMS',
              subtitle: 'Envoyer des SMS pour les infos critiques',
              upgrade: 'Passer a Pro pour activer les SMS'
            },
            inApp: {
              title: 'Notifications in-app',
              subtitle: "Notifications via l'app mobile",
              options: {
                sessionStart: 'Rappels de debut de session',
                scheduleChanges: 'Changements de programme',
                b2bReminders: 'Rappels B2B',
                networking: 'Opportunites de reseautage'
              }
            }
          },
          privacy: {
            title: 'Parametres de donnees et confidentialite',
            subtitle: 'Gerez la collecte et la confidentialite',
            additionalData: {
              title: 'Collecter des donnees supplementaires',
              note: "Ces champs sont collectes lors du profil",
              fields: {
                companyName: "Nom de l'entreprise",
                jobTitle: 'Poste',
                industry: 'Secteur',
                companySize: "Taille de l'entreprise",
                businessGoals: 'Objectifs business',
                linkedin: 'URL LinkedIn',
                linkedinSub: 'Pour le reseautage'
              }
            },
            retention: {
              title: 'Politique de conservation',
              subtitle: 'Duree de conservation des donnees',
              options: {
                days30: "30 jours apres l'evenement",
                days90: "90 jours apres l'evenement",
                months6: "6 mois apres l'evenement",
                year1: "1 an apres l'evenement",
                year2: "2 ans apres l'evenement",
                forever: 'Toujours'
              }
            },
            gdpr: {
              title: 'Mode conformite GDPR',
              subtitle: 'Activer les controles pour les participants UE',
              options: {
                consent: 'Consentement explicite requis',
                deletion: 'Autoriser la demande de suppression',
                privacy: 'Afficher la politique de confidentialite'
              }
            },
            export: {
              title: 'Autoriser lexport des donnees',
              subtitle: 'Permettre le telechargement des informations'
            }
          },
          categoryModal: {
            editTitle: 'Modifier la categorie',
            createTitle: 'Creer une categorie',
            subtitle: 'Regrouper les participants',
            fields: {
              name: 'Nom de la categorie*',
              namePlaceholder: 'ex. Media, Volontaires, Sponsors',
              description: 'Description (optionnel)',
              descriptionPlaceholder: 'Decrivez cette categorie...',
              color: 'Couleur de la categorie',
              assignment: 'Assigner selon'
            },
            assignmentOptions: {
              manual: 'Attribution manuelle',
              ticket: 'Type de billet',
              date: "Plage de dates d'inscription",
              field: 'Valeur de champ personnalise'
            },
            delete: 'Supprimer la categorie',
            cancel: 'Annuler',
            save: 'Enregistrer',
            create: 'Creer la categorie'
          }
        },
        exhibitors: {
          title: 'Exposants',
          subtitle: 'Gerez les entreprises exposantes',
          add: 'Ajouter un exposant',
          loading: 'Chargement des exposants...',
          searchPlaceholder: 'Rechercher des exposants...',
          sortBy: 'Trier par : Nom de societe',
          export: 'Exporter la liste',
          confirmDelete: 'Voulez-vous vraiment supprimer cet exposant ?',
          toasts: {
            updated: 'Exposant mis a jour avec succes',
            created: 'Exposant ajoute avec succes',
            saveFailed: "Echec de l'enregistrement de l'exposant",
            deleted: 'Exposant supprime',
            deleteFailed: "Echec de la suppression de l'exposant",
            formSent: 'Formulaire envoye a l exposant'
          },
          status: {
            confirmed: 'Confirme',
            pending: 'En attente',
            declined: 'Refuse',
            contractSent: 'Contrat envoye',
            pendingContract: 'Contrat en attente'
          },
          table: {
            company: 'Entreprise',
            contact: 'Contact',
            status: 'Statut',
            actions: 'Actions'
          },
          empty: {
            title: 'Ajouter un exposant',
            subtitle: 'Developpez votre liste',
            cta: 'Ajouter un exposant'
          },
          card: {
            readMore: 'Lire la suite',
            edit: 'Modifier exposant'
          },
          addChoice: {
            title: 'Ajouter un exposant',
            subtitle: 'Choisissez la methode',
            manual: {
              title: 'Ajouter manuellement',
              subtitle: 'Remplissez les details via le formulaire'
            },
            sendForm: {
              title: 'Envoyer un formulaire',
              subtitle: "Envoyez un formulaire a l exposant"
            }
          },
          formPreview: {
            title: 'Envoyer le formulaire exposant',
            subtitle: "Previsualisez le formulaire et saisissez l email",
            recipientLabel: 'Email du destinataire',
            recipientPlaceholder: 'exposant@entreprise.com',
            formTitle: "Formulaire d'information exposant",
            formSubtitle: "Veuillez remplir le formulaire pour vous inscrire comme exposant.",
            fields: {
              companyName: "Nom de l'entreprise",
              industry: 'Secteur',
              contactEmail: 'Email de contact',
              description: 'Description'
            },
            send: 'Envoyer le formulaire'
          },
          modal: {
            editTitle: 'Modifier exposant',
            addTitle: 'Ajouter un exposant',
            subtitle: "Saisissez les informations de l'entreprise",
            companySection: "Informations de l'entreprise",
            contactSection: 'Informations de contact',
            statusSection: 'Statut et notes',
            fields: {
              companyName: "Nom de l'entreprise",
              companyNamePlaceholder: 'ex. TechCorp Inc.',
              industry: 'Secteur',
              industryPlaceholder: 'Selectionner un secteur...',
              description: "Description de l'entreprise",
              descriptionPlaceholder: "Description breve de l'entreprise...",
              email: 'Adresse email',
              emailPlaceholder: 'contact@entreprise.com',
              phone: 'Numero de telephone',
              phonePlaceholder: '+1 (555) 123-4567',
              website: 'Site web',
              websitePlaceholder: 'https://www.entreprise.com',
              status: 'Statut exposant',
              notes: 'Notes internes',
              notesPlaceholder: 'Ajouter des notes internes...',
              notesHelper: 'Notes internes uniquement, non visibles'
            },
            cancel: 'Annuler',
            save: 'Enregistrer',
            add: 'Ajouter un exposant'
          },
          profile: {
            about: 'A propos',
            contactTitle: 'Informations de contact',
            email: 'Email',
            phone: 'Telephone',
            website: 'Site web',
            notes: 'Notes internes',
            delete: 'Supprimer exposant',
            edit: 'Modifier exposant'
          }
        },
        sessions: {
          title: 'Programme de l\'evenement',
          subtitle: 'Creez et gerez le programme de votre evenement avec des sessions, des intervenants et des lieux',
          view: {
            timeline: 'Vue chronologique',
            list: 'Vue liste'
          },
          actions: {
            addSession: 'Ajouter une session',
            createSession: 'Creer une session',
            exportSchedule: 'Exporter le programme',
            addAnotherSession: 'Ajouter une autre session'
          },
          filters: {
            allDays: 'Tous les jours',
            allTypes: 'Tous les types'
          },
          types: {
            keynote: 'Keynote',
            workshop: 'Atelier',
            panel: 'Table ronde',
            break: 'Pause / Networking',
            hackathon: 'Hackathon',
            pitching: 'Session de pitch',
            training: 'Formation',
            other: 'Autre'
          },
          searchPlaceholder: 'Rechercher des sessions...',
          empty: {
            title: 'Aucune session trouvee',
            filtered: 'Essayez d\'ajuster vos filtres pour voir plus de resultats.',
            unfiltered: 'Commencez en ajoutant votre premiere session au programme.'
          },
          table: {
            session: 'Session',
            dateTime: 'Date & heure',
            venue: 'Lieu',
            attendees: 'Participants',
            actions: 'Actions',
            noSpeakers: 'Aucun intervenant'
          },
          card: {
            duration: 'Duree : {minutes} minutes',
            capacity: 'Capacite : {count}',
            noVenue: 'Aucun lieu attribue',
            tbd: 'A definir',
            speakersLabel: 'Intervenants ({count})',
            moreSpeakers: '+ {count} de plus',
            edit: 'Modifier la session',
            checkInTitle: 'Session avec check-in',
            checkInHelper: 'Suivre la presence'
          },
          status: {
            confirmed: 'Confirmee',
            tentative: 'Tentative'
          },
          confirmDelete: 'Voulez-vous vraiment supprimer cette session ?',
          modal: {
            requiredFields: 'Veuillez remplir tous les champs obligatoires',
            titleEdit: 'Modifier la session',
            titleCreate: 'Creer une nouvelle session',
            subtitle: 'Configurer les details de la session, les intervenants et la logistique',
            tabs: {
              details: 'Details',
              speakers: 'Intervenants',
              advanced: 'Avance'
            },
            sessionType: 'Type de session *',
            typeDescriptions: {
              keynote: 'Presentation principale',
              workshop: 'Session pratique',
              panel: 'Discussion en panel',
              break: 'Creneau hors session',
              hackathon: 'Evenement collaboratif',
              pitching: 'Presentation de pitch',
              training: 'Session de formation',
              other: 'Type personnalise'
            },
            customType: 'Preciser le type de session *',
            customTypePlaceholder: 'ex. Fireside Chat, Demo, Q&A...',
            sessionTitle: 'Titre de la session *',
            sessionTitlePlaceholder: 'ex. L\'avenir de l\'IA en entreprise',
            description: 'Description',
            descriptionPlaceholder: 'Decrivez ce que les participants apprendront ou vivront...',
            date: 'Date *',
            startTime: 'Heure de debut *',
            endTime: 'Heure de fin *',
            venue: 'Lieu/Emplacement *',
            venuePlaceholder: 'Selectionner un lieu...',
            addNewVenue: '+ Ajouter un nouveau lieu',
            addNewVenueTitle: 'Ajouter un nouveau lieu',
            newVenueName: 'Nom du lieu *',
            newVenueNamePlaceholder: 'ex. Salle de conference C',
            newVenueCapacity: 'Capacite *',
            newVenueCapacityPlaceholder: 'ex. 150',
            saveVenue: 'Enregistrer le lieu',
            cancel: 'Annuler',
            capacity: 'Capacite maximale',
            capacityPlaceholder: 'ex. 100',
            tags: 'Tags',
            tagsPlaceholder: 'Saisissez un tag et appuyez sur Entree',
            selectDate: 'Choisissez une date',
            errors: {
              timeRange: "Attention ! La session finit avant d'avoir commence. Merci de verifier l'horaire.",
              invalidDateTime: 'Veuillez saisir une date et une heure valides.'
            },
            selectedSpeakers: 'Intervenants selectionnes ({count})',
            speakerLine: '{title} • {company}',
            noSpeakersAssigned: 'Aucun intervenant assigne',
            addSpeaker: 'Ajouter un intervenant',
            addMoreSpeakers: 'Ajouter d\'autres intervenants',
            sessionStatus: 'Statut de la session',
            showInPublic: 'Afficher dans le programme public',
            enableCheckIn: 'Activer le check-in de la session',
            postSessionSurvey: 'Enquete post-session',
            postSessionSurveyHelper: 'Envoyer automatiquement un formulaire aux participants apres la session',
            postSessionSurveyNone: 'Aucun formulaire selectionne',
            postSessionSurveyOptions: {
              sessionFeedback: 'Formulaire de feedback de session',
              speakerEvaluation: 'Evaluation de l\'intervenant',
              contentRating: 'Enquete de satisfaction',
              customOne: 'Formulaire personnalise 1',
              customTwo: 'Formulaire personnalise 2'
            },
            saveChanges: 'Enregistrer les modifications',
            createSession: 'Creer la session',
            selectSpeakers: 'Assigner des intervenants',
            selectSpeakersSubtitle: 'Selectionnez les experts et intervenants qui animeront cette session.',
            noSpeakersFound: 'Aucun intervenant trouve. Veuillez d\'abord ajouter des intervenants a votre evenement.',
            selectedCount: '{count} intervenant(s) selectionne(s)',
            saveSelection: 'Confirmer l\'affectation'
          },
          proModal: {
            title: 'Fonctionnalite Pro',
            subtitle: 'Cette fonctionnalite est disponible uniquement avec le plan Eventra Pro. Passez a Pro pour debloquer la gestion avancee des sessions.',
            upgrade: 'Passer a Pro'
          },
          speakerModal: {
            title: 'Selectionner des intervenants',
            subtitle: 'Choisissez un ou plusieurs intervenants a associer a cette session',
            empty: 'Aucun intervenant trouve. Ajoutez d\'abord des intervenants dans l\'onglet Intervenants.',
            selectedCount: '{count} intervenant(s) selectionne(s)',
            addSelected: 'Ajouter les intervenants selectionnes'
          },
          export: {
            title: 'Exporter le programme',
            subtitle: 'Choisissez le format pour exporter le programme de l\'evenement',
            pdf: 'Exporter en PDF',
            excel: 'Exporter en Excel',
            csv: 'Exporter en CSV'
          }
        },
        attendeesTab: {
          title: 'Gestion des participants',
          subtitle: 'Ajouter, importer et gérer les participants',
          loading: 'Chargement des participants...',
          csvTemplate: 'Modèle CSV',
          searchPlaceholder: 'Rechercher par nom ou email...',
          toasts: {
            importSuccess: '{count} participants importés avec succès',
            importFailed: 'Échec de l\'importation',
            nameEmailRequired: 'Le nom et l\'email sont requis',
            invalidEmail: 'Veuillez entrer une adresse email valide',
            missingField: '{field} est requis',
            addSuccess: 'Participant ajouté avec succès',
            duplicateEmail: 'Cet email est déjà enregistré',
            addFailed: 'Échec de l\'ajout du participant',
            noExport: 'Aucun participant à exporter',
            exportStarted: 'Exportation lancée'
          },
          actions: {
            addManually: 'Ajouter manuellement',
            addManuallyDesc: 'Remplir les détails du participant via le formulaire',
            importCsv: 'Importer depuis CSV',
            importCsvDesc: 'Importer en masse depuis un fichier tableur',
            exportList: 'Exporter la liste',
            exportListDesc: 'Télécharger les données en fichier CSV',
            addFirstAttendee: 'Ajouter le premier participant'
          },
          addForm: {
            title: 'Inscrire un nouveau participant',
            subtitle: 'Remplissez les détails ci-dessous pour ajouter manuellement un participant',
            ticketType: 'Type de billet',
            generalAdmission: 'Admission générale',
            status: 'Statut d\'inscription',
            statusApproved: 'Approuvé',
            statusPending: 'En attente',
            enterField: 'Entrez {field}',
            selectOption: 'Sélectionnez une option...',
            assignSessions: 'Assigner aux sessions',
            assignSessionsDesc: 'Assigner optionnellement ce participant à des sessions spécifiques',
            selectedCount: '{count} sélectionné(s)',
            noSessions: 'Aucune session disponible',
            discardChanges: 'Annuler les modifications',
            saveRegistration: 'Enregistrer l\'inscription'
          },
          table: {
            name: 'Participant',
            ticket: 'Billet',
            status: 'Statut',
            checkedIn: 'Enregistré',
            actions: 'Actions',
            approved: 'Approuvé',
            pending: 'En attente',
            yes: 'Oui',
            no: 'Non'
          },
          empty: {
            title: 'Aucun participant',
            subtitle: 'Commencez par ajouter des participants manuellement ou en important un fichier CSV'
          },
          badges: {
            title: 'Badges & Enregistrement',
            designTitle: 'Concevoir les badges',
            designDesc: 'Créez des badges professionnels avec codes QR pour un enregistrement fluide',
            openEditor: 'Ouvrir l\'éditeur de badges'
          }
        },
        sponsors: {
          title: 'Sponsors',
          subtitle: 'Gerez les sponsors et les packages de sponsoring',
          actions: {
            managePackages: 'Gerer les packages',
            addSponsor: 'Ajouter un sponsor',
            editSponsor: 'Modifier le sponsor'
          },
          filters: {
            all: 'Tous les sponsors'
          },
          searchPlaceholder: 'Rechercher des sponsors...',
          packages: {
            title: 'Packages de sponsoring',
            subtitle: 'Cliquez sur un package pour voir les sponsors de ce niveau',
            sponsorCount: '{count} sponsor(s)',
            moreBenefits: '+{count} avantages supplementaires',
            filterActive: 'Affichage de {count} sponsor(s) dans le niveau {tier}',
            clearFilter: 'Effacer le filtre',
            editPackage: 'Personnaliser le niveau de parrainage',
            manageTitle: 'Gerer les packages de sponsoring',
            manageSubtitle: 'Modifier ou ajouter des packages de sponsoring',
            manageSubtitleFree: 'Plan gratuit : {current}/{max} packages. Passez a Pro pour des packages illimites.',
            fields: {
              name: 'Nom du package *',
              namePlaceholder: 'ex. Platinum',
              value: 'Valeur du package *',
              valuePlaceholder: 'ex. 25000',
              color: 'Couleur *',
              benefits: 'Avantages (separes par des virgules)',
              benefitsPlaceholder: 'ex. Logo sur le site, 3 prises de parole, diner VIP'
            },
            upgradePrompt: 'Passer a Pro pour des packages illimites',
            addPackage: 'Ajouter un nouveau package de sponsoring',
            savePackages: 'Enregistrer les packages',
            upgradeTitle: 'Passer a Pro',
            upgradeSubtitle: 'Les utilisateurs gratuits peuvent avoir jusqu\'a {max} packages. Passez a Eventra Pro pour des packages illimites et une gestion avancee du sponsoring.',
            upgradeNow: 'Passer a Pro'
          },
          table: {
            sponsor: 'Sponsor',
            tier: 'Niveau',
            packageValue: 'Valeur du package',
            website: 'Site web',
            status: 'Statut',
            actions: 'Actions'
          },
          status: {
            confirmed: 'Confirme',
            pending: 'En attente',
            contractSent: 'Contrat envoye'
          },
          confirmDelete: 'Voulez-vous vraiment supprimer ce sponsor ?',
          addChoice: {
            title: 'Ajouter un sponsor',
            subtitle: 'Choisissez comment ajouter le sponsor',
            manual: {
              title: 'Ajouter manuellement',
              subtitle: 'Saisissez les details via notre formulaire'
            },
            sendForm: {
              title: 'Envoyer un formulaire au sponsor',
              subtitle: 'Envoyer un formulaire au sponsor pour qu\'il saisisse ses informations'
            }
          },
          form: {
            nameRequired: 'Le nom est obligatoire',
            editTitle: 'Modifier le sponsor',
            addTitle: 'Ajouter un sponsor',
            nameLabel: 'Nom du sponsor *',
            namePlaceholder: 'ex. TechCorp',
            tierLabel: 'Niveau',
            tierOption: '{name} - ${value}',
            contributionLabel: 'Montant de contribution ($)',
            statusLabel: 'Statut',
            websiteLabel: 'URL du site',
            websitePlaceholder: 'exemple.com',
            logoLabel: 'URL du logo',
            logoPlaceholder: 'https://...',
            descriptionLabel: 'Description',
            cancel: 'Annuler',
            save: 'Enregistrer le sponsor'
          },
          formPreview: {
            title: 'Envoyer le formulaire sponsor',
            to: 'A :',
            subject: 'Objet :',
            subjectLine: 'Invitation a completer le profil sponsor',
            body: 'Veuillez completer votre profil sponsor pour [Nom de l\'evenement] en cliquant sur le lien ci-dessous...',
            cancel: 'Annuler',
            send: 'Envoyer l\'email',
            toastSent: 'Formulaire envoye au sponsor (simulation)'
          }
        },
        qrBadges: {
          header: {
            title: "Concevoir les badges de l'evenement",
            subtitle: 'Choisissez un modele et personnalisez-le pour vos participants',
            preview: 'Apercu',
            download: 'Telecharger le PDF'
          },
          sections: {
            template: {
              title: 'Modele de badge',
              previewLabel: 'Apercu',
              currentBadge: 'Actuel',
              changeButton: 'Changer le modele'
            },
            info: {
              title: 'Informations du badge',
              sizeLabel: 'Taille du badge',
              sizeValue: 'Standard (4" x 6")',
              orientationLabel: 'Orientation',
              orientation: {
                portrait: 'Portrait',
                landscape: 'Paysage'
              },
              paperTypeLabel: 'Type de papier',
              paperTypes: {
                glossy: 'Carton brillant',
                matte: 'Carton mat',
                recycled: 'Papier recycle'
              }
            },
            branding: {
              title: 'Branding',
              logoLabel: "Logo de l'evenement",
              uploadCta: 'Cliquez pour televerser le logo',
              uploadHint: 'PNG ou JPG, max 5 Mo',
              replace: 'Remplacer',
              remove: 'Supprimer',
              colorLabel: 'Couleur de marque',
              logoAlt: 'Logo'
            },
            attendee: {
              title: 'Informations participant',
              fullName: 'Nom complet',
              jobTitle: 'Poste',
              company: "Nom de l'entreprise",
              ticketType: 'Type de billet',
              customField: 'Champ personnalise',
              requiredHint: 'Le nom complet est obligatoire'
            },
            qr: {
              title: 'Parametres du QR code',
              uniqueCode: 'Code unique par participant',
              positionLabel: 'Position du QR code',
              positions: {
                bottomCenter: 'Bas centre',
                bottomRight: 'Bas droit',
                back: 'Verso du badge'
              },
              security: {
                title: 'Inclure un hash de securite chiffre',
                subtitle: 'Recommande pour prevenir la fraude'
              }
            }
          },
          preview: {
            title: 'Apercu en direct',
            sampleData: 'Donnees exemple',
            sampleDataHint: "Montre l'apparence du badge avec des donnees reelles",
            logoAlt: "Logo de l'evenement",
            logoPlaceholder: 'Logo',
            sampleName: 'Sarah Johnson',
            sampleTitle: 'Chef de produit',
            sampleCompany: 'TechCorp Inc.',
            sampleTicket: 'Acces VIP',
            sampleEvent: 'TechCon 2025',
            sampleDate: '20-22 decembre 2025',
            hint: 'Le badge final inclura des informations uniques et des QR codes'
          },
          templates: {
            modal: {
              title: 'Choisir un modele de badge',
              subtitle: 'Selectionnez un design qui correspond a votre evenement',
              cancel: 'Annuler',
              apply: 'Appliquer le modele'
            },
            categories: {
              all: 'Tous les modeles',
              professional: 'Professionnel',
              creative: 'Creatif',
              minimal: 'Minimal',
              bold: 'Audacieux',
              classic: 'Classique'
            },
            modern: {
              name: 'Conference moderne',
              description: 'Design epure avec affichage du nom en grand',
              features: ['Logo en haut', 'QR en bas', 'Bandeau colore']
            },
            classic: {
              name: 'Business classique',
              description: 'Style corporate traditionnel',
              features: ['Mise en page centree', 'QR en bas']
            },
            creative: {
              name: 'Creatif audacieux',
              description: 'Design accrocheur aux couleurs vives',
              features: ['Grand logo', 'QR lateral', 'Typo audacieuse']
            },
            minimal: {
              name: 'Minimaliste',
              description: 'Design simple et elegant',
              features: ['Logo en haut', 'Mise en page epuree']
            },
            tech: {
              name: 'Sommet tech',
              description: 'Style moderne pour evenement tech',
              features: ['QR mis en avant', 'Look tech']
            },
            elegant: {
              name: 'Elegant formel',
              description: 'Design formel et raffine',
              features: ['Typographie elegante', 'Couleurs subtiles']
            },
            vibrant: {
              name: 'Festival vibrant',
              description: 'Fun et colore pour les festivals',
              features: ['Couleurs vives', 'Design ludique']
            },
            corporate: {
              name: 'Corporate pro',
              description: 'Design corporate professionnel',
              features: ['Logo mis en avant', 'Lignes epurees']
            },
            startup: {
              name: 'Pitch startup',
              description: 'Style moderne pour evenement startup',
              features: ['Mise en page dynamique', 'Typo moderne']
            }
          },
          printTitle: 'Badge'
        },
        customForms: {
          header: {
            title: "Formulaires d'evenement",
            subtitle: 'Creez et gerez des formulaires pour votre evenement',
            createButton: 'Creer un formulaire personnalise'
          },
          actions: {
            editForm: 'Modifier le formulaire',
            upgradeToPro: 'Passer a Pro'
          },
          badges: {
            default: 'DEFAUT',
            template: 'MODELE',
            free: 'GRATUIT',
            pro: 'PRO'
          },
          status: {
            active: 'Actif',
            draft: 'Brouillon'
          },
          toasts: {
            createFailed: 'Echec de la creation du formulaire',
            formNotReady: "Le formulaire n'est pas pret",
            saved: 'Formulaire enregistre',
            saveFailed: "Echec de l'enregistrement du formulaire"
          },
          fieldFallback: 'Champ sans titre',
          fieldOptions: {
            option1: 'Option 1',
            option2: 'Option 2',
            option3: 'Option 3'
          },
          fieldTypes: {
            text: {
              label: 'Texte court',
              desc: 'Saisie sur une ligne'
            },
            textarea: {
              label: 'Texte long',
              desc: 'Reponse longue'
            },
            dropdown: {
              label: 'Liste deroulante',
              desc: 'Selectionner dans une liste'
            },
            checkbox: {
              label: 'Cases a cocher',
              desc: 'Selection multiple'
            },
            radio: {
              label: 'Choix multiple',
              desc: 'Choisir une option'
            },
            date: {
              label: 'Date',
              desc: 'Choisir une date'
            },
            file: {
              label: 'Televersement de fichier',
              desc: 'Televerser un fichier'
            },
            number: {
              label: 'Nombre',
              desc: 'Saisie numerique'
            },
            multichoice: {
              label: 'Choix multiple',
              desc: 'Reponses a choix multiple'
            },
            country: {
              label: 'Pays',
              desc: 'Choisir un pays'
            }
          },
          formFieldsLabel: 'Champs du formulaire',
          moreFields: '+ {count} de plus',
          lastEdited: 'Modifie {date}',
          created: 'Cree {date}',
          fieldsCount: '{count} champs',
          searchPlaceholder: 'Rechercher des formulaires...',
          sections: {
            defaultTitle: 'FORMULAIRES PAR DEFAUT',
            defaultSubtitle: 'Formulaires preconfigures prets a personnaliser',
            customTitle: 'FORMULAIRES PERSONNALISES',
            customCount: '{count} formulaires personnalises',
            viewAll: 'Voir tout'
          },
          emptyState: {
            title: 'Aucun formulaire personnalise',
            subtitle: 'Creez des formulaires pour sondages, retours, candidatures, etc.',
            cta: 'Creer un formulaire personnalise'
          },
          builder: {
            backToForms: 'Retour aux formulaires',
            previewButton: 'Apercu',
            saveButton: 'Enregistrer',
            fieldLibrary: {
              title: 'Bibliotheque de champs',
              subtitle: 'Glissez des champs pour les ajouter au formulaire'
            },
            categories: {
              basic: 'Champs de base',
              choice: 'Champs de choix',
              advanced: 'Avances'
            },
            fieldLabels: {
              shortText: 'Texte court',
              longText: 'Texte long',
              email: 'Email',
              phone: 'Telephone',
              number: 'Nombre',
              date: 'Date',
              dropdown: 'Liste deroulante',
              multipleChoice: 'Choix multiple',
              checkboxes: 'Cases a cocher',
              fileUpload: 'Televersement de fichier',
              websiteUrl: 'URL du site',
              address: 'Adresse',
              country: 'Pays'
            },
            quickTips: {
              title: 'Conseils rapides',
              items: {
                drag: "Glissez les champs dans l'aperçu",
                edit: 'Cliquez pour modifier les parametres',
                reorder: 'Reordonnez par glisser-deposer'
              }
            },
            preview: {
              title: 'Apercu du formulaire',
              subtitle: 'Voici comment votre formulaire apparaitra aux repondants',
              device: {
                desktop: 'Vue bureau',
                tablet: 'Vue tablette',
                mobile: 'Vue mobile'
              }
            },
            dropZone: {
              emptyTitle: 'Commencez a construire votre formulaire',
              emptySubtitle: 'Glissez des champs depuis le panneau de gauche et deposez-les ici',
              label: 'Zone de depot - Glissez des champs ici',
              addMore: "Glissez d'autres champs ici pour continuer"
            },
            tips: {
              editField: "Survolez un champ et cliquez sur l'icone d'edition pour personnaliser les libelles, ajouter de l'aide et configurer les options"
            },
            fieldActions: {
              editProperties: 'Modifier les proprietes du champ',
              deleteField: 'Supprimer le champ',
              dragToReorder: 'Glisser pour reordonner',
              editSettings: 'Modifier les parametres du champ'
            },
            placeholders: {
              text: 'Saisir du texte...',
              textarea: 'Saisir votre reponse...',
              email: 'email@exemple.com',
              phone: '(555) 123-4567',
              number: '0',
              dropdown: 'Selectionner une option...',
              fileUpload: 'Cliquez pour televerser ou glissez-deposez',
              url: 'https://exemple.com',
              addressStreet: 'Adresse',
              addressCity: 'Ville',
              addressState: 'Etat/Province'
            },
            newFieldLabel: 'Nouveau champ {type}',
            untitled: 'Formulaire sans titre'
          },
          formTypeLabel: 'Formulaire {type}',
          formTypes: {
            registration: 'Inscription',
            survey: 'Sondage',
            assessment: 'Evaluation',
            feedback: 'Retour',
            'data-collection': 'Collecte de donnees',
            application: 'Candidature',
            submission: 'Soumission',
            custom: 'Autre (personnalise)'
          },
          defaults: {
            registration: {
              title: "Inscription a l'evenement",
              description: 'Collecter les coordonnees des participants',
              fields: {
                email: 'Email',
                fullName: 'Nom complet',
                phone: 'Telephone',
                company: 'Entreprise',
                jobTitle: 'Poste'
              },
              lastEdited: 'il y a 2 jours',
              info: 'Requis pour tous les participants'
            },
            satisfaction: {
              title: 'Enquete de satisfaction',
              description: "Mesurer la satisfaction apres l'evenement",
              fields: {
                overall: 'Satisfaction globale',
                sessionQuality: 'Qualite des sessions',
                venueRating: 'Evaluation du lieu',
                food: 'Restauration',
                networking: 'Valeur du reseautage'
              },
              info: 'Modele - personnalisez pour votre evenement'
            },
            assessment: {
              title: 'Evaluation avant/apres',
              description: 'Evaluer les connaissances avant et apres',
              fields: {
                preCheck: 'Test de connaissances avant',
                skillLevel: 'Niveau actuel',
                objectives: "Objectifs d'apprentissage",
                postQuiz: 'Quiz apres session',
                skillImprovement: 'Amelioration des competences'
              }
            }
          },
          custom: {
            speakerFeedback: {
              title: 'Formulaire de feedback intervenant',
              description: 'Recueillir des retours sur les intervenants',
              fields: {
                speakerName: "Nom de l'intervenant",
                sessionTitle: 'Titre de session',
                contentQuality: 'Qualite du contenu',
                presentation: 'Style de presentation',
                comments: 'Commentaires'
              },
              info: 'Utilise apres chaque session',
              created: 'Cree il y a 3 jours'
            },
            dietary: {
              title: 'Preferences alimentaires',
              description: 'Collecter repas et allergies',
              fields: {
                meal: 'Preference de repas',
                allergies: 'Allergies',
                requests: 'Demandes speciales',
                type: 'Type alimentaire'
              },
              info: 'Aide les traiteurs',
              created: 'Cree il y a 1 semaine'
            },
            workshopSubmission: {
              title: "Soumission d'atelier",
              description: "Collecter les propositions d'atelier",
              fields: {
                workshopTitle: "Titre de l'atelier",
                presenterName: 'Nom du presentateur',
                slides: 'Televersement des slides',
                supportingDocs: 'Documents justificatifs'
              },
              info: 'Pour revue interne',
              created: 'Cree il y a 2 semaines'
            },
            volunteer: {
              title: 'Inscription benevoles',
              description: 'Recruter et organiser des benevoles',
              fields: {
                fullName: 'Nom complet',
                contact: 'Coordonnees',
                roles: 'Roles preferes',
                skills: 'Competences',
                availability: 'Disponibilite'
              },
              created: 'Cree il y a 5 jours'
            }
          },
          templates: {
            abstract: {
              title: "Soumission d'abstract",
              description: "Collecter des abstracts et propositions"
            },
            assessment: {
              title: 'Evaluation avant/apres',
              description: 'Mesurer les connaissances avant et apres'
            },
            dietary: {
              title: 'Preferences alimentaires',
              description: 'Recueillir les besoins alimentaires'
            },
            exit: {
              title: 'Enquete de sortie',
              description: "Recueillir des retours en fin d'evenement"
            },
            extendedRegistration: {
              title: 'Inscription etendue',
              description: 'Collecter des details supplementaires'
            },
            networking: {
              title: 'Match reseautage',
              description: "Mettre en relation par centres d'interet"
            },
            satisfaction: {
              title: 'Enquete de satisfaction',
              description: "Evaluer l'experience"
            },
            speakerFeedback: {
              title: 'Feedback intervenant',
              description: 'Recueillir des retours sur les intervenants'
            },
            sponsorLead: {
              title: 'Capture de leads sponsor',
              description: "Collecter l'interet des sponsors"
            },
            tags: {
              text: 'Texte',
              textArea: 'Zone de texte',
              dropdown: 'Liste deroulante',
              checkbox: 'Case a cocher',
              checkboxes: 'Cases a cocher',
              fileUpload: 'Televersement de fichier',
              multipleChoice: 'Choix multiple',
              multiSelect: 'Selection multiple',
              contactInfo: 'Infos de contact',
              rating: 'Note',
              yesNo: 'Oui/Non',
              tags: 'Tags',
              notes: 'Notes',
              quiz: 'Quiz'
            }
          },
          templatesModal: {
            title: 'Creer un nouveau formulaire',
            subtitle: "Partir d'un modele ou construire a partir de zero",
            buildTitle: 'Creer un formulaire personnalise',
            buildSubtitle: 'Commencez avec une page blanche et ajoutez vos champs',
            formNameLabel: 'Nom du formulaire',
            formNamePlaceholder: 'ex. Preferences de reseautage, Soumission d\'abstract, Sondage de sortie...',
            formTypeLabel: 'Type de formulaire',
            descriptionLabel: 'Description (optionnelle)',
            descriptionPlaceholder: "Breve description de l'objectif du formulaire...",
            createBlank: 'Creer un formulaire vierge',
            orChooseTemplate: 'Ou choisir un modele',
            templateFieldsCount: '{count} champs pre-remplis',
            useTemplate: 'Utiliser le modele',
            cancel: 'Annuler'
          },
          upgradeModal: {
            title: 'Passer a Pro',
            subtitle: 'Debloquez des fonctionnalites avancees et des modeles',
            features: [
              'Modeles d\'evaluation avant/apres',
              'Champs de televersement de fichier',
              'Types de champs avances (signature, matrice, classement)',
              'Matching reseautage',
              'Formulaires de capture de prospects',
              'Formulaires personnalises illimites',
              'Support prioritaire'
            ],
            cta: 'Passer a Pro - $49/mois',
            viewAll: 'Voir toutes les fonctionnalites Pro',
            maybeLater: 'Peut-etre plus tard'
          },
          fieldSettings: {
            title: 'Parametres du champ',
            labels: {
              fieldLabel: 'Libelle du champ',
              helpText: 'Texte d\'aide',
              placeholder: 'Texte indicatif',
              options: 'Options',
              newOption: 'Ajouter une option...',
              settings: 'Parametres',
              requiredField: 'Champ obligatoire',
              requiredSystemNote: 'Ce champ systeme ne peut pas etre rendu optionnel',
              showInDashboard: 'Afficher dans le tableau de bord',
              dashboardNote: 'Ce champ apparaitra dans le tableau des participants'
            },
            placeholders: {
              helpText: 'Ajouter des instructions pour les repondants...',
              inputPlaceholder: 'Texte indicatif...'
            },
            actions: {
              deleteField: 'Supprimer le champ',
              cancel: 'Annuler',
              saveChanges: 'Enregistrer'
            }
          }
        },
        marketingTools: {
          title: 'Marketing et communication',
          subtitle: 'Promouvez votre evenement et engagez les participants',
          dateTba: 'Date a definir',
          actions: {
            previewAll: 'Tout previsualiser',
            moreActions: 'Plus d\'actions',
            upgradeToPro: 'Passer a Pro',
            upgradeToProWithPrice: 'Passer a Pro - {price}',
            learnMore: 'En savoir plus',
            maybeLater: 'Plus tard'
          },
          platforms: {
            facebook: 'Facebook',
            linkedin: 'LinkedIn',
            twitter: 'Twitter/X',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            email: 'Email',
            youtube: 'YouTube',
            google: 'Google',
            reddit: 'Reddit',
            pinterest: 'Pinterest',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            link: 'Lien'
          },
          customDomain: {
            title: 'Domaine personnalise',
            subtitle: 'Utilisez votre domaine pour les inscriptions et emails',
            learnMore: 'En savoir plus sur les domaines personnalises',
            features: {
              registrationUrl: {
                title: 'URL d\'inscription personnalisee',
                subtitle: 'events.votredomaine.com au lieu de eventra.com/votre-evenement'
              },
              emailDomain: {
                title: 'Domaine email personnalise',
                subtitle: 'Envoyez des emails depuis @votredomaine.com'
              },
              ssl: {
                title: 'Certificat SSL inclus',
                subtitle: 'Securite HTTPS automatique pour votre domaine'
              },
              branding: {
                title: 'Branding professionnel',
                subtitle: 'Gagnez la confiance avec votre propre domaine'
              }
            }
          },
          emailTemplates: {
            title: 'Modeles d\'email',
            subtitle: 'Personnalisez les emails automatiques envoyes',
            enabled: 'Active',
            disabled: 'Desactive',
            edit: 'Modifier le modele',
            preview: 'Previsualiser',
            sendTest: 'Envoyer un test',
            customCampaign: {
              title: 'Campagne personnalisee',
              subtitle: 'Envoyez des emails personnalises a vos participants'
            },
            proUnlock: 'Passez a PRO pour debloquer les campagnes personnalisees',
            upgradeToUse: 'Passer a Pro',
            default: {
              name: 'Confirmation d\'inscription',
              preview: 'Merci pour votre inscription !',
              previewWithEvent: 'Merci pour votre inscription a {eventName} !',
              timing: 'Envoye immediatement apres l\'inscription'
            }
          },
          links: {
            title: 'Suivi des liens d\'inscription',
            subtitle: 'Creez des liens uniques pour suivre les inscriptions',
            info: 'Utilisez ces liens dans vos posts, emails et pubs pour mesurer la performance',
            active: 'Actif',
            copy: 'Copier',
            clicks: 'Clics',
            registrations: 'Inscriptions',
            conversion: 'Conversion',
            analytics: 'Voir les analyses detaillees',
            create: 'Creer un nouveau lien',
            limit: 'Jusqu\'a 10 liens en gratuit, illimite en Pro',
            defaultName: 'Lien personnalise'
          },
          social: {
            title: 'Partage sur les reseaux sociaux',
            subtitle: 'Configurez l\'apparence lors du partage',
            preview: 'Apercu du partage',
            fields: {
              title: 'Titre reseaux sociaux',
              titleHint: 'Recommande : 40-60 caracteres',
              description: 'Description reseaux sociaux',
              descriptionHint: 'Recommande : 120-155 caracteres'
            },
            options: {
              includeDate: 'Inclure la date dans le texte',
              includeLink: 'Inclure le lien d\'inscription',
              includeHashtag: 'Ajouter un hashtag'
            },
            quickShare: 'Partage rapide',
            previewTitleFallback: 'Votre evenement',
            previewDescriptionFallback: 'Les details arrivent bientot.',
            previewLocationFallback: 'Lieu a definir',
            defaults: {
              title: 'Inscrivez-vous',
              titleWithEvent: '{eventName} - Inscrivez-vous'
            }
          },
          scheduled: {
            title: 'Campagnes planifiees',
            lockedTitle: 'Debloquer la planification',
            features: {
              schedule: 'Planifier des campagnes a l\'avance',
              drip: 'Campagnes drip pour l\'engagement',
              abTesting: 'Tests A/B pour le contenu',
              reminders: 'Rappels automatiques',
              analytics: 'Analyses avancees'
            }
          },
          whatsapp: {
            title: 'Marketing WhatsApp',
            lockedTitle: 'Touchez les participants sur WhatsApp',
            lockedSubtitle: 'Envoyez des mises a jour et rappels via WhatsApp',
            features: {
              confirmations: 'Envoyer les confirmations d\'inscription via WhatsApp',
              reminders: 'Rappels automatiques',
              twoWay: 'Messagerie bidirectionnelle',
              broadcast: 'Diffuser des mises a jour a tous les inscrits',
              richMedia: 'Support rich media (images, videos, PDFs)'
            }
          },
          toasts: {
            templateStatusUpdated: 'Statut du modele mis a jour',
            createLinkFirst: 'Creez d\'abord un lien',
            linkCopied: 'Lien copie dans le presse-papiers',
            createEventFirstLinks: 'Creez l\'evenement avant de generer des liens',
            addNameAndSource: 'Ajoutez un nom et un tag source',
            sourceTagExists: 'Le tag source existe deja',
            customLinkCreated: 'Lien personnalise cree',
            createEventFirstShare: 'Creez l\'evenement avant de partager',
            testEmailSent: 'Email de test envoye a votre@email.com',
            templateSaved: 'Modele enregistre',
            campaignScheduled: 'Campagne planifiee'
          },
          proModal: {
            title: 'Fonctionnalite PRO',
            subtitle: 'Passez a PRO pour debloquer les emails de rappel et de remerciement, et l\'automatisation avancee.',
            features: {
              reminder: 'Emails de rappel',
              thankYou: 'Emails de remerciement',
              customCampaigns: 'Campagnes email personnalisees',
              abTesting: 'Tests A/B',
              analytics: 'Analyses avancees'
            }
          }
        }
      },
      step4: {
        title: 'Revue et publication',
        subtitle: "Verifiez tous les details et publiez votre evenement quand vous etes pret.",
        launchHeader: {
          title: 'Pret pour le lancement',
          subtitle: 'Configurez les derniers parametres et publiez votre evenement'
        },
        integrations: {
          title: 'Integrations',
          subtitle: 'Connectez votre evenement avec des outils externes',
          connect: 'Connecter',
          items: {
            zoom: {
              name: 'Zoom',
              description: 'Visioconference pour les evenements virtuels'
            },
            mailchimp: {
              name: 'Mailchimp',
              description: 'Automatisation du marketing email'
            },
            googleCalendar: {
              name: 'Google Calendar',
              description: "Synchroniser automatiquement les dates d'evenement"
            },
            slack: {
              name: 'Slack',
              description: 'Envoyer des mises a jour a votre equipe'
            }
          }
        },
        seo: {
          title: 'Parametres SEO',
          subtitle: 'Aidez les personnes a trouver votre evenement',
          defaults: {
            title: 'SaaS Summit 2024 - Le futur du logiciel',
            description: "Rejoignez les leaders du secteur pour trois jours de reseautage, apprentissage et innovation.",
            slug: 'saas-summit-2024',
            keywords: ['SaaS', 'Conference tech', 'San Francisco']
          },
          fields: {
            title: {
              label: 'Titre SEO'
            },
            description: {
              label: 'Meta description'
            },
            url: {
              label: "URL de l'evenement",
              prefix: 'eventra.app/events/',
              check: 'Verifier la disponibilite'
            },
            keywords: {
              label: 'Mots-cles (optionnel)',
              placeholder: 'Ajouter un mot-cle...'
            }
          }
        },
        payment: {
          title: 'Passerelle de paiement',
          subtitle: 'Acceptez les paiements pour les billets payants',
          features: [
            'Traitement des cartes bancaires',
            'Plusieurs devises',
            'Facturation automatique',
            'Gestion des remboursements'
          ],
          upgrade: 'Passer a Pro',
          price: '$49/mois'
        },
        privacy: {
          title: 'Parametres de confidentialite',
          items: [
            {
              id: 'publicEvent',
              title: 'Evenement public',
              description: 'Accessible a tous'
            },
            {
              id: 'requireRegistration',
              title: "Inscription obligatoire",
              description: "Inscription requise pour voir les details"
            },
            {
              id: 'showAttendeeList',
              title: 'Afficher dans les communautes Eventra',
              description: 'Afficher votre evenement dans les listes publiques'
            },
            {
              id: 'allowSocialSharing',
              title: 'Partage sur les reseaux sociaux',
              description: 'Permettre le partage sur les plateformes sociales'
            }
          ]
        },
        checklist: {
          title: 'Checklist avant lancement',
          subtitle: 'Assurez-vous que tout est pret',
          items: {
            details: "Details de l'evenement ajoutes",
            design: "Page d'evenement creee",
            freeTickets: 'Billets non requis pour un evenement gratuit',
            ticketRequired: 'Au moins un type de billet'
          },
          actions: {
            edit: 'Modifier',
            view: 'Voir',
            addTicket: 'Ajouter un billet'
          },
          progress: '{completed} sur {total} termines'
        },
        publishConfirmation: {
          body: "Une fois publie, votre evenement sera en ligne et accessible. Vous pourrez toujours modifier apres publication."
        },
        errors: {
          publishFirst: "Enregistrez votre evenement avant de publier.",
          saveFirst: "Enregistrez votre evenement avant de continuer."
        },
        toasts: {
          publishedSuccess: 'Evenement publie avec succes.',
          publishFailed: "Echec de la publication de l'evenement.",
          draftSaved: 'Brouillon enregistre.'
        },
        summary: {
          coverAlt: "Couverture de l'evenement",
          noDate: 'Aucune date',
          tbd: 'A definir',
          unlimited: 'Illimite',
          maxAttendees: '{count} participants max'
        }
      },
      footer: {
        draftSavedHint: 'Brouillon enregistre il y a {minutes} minutes'
      },
      sidebar: {
        header: {
          eyebrow: "Creation de l'evenement",
          title: "Configuration de l'evenement"
        },
        stepLabel: 'Etape {number}',
        progressLabel: '{completed} sur {total} terminees',
        saveDraft: 'Enregistrer le brouillon',
        saving: 'Enregistrement...',
        steps: {
          details: {
            title: 'Infos evenement',
            label: "Informations sur l'evenement"
          },
          design: {
            title: 'Design',
            label: 'Design et branding'
          },
          registration: {
            title: 'Inscriptions',
            label: 'Configuration des inscriptions'
          },
          launch: {
            title: 'Lancement',
            label: 'Revue et publication'
          }
        },
        subSteps: {
          tickets: 'Billets',
          speakers: 'Intervenants',
          attendees: 'Participants',
          exhibitors: 'Exposants',
          schedule: 'Programme',
          sponsors: 'Sponsors',
          qrBadges: 'Badges QR',
          customForms: 'Formulaires personnalises',
          marketingTools: 'Outils marketing'
        }
      },
      registrationFooter: {
        backToDesign: 'Retour au design'
      },
      launchFooter: {
        allChangesSaved: 'Toutes les modifications sont enregistrees',
        preview: 'Apercu',
        backToRegistration: 'Retour aux inscriptions',
        publish: "Publier l'evenement"
      },
      notifications: {
        draftCreatedTitle: 'Brouillon cree',
        draftSavedTitle: 'Brouillon enregistre',
        draftSavedBody: 'Votre evenement "{name}" a ete enregistre en brouillon.',
        readyToDesign: 'Votre evenement "{name}" est pret pour le design.',
        publishedTitle: 'Evenement publie',
        publishedBody: '{name} est maintenant en ligne.'
      },
      details: {
        eventTypes: {
          conference: 'Conference',
          workshop: 'Atelier',
          webinar: 'Webinaire',
          networking: 'Reseautage',
          tradeShow: 'Salon',
          summit: 'Sommet',
          masterclass: 'Masterclass',
          training: 'Formation',
          bootcamp: 'Bootcamp',
          hackathon: 'Hackathon',
          awardCeremony: 'Ceremonie de prix',
          outreachCampaign: 'Campagne de prospection',
          event: 'Evenement',
          tradeMission: 'Mission commerciale',
          pitchingEvent: 'Evenement de pitching',
          other: 'Autre'
        },
        timezones: {
          pt: 'Heure du Pacifique (PT) - UTC-8',
          mt: 'Heure des Rocheuses (MT) - UTC-7',
          ct: 'Heure centrale (CT) - UTC-6',
          et: "Heure de l'Est (ET) - UTC-5",
          utc: 'UTC'
        },
        format: {
          inPerson: {
            label: 'En personne',
            description: 'Les invites assistent sur place.'
          },
          virtual: {
            label: 'Virtuel',
            description: 'Organise en ligne avec acces virtuel.'
          },
          hybrid: {
            label: 'Hybride',
            description: 'Melange de presentiel et virtuel.'
          }
        },
        fields: {
          eventName: {
            label: "Nom de l'evenement",
            placeholder: "Saisir le nom de l'evenement",
            error: "Le nom de l'evenement est obligatoire",
            helper: "Apparait sur votre page evenement."
          },
          tagline: {
            label: 'Slogan',
            placeholder: 'Courte description ou slogan'
          },
          eventType: {
            label: "Type d'evenement",
            otherPlaceholder: 'Saisir le type'
          },
          eventStatus: {
            label: "Statut de l'evenement"
          },
          startDate: {
            label: 'Date de debut'
          },
          endDate: {
            label: 'Date de fin'
          },
          durationHint: 'La duree est calculee automatiquement',
          timezone: {
            label: 'Fuseau horaire'
          },
          eventFormat: {
            label: "Format de l'evenement"
          },
          venueAddress: {
            placeholder: "Saisir l'adresse du lieu",
            addToMaps: 'Ajouter aux cartes'
          }
        },
        eventStatus: {
          free: {
            title: 'Evenement gratuit',
            subtitle: 'Pas de billets ni paiements requis.'
          },
          paid: {
            title: 'Evenement payant',
            subtitle: 'Vendez des billets et acceptez les paiements.'
          },
          continuous: {
            title: 'Evenement continu',
            subtitle: 'Pas de date de fin fixe.'
          },
          helper: 'Vous pouvez changer le statut plus tard.'
        },
        capacity: {
          title: "Capacite et liste d'attente",
          limitLabel: 'Limiter la capacite',
          maxAttendees: 'Participants maximum',
          maxAttendeesPlaceholder: 'ex. 500',
          waitlistLabel: "Activer la liste d'attente",
          enabled: 'Activee',
          disabled: 'Desactivee',
          waitlistCapacity: "Capacite de la liste d'attente",
          waitlistPlaceholder: 'ex. 100',
          waitlistHelper: "La liste d'attente ouvre quand les billets sont epuises.",
          waitlistEnabledNote: "Liste d'attente activee. Les participants peuvent s'inscrire quand les billets sont epuises.",
          waitlistDisabledNote: "Liste d'attente desactivee. Les inscriptions s'arretent a la capacite."
        },
        designChoice: {
          title: 'Choisissez votre chemin de configuration',
          subtitle: "Choisissez comment construire l'experience de votre evenement.",
          designStudio: {
            title: 'Design Studio',
            body: 'Construisez une page evenement sur mesure avec des blocs.',
            cta: 'Ouvrir Design Studio',
            note: "Ideal pour une experience de marque."
          },
          registration: {
            title: "Constructeur d'inscriptions",
            body: "Configurez d'abord les inscriptions et les billets.",
            cta: 'Commencer les inscriptions',
            note: 'Ideal pour un demarrage rapide.'
          },
          helper: 'Vous pourrez changer plus tard.'
        },
        proTip: {
          title: 'Astuce pro :',
          body: 'Enregistrez souvent pour garder vos donnees synchronisees.'
        },
        nextStep: 'Continuer vers le design',
        errors: {
          nameRequired: "Le nom de l'evenement est obligatoire.",
          datesRequired: "Veuillez selectionner les dates de debut et de fin.",
          startDatePast: "La date de debut ne peut pas etre dans le passe.",
          endDateBeforeStart: "La date de fin ne peut pas etre anterieure a la date de debut."
        }
      },
      designStudio: {
        title: 'Design Studio',
        subtitle: 'Creez une page evenement avec des blocs et du branding.',
        searchPlaceholder: 'Rechercher des blocs...',
        filters: {
          all: 'Tous',
          added: 'Ajoutes',
          addedCount: 'Ajoutes ({count})',
          free: 'Gratuit',
          pro: 'Pro'
        },
        availableBlocks: {
          title: 'Blocs disponibles'
        },
        blocks: {
          hero: {
            name: 'Hero',
            description: 'Banniere principale avec titre, date et appel a action.'
          },
          about: {
            name: 'A propos',
            description: "Description de l'evenement avec image et points forts."
          },
          details: {
            name: "Details de l'evenement",
            description: 'Infos cles : date, lieu et capacite.'
          },
          agenda: {
            name: 'Agenda',
            description: 'Programme des sessions et intervenants.'
          },
          speakers: {
            name: 'Intervenants',
            description: 'Mettez en avant vos intervenants.'
          },
          tickets: {
            name: 'Billets',
            description: 'Tarifs et avantages des billets.'
          },
          footer: {
            name: 'Pied de page',
            description: 'Section de fin avec liens et contact.'
          },
          videoHero: {
            name: 'Hero video',
            description: 'Hero avec video en arriere-plan.'
          },
          sponsors: {
            name: 'Sponsors',
            description: 'Grille de logos et niveaux sponsors.'
          },
          countdown: {
            name: 'Compte a rebours',
            description: "Minuteur jusqu'au debut."
          },
          testimonials: {
            name: 'Temoignages',
            description: 'Carousel de retours et avis.'
          },
          customHtml: {
            name: 'HTML personnalise',
            description: 'Integrez du HTML ou des widgets.'
          },
          sponsorPackages: {
            name: 'Forfaits Sponsors',
            description: 'Affichez les niveaux et offres de parrainage.'
          },
          networking: {
            name: 'Reseautage B2B',
            description: 'Espace reseautage avec mise en relation et rendez-vous.'
          },
          attendees: {
            name: 'Participants',
            description: 'Presentez les participants dans un carrousel.'
          }
        },
        branding: {
          title: 'Branding',
          subtitle: 'Personnalisez l\'identite de marque de votre evenement.',
          color: 'Couleur de marque',
          logo: 'Logo',
          logoSize: 'Taille du logo',
          uploadLogo: 'Televerser le logo',
          replaceLogo: 'Remplacer le logo',
          uploading: 'Televersement...',
          fontFamily: 'Police',
          buttonRoundness: 'Arrondi des boutons : {value}px',
          square: 'Carre',
          rounded: 'Arrondi',
          apply: 'Appliquer le branding',
          fonts: {
            inter: 'Inter',
            roboto: 'Roboto',
            poppins: 'Poppins',
            montserrat: 'Montserrat',
            openSans: 'Open Sans',
            lato: 'Lato'
          }
        },
        activeBlocks: {
          title: 'Blocs actifs ({count})',
          clearAll: 'Tout supprimer',
          confirmClearAll: 'Supprimer tous les blocs ?',
          confirmRemove: 'Supprimer "{name}" ?',
          emptyTitle: 'Aucun bloc ajoute',
          emptySubtitle: 'Commencez par ajouter des blocs.'
        },
        hint: {
          title: 'Commencez par des blocs',
          description: 'Glissez-deposez les blocs pour construire votre page.',
          dismiss: 'Fermer'
        },
        preview: {
          devices: {
            desktop: 'Bureau',
            tablet: 'Tablette',
            mobile: 'Mobile'
          },
          zoomOut: 'Zoom arriere',
          zoomIn: 'Zoom avant',
          reset: 'Reinitialiser le zoom',
          live: 'Apercu en direct',
          fullscreen: 'Plein ecran',
          newTab: 'Ouvrir dans un nouvel onglet',
          url: "URL d'aperçu"
        },
        hero: {
          title: "Titre de l'evenement",
          subtitle: "Decrivez l'evenement en une phrase.",
          category: 'Conference',
          actions: {
            edit: 'Modifier',
            editLabel: 'Modifier le hero',
            changeBackground: "Changer l'arriere-plan",
            editText: 'Modifier le texte',
            changeColors: 'Changer les couleurs'
          },
          primaryCta: "S'inscrire",
          secondaryCta: 'En savoir plus'
        },
        about: {
          blockName: 'A propos',
          eyebrow: "A propos de l'evenement",
          heading: "A propos de cet evenement",
          headingWithName: 'A propos de {name}',
          primaryText: "Racontez l'histoire de l'evenement et ce que les participants vont vivre.",
          secondaryText: 'Mettez en avant les sujets, intervenants et points clefs.',
          features: [
            'Experts du secteur et panels',
            'Ateliers pratiques et reseautage',
            'Insights actionnables'
          ],
          actions: {
            changeImage: "Changer l'image",
            editContent: 'Modifier le contenu'
          },
          imagePlaceholder: 'Image'
        },
        details: {
          blockName: 'Details',
          title: "Details de l'evenement",
          labels: {
            when: 'Quand',
            where: 'Ou',
            who: 'Qui'
          },
          tbd: 'A definir',
          openAttendance: 'Ouvert a tous',
          capacityValue: '{count} places',
          audience: 'Ouvert a tous',
          locationSet: 'Lieu defini',
          locationPending: 'Lieu a definir',
          actions: {
            editDate: 'Modifier la date',
            editLocation: 'Modifier le lieu',
            editCapacity: 'Modifier la capacite'
          }
        },
        speakers: {
          blockName: 'Intervenants',
          title: 'Intervenants principaux',
          subtitle: 'Decouvrez les experts.',
          actions: {
            add: 'Ajouter un intervenant',
            manage: 'Gerer les intervenants'
          },
          initialsFallback: 'SP',
          companyAt: 'chez {company}',
          samples: [
            { name: 'Alex Morgan', title: 'Head of Product', company: 'NovaLabs', color: '#E0E7FF' },
            { name: 'Priya Patel', title: 'Design Lead', company: 'Studio Nine', color: '#FEE2E2' },
            { name: 'Marcus Lee', title: 'CTO', company: 'CloudWorks', color: '#DCFCE7' }
          ]
        },
        agenda: {
          blockName: 'Agenda',
          title: 'Agenda',
          subtitle: 'Explorez les sessions et le programme.',
          actions: {
            addSession: 'Ajouter une session',
            manageSchedule: "Gerer l'agenda"
          },
          days: [
            { day: 1, label: 'Jour 1' },
            { day: 2, label: 'Jour 2' }
          ],
          sessions: [
            {
              day: 1,
              time: '09:00',
              duration: '60 min',
              title: "Keynote d'ouverture : le futur des evenements",
              speaker: 'Alex Morgan',
              location: 'Scene principale',
              tags: ['Keynote', 'Tendances']
            },
            {
              day: 1,
              time: '10:30',
              duration: '45 min',
              title: 'Concevoir des experiences qui convertissent',
              speaker: 'Priya Patel',
              location: 'Salle A',
              tags: ['Design', 'Croissance']
            },
            {
              day: 2,
              time: '09:30',
              duration: '50 min',
              title: "Scaler l'operation des inscriptions",
              speaker: 'Marcus Lee',
              location: 'Salle B',
              tags: ['Operations']
            }
          ]
        },
        tickets: {
          blockName: 'Billets',
          title: 'Choisissez votre billet',
          subtitle: "Selectionnez l'option qui vous convient.",
          actions: {
            manage: 'Gerer les billets',
            editPricing: 'Modifier les tarifs'
          },
          mostPopular: 'Le plus populaire',
          perPerson: 'par personne',
          select: 'Choisir le billet',
          samples: [
            {
              name: 'Acces general',
              price: '$99',
              popular: false,
              features: ['Acces a toutes les sessions', 'Pauses reseautage', "Materiel de l'evenement"]
            },
            {
              name: 'Pass VIP',
              price: '$199',
              popular: true,
              features: ['Places prioritaires', 'Acces au lounge VIP', 'Rencontre speakers']
            },
            {
              name: 'Pass atelier',
              price: '$149',
              popular: false,
              features: ['Ateliers pratiques', 'Certificat', 'Q&A prioritaire']
            }
          ]
        },
        footer: {
          blockName: 'Pied de page',
          eventName: 'Eventra Conference',
          tagline: 'Creez des experiences memorables',
          location: 'Ville, Pays',
          quickLinksTitle: 'Liens rapides',
          quickLinks: ['A propos', 'Intervenants', 'Agenda', 'Billets'],
          contactTitle: 'Contact',
          contact: {
            email: 'hello@eventra.com',
            phone: '+1 (555) 010-1234'
          },
          copyright: '(c) 2026 Eventra. Tous droits reserves.',
          poweredBy: 'Propulse par',
          brandName: 'Eventra',
          actions: {
            socialLinks: 'Liens sociaux',
            settings: 'Parametres du pied de page'
          }
        },
        editModule: {
          title: 'Modifier {block}',
          label: 'Modifier {block}'
        },
        locked: {
          title: 'Bloc Pro',
          subtitle: 'Passez a Pro pour debloquer ce bloc.',
          cta: 'Passer a Pro',
          note: "Vous pourrez l'ajouter apres la mise a niveau."
        },
        pro: {
          title: 'Debloquez les blocs Pro',
          subtitle: 'Accedez aux sections avancees et au style premium.',
          cta: 'Passer a Pro',
          features: [
            'Blocs video, sponsors et compte a rebours',
            'Personnalisation avancee',
            'Support prioritaire'
          ]
        },
        tiers: {
          free: 'GRATUIT',
          pro: 'PRO'
        },
        errors: {
          saveFirst: "Enregistrez votre evenement avant de modifier le design.",
          uploadFirst: "Enregistrez votre evenement avant de televerser un logo.",
          uploadFailed: 'Echec du televersement du logo.'
        },
        settingsComingSoon: 'Parametres pour {block} bientot disponibles.',
        upgradeUnlock: 'Passer a Pro pour debloquer',
        modals: {
          heroBlock: {
            title: 'Parametres de la section Hero',
            subtitle: 'Personnalisez la banniere hero de votre page.',
            sections: {
              backgroundImage: 'Image d\'arriere-plan',
              textContent: 'Contenu textuel',
              primaryButton: 'Bouton principal',
              secondaryButton: 'Bouton secondaire'
            },
            labels: {
              heroBannerImage: 'Image banniere Hero',
              uploading: 'Televersement...',
              clickToUpload: 'Cliquer pour televerser',
              fileTypes: 'PNG, JPG, WebP jusqu\'a 5 Mo',
              change: 'Modifier',
              eventTitle: 'Titre de l\'evenement',
              taglineSubtitle: 'Slogan / Sous-titre',
              visible: 'Visible',
              text: 'Texte',
              actionLocked: 'Action (verrouille)',
              registrationPage: 'Page d\'inscription',
              linkAction: 'Lien / Action'
            },
            placeholders: {
              title: 'Entrez le titre...',
              subtitle: 'Entrez un court slogan...'
            },
            actions: {
              cancel: 'Annuler',
              updating: 'Mise a jour...',
              updateSection: 'Mettre a jour'
            }
          },
          aboutBlock: {
            title: 'Parametres de la section A propos',
            subtitle: 'Presentez votre evenement aux participants.',
            labels: {
              sectionImage: 'Image de section',
              uploadImage: 'Televerser une image',
              sectionHeadline: 'Titre de section',
              briefSummary: 'Resume',
              keyHighlights: 'Points cles',
              mainInformation: 'Informations principales'
            },
            placeholders: {
              headline: 'ex: A propos de cet evenement',
              summary: 'Decrivez votre evenement...',
              description: 'Description detaillee...',
              addBullet: 'Ajouter un point cle...'
            },
            emptyHighlights: 'Aucun point cle ajoute.',
            actions: {
              cancel: 'Annuler',
              updating: 'Mise a jour...',
              updateSection: 'Mettre a jour'
            }
          },
          countdownBlock: {
            title: 'Parametres du compte a rebours',
            subtitle: 'Configurez l\'affichage du compte a rebours.',
            sections: { sectionHeader: 'Affichage du compte a rebours', callToAction: 'Appel a l\'action' },
            labels: {
              mainTitle: 'Titre de la section',
              subtitleLabel: 'Sous-titre',
              buttonText: 'Texte du bouton',
              buttonLink: 'Lien du bouton'
            },
            placeholders: {
              title: 'ex: L\'evenement commence dans...',
              subtitle: 'ex: Ne manquez pas !',
              buttonText: 'ex: S\'inscrire',
              buttonLink: 'https://...'
            },
            autoSync: 'Le compte a rebours se synchronise automatiquement avec la date de debut definie a l\'<strong>etape 1</strong>.',
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          customHtmlBlock: {
            title: 'Parametres HTML personnalise',
            subtitle: 'Ajoutez du contenu HTML personnalise.',
            sections: { sectionHeader: 'Contenu HTML' },
            labels: { htmlContent: 'Contenu HTML' },
            placeholders: { htmlContent: '<div>Votre HTML ici...</div>' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          exhibitorsBlock: {
            title: 'Parametres des exposants',
            subtitle: 'Configurez la section des exposants.',
            sections: { sectionHeader: 'En-tete de section', displayOptions: 'Options d\'affichage' },
            labels: {
              mainTitle: 'Titre de la section',
              subtitleLabel: 'Sous-titre',
              enableSearchBar: 'Activer la barre de recherche',
              searchBarDesc: 'Permettre aux visiteurs de rechercher des exposants par nom',
              showBoothNumbers: 'Afficher les numeros de stand',
              boothNumbersDesc: 'Afficher les numeros de stand sur les cartes des exposants'
            },
            placeholders: { title: 'ex: Nos exposants', subtitle: 'ex: Rencontrez les entreprises' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          footerBlock: {
            title: 'Parametres du pied de page',
            subtitle: 'Personnalisez le pied de page.',
            sections: { contactCopyright: 'Contact et copyright', socialMedia: 'Reseaux sociaux', externalLinks: 'Liens utiles' },
            labels: {
              copyrightNotice: 'Mention de copyright',
              supportEmail: 'Email de contact',
              contactNumber: 'Numero de telephone'
            },
            placeholders: {
              copyright: 'ex: © 2026 Votre evenement. Tous droits reserves.',
              email: 'hello@exemple.com',
              phone: '+1 (555) 123-4567',
              facebook: 'https://facebook.com/votre-evenement',
              twitter: 'https://twitter.com/votre-evenement',
              linkedin: 'https://linkedin.com/company/votre-evenement',
              instagram: 'https://instagram.com/votre-evenement',
              linkLabel: 'Nom du lien',
              linkUrl: 'https://...'
            },
            emptyLinks: 'Aucun lien ajoute. Ajoutez votre premier lien ci-dessus.',
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateFooter: 'Mettre a jour le pied de page' }
          },
          mapBlock: {
            title: 'Parametres de la carte',
            subtitle: 'Configurez la carte du lieu.',
            sections: { sectionHeader: 'En-tete de section', locationInfo: 'Coordonnees du lieu' },
            labels: { mainTitle: 'Titre principal', subtitleLabel: 'Sous-titre', latitude: 'Latitude', longitude: 'Longitude' },
            placeholders: { title: 'ex: Lieu de l\'evenement', subtitle: 'ex: Retrouvez-nous ici', latitude: 'ex: 25.2048', longitude: 'ex: 55.2708' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          networkingBlock: {
            title: 'Parametres du reseautage',
            subtitle: 'Configurez la section reseautage.',
            sections: { sectionContent: 'Contenu de la section' },
            labels: {
              mainTitle: 'Titre de la section',
              highlightTagline: 'Slogan accrocheur',
              description: 'Description',
              ctaButtonText: 'Texte du bouton'
            },
            placeholders: {
              title: 'ex: Espace reseautage',
              tagline: 'ex: Connectez-vous avec les leaders du secteur',
              description: 'ex: Decrivez les opportunites de reseautage...',
              ctaText: 'ex: Commencer le reseautage'
            },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          attendeesBlock: {
            title: 'Parametres des participants',
            subtitle: 'Configurez la section participants.',
            sections: { sectionContent: 'Contenu de la section', displayOptions: 'Options d\'affichage' },
            labels: {
              mainTitle: 'Titre de la section',
              subtitle: 'Sous-titre',
              showCount: 'Afficher le nombre',
              cardsPerPage: 'Cartes par page',
              autoSlide: 'Defilement automatique'
            },
            placeholders: {
              title: 'ex: Nos participants',
              subtitle: 'ex: Decouvrez les professionnels qui participent'
            },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          socialFeedBlock: {
            title: 'Parametres du fil social',
            subtitle: 'Configurez l\'affichage des reseaux sociaux.',
            sections: { sectionHeader: 'En-tete de section', displayOptions: 'Options d\'affichage' },
            labels: { mainTitle: 'Titre principal', subtitleLabel: 'Sous-titre', twitterHandle: 'Compte Twitter/X', instagramHandle: 'Compte Instagram' },
            placeholders: { title: 'ex: Fil social', subtitle: 'ex: Rejoignez la conversation', twitterHandle: '@votreevenement', instagramHandle: '@votreevenement' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          sponsorPackagesBlock: {
            title: 'Parametres des forfaits sponsors',
            subtitle: 'Configurez l\'affichage des forfaits.',
            sections: { sectionHeader: 'En-tete de section', callToAction: 'Appel a l\'action' },
            labels: { mainTitle: 'Titre principal', subtitleLabel: 'Sous-titre', highlightedPackage: 'Forfait mis en avant', buttonText: 'Texte du bouton', linkUrl: 'URL du lien', enabled: 'Active' },
            placeholders: { title: 'ex: Forfaits de sponsoring', subtitle: 'ex: Devenez partenaire', highlightedPackage: 'ex: Or', buttonText: 'ex: Devenir sponsor', linkUrl: 'https://...' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          sponsorsBlock: {
            title: 'Parametres des sponsors',
            subtitle: 'Configurez l\'affichage des sponsors.',
            sections: { sectionHeader: 'En-tete de section' },
            labels: { mainTitle: 'Titre principal', subtitleLabel: 'Sous-titre', becomeSponsorButton: 'Bouton devenir sponsor', buttonText: 'Texte du bouton', linkUrl: 'URL du lien', enabled: 'Active' },
            placeholders: { title: 'ex: Nos sponsors', subtitle: 'ex: Merci a nos sponsors', buttonText: 'ex: Devenir sponsor', linkUrl: 'https://...' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          testimonialsBlock: {
            title: 'Parametres des temoignages',
            subtitle: 'Configurez l\'affichage des temoignages.',
            sections: { sectionHeader: 'En-tete de section', displayOptions: 'Options d\'affichage' },
            labels: { mainTitle: 'Titre principal', subtitleLabel: 'Sous-titre', showStarRatings: 'Afficher les etoiles', starRatingsDesc: 'Afficher les notes sur les cartes' },
            placeholders: { title: 'ex: Ce qu\'on en dit', subtitle: 'ex: Les avis de nos participants' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          videoHeroBlock: {
            title: 'Parametres du Hero Video',
            subtitle: 'Configurez la section hero video.',
            sections: { cinematicContent: 'Contenu cinematique', textOverlay: 'Texte superpose', callToAction: 'Appel a l\'action' },
            labels: { backgroundVideoUrl: 'URL de la video', videoHint: 'Utilisez le format MP4 ou WebM', mainHeadline: 'Titre principal', subHeadline: 'Sous-titre', buttonText: 'Texte du bouton' },
            placeholders: { videoUrl: 'https://exemple.com/video.mp4', title: 'ex: Bienvenue', subtitle: 'ex: Une experience inoubliable', buttonText: 'ex: S\'inscrire' },
            actions: { cancel: 'Annuler', updating: 'Mise a jour...', updateSection: 'Mettre a jour' }
          },
          speakersGrid: {
            title: 'Paramètres de la grille des intervenants',
            upgrade: {
              title: 'La grille des intervenants est une fonctionnalité Pro',
              description: 'Passez à Pro pour personnaliser la mise en page et le contenu.',
              cta: 'Passer à Pro',
              learnMore: 'En savoir plus'
            },
            labels: {
              numberOfSpeakers: 'Nombre d\'intervenants',
              layout: 'Disposition',
              speakers: 'Intervenants ({count})',
              photo: 'Photo',
              upload: 'Télécharger',
              name: 'Nom',
              speakerTitle: 'Titre',
              company: 'Entreprise',
              bio: 'Bio'
            },
            layouts: {
              twoCols: '2 colonnes',
              threeCols: '3 colonnes',
              fourCols: '4 colonnes'
            },
            placeholders: {
              defaultSpeaker: 'Intervenant {index}',
              speakerName: 'Nom de l\'intervenant',
              jobTitle: 'Poste',
              companyName: 'Nom de l\'entreprise',
              bio: 'Courte biographie...'
            },
            actions: {
              removeSpeaker: 'Supprimer',
              addSpeaker: '+ Ajouter un intervenant',
              restoreDefault: 'Restaurer par défaut',
              cancel: 'Annuler',
              saveChanges: 'Enregistrer les modifications'
            }
          }
        }
      }
    },
    businessProfileWizard: {
        title: 'Place de marché Eventra',
        saving: 'Enregistrement...',
        steps: {
          essentials: 'Essentiels',
          sectors: 'Secteurs',
          offerings: 'Offres',
          identity: 'Identité'
        },
        actions: {
          saveExit: 'Sauvegarder & Quitter',
          back: 'Retour',
          next: 'Étape suivante',
          createProfile: 'Créer le profil',
          addOffering: 'Ajouter une offre',
          cancel: 'Annuler',
          save: 'Enregistrer'
        },
        essentials: {
          title: 'Essentiels de l\'entreprise',
          companyName: 'Nom de l\'entreprise *',
          companyNamePlaceholder: 'Entrez le nom légal de votre entreprise',
          companySize: 'Taille de l\'entreprise *',
          companySizePlaceholder: 'Sélectionnez la taille',
          companyDescription: 'Description de l\'entreprise *',
          companyDescriptionPlaceholder: 'Parlez-nous de votre entreprise...',
          legalDocs: 'Documents légaux / fiscaux',
          uploadHint: 'Cliquez pour',
          uploadBrowse: 'Parcourir',
          uploadSupport: 'Supporté : PDF, JPG, PNG (Max 5Mo)',
          charCount: '{count}/500 caractères',
          errors: {
            nameRequired: 'Le nom de l\'entreprise est requis.',
            sizeRequired: 'La taille de l\'entreprise est requise.',
            descRequired: 'La description est requise.',
            completeEssentials: 'Complétez les essentiels avant de télécharger des fichiers.'
          }
        },
        sectors: {
          title: 'Sélectionnez vos secteurs d\'activité',
          subtitle: 'Ajoutez des tags pour décrire votre industrie. Tapez et appuyez sur Entrée.',
          placeholder: 'Ajouter un secteur (ex. SaaS, Restauration, IA)...',
          hint: '💡 Commencez à taper pour ajouter des tags. Entrée pour valider.',
          errors: {
            atLeastOne: 'Ajoutez au moins un secteur pour continuer.'
          }
        },
        offerings: {
          title: 'Que proposez-vous ?',
          emptyTitle: 'Aucune offre ajoutée. Cliquez sur "Ajouter une offre" pour commencer.',
          modal: {
            title: 'Ajouter une nouvelle offre',
            type: 'Type',
            product: 'Produit',
            service: 'Service',
            basicInfo: 'Informations de base',
            name: 'Nom *',
            namePlaceholder: 'ex. Plateforme d\'analyse d\'événements',
            description: 'Description',
            descPlaceholder: 'Brève description de votre offre...',
            pricing: 'Prix & Inventaire',
            currency: 'Devise',
            price: 'Prix',
            quantity: 'Quantité',
            unlimited: 'Illimité',
            tags: 'Tags / Spécifications',
            tagsPlaceholder: 'Tapez un tag et Entrée (ex. SaaS, Analytics)...',
            images: 'Images',
            imagesHint: 'Télécharger des images (Max 4)',
            coverHint: 'La première image servira de couverture',
            coverBadge: 'COUVERTURE',
            addBtn: 'Ajouter l\'offre'
          },
          errors: {
            maxImages: 'Vous pouvez télécharger jusqu\'à 4 images.'
          }
        },
        identity: {
          title: 'Identité & Contact',
          branding: 'Image de marque',
          logo: 'Logo de l\'entreprise',
          uploadLogo: 'Télécharger le logo',
          cover: 'Image de couverture',
          uploadCover: 'Télécharger l\'image (1200x400)',
          contact: 'Coordonnées',
          email: 'Email professionnel *',
          phone: 'Numéro de téléphone',
          website: 'Site web',
          address: 'Adresse professionnelle',
          published: 'Profil professionnel publié et envoyé pour validation !',
          saved: 'Profil professionnel enregistré'
        },
        toasts: {
          fileUploaded: 'Fichier téléchargé',
          imageUploaded: 'Image téléchargée'
        }
      },
      businessDashboard: {
        tabs: {
          dashboard: 'Tableau de bord',
          profile: 'Détails du profil',
          team: 'Membres de l\'équipe',
          products: 'Produits & Services',
          visibility: 'Visibilité & Portée',
          appearance: 'Apparence',
          analytics: 'Analytique'
        },
        status: {
          draft: 'Brouillon - Non visible',
          pending: 'Validation en attente',
          live: 'En ligne sur la place de marché'
        },
        actions: {
          editWizard: 'Modifier dans l\'assistant',
          viewProfile: 'Voir le profil entreprise',
          viewPublic: 'Voir le profil public',
          createProfile: 'Créer un profil entreprise',
          requestValidation: 'Demander la validation'
        },
        loading: 'Chargement...',
        notFound: 'Aucun profil entreprise trouvé',
        strength: {
          title: 'Force du profil',
          complete: 'Complet',
          basicInfo: 'Infos de base complètes',
          basicInfoIncomplete: 'Complétez les infos de base',
          offeringsNeeded: 'Ajoutez {count} offre(s) de plus',
          offeringsComplete: 'Offres complètes',
          docsUploaded: 'Documents légaux téléchargés',
          uploadDocs: 'Télécharger les documents légaux',
          improve: 'Améliorer le score'
        },
        stats: {
          views: 'Vues du profil',
          leads: 'Leads qualifiés',
          shortlisted: 'Annonces sauvegardées',
          savedUsers: 'Utilisateurs ayant sauvegardé',
          contactClicks: 'Clics sur contact',
          last30days: '30 derniers jours'
        },
        profile: {
          title: 'Détails du profil',
          subtitle: 'Mettez à jour les informations de votre entreprise et les détails de l\'annonce publique.',
          essentials: 'Essentiels de l\'entreprise',
          companyName: 'Nom de l\'entreprise *',
          companySize: 'Taille de l\'entreprise *',
          description: 'Description de l\'entreprise *',
          legalDocs: 'Documents légaux / fiscaux',
          sectors: {
            title: 'Secteurs d\'activité',
            subtitle: 'Ajoutez des tags pour décrire votre industrie. Tapez et appuyez sur Entrée.'
          },
          branding: {
            title: 'Image de marque',
            logo: 'Logo de l\'entreprise',
            cover: 'Image de couverture'
          },
          contact: {
            title: 'Coordonnées',
            email: 'Email professionnel *',
            phone: 'Numéro de téléphone',
            website: 'Site web',
            address: 'Adresse professionnelle'
          },
          save: 'Enregistrer le profil',
          saving: 'Enregistrement...'
        },
        team: {
          title: 'Gestion de l\'équipe',
          addMember: 'Ajouter un membre',
          table: {
            name: 'Nom',
            role: 'Rôle',
            status: 'Statut'
          },
          roles: {
            owner: 'Propriétaire',
            admin: 'Admin',
            member: 'Membre',
            viewer: 'Spectateur'
          },
          actions: {
            makeAdmin: 'Rendre Admin',
            setMember: 'Définir comme Membre',
            remove: 'Retirer le membre'
          }
        },
        visibility: {
          title: 'Visibilité & Portée',
          geographic: {
            title: 'Portée géographique',
            label: 'Pays desservis',
            select: 'Sélectionner des pays',
            selected: '{count} pays sélectionnés',
            search: 'Rechercher des pays...',
            clear: 'Effacer'
          },
          sectors: {
            title: 'Secteurs d\'activité',
            primary: 'Secteur primaire',
            secondary: 'Secteur secondaire'
          },
          publicListing: {
            title: 'Annonce publique',
            subtitle: 'Autoriser votre entreprise à apparaître sur la place de marché',
            hint: 'Nécessite la validation d\'un administrateur avant la mise en ligne'
          }
        },
        appearance: {
          title: 'Paramètres d\'apparence',
          accentColor: {
            title: 'Couleur de la marque',
            subtitle: 'Choisissez une couleur qui représente votre marque'
          },
          layout: {
            title: 'Mise en page du profil',
            standard: 'Mise en page standard',
            standardDesc: 'Image de couverture en haut',
            modern: 'Mise en page moderne',
            modernDesc: 'En-tête divisé'
          }
        },
        analytics: {
          title: 'Analytique commerciale',
          subtitle: 'Suivez la visibilité, le flux de leads et l\'engagement.',
          actions: {
            refresh: 'Actualiser',
            export: 'Exporter CSV',
            snapshot: 'Instantané',
            share: 'Partager',
            email: 'Résumé par email',
            compare: 'Comparer',
            reset: 'Réinitialiser'
          },
          engagement: {
            title: 'Tendance d\'engagement',
            leadConversion: 'Conversion de leads',
            saveRate: 'Taux de sauvegarde'
          },
          highlights: {
            title: 'Faits saillants du marché',
            topSector: 'Intérêt sectoriel principal',
            trendingRegion: 'Région tendance',
            profileStrength: 'Force du profil'
          }
        },
        modals: {
          addMember: {
            title: 'Ajouter un membre',
            searchLabel: 'Rechercher par nom ou email',
            searchPlaceholder: 'Tapez au moins 2 caractères...',
            noResults: 'Aucun utilisateur trouvé correspondant à "{query}"',
            info: 'Vous pouvez ajouter tout utilisateur Eventra existant à votre équipe en recherchant son nom ou son adresse email.',
            cancel: 'Annuler',
            sendInvite: 'Envoyer l\'invitation',
            addToTeam: 'Ajouter à l\'équipe'
          }
        }
      },
      businessProfilePage: {
        manageButton: 'Gérer l\'entreprise',
        verified: 'Entreprise vérifiée',
        legalVerified: 'Documents légaux vérifiés',
        about: 'À propos de nous',
        noDescription: 'Aucune description fournie.',
        noSectors: 'Aucun secteur ajouté',
        employees: '{count} Employés',
        locationTbd: 'Lieu à définir',
        notFound: 'Entreprise non trouvée.',
        stats: {
          reviews: '({count} avis)',
          eventsManaged: '{count} événements gérés',
          memberSince: 'Membre depuis {year}'
        },
        team: {
          title: 'Notre équipe',
          addMember: 'Ajouter un membre'
        },
        offerings: {
          title: 'Nos offres',
          empty: 'Aucune offre listée.',
          free: 'Gratuit'
        },
        contact: {
          title: 'Coordonnées',
          businessEmail: 'Email professionnel'
        },
        follow: 'Suivez-nous',
        b2b: {
          title: 'Matchmaking B2B',
          seeking: 'Recherche',
          offering: 'Offre',
          placeholder: 'Tapez et appuyez sur Entrée...'
        },
        specializations: 'Spécialisations',
        cta: {
          title: 'Intéressé par nos services ?',
          subtitle: 'Contactez-nous pour discuter de la façon dont nous pouvons vous aider pour votre prochain événement.',
          button: 'Demander un devis'
        },
        actions: {
          contact: 'Contacter l\'entreprise',
          save: 'Enregistrer',
          share: 'Partager le profil',
          edit: 'Modifier le profil',
          saveChanges: 'Enregistrer',
          cancel: 'Annuler'
        },
        toasts: {
          linkCopied: 'Lien du profil copié.',
          copyFailed: 'Échec de la copie du lien.',
          profileUpdated: 'Profil mis à jour',
          userAlreadyMember: 'L\'utilisateur est déjà membre de l\'équipe.',
          memberAdded: '{name} ajouté avec succès.'
        }
      },
      publicProfilePage: {
        notFound: {
          title: 'Profil introuvable',
          subtitle: 'Le profil que vous recherchez n\'existe pas ou a ete rendu prive.',
          returnHome: 'Retour a l\'accueil'
        },
        defaults: {
          fullName: 'Utilisateur Eventra'
        },
        actions: {
          back: 'Retour',
          requestMeeting: 'Demander une reunion',
          sendMessage: 'Envoyer un message',
          editProfile: 'Modifier le profil'
        },
        toasts: {
          linkCopied: 'Lien du profil copie.'
        },
        badges: {
          openToNetworking: 'Ouvert au networking'
        },
        details: {
          bornOn: 'Ne le {date}'
        },
        sections: {
          about: 'A propos',
          professionalInfo: 'Informations professionnelles',
          skills: 'Competences et expertise',
          interests: 'Interets professionnels',
          education: 'Education et certifications',
          lookingFor: 'Ce que je recherche',
          industriesOfInterest: 'Secteurs d\'interet',
          discussionTopics: 'Sujets que je peux aborder'
        },
        labels: {
          industry: 'Industrie',
          otherIndustry: 'Autre',
          department: 'Departement',
          experience: 'Experience',
          yearsExperience: '{count} ans',
          companySize: 'Taille de l\'entreprise'
        },
        placeholders: {
          noBio: 'Aucune biographie fournie.'
        },
        lookingFor: {
          clients: 'Clients potentiels / clients',
          partnerships: 'Opportunites de partenariat',
          learning: 'Apprendre des experts du secteur',
          investment: 'Investissement / financement',
          hiring: 'Recruter des talents',
          sharing: 'Partager des connaissances / expertise'
        },
        expertise: {
          expert: 'Expert',
          intermediate: 'Intermediaire',
          beginner: 'Debutant'
        },
        b2b: {
          title: 'Profil networking B2B',
          subtitle: 'Comment je peux aider et ce que je recherche'
        },
        meeting: {
          title: 'Disponibilite des reunions',
          availability: {
            title: 'Statut de disponibilite',
            always: 'Toujours ouvert aux demandes de reunion',
            eventsOnly: 'Seulement aux evenements participes',
            closed: 'N\'accepte pas de reunions actuellement',
            open: 'Ouvert aux demandes de reunion'
          },
          formats: {
            title: 'Format de reunion prefere',
            inPerson: 'En personne',
            virtual: 'Virtuel',
            phone: 'Telephone'
          },
          durationTitle: 'Duree preferee',
          instructions: {
            title: 'Lors d\'une demande de reunion :',
            placeholder: 'Veuillez indiquer les sujets que vous souhaitez aborder.'
          }
        },
        connect: {
          title: 'Restons en contact',
          subtitle: 'Planifiez une reunion pour discuter des opportunites de collaboration'
        },
        activity: {
          title: 'Activite du profil',
          views: 'Vues du profil',
          connections: 'Connexions',
          meetings: 'Reunions',
          responseRate: 'Taux de reponse'
        },
        connectElsewhere: {
          title: 'Me retrouver ailleurs',
          linkedin: 'LinkedIn',
          twitter: 'Twitter',
          website: 'Site web'
        },
        proUpsell: {
          title: 'Gagnez en visibilite',
          subtitle: 'Passez a PRO pour afficher des endorsements, badges mis en avant et apparaitre plus haut dans les resultats.',
          button: 'Passer a PRO'
        },
        modal: {
          title: 'Demander une reunion',
          withName: 'avec {name}',
          placeholder: 'Bonjour, j\'aimerais discuter...',
          cancel: 'Annuler',
          send: 'Envoyer la demande'
        }
      },
      productsManagement: {
        title: 'Produits & Services',
        subtitle: 'Gerez vos offres, tarifs et informations produits',
        addProduct: 'Ajouter un produit',
        editProduct: 'Modifier le produit',
        addNewProduct: 'Ajouter un nouveau produit',
        updateProduct: 'Mettre a jour',
        saveProduct: 'Enregistrer',
        cancel: 'Annuler',
        form: {
          name: 'Nom du produit / service *',
          namePlaceholder: 'ex. Event Analytics Pro',
          sector: 'Secteur *',
          subsector: 'Sous-secteur *',
          description: 'Description *',
          descriptionPlaceholder: 'Decrivez votre produit ou service...',
          price: 'Prix *',
          pricePlaceholder: '499.00',
          currency: 'Devise',
          tags: 'Tags',
          tagsPlaceholder: 'Tapez un tag et appuyez sur Entree',
          mainImage: 'Image principale du produit *',
          uploadMain: "Cliquez pour telecharger l'image principale",
          imageUploaded: 'Image telechargee - Cliquez pour changer',
          gallery: 'Images de la galerie (Max 4)',
          upload: 'Telecharger'
        },
        toasts: {
          offeringRemoved: 'Offre supprimee',
          offeringSaved: 'Offre enregistree',
          uploadFailed: 'Echec du telechargement'
        }
      },
      constants: {
        sectors: {
          Technology: 'Technologie',
          ProfessionalServices: 'Services Professionnels',
          Marketing: 'Marketing',
          Finance: 'Finance',
          Logistics: 'Logistique',
          Production: 'Production'
        },
        subsectors: {
          'Software Development': 'Developpement Logiciel',
          'Event Tech': 'Tech evenementielle',
          'AI Tools': 'Outils IA',
          'Analytics': 'Analytique',
          'Consulting': 'Conseil',
          'Advisory': 'Avis',
          'Operations': 'Operations',
          'Legal': 'Juridique',
          'Digital Marketing': 'Marketing Digital',
          'Brand Strategy': 'Strategie de Marque',
          'Growth': 'Croissance',
          'Content': 'Contenu',
          'Accounting': 'Comptabilite',
          'Payments': 'Paiements',
          'Investment': 'Investissement',
          'FinTech': 'FinTech',
          'Shipping': 'Expedition',
          'Warehousing': 'Entreposage',
          'Transportation': 'Transport',
          'Fulfillment': 'Execution',
          'A/V Production': 'Production A/V',
          'Stage Design': 'Conception Scenique',
          'Lighting': 'Eclairage',
          'Sound': 'Son'
        },
        countries: [
          'Etats-Unis',
          'Canada',
          'Royaume-Uni',
          'Allemagne',
          'France',
          'Pays-Bas',
          'Espagne',
          'Emirats Arabes Unis',
          'Arabie Saoudite',
          'Qatar',
          'Singapour',
          'Australie'
        ],
        suggestedTags: ['SaaS', 'EventTech', 'Inscription', 'Analytique', 'B2B']
      },
      marketplace: {
        hero: {
          title: 'Trouvez les partenaires parfaits pour votre prochain evenement.',
          searchPlaceholder: 'Rechercher des services, entreprises ou tags...',
          searchButton: 'Rechercher',
          categories: {
            av: 'A/V & Production',
            catering: 'Traiteur',
            tech: 'Tech evenementielle',
            venues: 'Lieux',
            logistics: 'Logistique',
            photography: 'Photographie',
            design: 'Design & Decor',
            marketing: 'Marketing',
            entertainment: 'Divertissement',
            swag: 'Cadeaux & Goodies',
            translation: 'Traduction',
            staffing: 'Personnel'
          }
        },
        filters: {
          active: 'Filtres actifs',
          clearAll: 'Tout effacer',
          sectors: 'Secteurs',
          location: 'Lieu',
          locationPlaceholder: 'Pays / Ville',
          trustBadges: 'Badges de confiance',
          verified: 'Entreprises verifiees uniquement',
          sustainable: 'Durable / Eco-responsable',
          size: 'Taille de l\'entreprise',
          rating: 'Note',
          up: '& Plus',
          sizes: {
            freelancer: 'Freelance',
            sme: 'PME (1-50)',
            enterprise: 'Grande entreprise (500+)'
          }
        },
        recommended: {
          badge: 'Propulse par IA',
          title: 'Recommande pour vous',
          refresh: 'Actualiser',
          match: '95% match',
          aiMatch: 'Match IA'
        },
        results: {
          loading: 'Chargement des entreprises...',
          found: '{count} {label} trouve(s)',
          business: 'Entreprise',
          businesses: 'Entreprises',
          requestQuote: 'Demander un devis',
          noDescription: 'Aucune description fournie.',
          locationTbd: 'Lieu a definir'
        },
        empty: {
          title: 'Aucune entreprise trouvee',
          subtitle: 'Essayez d\'ajuster vos filtres ou criteres de recherche',
          action: 'Effacer tous les filtres'
        }
      },
      businessProductPage: {
        loading: 'Chargement du produit...',
        notFound: {
          title: 'Produit introuvable',
          back: 'Retour au marketplace'
        },
        breadcrumb: {
          marketplace: 'Marketplace'
        },
        tabs: {
          description: 'Description',
          specifications: 'Specifications',
          reviews: 'Avis'
        },
        overview: 'Apercu',
        labels: {
          id: 'ID',
          verified: 'Entreprise verifiee',
          deliveryTime: 'Livraison moyenne : {value}',
          shipsFrom: 'Expedie depuis : {value}'
        },
        types: {
          product: 'Produit',
          service: 'Service professionnel'
        },
        specifications: {
          type: 'Type',
          availability: 'Disponibilite',
          unlimited: 'Illimitee',
          limited: 'Limitee',
          quantity: 'Quantite',
          tags: 'Tags'
        },
        pricing: {
          contact: 'Contactez-nous pour le prix',
          quantityLabel: 'Selectionner la quantite / licences',
          licensesLabel: 'Licences'
        },
        actions: {
          requestQuote: 'Demander un devis',
          messageSeller: 'Contacter le vendeur',
          saved: 'Enregistre',
          wishlist: 'Enregistrer',
          share: 'Partager'
        },
        reviews: {
          count: '({count} avis)',
          globalSatisfaction: 'Satisfaction globale',
          helpful: 'Utile ({count})',
          starsLabel: '{count} etoiles',
          empty: 'Aucun avis pour le moment.'
        },
        seller: {
          about: 'A propos du vendeur',
          verified: 'Vendeur verifie',
          managedBy: 'Gere par',
          response: 'Reponse',
          memberSince: 'Membre depuis',
          memberSinceInline: 'Membre depuis {value}',
          responseInline: 'Repond en {value}',
          viewProfile: 'Voir le profil professionnel',
          fallbackName: 'Vendeur',
          deals: '({count} transactions)'
        },
        features: {
          title: 'Fonctionnalites cles'
        },
        longDescription: {
          overviewTitle: 'Apercu',
          whatYouGetTitle: 'Ce que vous obtenez',
          whyItMattersTitle: 'Pourquoi c\'est important',
          overviewFallback: 'Une offre concue pour les professionnels de l\'evenementiel.',
          whyItMattersBody: 'Aligne sur les besoins des organisateurs qui veulent des resultats fiables et evolutifs.',
          fallbackList: [
            'Solutions adaptees aux equipes evenementielles',
            'Options de livraison flexibles',
            'Support dedie'
          ]
        },
        errors: {
          loginRequired: 'Veuillez vous connecter pour contacter le vendeur.',
          noOwner: 'Les informations du vendeur sont indisponibles.',
          contactSelf: 'Vous ne pouvez pas contacter votre propre annonce.'
        },
        notifications: {
          quoteTitle: 'Demande de devis',
          quoteBody: 'Demande de devis pour {product}.'
        },
        toasts: {
          linkCopied: 'Lien du produit copie.',
          quoteSent: 'Demande de devis envoyee.',
          quoteFailed: 'Echec de la demande de devis.',
          copyFailed: 'Echec de la copie du lien.'
        }
      },
  };
