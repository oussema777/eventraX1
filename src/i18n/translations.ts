export const translations = {
  en: {
    brand: {
      name: 'Eventra'
    },
    nav: {
      communities: {
        label: 'Communities',
        items: [
          'Technology & Software',
          'AI, IoT & Emerging Tech',
          'Developers & Engineers',
          'Financial Services & Banking',
          'Investment & Banking',
          'Audit, Accounting & Finance',
          'Insurance & Microfinance',
          'Healthcare & Pharmaceuticals',
          'Education & Training',
          'Universities & Academies',
          'Students & Researchers',
          'Media & Entertainment',
          'Audiovisual & Creative Industries',
          'Marketing & Advertising',
          'Retail & E-commerce',
          'Manufacturing & Production',
          'Real Estate & Construction',
          'Transportation & Logistics',
          'Energy & Utilities',
          'Hospitality & Tourism',
          'Telecommunications',
          'Agriculture & Food Production',
          'Legal Services',
          'Consulting & Professional Services',
          'Coaches & Trainers',
          'Non-Profit & Civil Society',
          'Government & Public Sector',
          'Entrepreneurs & Startups'
        ]
      },
      marketplace: 'Marketplace',
      browseEvents: 'Browse Events',
      logistics: {
        label: 'Logistic Solutions',
        items: [
          'Freight Calculator: MENA & AFRICA',
          'Load Calculator: MENA & AFRICA',
          'Container Shipping Costs: Informations'
        ]
      },
      auth: {
        login: 'Login',
        signUp: 'Sign Up'
      },
      language: {
        label: 'Language',
        en: 'English',
        fr: 'French'
      },
      userMenu: {
        myProfile: 'My Profile',
        businessProfile: 'Business Profile',
        myEvents: 'My Events',
        myB2bArea: 'My B2B Area',
        myNetworking: 'My Networking',
        messages: 'Messages',
        viewMessages: 'View Messages',
        logout: 'Logout'
      },
      placeholders: {
        userName: 'User',
        userEmail: 'user@example.com'
      }
    },
    browseEventsPage: {
      hero: {
        title: 'Discover Your Next Experience',
        searchPlaceholder: 'Search events, topics, or speakers...',
        locationPlaceholder: 'City or Online',
        datePlaceholder: 'Any Date'
      },
      filters: {
        title: 'Filters',
        clearAll: 'Clear All',
        clearFilters: 'Clear Filters',
        format: {
          title: 'Format',
          all: 'All Formats',
          'in-person': 'In person',
          virtual: 'Virtual',
          hybrid: 'Hybrid'
        },
        category: {
          title: 'Category',
          business: 'Business',
          technology: 'Technology',
          musicArts: 'Music & Arts',
          education: 'Education',
          health: 'Health & Wellness'
        },
        price: {
          title: 'Price',
          free: 'Free',
          paid: 'Paid'
        },
        date: {
          title: 'Date',
          today: 'Today',
          'this-weekend': 'This weekend',
          custom: 'Choose Date Range...'
        }
      },
      sort: {
        upcoming: 'Sort by: Upcoming',
        popular: 'Sort by: Popular',
        priceLow: 'Sort by: Price (Low to High)',
        priceHigh: 'Sort by: Price (High to Low)'
      },
      results: {
        count: '{count} Events Found',
        loadMore: 'Load More Events'
      },
      states: {
        loadError: 'Unable to load events right now.',
        errorTitle: 'Unable to Load Events',
        loadingTitle: 'Loading Events...',
        emptyTitle: 'No Events Found',
        loadingBody: 'Fetching the latest events. Please wait.',
        emptyBody: 'Try adjusting your filters or search criteria'
      },
      event: {
        tbd: 'TBD',
        online: 'Online',
        free: 'Free',
        untitled: 'Untitled Event',
        timeTbd: 'Time TBD',
        startsAt: 'Starts at {time}',
        fromPrice: 'From {currency} {price}'
      }
    },
    communityPage: {
      hero: {
        title: 'Community & Networking',
        subtitle: 'Discover professionals, find your next partner, and book meetings',
        searchPlaceholder: 'Search people by name, title, or company...'
      },
      filters: {
        title: 'Filters',
        status: {
          label: 'Status',
          online: 'Online Now',
          openToMeetings: 'Open to Meetings'
        },
        industries: {
          label: 'Industries'
        }
      },
      results: {
        count: 'Showing {count} professionals',
        matchLabel: '{score}% Match',
        atCompany: '@ {company}'
      },
      actions: {
        viewProfile: 'View Profile'
      },
      errors: {
        loadMembers: 'Failed to load community members',
        selectTime: 'Please select a time slot'
      },
      toasts: {
        requestSent: 'Connection request sent to {name}',
        meetingSent: 'Meeting request sent to {name}'
      },
      defaults: {
        member: 'Eventra Member',
        position: 'Professional',
        company: 'Organization',
        location: 'Remote',
        bio: 'Professional networking on Eventra.',
        tag: 'Networking',
        role: 'Other',
        industry: 'General'
      },
      roles: {
        technology: 'Technology',
        marketing: 'Marketing',
        consulting: 'Consulting',
        finance: 'Finance',
        education: 'Education'
      },
      industries: {
        saas: 'SaaS',
        fintech: 'FinTech',
        healthcare: 'Healthcare',
        eventtech: 'EventTech',
        media: 'Media'
      },
      interests: {
        ai: 'AI',
        marketing: 'Marketing',
        sales: 'Sales',
        product: 'Product',
        engineering: 'Engineering',
        leadership: 'Leadership',
        growth: 'Growth',
        b2b: 'B2B'
      },
      dates: {
        today: 'Today',
        tomorrow: 'Tomorrow',
        fri17: 'Fri 17',
        mon20: 'Mon 20',
        tue21: 'Tue 21',
        days: {
          wed: 'Wed',
          thu: 'Thu',
          fri: 'Fri',
          mon: 'Mon',
          tue: 'Tue'
        }
      },
      timeSlots: {
        slot0900: '09:00 AM',
        slot0930: '09:30 AM',
        slot1000: '10:00 AM',
        slot1030: '10:30 AM',
        slot1100: '11:00 AM',
        slot1130: '11:30 AM',
        slot1400: '02:00 PM',
        slot1430: '02:30 PM',
        slot1500: '03:00 PM',
        slot1530: '03:30 PM',
        slot1600: '04:00 PM',
        slot1630: '04:30 PM'
      }
    },
    networking: {
      title: 'Networking Hub',
      subtitle: 'Manage your meetings and connections.',
      stats: {
        meetingsToday: 'Meetings Today',
        newRequests: 'New Requests',
        newMatches: 'New AI Matches'
      },
      tabs: {
        schedule: 'My Schedule',
        matches: 'Smart Matches',
        requests: 'Requests',
        connections: 'My Connections'
      },
      filters: {
        allEvents: 'All Events',
        showPastMeetings: 'Show Past Meetings'
      },
      common: {
        tbd: 'TBD'
      },
      relative: {
        justNow: 'Just now',
        minute: '1 min ago',
        minutes: '{count} min ago',
        hour: '1 hour ago',
        hours: '{count} hours ago',
        day: '1 day ago',
        days: '{count} days ago'
      },
      defaults: {
        unknownUser: 'Unknown User',
        professional: 'Professional',
        event: 'Event',
        generalNetworking: 'General Networking',
        networkingMeeting: 'Networking Meeting',
        onSite: 'On-site',
        inPerson: 'In-person',
        unknownCountry: 'Unknown',
        user: 'User',
        someone: 'Someone'
      },
      matches: {
        reasonFallback: 'Based on your profile and interests',
        subtitle: 'AI-powered recommendations based on your profile, interests, and networking goals.',
        requestedByThem: 'Requested by them'
      },
      requests: {
        defaultMessage: "Let's connect and explore opportunities.",
        receivedTitle: 'Received Requests ({count})',
        sentTitle: 'Sent Requests ({count})',
        noPending: 'No pending requests'
      },
      actions: {
        joinCall: 'Join Call',
        confirm: 'Confirm',
        decline: 'Decline',
        cancel: 'Cancel',
        viewProfile: 'View Profile',
        connect: 'Connect',
        reschedule: 'Reschedule',
        scheduleMeeting: 'Schedule Meeting',
        accept: 'Accept',
        withdraw: 'Withdraw',
        message: 'Message'
      },
      status: {
        confirmed: 'Confirmed',
        pending: 'Pending',
        cancelled: 'Cancelled',
        connected: 'Connected',
        requestClosed: 'Request Closed',
        requestSent: 'Request Sent'
      },
      labels: {
        event: 'Event: {event}'
      },
      connections: {
        total: '{count} total connections',
        connectedOn: 'Connected: {date}'
      },
      meetings: {
        videoCall: 'Video Call',
        types: {
          online: 'Online',
          inPerson: 'In-person',
          hybrid: 'Hybrid'
        },
        validation: {
          selectType: 'Select a meeting type.',
          selectDateTime: 'Select a meeting date and time.',
          selectEvent: 'Select an event for in-person or hybrid meetings.',
          selectSlot: 'Select a meeting slot.',
          invalidDateTime: 'Invalid meeting date/time.',
          slotNoTime: 'Selected slot has no time assigned.',
          slotFull: 'Selected slot is full.'
        }
      },
      errors: {
        loadData: 'Failed to load networking data',
        generateMatches: 'Failed to generate matches',
        loadEvents: 'Failed to load events',
        rescheduleMeeting: 'Failed to reschedule meeting',
        scheduleMeeting: 'Failed to schedule meeting',
        sendRequest: 'Failed to send request',
        openConversation: 'Failed to open conversation',
        noMeetingLink: 'No meeting link yet.'
      },
      notifications: {
        meetingRescheduled: {
          title: 'Meeting rescheduled',
          body: '{name} rescheduled the meeting.'
        },
        meetingRequested: {
          title: 'Meeting requested',
          body: '{name} scheduled a meeting with you.'
        },
        meetingCancelled: {
          title: 'Meeting cancelled',
          body: '{name} cancelled the meeting.'
        },
        meetingConfirmed: {
          title: 'Meeting confirmed',
          body: '{name} confirmed the meeting.'
        },
        meetingDeclined: {
          title: 'Meeting declined',
          body: '{name} declined the meeting.'
        },
        newRequest: {
          title: 'New connection request',
          body: '{name} wants to connect with you.'
        },
        connectionAccepted: {
          title: 'Connection accepted',
          body: '{name} accepted your connection request.'
        },
        connectionDeclined: {
          title: 'Connection declined',
          body: '{name} declined your connection request.'
        },
        connectionRemoved: {
          title: 'Connection removed',
          body: '{name} removed the connection.'
        }
      },
      toasts: {
        meetingRescheduled: 'Meeting rescheduled',
        meetingRequested: 'Meeting requested',
        meetingCancelled: 'Meeting cancelled',
        meetingConfirmed: 'Meeting confirmed',
        meetingDeclined: 'Meeting declined',
        requestSent: 'Request sent'
      },
      modals: {
        rescheduleTitle: 'Reschedule Meeting',
        scheduleTitle: 'Schedule Meeting',
        with: 'With {name}',
        meetingType: 'Meeting Type',
        filterCountry: 'Filter by country',
        filterDate: 'Filter by date',
        allCountries: 'All Countries',
        loadingEvents: 'Loading events...',
        noEvents: 'No events available for in-person meetings.',
        noCapacityLimit: 'No capacity limit',
        slotsLeft: '{count} slots left',
        full: 'Full',
        meetingSlot: 'Meeting Slot',
        selectSlot: 'Select a slot',
        remainingShort: ' ({count} left)',
        meetingDate: 'Meeting Date',
        meetingTime: 'Meeting Time'
      }
    },
    messages: {
      title: 'Messages',
      tabs: {
        chats: 'Chat History',
        suggestions: 'Suggestions'
      },
      search: {
        conversations: 'Search conversations...'
      },
      loading: {
        conversations: 'Loading conversations...',
        suggestions: 'Loading suggestions...',
        messages: 'Loading messages...'
      },
      empty: {
        conversations: 'No conversations yet.',
        suggestions: 'No suggestions yet.',
        selectConversation: 'Select a conversation to start messaging',
        lastMessage: 'No messages yet.',
        startConversation: 'Start a conversation'
      },
      actions: {
        start: 'Start',
        viewProfile: 'View Profile'
      },
      composer: {
        placeholder: 'Type a message...'
      },
      dateDivider: 'Today, {date}',
      newMessage: {
        title: 'New Message',
        searchPlaceholder: 'To: Search name or company...',
        startTyping: 'Start typing to search for people'
      },
      defaults: {
        user: 'User',
        unknownUser: 'Unknown User'
      },
      errors: {
        loadConversations: 'Failed to load conversations',
        loadMessages: 'Failed to load messages',
        sendMessage: 'Failed to send message',
        createConversation: 'Failed to create conversation',
        loadSuggestions: 'Failed to load suggestions'
      }
    },
    landing: {
      hero: {
        title: 'Create Unforgettable Events',
        subtitle: 'Professional event management platform trusted by businesses worldwide',
        primaryCta: 'Create Event',
        secondaryCta: 'Watch Demo',
        trustLine: 'Trusted by 10,000+ event organizers',
        logos: ['ACME Corp', 'TechStart', 'Innovate Co', 'GlobalEvents']
      },
      features: {
        title: 'Everything You Need to Succeed',
        subtitle: 'Powerful tools for professional event management',
        cta: 'Learn more',
        items: [
          {
            title: 'Design Studio',
            description:
              'Create beautiful, branded event pages with our intuitive drag-and-drop editor. Customize every detail to match your brand identity.'
          },
          {
            title: 'Registration Hub',
            description:
              'Streamline attendee registration with smart forms, automated confirmations, and integrated payment processing for seamless check-in.'
          },
          {
            title: 'Analytics Suite',
            description:
              'Track event performance with real-time analytics. Monitor registrations, engagement, and ROI with comprehensive reporting tools.'
          }
        ]
      },
      howItWorks: {
        title: 'Create Events in 4 Simple Steps',
        steps: [
          {
            title: 'Add Details',
            description:
              'Enter your event information, date, location, and key details to get started quickly.'
          },
          {
            title: 'Design Page',
            description:
              'Customize your event page with our drag-and-drop builder and branded templates.'
          },
          {
            title: 'Setup Registration',
            description:
              'Configure ticketing, pricing, and registration forms to capture attendee information.'
          },
          {
            title: 'Launch Event',
            description:
              'Publish your event and share it with your audience. Track registrations in real-time.'
          }
        ]
      },
      testimonials: {
        title: 'Loved by Event Professionals',
        items: [
          {
            quote:
              'This platform transformed how we manage events. The intuitive interface and powerful features helped us increase attendance by 40% while reducing admin time significantly.',
            authorName: 'Sarah Johnson',
            authorTitle: 'Head of Events',
            authorCompany: 'TechStart Inc.',
            authorInitials: 'SJ'
          },
          {
            quote:
              'Eventra made our annual conference seamless. From registration to analytics, everything worked flawlessly. Our attendees loved the professional event pages we created.',
            authorName: 'Michael Chen',
            authorTitle: 'Marketing Director',
            authorCompany: 'Innovate Co.',
            authorInitials: 'MC'
          },
          {
            quote:
              "The best event management platform we've used. The customization options are incredible, and the support team is always there when we need them. Highly recommended!",
            authorName: 'Emily Rodriguez',
            authorTitle: 'Event Coordinator',
            authorCompany: 'Global Events Ltd.',
            authorInitials: 'ER'
          }
        ]
      },
      finalCta: {
        title: 'Ready to Create Your First Event?',
        subtitle: 'Join thousands of event organizers using Eventra',
        button: 'Get Started Free'
      },
      footer: {
        description: 'Professional event management platform for businesses worldwide',
        product: {
          title: 'Product',
          items: ['Features', 'Pricing', 'Templates', 'Integrations']
        },
        company: {
          title: 'Company',
          items: ['About', 'Blog', 'Careers', 'Contact']
        },
        newsletter: {
          title: 'Stay Updated',
          subtitle: 'Get the latest news and updates',
          placeholder: 'Your email'
        },
        legal: {
          copyright: '(c) 2024 Eventra. All rights reserved.',
          privacyPolicy: 'Privacy Policy',
          terms: 'Terms of Service'
        }
      },
      testing: {
        resetSentButton: 'Test Reset Sent'
      }
    },
    auth: {
      registrationEntry: {
        title: 'Create your account',
        subtitle: 'Join Eventra to register for events and connect with professionals',
        continueWithGoogle: 'Continue with Google',
        continueWithEmail: 'Continue with Email',
        divider: 'OR',
        alreadyAccount: 'Already have an account?',
        login: 'Login',
        errors: {
          googleSignupFailed: 'Failed to start Google signup',
          accountExists: 'Account already exists. Please log in.',
          accountExistsReset: 'Account already exists. Please log in or reset your password.',
          resendFailed: 'Unable to resend confirmation email.',
          registrationIncomplete: 'Registration incomplete. Please try again.',
          registrationFailed: 'Failed to register',
          signInToComplete: 'Please sign in to complete your profile.',
          saveProfileFailed: 'Failed to save profile',
          signInToContinue: 'Please sign in to continue.'
        }
      },
      login: {
        title: 'Welcome back',
        subtitle: 'Login to your Eventra account',
        continueWithGoogle: 'Continue with Google',
        divider: 'OR',
        emailLabel: 'Email address',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        submit: 'Login',
        loggingIn: 'Logging in...', 
        newToEventra: 'New to Eventra?',
        signUp: 'Sign up',
        errors: {
          invalidCredentials: 'Invalid email or password. Please try again.',
          googleInitFailed: 'Failed to initialize Google login'
        }
      },
      forgotPassword: {
        title: 'Reset your password',
        subtitle: "Enter your email and we'll send you a reset link",
        emailLabel: 'Email address',
        emailPlaceholder: 'you@example.com',
        submit: 'Send Reset Link',
        sending: 'Sending...', 
        backToLogin: 'Back to Login',
        toastSuccess: 'Reset link sent to your email',
        toastError: 'Failed to send reset link'
      },
      passwordResetSent: {
        title: 'Check your email',
        subtitle: 'We sent a password reset link to:',
        instructions: 'Click the link in the email to create a new password',
        resend: 'Resend Email',
        resending: 'Resending...', 
        backToLogin: 'Back to Login',
        help: "Didn't receive the email? Check your spam folder"
      },
      emailRegistration: {
        title: 'Create your account',
        subtitle: 'Enter your details to get started',
        emailLabel: 'Email address',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Create a strong password',
        strength: {
          weak: 'Weak',
          medium: 'Medium',
          strong: 'Strong'
        },
        requirements: {
          length: 'At least 8 characters',
          uppercase: 'One uppercase letter',
          number: 'One number'
        },
        terms: {
          prefix: "I agree to Eventra's",
          termsOfService: 'Terms of Service',
          and: 'and',
          privacyPolicy: 'Privacy Policy'
        },
        submit: 'Create Account',
        submitting: 'Creating...', 
        alreadyAccount: 'Already have an account?',
        login: 'Login',
        errors: {
          invalidEmail: 'Please enter a valid email address'
        }
      },
      emailVerification: {
        title: 'Check your email',
        subtitle: 'We sent a verification link to:',
        instructions: 'Click the link in the email to verify your account and continue registration',
        resend: 'Resend Email',
        resending: 'Sending...', 
        changeEmail: 'Change Email',
        timer: 'Resend available in {time}',
        helpPrefix: "Didn't receive the email? Check your spam folder or",
        helpLink: 'contact support',
        resendSuccess: 'Verification email resent',
        resendError: 'Failed to resend verification email'
      },
      demoEmail: 'demo@example.com'
    },
    profileSetup: {
      progress: {
        stepLabel: 'Step {current} of {total}',
        percentLabel: '{percent}%'
      },
      step1: {
        title: 'Complete your profile',
        subtitle: 'Just a few details to personalize your experience'
      },
      step2: {
        title: 'Complete your professional profile',
        subtitle:
          'Current Job Title | Company / Organization | Industry | Department | Years of Experience | Company Size'
      },
      labels: {
        firstName: 'First Name',
        lastName: 'Last Name',
        phoneNumber: 'Phone Number',
        country: 'Country',
        jobTitle: 'Job Title',
        company: 'Company / Organization',
        industry: 'Industry',
        department: 'Department',
        yearsExperience: 'Years of Experience',
        companySize: 'Company Size'
      },
      placeholders: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '234 567 8900',
        country: 'Select your country',
        jobTitle: 'e.g., Product Manager',
        company: 'e.g., Acme Inc.',
        industry: 'Select your industry',
        industryOther: 'Enter your industry',
        department: 'e.g., Marketing',
        yearsExperience: 'Select years of experience',
        companySize: 'Select company size'
      },
      errors: {
        phoneTooShort: 'Phone number too short'
      },
      requiredFields: '* Required fields',
      buttons: {
        back: 'Back',
        continue: 'Continue',
        completeProfile: 'Complete your profile',
        skip: 'Skip for now'
      },
      industries: [
        'Technology & Software',
        'Financial Services & Banking',
        'Healthcare & Pharmaceuticals',
        'Manufacturing & Production',
        'Retail & E-commerce',
        'Consulting & Professional Services',
        'Education & Training',
        'Media & Entertainment',
        'Transportation & Logistics',
        'Energy & Utilities',
        'Real Estate & Construction',
        'Hospitality & Tourism',
        'Telecommunications',
        'Agriculture & Food Production',
        'Automotive',
        'Aerospace & Defense',
        'Legal Services',
        'Marketing & Advertising',
        'Non-Profit & NGO',
        'Government & Public Sector',
        'Other'
      ],
      yearsOfExperience: [
        '0-1 years',
        '1-3 years',
        '3-5 years',
        '5-10 years',
        '10-15 years',
        '15+ years'
      ],
      companySizes: [
        '1-10 employees',
        '11-50 employees',
        '51-200 employees',
        '201-500 employees',
        '501-1000 employees',
        '1001-5000 employees',
        '5000+ employees'
      ]
    },
    dashboard: {
      breadcrumb: {
        home: 'Home',
        current: 'My Events'
      },
      header: {
        title: 'My Events',
        subtitle: 'Manage and track your event portfolio',
        initializing: 'Initializing...', 
        create: 'Create Event'
      },
      stats: {
        totalEvents: 'Total Events',
        totalAttendees: 'Total Attendees',
        activeEvents: 'Active Events',
        revenue: 'Revenue',
        trendSuffix: 'from last month'
      },
      filters: {
        tabs: {
          all: 'All Events',
          live: 'Live',
          draft: 'Draft',
          archived: 'Archived'
        },
        searchPlaceholder: 'Search events...', 
        sortLabel: 'Sort by: {option}',
        sortOptions: {
          recent: 'Recent',
          oldest: 'Oldest'
        }
      },
      event: {
        typeFallback: 'Event',
        noDate: 'No date set',
        locationTbd: 'TBD',
        copyName: '{name} (Copy)'
      },
      status: {
        live: 'Live',
        draft: 'Draft',
        upcoming: 'Upcoming',
        archived: 'Archived'
      },
      card: {
        registered: '{count} registered',
        views: '{count} views',
        sold: '{percent} sold',
        pro: 'PRO',
        edit: 'Edit',
        duplicate: 'Duplicate',
        more: 'More actions'
      },
      empty: {
        create: 'Create New Event',
        waiting: 'Please wait a moment',
        subtitle: 'Start building your next event'
      }
    },
    manageEvent: {
      loading: 'Loading event...', 
      notFound: {
        title: 'Event not found',
        return: 'Return to Dashboard'
      },
      header: {
        viewLive: 'View Live Site',
        editDetails: 'Edit Details',
        tbd: 'TBD',
        noDate: 'No date set'
      },
      nav: {
        overview: { label: 'Overview', desc: 'Event summary' },
        agenda: { label: 'Agenda', desc: 'Manage sessions' },
        speakers: { label: 'Speakers', desc: 'Manage profiles' },
        attendees: { label: 'Attendees', desc: 'Manage registrations' },
        exhibitors: { label: 'Exhibitors', desc: 'Manage booths' },
        ticketing: { label: 'Ticketing', desc: 'Manage pricing' },
        b2b: { label: 'B2B Matchmaking', desc: 'Connections' },
        marketing: { label: 'Marketing', desc: 'Promotional tools' },
        dayof: { label: 'Day-of-Event', desc: 'QR & Check-in' },
        reporting: { label: 'Reporting', desc: 'Analytics' }
      },
      overview: {
        header: {
          title: 'Event Overview',
          subtitle: "Monitor your event's performance and key metrics"
        },
        metrics: {
          registrations: {
            label: 'Total Registrations',
            active: 'Active',
            none: 'No registrations yet'
          },
          revenue: {
            label: 'Revenue',
            fromSales: 'From ticket sales',
            none: 'No revenue yet'
          },
          ticketsSold: {
            label: 'Tickets Sold',
            capacity: '{percent}% capacity',
            noCapacity: 'No capacity limit'
          },
          avgPrice: {
            label: 'Avg. Ticket Price',
            acrossTypes: 'Across ticket types',
            setPrice: 'Set ticket prices'
          }
        },
        charts: {
          registrationTrends: {
            title: 'Registration Trends',
            subtitle: 'Daily registration activity over the last 30 days',
            viewDetails: 'View Details',
            visualization: 'Registration chart visualization'
          }
        },
        activity: {
          title: 'Recent Activity',
          noActivity: 'No activity yet',
          noActivityDesc: 'Create tickets, sessions, speakers, or exhibitors to start tracking.',
          viewAll: 'View All Activity',
          items: {
            speaker: 'Speaker',
            session: 'Session',
            ticket: 'Ticket',
            exhibitor: 'Exhibitor',
            registrationForm: 'Registration form',
            emailCampaign: 'Email campaign',
            marketingLink: 'Marketing link',
            update: 'Update',
            created: 'created',
            updated: 'updated',
            deleted: 'deleted'
          }
        },
        tasks: {
          title: 'Upcoming Tasks',
          pending: '{count} pending',
          viewAll: 'View All Tasks',
          items: {
            tickets: 'Make tickets',
            sessions: 'Make sessions',
            speakers: 'Add speakers',
            exhibitors: 'Make exhibitors'
          }
        },
        actions: {
          title: 'Quick Actions',
          sendEmail: 'Send Email',
          addSession: 'Add Session',
          addSpeaker: 'Add Speaker',
          previewSite: 'Preview Site'
        },
        health: {
          title: 'Event Health Score',
          setupIncomplete: 'Setup incomplete. Start by adding tickets, sessions, speakers, and exhibitors.',
          setupIncompleteNext: 'Setup incomplete. Next: {items}.',
          goodStart: 'Good start. Keep building momentum.',
          goodStartNext: 'Good start. Finish {count} more core item(s) to boost readiness.',
          almostThere: 'Almost there. Finalize the remaining setup.',
          almostThereNext: 'Almost there. Complete {count} more core item(s) for a strong launch.',
          greatProgress: 'Great progress! Your event is launch-ready.',
          greatProgressNext: 'Great progress! Complete {count} more core item(s) for 100%.'
        },
        toasts: {
          publishSuccess: 'Event published successfully!',
          publishError: 'Failed to publish event.'
        }
      },
      agenda: {
        header: {
          title: 'Event Agenda & Schedule',
          subtitle: 'Manage your event sessions, speakers, and schedule timeline.'
        },
        viewModes: {
          timeline: 'Timeline View',
          list: 'List View'
        },
        filter: {
          button: 'Filter',
          title: 'Filter Sessions',
          track: 'Track',
          room: 'Room',
          status: 'Status',
          allTracks: 'All Tracks',
          allRooms: 'All Rooms',
          allStatus: 'All Status',
          reset: 'Reset',
          apply: 'Apply'
        },
        builder: 'Open Schedule Builder',
        stats: {
          total: 'Total Sessions',
          days: 'Across {count} days',
          day: 'Across 1 day',
          confirmed: 'Confirmed',
          confirmedPct: '{percent}% confirmed',
          nearlyFull: 'Nearly Full',
          capacityHint: '>90% capacity',
          avgAttendance: 'Avg. Attendance',
          attendanceHint: 'Based on checked-in attendees'
        },
        timeline: {
          dayLabel: 'Day {day}: {date}',
          noSessions: 'No sessions match your filters for this day.'
        },
        list: {
          columns: {
            time: 'Time',
            title: 'Session Title',
            speakers: 'Speaker(s)',
            location: 'Location/Room',
            capacity: 'Capacity',
            status: 'Status',
            actions: 'Actions'
          },
          rowActions: {
            edit: 'Edit Session',
            viewAttendees: 'View Attendees',
            sendNotification: 'Send Notification'
          }
        },
        status: {
          confirmed: 'Confirmed',
          full: 'Full',
          pending: 'Pending',
          cancelled: 'Cancelled'
        },
        modals: {
          attendees: {
            title: 'Attendees',
            loading: 'Loading attendees...', 
            columns: {
              attendee: 'Attendee',
              company: 'Company',
              email: 'Email'
            },
            empty: 'No attendees yet.'
          },
          notification: {
            title: 'Send Notification',
            fields: {
              title: 'Title',
              channel: 'Channel',
              message: 'Message'
            },
            channels: {
              inApp: 'In-app',
              email: 'Email',
              sms: 'SMS',
              push: 'Push'
            },
            actions: {
              cancel: 'Cancel',
              send: 'Send',
              sending: 'Sending...'
            }
          },
          edit: {
            title: 'Edit Session',
            fields: {
              title: 'Title',
              speaker: 'Speaker',
              speakerPhoto: 'Speaker Photo URL',
              location: 'Location',
              track: 'Track',
              day: 'Day',
              startTime: 'Start Time',
              endTime: 'End Time',
              capacity: 'Capacity',
              status: 'Status',
              description: 'Description'
            },
            actions: {
              cancel: 'Cancel',
              save: 'Save Changes',
              saving: 'Saving...'
            }
          }
        },
        toasts: {
          notifRequired: 'Title and message are required',
          notifSuccess: 'Notification created',
          notifError: 'Failed to create notification',
          titleRequired: 'Session title is required',
          updateSuccess: 'Session updated',
          updateError: 'Failed to update session'
        }
      },
      speakers: {
        header: {
          title: 'Speaker Management',
          subtitle: 'Coordinate speakers, sessions, and materials',
          sendUpdate: 'Send Update',
          import: 'Import Speakers',
          add: 'Add Speaker'
        },
        stats: {
          total: 'Total Speakers',
          keynoteCount: '{count} keynote',
          regularCount: '{count} regular',
          pendingCount: '+{count} pending',
          confirmed: 'Confirmed',
          confirmedPct: '{percent}% confirmed',
          sessionsAssigned: 'Sessions Assigned',
          allAssigned: 'All sessions have speakers',
          needSpeakers: '{count} session(s) need speakers',
          noSessions: 'No sessions yet',
          materialsSubmitted: 'Materials Submitted',
          pendingUploads: '{count} pending uploads',
          sendReminder: 'Send Reminder',
          rating: 'Speaker Rating',
          basedOnFeedback: 'Based on feedback'
        },
        tabs: {
          all: 'All Speakers',
          bySession: 'By Session',
          materials: 'Materials Tracking',
          communication: 'Communication Log',
          analytics: 'Analytics'
        },
        allSpeakers: {
          filters: {
            all: 'All',
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Workshop',
            confirmed: 'Confirmed',
            pending: 'Pending'
          },
          search: 'Search speakers...', 
          sort: 'Sort: Name {order}',
          sortAsc: 'A-Z',
          sortDesc: 'Z-A',
          card: {
            sessions: '{count} sessions',
            materials: 'Materials',
            speakingAt: 'Speaking At',
            noSessions: 'No sessions assigned',
            materialsSubmitted: 'Materials submitted',
            materialsPending: 'Materials pending',
            more: 'more',
            moreSessions: 'more sessions',
            viewProfile: 'View Profile',
            contact: 'Contact',
            edit: 'Edit',
            remove: 'Remove',
            email: 'Email'
          },
          badges: {
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Workshop'
          },
          empty: {
            title: 'Add New Speaker',
            subtitle: 'Expand your speaker lineup',
            cta: 'Add Speaker'
          }
        },
        bySession: {
          columns: {
            session: 'Session',
            dateTime: 'Date & Time',
            location: 'Location',
            speakers: 'Speakers',
            actions: 'Actions'
          },
          actions: {
            assign: 'Assign',
            contact: 'Contact',
            view: 'View',
            addSession: 'Add Session'
          },
          empty: 'No sessions found.'
        },
        materials: {
          columns: {
            speaker: 'Speaker',
            presentation: 'Presentation',
            deadline: 'Deadline',
            status: 'Status',
            action: 'Action'
          },
          status: {
            submitted: 'Submitted',
            pending: 'Pending',
            overdue: 'Overdue'
          },
          actions: {
            remind: 'Remind',
            download: 'Download',
            remindAll: 'Remind Pending'
          },
          empty: 'No material data found.'
        },
        communication: {
          columns: {
            date: 'Date',
            recipient: 'Recipient',
            subject: 'Subject',
            channel: 'Channel',
            status: 'Status'
          },
          empty: 'No communication logs found.'
        },
        analytics: {
          popularity: 'Session Popularity',
          materialCompletion: 'Material Completion Rate',
          feedbackTrends: 'Speaker Feedback Trends'
        },
        bulk: {
          selected: '{count} speakers selected',
          deselect: 'Deselect All',
          sendEmail: 'Send Email',
          export: 'Export Selected',
          changeStatus: 'Change Status',
          delete: 'Delete'
        },
        modals: {
          compose: {
            title: 'Send Message',
            noRecipients: 'No recipients selected',
            others: '+{count} others',
            fields: {
              subject: 'Subject',
              channel: 'Channel',
              message: 'Message'
            },
            actions: {
              cancel: 'Cancel',
              send: 'Send',
              sending: 'Sending...'
            }
          },
          status: {
            title: 'Change Status',
            count: '{count} speaker(s) selected',
            fields: {
              status: 'Status'
            },
            actions: {
              cancel: 'Cancel',
              save: 'Save',
              saving: 'Saving...'
            }
          },
          assign: {
            title: 'Assign Speakers',
            empty: 'No speakers available. Add speakers first.',
            selected: '{count} selected',
            actions: {
              cancel: 'Cancel',
              save: 'Save',
              saving: 'Saving...'
            }
          }
        },
        toasts: {
          notifRequired: 'Title and message are required',
          notifError: 'Failed to send notification',
          notifSuccess: 'Notification sent',
          selectRecipient: 'Select at least one speaker',
          noMaterials: 'No pending materials',
          reminderSent: 'Reminder sent',
          removeConfirm: 'Remove {name}?',
          removeError: 'Failed to remove speaker',
          removeSuccess: 'Speaker removed',
          deleteConfirm: 'Delete {count} speaker(s)?',
          deleteError: 'Failed to delete speakers',
          deleteSuccess: 'Speakers deleted',
          noExport: 'No speakers to export',
          statusUpdateError: 'Failed to update status',
          statusUpdateSuccess: 'Status updated',
          assignError: 'Failed to assign speakers',
          assignSuccess: 'Speakers assigned',
          csvError: 'Please upload a CSV file',
          csvEmpty: 'CSV must include a header row and at least one speaker',
          importEmpty: 'No valid speaker rows found',
          importSuccess: 'Speakers imported',
          nameRequired: 'Speaker name is required',
          updateError: 'Failed to update speaker',
          updateSuccess: 'Speaker updated',
          addError: 'Failed to add speaker',
          addSuccess: 'Speaker added',
          emailCopied: 'Email copied to clipboard',
          noEmail: 'No email address to copy'
        },
        detailModal: {
          tabs: {
            overview: 'Overview',
            sessions: 'Sessions',
            materials: 'Materials',
            communication: 'Communication',
            analytics: 'Analytics'
          },
          overview: {
            about: 'About',
            expertise: 'Expertise & Topics',
            experience: 'Speaking Experience',
            eventsSpoken: 'Events Spoken At',
            avgRating: 'Average Rating',
            yearsExperience: 'Years Experience',
            contact: 'Contact Details',
            copy: 'Copy'
          },
          sessions: {
            empty: 'No sessions assigned yet.'
          },
          footer: {
            remove: 'Remove Speaker',
            sendEmail: 'Send Email',
            edit: 'Edit Details'
          }
        }
      },
      attendees: {
        header: {
          title: 'Attendees Management',
          subtitle: 'View and manage all event registrations',
          import: 'Import Attendees',
          add: 'Add Attendee',
          export: 'Export to Excel'
        },
        stats: {
          total: 'Total Attendees',
          capacity: '{percent}% of capacity ({total})',
          capacityUnset: 'Capacity not set',
          growth: '+{count} this week',
          pending: 'Pending Approval',
          awaiting: 'Awaiting action',
          review: 'Review Now',
          checkedIn: 'Checked In',
          attendanceRate: '{percent}% attendance rate',
          noShows: 'No-Shows',
          noShowRate: '{percent}% of registered'
        },
        filters: {
          all: 'All Attendees',
          approved: 'Approved',
          pending: 'Pending',
          declined: 'Declined',
          checkedIn: 'Checked In',
          vip: 'VIP',
          search: 'Search by name, email, or ticket...', 
          sort: 'Sort: {option}',
          sortOptions: {
            recent: 'Recent',
            name: 'Name A-Z',
            status: 'Status',
            checkin: 'Check-in',
            ticket: 'Ticket Price'
          }
        },
        table: {
          headers: {
            attendee: 'Attendee',
            date: 'Registration Date',
            status: 'Status',
            checkin: 'Check-in',
            actions: 'Actions'
          },
          rows: {
            groupLeader: 'Group Leader',
            groupSize: 'Group of {count}',
            new: 'NEW',
            checkedIn: 'Checked In',
            notYet: 'Not Yet'
          },
          actions: {
            view: 'View Details',
            approve: 'Approve',
            decline: 'Decline',
            edit: 'Edit Attendee',
            email: 'Send Email',
            resend: 'Resend Confirmation',
            checkin: 'Check In Manually',
            vip: 'Mark as VIP',
            qr: 'View QR Code',
            delete: 'Delete Attendee'
          }
        },
        pagination: {
          previous: 'Previous',
          next: 'Next',
          showing: 'Showing {start}-{end} of {total} attendees'
        },
        bulk: {
          selected: '{count} attendees selected',
          deselect: 'Deselect All',
          email: 'Send Email',
          approve: 'Approve Selected',
          export: 'Export Selected',
          delete: 'Delete'
        },
        modals: {
          add: {
            titleAdd: 'Add Attendee',
            titleEdit: 'Edit Attendee',
            fields: {
              name: 'Full Name *',
              email: 'Email Address',
              company: 'Company',
              phone: 'Phone Number',
              ticketType: 'Ticket Type',
              ticketColor: 'Ticket Color',
              price: 'Price Paid',
              status: 'Status',
              vip: 'Mark as VIP',
              checkin: 'Mark as Checked In'
            },
            actions: {
              cancel: 'Cancel',
              save: 'Save Attendee'
            }
          },
          export: {
            title: 'Export Attendees',
            subtitle: 'Choose format and fields to export',
            format: 'Export Format',
            fields: 'Fields to Include',
            filter: 'Filter by Status',
            actions: {
              cancel: 'Cancel',
              export: 'Export Data'
            },
            options: {
              all: 'All Attendees',
              approved: 'Approved Only',
              pending: 'Pending Only',
              checkedIn: 'Checked In Only'
            },
            fieldLabels: {
              nameEmail: 'Name & Email',
              ticketPrice: 'Ticket & Price',
              registrationDate: 'Registration Date',
              checkInStatus: 'Check-in Status',
              contact: 'Contact Info',
              dietary: 'Dietary & Accessibility',
              notes: 'Notes'
            }
          },
          detail: {
            title: 'Attendee Details',
            status: 'Status',
            ticket: 'Ticket',
            contact: 'Contact Information',
            registration: 'Registration Details',
            additional: 'Additional Information',
            fields: {
              company: 'Company',
              phone: 'Phone',
              linkedin: 'LinkedIn',
              orderId: 'Order ID',
              date: 'Date',
              price: 'Price Paid',
              dietary: 'Dietary Requirements',
              accessibility: 'Accessibility Needs',
              notes: 'Notes'
            },
            actions: {
              close: 'Close',
              edit: 'Edit Details',
              checkin: 'Check In'
            }
          }
        },
        toasts: {
          loadError: 'Failed to load attendees',
          saveError: 'Failed to save changes',
          saveBlocked: 'Save blocked (permissions)',
          deleteError: 'Failed to delete attendee',
          deleteBlocked: 'Delete blocked (permissions)',
          missingEvent: 'Missing event',
          nameRequired: 'Name is required',
          updateSuccess: 'Attendee updated',
          addError: 'Failed to add attendee',
          addBlocked: 'Add blocked (permissions)',
          addSuccess: 'Attendee added',
          csvError: 'Please upload a CSV file',
          noRows: 'No attendee rows found',
          importSuccess: 'Imported {count} attendees',
          importFailed: 'Import failed',
          selectField: 'Select at least one field to export',
          noExport: 'No attendees to export',
          exportSuccess: 'Attendees exported successfully!',
          bulkUpdateError: 'Bulk update failed',
          bulkUpdateSuccess: 'Attendees {status}',
          bulkDeleteError: 'Bulk delete failed',
          bulkDeleteSuccess: 'Attendees deleted',
          filterReset: 'Filters reset',
          resendSuccess: 'Confirmation resent to {name}',
          checkinSuccess: '{name} {status}',
          vipSuccess: '{name} {status}',
          qrInfo: 'Showing QR code for {name}',
          deleteSuccess: '{name} deleted',
          declined: '{name} has been declined',
          approved: '{name} has been approved',
          noEmail: 'No email address for this attendee'
        }
      },
      exhibitors: {
        termExhibitor: 'Exhibitor',
        termSponsor: 'Sponsor',
        header: {
          title: 'Exhibitors & Sponsors',
          shareLink: 'Share Self-Fill Link',
          add: 'Add Manually'
        },
        tabs: {
          exhibitors: 'Exhibitors',
          sponsors: 'Sponsors'
        },
        stats: {
          totalExhibitors: 'Total Exhibitors',
          boothsAssigned: 'Booths Assigned',
          pendingSetup: 'Pending Setup',
          profilesComplete: 'Profiles Complete',
          totalSponsors: 'Total Sponsors',
          platinum: 'Platinum',
          gold: 'Gold',
          silver: 'Silver'
        },
        managementMode: {
          title: 'Choose Your Management Mode',
          subtitle: 'Manually add exhibitor details yourself, or send them a link to complete their own profiles',
          manual: 'Manual Fill',
          selfFill: 'Self-Fill Links'
        },
        selfFill: {
          title: 'Self-Fill Form Link',
          subtitle: 'Share this link so {type} can complete their profiles.',
          copy: 'Copy Link',
          copied: 'Copied',
          preview: 'Preview Form'
        },
        filters: {
          search: 'Search by company name, booth number, or contact...', 
          booth: {
            all: 'All Booths',
            assigned: 'Assigned',
            unassigned: 'Unassigned',
            premium: 'Premium Location'
          },
          profile: {
            all: 'All Profiles',
            complete: 'Complete',
            incomplete: 'Incomplete',
            pending: 'Pending Approval'
          },
          tier: {
            all: 'All Tiers',
            platinum: 'Platinum',
            gold: 'Gold',
            silver: 'Silver',
            bronze: 'Bronze'
          },
          sort: {
            company: 'Company A-Z',
            booth: 'Booth Number',
            date: 'Date Added',
            profile: 'Profile %'
          }
        },
        bulk: {
          selected: '{count} {type} selected',
          assignBooths: 'Assign Booths',
          sendMessage: 'Send Message',
          updateStatus: 'Update Status',
          exportData: 'Export Data',
          remove: 'Remove',
          updateTier: 'Update Tier',
          sendMaterials: 'Send Materials'
        },
        viewModes: {
          cards: 'Cards',
          list: 'List',
          map: 'Booth Map'
        },
        cards: {
          booth: 'Booth #{number}',
          noBooth: 'No booth assigned',
          assign: 'Assign Booth',
          moreTags: '+{count} more',
          sponsorship: '{tier} Sponsorship',
          benefits: '+{count} more benefits'
        },
        list: {
          headers: {
            company: 'COMPANY',
            booth: 'BOOTH ASSIGNMENT',
            contact: 'PRIMARY CONTACT',
            category: 'CATEGORY',
            status: 'PROFILE STATUS',
            tier: 'SPONSORSHIP TIER',
            benefits: 'BENEFITS'
          },
          assignNow: 'Assign Now',
          unassigned: 'Unassigned'
        },
        status: {
          complete: 'Complete',
          incomplete: 'Incomplete',
          pending: 'Pending'
        },
        toasts: {
          linkCopied: 'Link copied to clipboard',
          noEmail: 'No email address available',
          noPhone: 'No phone number available'
        },
        map: {
          title: 'Exhibition Floor Plan',
          mainHall: 'Main Hall',
          legend: 'Legend',
          legendItems: {
            assigned: 'Assigned Booth',
            available: 'Available Booth',
            premium: 'Premium Location',
            entry: 'Entry/Exit',
            food: 'Food Court',
            restrooms: 'Restrooms'
          },
          empty: {
            title: 'No booths assigned yet',
            subtitle: 'Assign booths to exhibitors to populate the map'
          },
          boothLabel: 'Booth {number}',
          standardLocation: 'Standard location',
          assignPanel: {
            title: 'Assign Booth {number}',
            size: 'Size: 3m × 3m (9m²)',
            location: 'Location: {hall}, {location}',
            typeAssigned: 'Type: Assigned Booth',
            typeStandard: 'Type: Standard Booth',
            selectLabel: 'Select Exhibitor',
            searchPlaceholder: 'Search exhibitors...',
            cancel: 'Cancel',
            assign: 'Assign Booth'
          }
        },
        modals: {
          add: {
            edit: 'Edit',
            add: 'Add New',
            subtitle: 'Fill in the details below or send a self-fill link',
            uploadLogo: 'Upload Logo',
            logoHint: 'PNG or JPG, max 5MB, square ratio recommended',
            fields: {
              companyName: 'Company Name*',
              website: 'Company Website',
              category: 'Industry/Category*',
              description: 'Company Description',
              contactName: 'Primary Contact Name*',
              contactRole: 'Contact Title/Role',
              email: 'Email Address*',
              phone: 'Phone Number',
              assignBooth: 'Assign booth now (optional)',
              hall: 'Hall/Zone',
              boothNumber: 'Booth Number'
            },
            placeholders: {
              companyName: 'e.g., TechCorp Solutions Inc.',
              website: 'https://www.company.com',
              category: 'Select category...',
              description: 'Brief description of your company...'
            },
            sections: {
              contact: 'Contact Information',
              booth: 'Booth Assignment',
              sponsorship: 'Sponsorship Details',
              benefits: 'Package Benefits'
            },
            options: {
              welcomeEmail: 'Send welcome email with setup instructions',
              publicDirectory: 'Add to public directory immediately'
            },
            actions: {
              draft: 'Save as Draft',
              save: 'Save Changes',
              add: 'Add {type}'
            }
          },
          share: {
            title: 'Share {type} Self-Fill Link',
            subtitle: 'Send this link to companies so they can register and complete their profiles',
            tabs: {
              exhibitor: 'Exhibitor Link',
              sponsor: 'Sponsor Link'
            },
            description: 'Companies will be able to register, upload their information, and customize their profile. You\'ll receive a notification when they complete their submission.',
            copy: 'Copy',
            copied: 'Copied!',
            scan: 'Scan to access registration form',
            downloadQr: 'Download QR',
            shareVia: 'Share via:',
            options: {
              approval: 'Require admin approval before profile goes live',
              notification: 'Send me email notification for each registration'
            },
            actions: {
              done: 'Done'
            }
          }
        }
      },
      ticketing: {
        header: {
          title: 'Ticketing & Pricing',
          subtitle: 'Monitor sales performance and manage ticket inventory'
        },
        stats: {
          totalRevenue: 'Total Revenue',
          netRevenue: 'Net: ${amount} after fees',
          ticketsSold: 'Tickets Sold',
          acrossTypes: 'Across {count} ticket types',
          sellThroughRate: 'Sell-through Rate',
          soldOfTotal: '{sold} of {total} tickets',
          totalOrders: 'Total Orders',
          avgPerOrder: 'Avg. {count} tickets per order'
        },
        ticketTypes: {
          title: 'Ticket Types',
          add: 'Add New Ticket Type',
          soldCount: '{sold} / {total} Sold',
          salesEnd: 'Sales end on {date}',
          price: 'Price',
          revenue: 'Revenue',
          status: 'Status',
          actions: {
            edit: 'Edit',
            orders: 'Orders',
            duplicate: 'Duplicate',
            archive: 'Archive'
          }
        },
        settings: {
          title: 'Event Settings',
          globalLimit: 'Global Ticket Limit',
          limitLabel: 'Global Ticket Limit',
          limitPlaceholder: 'Enter total capacity',
          limitHint: 'Maximum total tickets that can be sold across all ticket types'
        },
        status: {
          onSale: 'On Sale',
          soldOut: 'Sold Out',
          offSale: 'Off Sale',
          scheduled: 'Scheduled'
        },
        modals: {
          add: {
            titleAdd: 'Add New Ticket',
            titleEdit: 'Edit: {name}',
            simulatePro: 'Simulate Pro Plan',
            proMode: 'PRO MODE',
            fields: {
              name: 'Ticket Name *',
              namePlaceholder: 'e.g., VIP Pass, General Admission',
              tier: 'Ticket Tier',
              standard: 'Standard',
              standardDesc: 'Regular ticket tier for general attendees',
              vip: 'VIP',
              vipDesc: 'Premium tier with exclusive benefits',
              price: 'Ticket Price *',
              quantity: 'Quantity Available *',
              earlyBird: 'Enable Early Bird Pricing',
              earlyBirdPrice: 'Early Bird Price',
              earlyBirdUntil: 'Valid Until',
              saleStarts: 'Sale Starts',
              saleEnds: 'Sale Ends',
              description: 'Ticket Description',
              descriptionPlaceholder: "Describe what's included with this ticket...",
              advanced: 'Advanced Options',
              minPerOrder: 'Min per Order',
              maxPerOrder: 'Max per Order',
              visibility: 'Visibility',
              public: 'Public',
              hidden: 'Hidden/Private',
              hiddenHint: 'Hidden tickets can only be accessed via direct link',
              status: 'Status'
            },
            warnings: {
              upgradeRequired: 'Upgrade Required',
              upgradeDesc: 'Upgrade to Pro to create paid tickets. Free plan only supports free tickets.',
              vipUpgrade: 'Upgrade to Pro to create VIP tickets'
            },
            actions: {
              cancel: 'Cancel',
              save: 'Save Changes',
              create: 'Create Ticket'
            }
          }
        },
        toasts: {
          loadError: 'Failed to load tickets',
          saveSuccess: 'Changes saved',
          createSuccess: 'Ticket created',
          saveError: 'Failed to save',
          duplicateSuccess: 'Duplicated',
          duplicateError: 'Failed to duplicate',
          archiveSuccess: 'Archived',
          archiveError: 'Failed to archive',
          missingEvent: 'Missing event'
        }
      },
      b2b: {
        header: {
          title: 'B2B Matchmaking Hub',
          subtitle: 'AI-powered networking and meeting facilitation',
          aiMatchmaker: 'AI Matchmaker',
          createMeeting: 'Create Meeting'
        },
        stats: {
          activeConnections: 'Active Connections',
          totalMeetings: 'Total meetings scheduled',
          newThisWeek: '+{count} this week',
          aiMatchSuccess: 'AI Match Success',
          ofAiAccepted: 'Of AI matches accepted',
          pendingSuggestions: 'Pending Suggestions',
          awaitingResponse: 'Awaiting response',
          sendReminders: 'Send Reminders',
          completed: 'Completed',
          completionRate: '{percent}% completion rate',
          networkingScore: 'Networking Score',
          overallEngagement: 'Overall engagement'
        },
        tabs: {
          aiMatchmaker: 'AI Matchmaker',
          allMeetings: 'All Meetings',
          analytics: 'Networking Analytics',
          suggestions: 'Match Suggestions'
        },
        aiMatchmaker: {
          title: 'AI Matchmaking Engine',
          subtitle: 'Intelligent networking powered by AI',
          whoToMatch: 'Who should we match?',
          options: {
            all: {
              label: 'Match All Attendees',
              desc: "Generate matches for everyone who hasn't connected yet",
              count: '{count} attendees available'
            },
            category: {
              label: 'Match Specific Category',
              desc: 'Target specific attendee groups',
              count: '{count} with categories'
            },
            individuals: {
              label: 'Match Selected Individuals',
              desc: 'Choose specific attendees to match',
              count: '{count} opted in'
            },
            recommended: 'Recommended',
            noAttendees: 'No attendees yet',
            noCategories: 'No categories detected',
            noOptIn: 'No opt-in tags found'
          },
          criteria: {
            title: 'Match Criteria',
            industry: 'Industry Alignment',
            industryDesc: 'High priority - Match similar industries',
            role: 'Job Role Compatibility',
            roleDesc: 'Medium priority',
            stage: 'Company Stage Alignment',
            stageDesc: 'Medium-high priority',
            interests: 'Common Interests',
            interestsDesc: 'High priority - Focus on interests',
            goals: 'Goal Alignment',
            goalsDesc: 'High priority - Match networking objectives'
          },
          threshold: {
            title: 'Minimum Match Score',
            subtitle: 'Only suggest matches with {percent}% or higher compatibility',
            recommended: 'Recommended: 70-80%'
          },
          generate: {
            info: 'AI will analyze {total} attendees and generate approximately {count} high-quality matches',
            time: 'Processing time: ~30 seconds',
            button: 'Generate AI Matches'
          },
          insights: {
            title: 'Matching Insights',
            subtitle: 'Real-time analysis',
            potential: 'High Networking Potential',
            potentialDesc: '{percent}% of attendees have match potential based on their profiles',
            industries: 'Top Industries Present',
            goals: 'Networking Goals',
            lastRun: 'Last AI Run',
            noRun: 'No AI run yet',
            generated: 'Generated {count} matches',
            accepted: '{percent}% accepted by attendees',
            viewResults: 'View Results'
          }
        },
        allMeetings: {
          filters: {
            all: 'All',
            today: 'Today',
            ai: 'AI Generated',
            manual: 'Manual',
            pending: 'Pending',
            completed: 'Completed',
            search: 'Search meetings...', 
            allDates: 'All Dates',
            thisWeek: 'This Week',
            recent: 'Recent First',
            score: 'Score: High to Low',
            upcoming: 'Date: Upcoming'
          },
          table: {
            headers: {
              id: 'Meeting ID',
              participants: 'Participants',
              score: 'Match Score',
              dateTime: 'Date & Time',
              status: 'Status',
              actions: 'Actions'
            },
            manual: 'Manual',
            view: 'View',
            empty: 'No meetings found.'
          }
        },
        analytics: {
          title: 'Networking Analytics',
          summary: '{total} meetings · {avg}% avg match score · {rate}% success rate',
          topIndustry: 'Top industry: {industry} · Top goal: {goal}'
        },
        suggestions: {
          title: 'AI Match Suggestions',
          subtitle: '{count} pending matches awaiting review',
          card: {
            match: 'AI MATCH',
            why: 'Why this match?',
            noCriteria: 'No matching criteria',
            createMeeting: 'Create Meeting',
            dismiss: 'Dismiss',
            sent: 'Sent {date}',
            sentRecently: 'Sent recently'
          },
          empty: 'No match suggestions yet. Generate matches to see results here.'
        },
        modals: {
          processing: {
            analyzing: {
              title: 'AI is Analyzing Attendees',
              subtitle: 'Processing {count} attendee profiles...'
            },
            generating: {
              title: 'Generating Optimal Matches',
              subtitle: 'Creating intelligent connections...'
            },
            complete: {
              title: 'Matches Generated Successfully!',
              subtitle: 'AI has created high-quality networking matches',
              stats: {
                created: 'Matches Created',
                avgScore: 'Avg Match Score',
                matched: 'Attendees Matched'
              },
              actions: {
                viewAll: 'View All Matches',
                sendNotif: 'Send Notifications'
              }
            },
            progress: {
              analyzing: 'Analyzing industry alignments...',
              generating: 'Building match recommendations...',
              remaining: 'Estimated time: {count} seconds remaining'
            }
          },
          details: {
            title: 'AI Match Analysis',
            score: '{percent}% Match Score',
            breakdown: 'Match Score Breakdown',
            noDetails: 'Match details unavailable. Generate matches to see detailed insights.',
            overall: '{percent}% Overall Match',
            insights: 'AI Insights',
            noInsights: 'No AI insights available yet.',
            topics: 'Suggested Discussion Topics',
            noTopics: 'No suggested topics yet.',
            actions: {
              schedule: 'Schedule Meeting',
              sendBoth: 'Send to Both Attendees'
            }
          },
          create: {
            title: 'Schedule AI-Matched Meeting',
            matchInfo: 'AI MATCH · {percent}% Score',
            perfectMatch: 'Perfect match for: {tags}',
            fields: {
              dateTime: 'Date & Time',
              duration: 'Duration',
              location: 'Location'
            },
            placeholders: {
              location: 'Room B-12 or Zoom link'
            },
            durations: {
              m30: '30 minutes',
              m45: '45 minutes',
              m60: '60 minutes'
            },
            actions: {
              cancel: 'Cancel',
              create: 'Create & Notify'
            }
          }
        },
        toasts: {
          addTwo: 'Add at least two attendees to generate matches',
          noMatches: 'No matches found with the current criteria',
          matchesSuccess: '{count} AI matches generated successfully!',
          matchesComplete: 'AI matching complete',
          noSuggestionsExport: 'No suggestions to export',
          suggestionsExported: 'Suggestions exported',
          suggestionsDismissed: 'Suggestion dismissed',
          noMeetingsExport: 'No meetings to export',
          meetingsExported: 'Meetings exported',
          settingsSaved: 'Matchmaking settings saved',
          noPendingRemind: 'No pending suggestions to remind',
          remindersSent: 'Reminders sent',
          selectMatchFirst: 'Select a match first',
          matchNotifSent: 'Match notification sent',
          notifSent: 'Notifications sent',
          notificationsSent: 'Meeting updated and notifications sent!',
          selectSuggestion: 'Select a match suggestion first',
          meetingCreateError: 'Failed to create meeting'
        }
      },
      marketing: {
        header: {
          title: 'Marketing Tools',
          subtitle: 'Promote your event and drive ticket sales'
        },
        tabs: {
          email: 'Email Campaigns',
          promo: 'Promotion Codes'
        },
        email: {
          customDomain: {
            title: 'Custom Domain',
            subtitle: 'Use your own domain for event registration and emails',
            url: 'Custom Registration URL',
            urlDesc: 'events.yourdomain.com instead of eventra.com/your-event',
            domain: 'Branded Email Domain',
            domainDesc: 'Send emails from @yourdomain.com for better deliverability',
            ssl: 'SSL Certificate Included',
            sslDesc: 'Automatic HTTPS security for your custom domain',
            branding: 'Professional Branding',
            brandingDesc: 'Build trust with attendees using your own domain',
            upgrade: 'Upgrade to Pro',
            learnMore: 'Learn more about custom domains'
          },
          stats: {
            totalSent: 'Total Emails Sent',
            openRate: 'Average Open Rate',
            clickRate: 'Average Click-Through Rate',
            basedOn: 'Based on sent campaigns',
            noSent: 'No sent campaigns yet',
            across: 'Across {count} campaigns'
          },
          table: {
            title: 'Email Campaigns',
            create: 'Create New Campaign',
            headers: {
              name: 'CAMPAIGN NAME',
              status: 'STATUS',
              audience: 'AUDIENCE',
              open: 'OPEN RATE',
              click: 'CLICK RATE',
              sent: 'SENT ON',
              actions: 'ACTIONS'
            },
            status: {
              sent: 'Sent',
              draft: 'Draft',
              scheduled: 'Scheduled'
            },
            actions: {
              edit: 'Edit',
              view: 'View Report',
              duplicate: 'Duplicate',
              delete: 'Delete'
            },
            empty: 'No campaigns yet. Create your first email campaign.',
            notSent: 'Not sent'
          }
        },
        promo: {
          stats: {
            activeCodes: 'Active Codes',
            totalCodes: 'Out of {count} total codes',
            totalUses: 'Total Uses',
            redemptions: 'Promotion redemptions',
            revenue: 'Revenue from Promotions',
            revenueDesc: 'Estimated revenue generated',
            revenueNoPrice: 'Add ticket pricing to estimate revenue'
          },
          table: {
            title: 'Promotion Codes',
            create: 'Create New Code',
            headers: {
              code: 'CODE',
              discount: 'DISCOUNT',
              usage: 'USAGE',
              status: 'STATUS',
              applies: 'APPLIES TO',
              actions: 'ACTIONS'
            },
            status: {
              active: 'Active',
              expired: 'Expired',
              inactive: 'Inactive'
            },
            usage: {
              used: '{count} / {total} used',
              unlimited: '{count} uses (unlimited)'
            },
            discount: {
              off: '{value} Off'
            },
            actions: {
              edit: 'Edit',
              deactivate: 'Deactivate',
              delete: 'Delete'
            },
            empty: 'No promotion codes yet. Create your first promo code.'
          }
        },
        modals: {
          promo: {
            titleAdd: 'Create New Promotion Code',
            titleEdit: 'Edit: {code}',
            fields: {
              code: 'Promotion Code *',
              codePlaceholder: 'e.g., SAVE20, EARLYBIRD',
              type: 'Discount Type *',
              typePercent: 'Percentage',
              typeFixed: 'Fixed Amount',
              value: 'Discount Value *',
              applies: 'Applies To *',
              appliesAll: 'All Ticket Types',
              appliesSpecific: 'Specific Ticket Types',
              noTickets: 'No ticket types found. Create tickets first.',
              usage: 'Usage Limits',
              limitTotal: 'Limit total number of uses',
              limitTotalDesc: 'Set a maximum number of times this code can be used',
              limitCustomer: 'Limit one use per customer',
              limitCustomerDesc: 'Each customer can only use this code once',
              dates: 'Active Dates',
              start: 'Start Date *',
              end: 'End Date (Optional)'
            },
            actions: {
              cancel: 'Cancel',
              save: 'Save Code'
            }
          },
          campaign: {
            titleAdd: 'Create New Email Campaign',
            titleEdit: 'Edit: {name}',
            fields: {
              name: 'Campaign Name *',
              namePlaceholder: 'e.g., Early Bird Reminder',
              status: 'Status',
              audience: 'Audience',
              date: 'Sent/Scheduled On',
              total: 'Total Sent',
              open: 'Open Rate (%)',
              click: 'Click Rate (%)'
            },
            actions: {
              cancel: 'Cancel',
              save: 'Save Campaign'
            }
          },
          upgrade: {
            title: 'Upgrade to Eventra Pro',
            subtitle: 'Unlock custom domain features including branded registration URLs, email domains, and SSL certificates to build trust with your attendees.',
            cancel: 'Cancel',
            upgrade: 'Upgrade Now'
          }
        }
      },
      dayOf: { 
        header: {
          title: 'Day-of-Event Tools',
          subtitle: 'Real-time check-in and attendance tracking',
          live: 'EVENT LIVE',
          reports: 'Download Reports'
        },
        stats: {
          checkedIn: 'Currently Checked In',
          live: 'Live',
          registered: '{percent}% of registered ({total})',
          today: 'Check-ins Today',
          lastHour: '+{count} in last hour',
          activeSessions: 'Active Sessions',
          upcomingSessions: '{count} upcoming today',
          activeMeetings: 'Active B2B Meetings',
          scheduledMeetings: '{count} scheduled today'
        },
        tools: {
          title: 'Check-in Tools',
          event: {
            title: 'Event Check-in',
            desc: 'Scan attendee QR codes for general event entry',
            checkedIn: 'Checked In',
            pending: 'Pending'
          },
          session: {
            title: 'Session Check-in',
            desc: 'Track attendance for specific sessions and workshops',
            active: 'Active Sessions',
            scans: 'Total Scans'
          },
          b2b: {
            title: 'B2B Meeting Check-in',
            desc: 'Verify attendees for scheduled business meetings',
            active: 'Active Meetings',
            completed: 'Completed'
          },
          action: 'Open Scanner'
        },
        recent: {
          title: 'Recent Check-ins',
          autoUpdate: 'Auto-updating',
          viewAll: 'View All Check-ins'
        },
        metrics: {
          totalToday: 'Total Today',
          scanRate: 'Scan Rate',
          perHour: '{count}/hour',
          scannedNow: 'Scanned Now'
        },
        lastScan: {
          registration: 'Registration',
          checkInTime: 'Check-in Time',
          previous: 'Previous Check-ins',
          email: 'Email'
        },
        settings: {
          title: 'Scanner Settings',
          reset: 'Reset to Defaults',
          cancel: 'Cancel',
          save: 'Save Settings',
          saving: 'Saving...',
          duplicatePolicy: 'Duplicate Check-in Policy',
          policyOptions: {
            allow: 'Allow re-entry',
            block: 'Block duplicate check-ins',
            confirm: 'Require confirmation for duplicates'
          },
          toggles: {
            autoAdvance: 'Auto-advance after successful scan',
            offline: 'Enable offline scanning',
            sound: 'Play sound on successful scan',
            vibrate: 'Vibrate on scan (mobile devices)'
          }
        },
        reportsModal: {
          title: 'Download Check-in Reports',
          reportType: 'Report Type',
          include: 'Include in Report',
          download: 'Download Report',
          types: {
            general: 'General Event Check-ins',
            session: 'Session Attendance',
            b2b: 'B2B Meeting Check-ins',
            all: 'All Check-ins (Combined)'
          },
          fields: {
            attendee: 'Attendee names & emails',
            timestamps: 'Check-in timestamps',
            ticketTypes: 'Ticket types',
            details: 'Session/meeting details',
            summary: 'Summary statistics'
          }
        },
        empty: {
          scanPrompt: 'Scan a QR code to check in an attendee'
        },
        scanner: {
          status: 'Active',
          close: 'Close',
          minimize: 'Minimize',
          switchCamera: 'Switch Camera',
          manualEntry: 'Manual Entry',
          checkIn: 'Check In',
          placeholder: 'Enter ticket/confirmation code',
          ready: 'Ready to Scan',
          initializing: 'Initializing camera...', 
          complete: 'Scan Complete',
          error: {
            unsupported: 'QR scanning not supported on this device',
            denied: 'Camera access denied',
            unable: 'Unable to access camera',
            invalid: 'Invalid QR Code',
            invalidDesc: 'This code is not valid for this event',
            session: 'Select a session',
            meeting: 'Select a meeting',
            meetingNotFound: 'Meeting not found',
            notAssigned: 'Attendee is not assigned to this meeting',
                      tryAgain: 'Try Again',
},
          success: {
            title: 'Check-in Successful!',
            reentry: 'Re-entry logged',
            prior: '{count} prior',
            firstTime: 'First time',
            viewProfile: 'View Full Profile',
            next: 'Next Scan'
          },
          duplicate: {
            title: 'Already Checked In',
            first: 'First check-in: {time}',
            allow: 'Allow Re-entry',
            blocked: 'Duplicate check-in blocked'
          },
          offline: 'Check-in queued offline',
          synced: 'Queued check-ins synced'
        },
        sessions: {
          noSessions: 'No sessions available'
        },
        meetings: {
          noMeetings: 'No meetings available'
        }
      },
      reporting: {
        header: {
          title: 'Event Reports & Analytics',
          subtitle: 'Comprehensive insights and data exports',
          exportAll: 'Export All Reports',
          share: 'Share Report'
        },
        filters: {
          eventDuration: 'Event Duration',
          last7: 'Last 7 Days',
          last30: 'Last 30 Days',
          custom: 'Custom Range'
        },
        quickExport: {
          title: 'Quick Exports',
          attendees: 'Attendee contact info',
          checkins: 'Check-in times',
          sessions: 'Engagement per session',
          b2b: 'Meetings and outcomes',
          descriptions: {
            attendees: 'Export attendee contact details (CSV)',
            checkins: 'Export check-in timestamps and types (CSV)',
            sessions: 'Export session attendance and occupancy (CSV)',
            b2b: 'Export meetings, participants, and statuses (CSV)'
          },
          action: 'Export',
          counts: {
            attendees: '{count} attendees',
            checkins: '{count} checked in ({percent}%)',
            sessions: '{count} sessions',
            meetings: '{count} meetings'
          }
        },
        performance: {
          title: 'Event Performance',
          attendance: {
            label: 'Overall Attendance Rate',
            desc: '{checkedIn} of {total} registered',
            target: '+{percent}% vs target'
          },
          revenue: {
            label: 'Total Revenue',
            desc: 'From {count} paid tickets',
            forecast: '+{percent}% vs forecast'
          },
          engagement: {
            label: 'Engagement Score',
            desc: 'Based on multiple factors',
            status: 'Excellent',
            basis: 'Based on sessions, meetings, networking'
          },
          nps: {
            label: 'Net Promoter Score',
            desc: '{count} survey responses',
            status: 'Excellent'
          }
        },
        analytics: {
          title: 'Attendance Analytics',
          subtitle: 'Registration and check-in trends',
          peak: 'Peak Registration Day',
          avg: 'Average per Day',
          conversion: 'Conversion Rate',
          conversionDesc: 'Registered to check-ins',
          registrations: '{count} registrations',
          noData: 'No data yet'
        },
        tickets: {
          title: 'Ticket Sales Breakdown',
          totalRevenue: 'Total Revenue'
        },
        sessions: {
          title: 'Session Performance',
          subtitle: 'Top and bottom performing sessions',
          top: 'Top 5 Sessions',
          insights: {
            high: 'High demand',
            low: 'Low interest',
            normal: 'Normal'
          },
          headers: {
            name: 'Session Name',
            attendance: 'Attendance',
            capacity: 'Capacity',
            rating: 'Rating'
          },
          underperforming: 'View Underperforming Sessions',
          insight: 'Insight'
        },
        b2b: {
          title: 'B2B Networking Insights',
          stats: {
            title: 'Meeting Statistics',
            scheduled: '{count} meetings scheduled',
            completed: '{count} meetings completed ({percent}%)',
            cancelled: '{count} meetings cancelled ({percent}%)',
            avgDuration: '{count} minutes avg duration',
            labels: {
              scheduled: 'Scheduled',
              avgDuration: 'Average duration'
            }
          },
          types: {
            title: 'Meeting Types',
            partnership: 'Partnership',
            salesDemo: 'Sales/Demo',
            investment: 'Investment',
            networking: 'Networking',
            other: 'Other'
          },
          active: {
            title: 'Most Active',
            meetings: '{count} meetings',
            defaultRole: 'Networking participant'
          }
        },
        engagement: {
          title: 'Engagement Metrics',
          sessionAvg: 'Avg. Session Attendance',
          sessionAvgSub: 'sessions per attendee',
          networking: 'Networking Score',
          networkingSub: 'Based on connections made',
          app: 'Event App Usage',
          appSub: 'Of attendees used app',
          downloads: 'Content Downloads',
          downloadsSub: 'Session materials & resources'
        },
        feedback: {
          title: 'Attendee Feedback',
          responses: '{count} responses ({percent}%)',
          overall: 'Overall Event Rating',
          stars: '{count} stars',
          satisfaction: 'Satisfaction by Category',
          categories: {
            venue: 'Venue & Facilities',
            content: 'Session Content & Speakers',
            networking: 'Networking Opportunities',
            organization: 'Event Organization',
            value: 'Value for Money'
          },
          featured: 'Featured Comments'
        },
        builder: {
          title: 'Custom Report Builder',
          subtitle: 'Create a custom report with selected data',
          sections: {
            overview: 'Event Overview & Summary',
            attendance: 'Attendance Analytics',
            revenue: 'Revenue Breakdown',
            sessions: 'Session Performance',
            tickets: 'Ticket Sales Analysis',
            b2b: 'B2B Meeting Insights',
            engagement: 'Engagement Metrics',
            feedback: 'Feedback & Survey Results',
            attendeeList: 'Detailed Attendee List',
            marketing: 'Marketing Performance'
          },
          format: 'Format',
          formats: {
            pdf: 'PDF Report',
            xlsx: 'Excel Workbook (.xlsx)',
            pptx: 'PowerPoint Presentation (.pptx)',
            csv: 'CSV Data Export'
          },
          options: {
            charts: 'Include charts and graphs',
            branding: 'Add company logo and branding'
          },
          actions: {
            preview: 'Preview Report',
            generate: 'Generate Report'
          }
        },
        modals: {
          export: {
            title: 'Export Report',
            format: 'Export Format',
            options: 'Data Options',
            fields: {
              columns: 'Include all columns',
              summary: 'Include summary statistics',
              charts: 'Include charts/visualizations',
              timestamps: 'Include timestamps'
            },
            actions: {
              cancel: 'Cancel',
              confirm: 'Export'
            }
          },
          share: {
            title: 'Share Report',
            link: 'Shareable Link',
            copy: 'Copy',
            password: 'Password protect link',
            expiration: 'Set expiration date',
            email: 'Send via Email',
            emailPlaceholder: 'Enter email addresses...', 
            message: 'Add a message... (optional)',
            actions: {
              cancel: 'Cancel',
              share: 'Share Report'
            }
          }
        },
        toasts: {
          exported: 'All reports exported',
          attendeesExported: 'Attendee report exported',
          checkinsExported: 'Check-in report exported',
          sessionsExported: 'Session report exported',
          b2bExported: 'B2B report exported',
          generated: 'Report generated successfully',
          shared: 'Report shared successfully',
          unsupported: 'Unsupported export type',
          failed: 'Export failed'
        }
      },
    },
    profile: {
      header: {
        title: 'My Profile',
        subtitle: 'Manage your personal information and networking profile',
        preview: 'Preview Public Profile',
        save: 'Save Changes'
      },
      card: {
        changePhoto: 'Change Photo',
        memberSince: 'Member since {date}',
        profileCompletion: 'Profile Completion',
        completion: '{percent}% Complete',
        addLinkedInHint: 'Add LinkedIn to reach {percent}%',
        social: {
          linkedin: 'LinkedIn',
          twitter: 'Twitter',
          website: 'Website'
        },
        connected: 'Connected',
        connect: 'Connect',
        edit: 'Edit',
        add: 'Add'
      },
      stats: {
        title: 'Activity Stats',
        eventsAttended: 'Events Attended',
        b2bMeetings: 'B2B Meetings',
        connectionsMade: 'Connections Made',
        profileViews: 'Profile Views'
      },
      tabs: {
        basic: 'Basic Info',
        professional: 'Professional Details',
        b2b: 'B2B Networking',
        preferences: 'Preferences'
      },
      common: {
        select: 'Select...',
        selectSector: '+ Add Professional Sector'
      },
      sections: {
        personal: {
          title: 'Personal Information',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          emailHelper: 'This email is used for login and notifications',
          phone: 'Phone Number',
          dateOfBirth: 'Date of Birth',
          dobHelper: 'Not shown publicly',
          gender: 'Gender',
          location: 'Location',
          timezone: 'Time Zone'
        },
        about: {
          title: 'About Me',
          bioLabel: 'Bio / Description',
          bioHelper: 'This appears on your public profile and B2B networking page',
          counter: '{current}/{max}',
          showBio: 'Show bio on public profile'
        },
        professional: {
          title: 'Professional Information',
          jobTitle: 'Current Job Title',
          company: 'Company / Organization',
          industry: 'Industry',
          sector: 'Professional Sector',
          industryOther: 'Other Industry',
          department: 'Department',
          yearsExperience: 'Years of Experience',
          companySize: 'Company Size'
        },
        skills: {
          title: 'Areas of Expertise',
          skillsLabel: 'Skills & Expertise',
          addSkill: 'Add skill',
          skillsLimit: 'Add up to 10 skills',
          interestsLabel: 'Professional Interests',
          addInterest: 'Add interest'
        },
        education: {
          title: 'Education',
          add: 'Add Education'
        },
        certifications: {
          label: 'Certifications',
          add: 'Add Certification'
        }
      },
      b2b: {
        title: 'B2B Networking Profile',
        subtitle: 'This information helps match you with relevant connections at events',
        enableTitle: 'Enable B2B Networking',
        enableHelper: 'Allow other attendees to see your profile and request meetings',
        meetingPreferences: 'Meeting Preferences',
        meetingGoalsLabel: 'What are you looking for?',
        industriesLabel: "Industries I'm Interested In",
        addIndustry: 'Add industry',
        companyStagesLabel: "Company Stages I'm Interested In",
        topicsLabel: 'Topics I Can Discuss',
        addTopic: 'Add topic',
        availabilityTitle: 'Availability',
        availabilityLabel: "I'm available for meetings",
        meetingFormatLabel: 'Preferred Meeting Format',
        meetingDurationLabel: 'Preferred Duration',
        meetingNotesLabel: 'Additional Information for Meeting Requests',
        meetingNotesPlaceholder: 'e.g., Please mention specific topics in your request, Available weekdays only, etc.'
      },
      ai: {
        title: 'AI Matchmaking Preferences',
        proBadge: 'PRO',
        lockedMessage: 'Upgrade to Pro to unlock AI-powered matchmaking',
        upgrade: 'Upgrade to Pro',
        receiveTitle: 'Receive AI-powered meeting suggestions',
        receiveHelper: 'Get smart recommendations based on your profile and goals',
        frequencyLabel: 'How often should we send suggestions?',
        prioritiesLabel: 'Prioritize matches based on:',
        criteria: {
          industry: 'Industry alignment',
          role: 'Job role similarity',
          stage: 'Company stage match',
          interests: 'Shared interests'
        }
      },
      preferences: {
        notificationsTitle: 'Notifications',
        privacyTitle: 'Privacy & Visibility',
        profileVisibilityLabel: 'Who can see my profile?',
        contactVisibilityLabel: 'Who can see my contact details?',
        activityTitle: 'Show my activity on public profile',
        activityHelper: 'Display events attended and connections made',
        accountTitle: 'Account',
        changePassword: 'Change Password',
        twoFactor: 'Two-Factor Authentication',
        recommended: 'Recommended',
        language: 'Language',
        dangerTitle: 'Danger Zone',
        dangerHelper: 'Permanently delete your account and all associated data',
        deleteAccount: 'Delete Account'
      },
      sticky: {
        unsaved: 'You have unsaved changes',
        discard: 'Discard',
        save: 'Save Changes'
      },
      modals: {
        common: {
          cancel: 'Cancel',
          save: 'Save',
          saving: 'Saving...'
        },
        education: {
          addTitle: 'Add Education',
          editTitle: 'Edit Education',
          degree: 'Degree',
          institution: 'Institution',
          years: 'Years',
          yearsPlaceholder: 'e.g., 2016 - 2020'
        },
        password: {
          title: 'Change Password',
          current: 'Current Password',
          new: 'New Password',
          confirm: 'Confirm New Password',
          updating: 'Updating...', 
          update: 'Update Password',
          requirements: {
            length: 'At least 8 characters',
            uppercase: 'One uppercase letter',
            number: 'One number',
            special: 'One special character'
          }
        },
        twoFactor: {
          title: 'Enable Two-Factor',
          instructions: 'Scan the QR code with your authenticator app, then enter the 6-digit code to verify.',
          qrUnavailable: 'QR code unavailable',
          codeLabel: 'Verification Code',
          codePlaceholder: '123456',
          verifying: 'Verifying...', 
          verify: 'Verify & Enable'
        },
        deleteConfirm: {
          title: 'Confirm Deletions',
          message: 'You are about to clear fields that already have saved data. This cannot be undone after saving.',
          accept: 'I understand these fields will be cleared.',
          confirm: 'Confirm & Save'
        }
      },
      preview: {
        avatarAlt: 'Profile',
        about: 'About',
        skills: 'Skills & Expertise',
        interests: 'Professional Interests',
        hint: 'This is how other attendees see your profile',
        close: 'Close Preview'
      },
      crop: {
        title: 'Crop Photo',
        zoom: 'Zoom',
        apply: 'Apply & Upload'
      },
      prompts: {
        linkedin: 'LinkedIn URL',
        twitter: 'Twitter URL',
        website: 'Website URL',
        addSkill: 'Add a skill',
        addInterest: 'Add an interest',
        addIndustry: 'Add an industry',
        addTopic: 'Add a topic',
        certificationName: 'Certification',
        certificationOrganization: 'Organization',
        certificationYear: 'Year'
      },
      fields: {
        phoneNumber: 'Phone number',
        dateOfBirth: 'Date of birth',
        location: 'Location',
        timezone: 'Timezone',
        jobTitle: 'Job title',
        company: 'Company',
        department: 'Department',
        industry: 'Industry',
        gender: 'Gender',
        yearsExperience: 'Years of experience',
        companySize: 'Company size',
        bio: 'Bio',
        linkedinUrl: 'LinkedIn URL',
        twitterUrl: 'Twitter URL',
        websiteUrl: 'Website URL',
        customIndustry: 'Custom industry',
        meetingTopics: 'Meeting topics',
        meetingGoals: 'Meeting goals',
        companyStages: 'Company stages',
        meetingFormats: 'Meeting formats',
        availabilityPreference: 'Availability preference',
        meetingDuration: 'Meeting duration',
        meetingNotes: 'Meeting notes',
        notificationPreferences: 'Notification preferences',
        contactVisibility: 'Contact visibility',
        profileVisibility: 'Profile visibility',
        language: 'Language'
      },
      toasts: {
        updateSuccess: 'Profile updated successfully',
        updateFailed: 'Failed to update profile',
        changesDiscarded: 'Changes discarded',
        educationMissing: 'Please complete all education fields.',
        educationUpdated: 'Education updated.',
        educationAdded: 'Education added.',
        educationFailed: 'Failed to save education.',
        passwordSignIn: 'Please sign in to update your password.',
        passwordFields: 'Please complete all password fields.',
        passwordMismatch: 'New passwords do not match.',
        passwordIncorrect: 'Current password is incorrect.',
        passwordUpdated: 'Password updated successfully.',
        passwordFailed: 'Failed to update password.',
        twoFactorUnavailable: 'Two-factor authentication is unavailable.',
        twoFactorDisableFailed: 'Unable to disable two-factor authentication.',
        twoFactorDisabled: 'Two-factor authentication disabled.',
        twoFactorFailed: 'Two-factor authentication failed.',
        twoFactorEnterCode: 'Enter the verification code.',
        twoFactorEnabled: 'Two-factor authentication enabled.',
        twoFactorVerifyFailed: 'Verification failed.',
        photoSignIn: 'Please sign in to update your photo',
        photoUploadFailed: 'Failed to upload photo',
        photoUpdated: 'Profile photo updated',
        photoSaveFailed: 'Failed to save profile photo'
      },
      options: {
        industryOtherValue: 'Other',
        gender: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'non-binary', label: 'Non-binary' },
          { value: 'prefer-not-to-say', label: 'Prefer not to say' },
          { value: 'custom', label: 'Custom' }
        ],
        timezones: [
          { value: 'pt', label: 'Pacific Time (PT) - UTC-8' },
          { value: 'mt', label: 'Mountain Time (MT) - UTC-7' },
          { value: 'ct', label: 'Central Time (CT) - UTC-6' },
          { value: 'et', label: 'Eastern Time (ET) - UTC-5' }
        ],
        industries: [
          { value: 'Technology & Software', label: 'Technology & Software' },
          { value: 'AI, IoT & Emerging Tech', label: 'AI, IoT & Emerging Tech' },
          { value: 'Developers & Engineers', label: 'Developers & Engineers' },
          { value: 'Financial Services & Banking', label: 'Financial Services & Banking' },
          { value: 'Investment & Banking', label: 'Investment & Banking' },
          { value: 'Audit, Accounting & Finance', label: 'Audit, Accounting & Finance' },
          { value: 'Insurance & Microfinance', label: 'Insurance & Microfinance' },
          { value: 'Healthcare & Pharmaceuticals', label: 'Healthcare & Pharmaceuticals' },
          { value: 'Education & Training', label: 'Education & Training' },
          { value: 'Universities & Academies', label: 'Universities & Academies' },
          { value: 'Students & Researchers', label: 'Students & Researchers' },
          { value: 'Media & Entertainment', label: 'Media & Entertainment' },
          { value: 'Audiovisual & Creative Industries', label: 'Audiovisual & Creative Industries' },
          { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
          { value: 'Retail & E-commerce', label: 'Retail & E-commerce' },
          { value: 'Manufacturing & Production', label: 'Manufacturing & Production' },
          { value: 'Real Estate & Construction', label: 'Real Estate & Construction' },
          { value: 'Transportation & Logistics', label: 'Transportation & Logistics' },
          { value: 'Energy & Utilities', label: 'Energy & Utilities' },
          { value: 'Hospitality & Tourism', label: 'Hospitality & Tourism' },
          { value: 'Telecommunications', label: 'Telecommunications' },
          { value: 'Agriculture & Food Production', label: 'Agriculture & Food Production' },
          { value: 'Legal Services', label: 'Legal Services' },
          { value: 'Consulting & Professional Services', label: 'Consulting & Professional Services' },
          { value: 'Coaches & Trainers', label: 'Coaches & Trainers' },
          { value: 'Non-Profit & Civil Society', label: 'Non-Profit & Civil Society' },
          { value: 'Government & Public Sector', label: 'Government & Public Sector' },
          { value: 'Entrepreneurs & Startups', label: 'Entrepreneurs & Startups' }
        ],
        companySizes: [
          { value: '1-10', label: '1-10 employees' },
          { value: '11-50', label: '11-50 employees' },
          { value: '51-200', label: '51-200 employees' },
          { value: '201-500', label: '201-500 employees' },
          { value: '501-1000', label: '501-1000 employees' },
          { value: '1000+', label: '1000+ employees' }
        ],
        meetingGoals: [
          { value: 'Find potential clients/customers', label: 'Find potential clients/customers', checked: true },
          { value: 'Explore partnership opportunities', label: 'Explore partnership opportunities', checked: true },
          { value: 'Investment/Funding', label: 'Investment/Funding', checked: false },
          { value: 'Learn from industry experts', label: 'Learn from industry experts', checked: true },
          { value: 'Hire talent', label: 'Hire talent', checked: false },
          { value: 'Share knowledge/expertise', label: 'Share knowledge/expertise', checked: true },
          { value: 'Other (specify)', label: 'Other (specify)', checked: false }
        ],
        companyStages: [
          { value: 'Startup (Seed stage)', label: 'Startup (Seed stage)', checked: true },
          { value: 'Early stage (Series A/B)', label: 'Early stage (Series A/B)', checked: true },
          { value: 'Growth stage (Series C+)', label: 'Growth stage (Series C+)', checked: false },
          { value: 'Enterprise', label: 'Enterprise', checked: true }
        ],
        availability: [
          { value: 'Always open to meeting requests', label: 'Always open to meeting requests', checked: true },
          { value: "Only at events I'm attending", label: "Only at events I'm attending" },
          { value: 'Not currently accepting meetings', label: 'Not currently accepting meetings' }
        ],
        meetingFormats: [
          { value: 'In-person', label: 'In-person', checked: true },
          { value: 'Virtual (video call)', label: 'Virtual (video call)', checked: true },
          { value: 'Phone call', label: 'Phone call', checked: false }
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
            label: 'Event Updates',
            helper: "Receive updates about events you're attending",
            checked: true
          },
          {
            value: 'B2B Meeting Requests',
            label: 'B2B Meeting Requests',
            helper: 'Get notified when someone requests a meeting',
            checked: true
          },
          {
            value: 'Marketing Emails',
            label: 'Marketing Emails',
            helper: 'Promotional content and event recommendations',
            checked: false
          },
          {
            value: 'Weekly Digest',
            label: 'Weekly Digest',
            helper: 'Summary of activity and upcoming events',
            checked: true
          }
        ],
        profileVisibility: [
          { value: 'Everyone (Public)', label: 'Everyone (Public)', checked: true },
          { value: 'Only event attendees', label: 'Only event attendees' },
          { value: "Only people I've connected with", label: "Only people I've connected with" },
          { value: 'Private (Hidden)', label: 'Private (Hidden)' }
        ],
        contactVisibility: [
          { value: 'Email address', label: 'Email address', checked: true },
          { value: 'Phone number', label: 'Phone number', checked: true },
          { value: 'LinkedIn profile', label: 'LinkedIn profile', checked: false },
          { value: 'Company information', label: 'Company information', checked: true }
        ],
        aiSuggestionFrequency: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly', checked: true },
          { value: 'before-event', label: 'Before each event' }
        ],
        languages: [
          { value: 'en-us', label: 'English (US)', checked: true },
          { value: 'en-uk', label: 'English (UK)' },
          { value: 'fr', label: 'French' },
          { value: 'es', label: 'Spanish' },
          { value: 'de', label: 'German' },
          { value: 'ar', label: 'Arabic' }
        ]
      }
    },
    wizard: {
      common: {
        back: 'Back',
        saveContinue: 'Save & Continue',
        saveDraft: 'Save Draft',
        cancel: 'Cancel',
        untitledEvent: 'Untitled Event',
        statusDraft: 'DRAFT',
        eventLabel: 'Event',
        yourEvent: 'your event'
      },
      stepLabels: {
        step1: 'Step 1 of 4',
        step3: 'Step {current} of {total}',
        step4: 'Step 4 of 4'
      },
      step1: {
        title: 'Event Information',
        subtitle: 'Provide basic details about your event including name, date, location, and description.'
      },
      step3: {
        subSteps: {
          tickets: 'Tickets',
          speakers: 'Speakers',
          attendees: 'Attendees',
          exhibitors: 'Exhibitors',
          schedule: 'Schedule',
          sponsors: 'Sponsors',
          qrBadges: 'QR Badges',
          customForms: 'Custom Forms',
          marketingTools: 'Marketing Tools'
        },
        descriptions: {
          tickets: 'Set up ticket types, pricing, and availability for your event.',
          speakers: 'Add speakers, manage profiles, and organize sessions.',
          attendees: 'Configure attendee capacity, registration settings, and custom forms.',
          exhibitors: 'Manage exhibitors, booth assignments, and sponsorship tiers.',
          schedule: 'Build the event agenda and session schedule.',
          sponsors: 'Showcase sponsors and manage sponsorship packages.',
          qrBadges: 'Generate QR badges for faster check-in.',
          customForms: 'Collect custom attendee information with flexible forms.',
          marketingTools: 'Promote your event with built-in marketing tools.'
        },
        errors: {
          saveFirst: 'Save event details before continuing.',
          continueFirst: 'Please continue from the previous step first.'
        },
        loading: 'Loading registration setup...',
        missingStep1: 'Complete event details first to continue.',
        continueReview: 'Continue to Review',
        ticketsTab: {
          title: 'Ticket Types',
          subtitle: 'Create and manage ticket options for your event',
          addTicket: 'Add Ticket',
          loading: 'Loading tickets...',
          confirmDelete: 'Are you sure you want to delete this ticket?',
          toasts: {
            statusUpdated: 'Ticket status updated',
            updated: 'Ticket updated successfully',
            created: 'Ticket created successfully',
            deleted: 'Ticket deleted'
          },
          pro: {
            title: 'PRO Feature',
            subtitle: 'Upgrade to create VIP tickets',
            cta: 'Upgrade to Pro'
          },
          status: {
            active: 'Active',
            expired: 'Expired',
            enabled: 'Enabled',
            disabled: 'Disabled'
          },
          card: {
            price: 'Price',
            perAttendee: 'per attendee',
            totalAvailable: 'Total Available',
            unlimited: 'Unlimited',
            tickets: 'tickets',
            saleEnds: 'Sale ends: {date}',
            noEndDate: 'N/A',
            includes: 'Includes: {count} items',
            edit: 'Edit Ticket'
          },
          empty: {
            title: 'Add Free Ticket Option',
            subtitle: 'Great for networking events or community meetups',
            cta: 'Add Free Ticket'
          },
          settings: {
            title: 'Ticket Settings',
            globalLimit: {
              title: 'Global Ticket Limit',
              subtitle: 'Limit the total number of tickets one person can purchase across all ticket types',
              toggle: 'Enable global ticket limit',
              maxPerPerson: 'Maximum tickets per person',
              placeholder: 'e.g., 10',
              exampleLabel: 'Example:',
              exampleBody: 'If set to {count}, a person can buy up to {count} tickets total in any combination.'
            }
          }
        },
        ticketsModal: {
          title: 'Create New Ticket Type',
          subtitle: 'Configure pricing and availability',
          eventType: {
            paidTitle: 'Paid Event Ticket',
            freeTitle: 'Free Event Ticket',
            paidBody: 'This event was configured as a paid event in Step 1. All tickets will require payment.',
            freeBody: 'This event was configured as a free event in Step 1. All tickets will be free of charge.'
          },
          fields: {
            name: {
              label: 'Ticket Name *',
              placeholder: 'e.g., General Admission, VIP Pass, Early Bird'
            },
            description: {
              label: 'Ticket Description *',
              placeholder: "Describe what's included..."
            },
            vip: {
              label: 'VIP Ticket',
              helper: "VIP tickets have quantity controls. Basic tickets don't limit availability.",
              lockedHelper: 'VIP tickets with priority seating and exclusive perks (PRO feature)'
            },
            currency: {
              label: 'Currency *'
            },
            price: {
              label: 'Price *',
              placeholder: '0.00'
            },
            vipQuantity: {
              label: 'VIP Ticket Quantity *',
              placeholder: 'e.g., 50',
              helper: 'Limit the number of VIP tickets available',
              warningTitle: 'Warning: VIP tickets ({quantity}) exceed event capacity ({capacity})',
              warningBody: 'Adjust ticket quantities or increase event capacity'
            },
            salesPeriod: {
              label: 'Sales Period *',
              start: 'Start Date & Time',
              end: 'End Date & Time'
            },
            earlyBird: {
              label: 'Early Bird Discount',
              discountLabel: 'Discount Percentage *',
              discountPlaceholder: 'e.g., 20',
              start: 'Early Bird Start',
              end: 'Early Bird End',
              helper: 'Early bird pricing will automatically apply during the specified period'
            },
            includes: {
              label: "What's Included (Optional)",
              placeholder: 'Add included items...'
            }
          },
          proWarning: {
            title: 'Upgrade to Pro Required',
            message: 'Free plans can only create free tickets. Upgrade to Pro to sell paid tickets and access VIP features.'
          },
          actions: {
            saveDraft: 'Save as Draft',
            addTicket: 'Add Ticket'
          }
        },
        speakers: {
          title: 'Speakers & Presenters',
          subtitle: "Manage your event's speakers and their profiles",
          add: 'Add Speaker',
          loading: 'Loading speakers...',
          confirmDelete: 'Are you sure you want to delete this speaker?',
          toasts: {
            updated: 'Speaker updated successfully',
            created: 'Speaker added successfully',
            deleted: 'Speaker deleted',
            imported: 'Speakers imported successfully'
          },
          filters: {
            all: 'All Speakers',
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Workshop'
          },
          searchPlaceholder: 'Search speakers...',
          sortBy: 'Sort by: Name',
          badges: {
            keynote: 'KEYNOTE',
            panel: 'PANEL',
            workshop: 'WORKSHOP'
          },
          status: {
            confirmed: 'Confirmed',
            pending: 'Pending',
            declined: 'Declined'
          },
          empty: {
            title: 'Add New Speaker',
            subtitle: 'Build your speaker lineup',
            cta: '+ Add Speaker'
          },
          modal: {
            titleCreate: 'Add New Speaker',
            titleEdit: 'Edit Speaker',
            subtitle: 'Add speaker information and assign to sessions',
            sections: {
              basic: 'Basic Information',
              professional: 'Professional Information',
              details: 'Speaker Details',
              type: 'Speaker Type *'
            },
            fields: {
              photo: {
                label: 'Profile Photo',
                uploading: 'Uploading...',
                cta: 'Upload Photo',
                helper: '400x400px, max 2MB'
              },
              name: {
                label: 'Full Name *',
                placeholder: 'e.g., John Smith'
              },
              email: {
                label: 'Email Address *',
                placeholder: 'speaker@email.com',
                helper: 'Used for communication only, not public'
              },
              phone: {
                label: 'Phone Number (Optional)',
                placeholder: '+1 (555) 123-4567'
              },
              title: {
                label: 'Job Title *',
                placeholder: 'e.g., CEO, CTO, Senior Product Manager'
              },
              company: {
                label: 'Company/Organization *',
                placeholder: 'e.g., Tech Innovations Inc.'
              },
              linkedin: {
                label: 'LinkedIn Profile (Optional)',
                placeholder: 'https://linkedin.com/in/...'
              },
              twitter: {
                label: 'Twitter/X Handle (Optional)',
                placeholder: '@username'
              },
              website: {
                label: 'Website (Optional)',
                placeholder: 'https://...'
              },
              bio: {
                label: 'Biography *',
                placeholder: "Tell attendees about this speaker's background, expertise, and experience...",
                helper: "This will be shown on the speaker's profile page"
              },
              shortBio: {
                label: 'Short Bio (Optional)',
                placeholder: 'Brief one-liner for speaker card previews...'
              },
              tags: {
                label: 'Expertise Topics/Tags *',
                placeholder: 'Add topic and press Enter',
                helper: 'Add 2-5 topics'
              }
            },
            types: {
              keynote: {
                label: 'Keynote Speaker',
                desc: 'Main stage speaker, featured prominently'
              },
              panel: {
                label: 'Panelist',
                desc: 'Part of panel discussions'
              },
              workshop: {
                label: 'Workshop Leader',
                desc: 'Leads hands-on workshops'
              },
              regular: {
                label: 'Regular Speaker',
                desc: 'Standard session speaker'
              }
            },
            actions: {
              saveDraft: 'Save as Draft',
              saved: 'Saved',
              save: 'Save Speaker'
            }
          },
          profileModal: {
            about: 'About',
            expertise: 'Expertise',
            speakingAt: 'Speaking At',
            contact: 'Get in Touch',
            sampleSessions: {
              keynote: {
                title: 'Opening Keynote: The Future of AI',
                date: 'Dec 15, 2024 at 9:00 AM',
                location: 'Main Hall A',
                duration: '45 minutes',
                attendees: '500+ registered'
              },
              panel: {
                title: 'Panel Discussion: Innovation in SaaS',
                date: 'Dec 15, 2024 at 2:00 PM',
                location: 'Conference Room B',
                duration: '60 minutes',
                attendees: '200+ registered'
              }
            },
            actions: {
              email: 'Email',
              linkedin: 'LinkedIn',
              website: 'Website',
              close: 'Close'
            }
          },
          importModal: {
            title: 'Import Speakers',
            subtitle: 'Upload a CSV file with speaker information',
            dropzone: {
              title: 'Drop CSV file here or click to browse',
              helper: 'Supported: .csv, .xlsx'
            },
            template: {
              title: 'Need a template?',
              subtitle: 'Use our template to ensure correct formatting',
              cta: 'Download CSV Template'
            },
            fields: {
              requiredLabel: 'Required fields:',
              required: 'Name, Email, Title, Company, Bio',
              optionalLabel: 'Optional fields:',
              optional: 'Phone, LinkedIn, Twitter, Website, Tags, Type, Status'
            },
            actions: {
              import: 'Import Speakers'
            }
          }
        },
        attendees: {
          title: 'Attendee Configuration',
          subtitle: 'Configure attendee groups, permissions, and settings',
          infoTitle: 'Configure how attendees are organized and managed',
          loading: 'Loading settings...',
          toasts: {
            categoryDeleted: 'Category deleted',
            categoryDeleteFailed: 'Failed to delete category',
            categoryNameRequired: 'Category name is required',
            categoryUpdated: 'Category updated',
            categoryCreated: 'Category created',
            categorySaveFailed: 'Failed to save category'
          },
          permissions: {
            title: 'Attendee Permissions',
            subtitle: 'Control what attendees can access and do',
            selfCheckin: {
              title: 'Allow Self Check-in',
              subtitle: 'Let attendees check themselves in via mobile app or QR code',
              note: 'Requires event app or self-service kiosks'
            },
            profileEditing: {
              title: 'Allow Profile Editing',
              subtitle: 'Attendees can update their own information after registration',
              options: {
                contact: 'Can edit contact information',
                dietary: 'Can edit dietary preferences',
                requirements: 'Can edit special requirements',
                company: 'Can edit company/job title'
              }
            },
            sessionRegistration: {
              title: 'Session Registration Required',
              subtitle: 'Require attendees to register for specific sessions'
            },
            b2b: {
              title: 'B2B Networking Access',
              subtitle: 'Allow attendees to access B2B matchmaking features',
              options: {
                all: 'All attendees can access',
                categories: 'Only specific categories',
                approval: 'Requires approval'
              }
            },
            download: {
              title: 'Content Download Access',
              subtitle: 'Allow attendees to download session materials and resources'
            },
            publicDirectory: {
              title: 'Public Attendee Directory',
              subtitle: 'Display attendee list publicly for networking',
              upgrade: 'Upgrade to Pro'
            }
          },
          communication: {
            title: 'Communication Settings',
            subtitle: 'Configure how you communicate with attendees',
            automatedEmails: {
              title: 'Automated Email Notifications',
              subtitle: 'Send automatic emails for key events',
              triggers: {
                registration: {
                  label: 'Registration Confirmation',
                  sub: 'Sent immediately after registration'
                },
                reminder: {
                  label: 'Event Reminder',
                  sub: 'Sent 24 hours before event'
                },
                checkin: {
                  label: 'Check-in Confirmation',
                  sub: 'Sent when attendee checks in'
                },
                thankYou: {
                  label: 'Post-Event Thank You',
                  sub: 'Sent 2 hours after event ends'
                }
              },
              editTemplate: 'Edit Template'
            },
            sms: {
              title: 'SMS Notifications',
              subtitle: 'Send text messages for critical updates',
              upgrade: 'Upgrade to Pro to enable SMS'
            },
            inApp: {
              title: 'In-App Notifications',
              subtitle: 'Push notifications via event mobile app',
              options: {
                sessionStart: 'Session start reminders',
                scheduleChanges: 'Schedule changes',
                b2bReminders: 'B2B meeting reminders',
                networking: 'Networking opportunities'
              }
            }
          },
          privacy: {
            title: 'Data & Privacy Settings',
            subtitle: 'Manage attendee data collection and privacy',
            additionalData: {
              title: 'Collect Additional Data',
              note: 'These fields are separate from your registration form and collected during profile setup',
              fields: {
                companyName: 'Company Name',
                jobTitle: 'Job Title',
                industry: 'Industry',
                companySize: 'Company Size',
                businessGoals: 'Business Goals',
                linkedin: 'LinkedIn Profile URL',
                linkedinSub: 'For networking purposes'
              }
            },
            retention: {
              title: 'Data Retention Policy',
              subtitle: 'How long to keep attendee data after event',
              options: {
                days30: '30 days after event',
                days90: '90 days after event',
                months6: '6 months after event',
                year1: '1 year after event',
                year2: '2 years after event',
                forever: 'Forever'
              }
            },
            gdpr: {
              title: 'GDPR Compliance Mode',
              subtitle: 'Enable additional privacy controls for EU attendees',
              options: {
                consent: 'Require explicit consent for data processing',
                deletion: 'Allow attendees to request data deletion',
                privacy: 'Show privacy policy during registration'
              }
            },
            export: {
              title: 'Allow Attendees to Export Their Data',
              subtitle: 'Let attendees download their own information'
            }
          },
          categoryModal: {
            editTitle: 'Edit Category',
            createTitle: 'Create Attendee Category',
            subtitle: 'Group attendees for better organization',
            fields: {
              name: 'Category Name*',
              namePlaceholder: 'e.g., Media & Press, Volunteers, Sponsors',
              description: 'Description (Optional)',
              descriptionPlaceholder: 'Describe this category...',
              color: 'Category Color',
              assignment: 'Assign Based On'
            },
            assignmentOptions: {
              manual: 'Manual assignment',
              ticket: 'Ticket type',
              date: 'Registration date range',
              field: 'Custom field value'
            },
            delete: 'Delete Category',
            cancel: 'Cancel',
            save: 'Save Changes',
            create: 'Create Category'
          }
        },
        exhibitors: {
          title: 'Exhibitors',
          subtitle: 'Manage exhibitor companies and partnerships',
          add: 'Add Exhibitor',
          loading: 'Loading exhibitors...',
          searchPlaceholder: 'Search exhibitors...',
          sortBy: 'Sort by: Company Name',
          export: 'Export List',
          confirmDelete: 'Are you sure you want to delete this exhibitor?',
          toasts: {
            updated: 'Exhibitor updated successfully',
            created: 'Exhibitor added successfully',
            saveFailed: 'Failed to save exhibitor',
            deleted: 'Exhibitor deleted',
            deleteFailed: 'Failed to delete exhibitor',
            formSent: 'Form sent to exhibitor'
          },
          status: {
            confirmed: 'Confirmed',
            pending: 'Pending',
            declined: 'Declined',
            contractSent: 'Contract Sent',
            pendingContract: 'Pending Contract'
          },
          table: {
            company: 'Company',
            contact: 'Contact',
            status: 'Status',
            actions: 'Actions'
          },
          empty: {
            title: 'Add New Exhibitor',
            subtitle: 'Grow your exhibitor lineup',
            cta: 'Add Exhibitor'
          },
          card: {
            readMore: 'Read more',
            edit: 'Edit Exhibitor'
          },
          addChoice: {
            title: 'Add New Exhibitor',
            subtitle: 'Choose how you want to add the exhibitor',
            manual: {
              title: 'Add Manually',
              subtitle: 'Fill in the exhibitor details yourself using our form'
            },
            sendForm: {
              title: 'Send Form to Exhibitor',
              subtitle: 'Email a form to the exhibitor to fill out their own details'
            }
          },
          formPreview: {
            title: 'Send Exhibitor Form',
            subtitle: 'Preview the form and enter the recipient email address',
            recipientLabel: 'Recipient Email Address',
            recipientPlaceholder: 'exhibitor@company.com',
            formTitle: 'Exhibitor Information Form',
            formSubtitle: 'Please fill out the form below to register as an exhibitor for our event.',
            fields: {
              companyName: 'Company Name',
              industry: 'Industry',
              contactEmail: 'Contact Email',
              description: 'Description'
            },
            send: 'Send Form'
          },
          modal: {
            editTitle: 'Edit Exhibitor',
            addTitle: 'Add New Exhibitor',
            subtitle: 'Enter exhibitor company information',
            companySection: 'Company Information',
            contactSection: 'Contact Information',
            statusSection: 'Status & Notes',
            fields: {
              companyName: 'Company Name',
              companyNamePlaceholder: 'e.g., TechCorp Inc.',
              industry: 'Industry',
              industryPlaceholder: 'Select industry...',
              description: 'Company Description',
              descriptionPlaceholder: 'Brief description of what your company does...',
              email: 'Email Address',
              emailPlaceholder: 'contact@company.com',
              phone: 'Phone Number',
              phonePlaceholder: '+1 (555) 123-4567',
              website: 'Website',
              websitePlaceholder: 'https://www.company.com',
              status: 'Exhibitor Status',
              notes: 'Internal Notes',
              notesPlaceholder: 'Add any internal notes or reminders...',
              notesHelper: "These notes are for internal use only and won't be visible to exhibitors"
            },
            cancel: 'Cancel',
            save: 'Save Changes',
            add: 'Add Exhibitor'
          },
          profile: {
            about: 'About',
            contactTitle: 'Contact Information',
            email: 'Email',
            phone: 'Phone',
            website: 'Website',
            notes: 'Internal Notes',
            delete: 'Delete Exhibitor',
            edit: 'Edit Exhibitor'
          }
        },
        sessions: {
          title: 'Event Schedule',
          subtitle: 'Create and manage your event schedule with sessions, speakers, and venues',
          view: {
            timeline: 'Timeline View',
            list: 'List View'
          },
          actions: {
            addSession: 'Add Session',
            createSession: 'Create Session',
            exportSchedule: 'Export Schedule',
            addAnotherSession: 'Add Another Session'
          },
          filters: {
            allDays: 'All Days',
            allTypes: 'All Types'
          },
          types: {
            keynote: 'Keynote',
            workshop: 'Workshop',
            panel: 'Panel Discussion',
            break: 'Break / Networking',
            hackathon: 'Hackathon',
            pitching: 'Pitching Session',
            training: 'Training',
            other: 'Other'
          },
          searchPlaceholder: 'Search sessions...',
          empty: {
            title: 'No sessions found',
            filtered: 'Try adjusting your filters to see more results.',
            unfiltered: 'Get started by adding your first session to the schedule.'
          },
          table: {
            session: 'Session',
            dateTime: 'Date & Time',
            venue: 'Venue',
            attendees: 'Attendees',
            actions: 'Actions',
            noSpeakers: 'No speakers'
          },
          card: {
            duration: 'Duration: {minutes} minutes',
            capacity: 'Capacity: {count}',
            noVenue: 'No venue assigned',
            tbd: 'TBD',
            speakersLabel: 'Speakers ({count})',
            moreSpeakers: '+ {count} more',
            edit: 'Edit Session',
            checkInTitle: 'Session requires check-in',
            checkInHelper: 'Track attendance'
          },
          status: {
            confirmed: 'Confirmed',
            tentative: 'Tentative'
          },
          confirmDelete: 'Are you sure you want to delete this session?',
          modal: {
            requiredFields: 'Please fill in all required fields',
            titleEdit: 'Edit Session',
            titleCreate: 'Create New Session',
            subtitle: 'Configure session details, speakers, and logistics',
            tabs: {
              details: 'Details',
              speakers: 'Speakers',
              advanced: 'Advanced'
            },
            sessionType: 'Session Type *',
            typeDescriptions: {
              keynote: 'Main stage presentation',
              workshop: 'Hands-on learning session',
              panel: 'Multiple speakers discussing',
              break: 'Non-session time block',
              hackathon: 'Collaborative coding event',
              pitching: 'Startup or idea presentations',
              training: 'Educational training session',
              other: 'Custom session type'
            },
            customType: 'Specify Session Type *',
            customTypePlaceholder: 'e.g., Fireside Chat, Demo Session, Q&A...',
            sessionTitle: 'Session Title *',
            sessionTitlePlaceholder: 'e.g., The Future of AI in Enterprise',
            description: 'Description',
            descriptionPlaceholder: 'Describe what attendees will learn or experience...',
            date: 'Date *',
            startTime: 'Start Time *',
            endTime: 'End Time *',
            venue: 'Venue/Location *',
            venuePlaceholder: 'Select venue...',
            addNewVenue: '+ Add new venue',
            addNewVenueTitle: 'Add New Venue',
            newVenueName: 'Venue Name *',
            newVenueNamePlaceholder: 'e.g., Conference Room C',
            newVenueCapacity: 'Capacity *',
            newVenueCapacityPlaceholder: 'e.g., 150',
            saveVenue: 'Save Venue',
            cancel: 'Cancel',
            capacity: 'Maximum Capacity',
            capacityPlaceholder: 'e.g., 100',
            tags: 'Tags',
            tagsPlaceholder: 'Type a tag and press Enter',
            selectedSpeakers: 'Selected Speakers ({count})',
            speakerLine: '{title} • {company}',
            noSpeakersAssigned: 'No speakers assigned yet',
            addSpeaker: 'Add Speaker',
            addMoreSpeakers: 'Add More Speakers',
            sessionStatus: 'Session Status',
            showInPublic: 'Show in public schedule',
            enableCheckIn: 'Enable session check-in',
            postSessionSurvey: 'Post-Session Survey',
            postSessionSurveyHelper: 'Automatically send a custom form to attendees after the session ends',
            postSessionSurveyNone: 'No form selected',
            postSessionSurveyOptions: {
              sessionFeedback: 'Session Feedback Form',
              speakerEvaluation: 'Speaker Evaluation',
              contentRating: 'Content Rating Survey',
              customOne: 'Custom Form 1',
              customTwo: 'Custom Form 2'
            },
            saveChanges: 'Save Changes',
            createSession: 'Create Session',
            selectSpeakers: 'Assign Speakers',
            selectSpeakersSubtitle: 'Select the experts and speakers who will lead this session.',
            noSpeakersFound: 'No speakers found. Please add speakers to your event first.',
            selectedCount: '{count} speaker(s) selected',
            saveSelection: 'Confirm Assignment'
          },
          proModal: {
            title: 'Pro Feature',
            subtitle: 'This feature is only available with the Eventra Pro plan. Upgrade now to unlock advanced session management capabilities.',
            upgrade: 'Upgrade to Pro'
          },
          speakerModal: {
            title: 'Select Speakers',
            subtitle: 'Choose one or more speakers to assign to this session',
            empty: 'No speakers found. Add speakers in the Speakers tab first.',
            selectedCount: '{count} speaker(s) selected',
            addSelected: 'Add Selected Speakers'
          },
          export: {
            title: 'Export Schedule',
            subtitle: 'Choose format to export your event schedule',
            pdf: 'Export as PDF',
            excel: 'Export as Excel',
            csv: 'Export as CSV'
          }
        },
        sponsors: {
          title: 'Sponsors',
          subtitle: 'Manage event sponsors and sponsorship packages',
          actions: {
            managePackages: 'Manage Packages',
            addSponsor: 'Add Sponsor',
            editSponsor: 'Edit Sponsor'
          },
          filters: {
            all: 'All Sponsors'
          },
          searchPlaceholder: 'Search sponsors...',
          packages: {
            title: 'Sponsorship Packages',
            subtitle: 'Click on a package to view sponsors in that tier',
            sponsorCount: '{count} Sponsor(s)',
            moreBenefits: '+{count} more benefits',
            filterActive: 'Showing {count} sponsor(s) in {tier} tier',
            clearFilter: 'Clear Filter',
            manageTitle: 'Manage Sponsorship Packages',
            manageSubtitle: 'Edit or add new sponsorship packages',
            manageSubtitleFree: 'Free plan: {current}/{max} packages. Upgrade to Pro for unlimited packages.',
            fields: {
              name: 'Package Name *',
              namePlaceholder: 'e.g., Platinum',
              value: 'Package Value *',
              valuePlaceholder: 'e.g., 25000',
              color: 'Color *',
              benefits: 'Benefits (comma-separated)',
              benefitsPlaceholder: 'e.g., Logo on Website, 3 Speaking Slots, VIP Dinner Access'
            },
            upgradePrompt: 'Upgrade to Pro for Unlimited Packages',
            addPackage: 'Add New Sponsorship Package',
            savePackages: 'Save Packages',
            upgradeTitle: 'Upgrade to Pro',
            upgradeSubtitle: 'Free users can have up to {max} sponsorship packages. Upgrade to Eventra Pro for unlimited packages and advanced sponsorship management features.',
            upgradeNow: 'Upgrade Now'
          },
          table: {
            sponsor: 'Sponsor',
            tier: 'Tier',
            packageValue: 'Package Value',
            website: 'Website',
            status: 'Status',
            actions: 'Actions'
          },
          status: {
            confirmed: 'Confirmed',
            pending: 'Pending',
            contractSent: 'Contract Sent'
          },
          confirmDelete: 'Are you sure you want to delete this sponsor?',
          addChoice: {
            title: 'Add New Sponsor',
            subtitle: 'Choose how you want to add the sponsor',
            manual: {
              title: 'Add Manually',
              subtitle: 'Fill in the sponsor details yourself using our form'
            },
            sendForm: {
              title: 'Send Form to Sponsor',
              subtitle: 'Email a form to the sponsor to fill out their own details'
            }
          },
          form: {
            nameRequired: 'Name is required',
            editTitle: 'Edit Sponsor',
            addTitle: 'Add Sponsor',
            nameLabel: 'Sponsor Name *',
            namePlaceholder: 'e.g. TechCorp',
            tierLabel: 'Tier',
            tierOption: '{name} - ${value}',
            contributionLabel: 'Contribution Amount ($)',
            statusLabel: 'Status',
            websiteLabel: 'Website URL',
            websitePlaceholder: 'example.com',
            logoLabel: 'Logo URL',
            logoPlaceholder: 'https://...',
            descriptionLabel: 'Description',
            cancel: 'Cancel',
            save: 'Save Sponsor'
          },
          formPreview: {
            title: 'Send Sponsor Form',
            to: 'To:',
            subject: 'Subject:',
            subjectLine: 'Invitation to complete sponsor profile',
            body: 'Please complete your sponsor profile for [Event Name] by clicking the link below...',
            cancel: 'Cancel',
            send: 'Send Email',
            toastSent: 'Form sent to sponsor (simulation)'
          }
        },
        qrBadges: {
          header: {
            title: 'Design Event Badges',
            subtitle: 'Choose a template and customize it for your attendees',
            preview: 'Preview',
            download: 'Download PDF'
          },
          sections: {
            template: {
              title: 'Badge Template',
              previewLabel: 'Preview',
              currentBadge: 'Current',
              changeButton: 'Change Template'
            },
            info: {
              title: 'Badge Information',
              sizeLabel: 'Badge Size',
              sizeValue: 'Standard (4" x 6")',
              orientationLabel: 'Orientation',
              orientation: {
                portrait: 'Portrait',
                landscape: 'Landscape'
              },
              paperTypeLabel: 'Paper Type',
              paperTypes: {
                glossy: 'Glossy Card Stock',
                matte: 'Matte Card Stock',
                recycled: 'Recycled Paper'
              }
            },
            branding: {
              title: 'Branding',
              logoLabel: 'Event Logo',
              uploadCta: 'Click to upload logo',
              uploadHint: 'PNG or JPG, max 5MB',
              replace: 'Replace',
              remove: 'Remove',
              colorLabel: 'Brand Color',
              logoAlt: 'Logo'
            },
            attendee: {
              title: 'Attendee Information',
              fullName: 'Full Name',
              jobTitle: 'Job Title',
              company: 'Company Name',
              ticketType: 'Ticket Type',
              customField: 'Custom Field',
              requiredHint: 'Full Name is a required field'
            },
            qr: {
              title: 'QR Code Settings',
              uniqueCode: 'Unique code per attendee',
              positionLabel: 'QR Code Position',
              positions: {
                bottomCenter: 'Bottom Center',
                bottomRight: 'Bottom Right',
                back: 'Back of Badge'
              },
              security: {
                title: 'Include encrypted security hash',
                subtitle: 'Recommended for preventing fraud'
              }
            }
          },
          preview: {
            title: 'Live Preview',
            sampleData: 'Sample Data',
            sampleDataHint: 'This shows how the badge will look with real attendee data',
            logoAlt: 'Event Logo',
            logoPlaceholder: 'Logo',
            sampleName: 'Sarah Johnson',
            sampleTitle: 'Product Manager',
            sampleCompany: 'TechCorp Inc.',
            sampleTicket: 'VIP Access',
            sampleEvent: 'TechCon 2025',
            sampleDate: 'December 20-22, 2025',
            hint: 'The actual badge will include unique attendee information and QR codes'
          },
          templates: {
            modal: {
              title: 'Choose Badge Template',
              subtitle: 'Select a design that matches your event style',
              cancel: 'Cancel',
              apply: 'Apply Template'
            },
            categories: {
              all: 'All Templates',
              professional: 'Professional',
              creative: 'Creative',
              minimal: 'Minimal',
              bold: 'Bold',
              classic: 'Classic'
            },
            modern: {
              name: 'Modern Conference',
              description: 'Clean design with large name display',
              features: ['Logo Top', 'QR Bottom', 'Color Footer']
            },
            classic: {
              name: 'Classic Business',
              description: 'Traditional corporate style',
              features: ['Centered Layout', 'QR Bottom']
            },
            creative: {
              name: 'Creative Bold',
              description: 'Eye-catching design with vibrant colors',
              features: ['Large Logo', 'Side QR', 'Bold Typography']
            },
            minimal: {
              name: 'Minimal Clean',
              description: 'Simple and elegant minimalist design',
              features: ['Logo Top', 'Clean Layout']
            },
            tech: {
              name: 'Tech Summit',
              description: 'Modern tech event style',
              features: ['QR Prominent', 'Tech Feel']
            },
            elegant: {
              name: 'Elegant Formal',
              description: 'Sophisticated formal event design',
              features: ['Elegant Typography', 'Subtle Colors']
            },
            vibrant: {
              name: 'Vibrant Festival',
              description: 'Fun and colorful for festivals',
              features: ['Bold Colors', 'Playful Design']
            },
            corporate: {
              name: 'Corporate Pro',
              description: 'Professional corporate design',
              features: ['Logo Emphasis', 'Clean Lines']
            },
            startup: {
              name: 'Startup Pitch',
              description: 'Modern startup event style',
              features: ['Dynamic Layout', 'Modern Typography']
            }
          },
          printTitle: 'Badge'
        },
        customForms: {
          header: {
            title: 'Event Forms',
            subtitle: 'Create and manage forms for your event',
            createButton: 'Create Custom Form'
          },
          actions: {
            editForm: 'Edit Form',
            upgradeToPro: 'Upgrade to Pro'
          },
          badges: {
            default: 'DEFAULT',
            template: 'TEMPLATE',
            free: 'FREE',
            pro: 'PRO'
          },
          status: {
            active: 'Active',
            draft: 'Draft'
          },
          toasts: {
            createFailed: 'Failed to create form',
            formNotReady: 'Form is not ready yet',
            saved: 'Form saved',
            saveFailed: 'Failed to save form'
          },
          fieldFallback: 'Untitled field',
          fieldOptions: {
            option1: 'Option 1',
            option2: 'Option 2',
            option3: 'Option 3'
          },
          fieldTypes: {
            text: {
              label: 'Short Text',
              desc: 'Single-line input'
            },
            textarea: {
              label: 'Long Text',
              desc: 'Long answer input'
            },
            dropdown: {
              label: 'Dropdown',
              desc: 'Select from a list'
            },
            checkbox: {
              label: 'Checkboxes',
              desc: 'Check multiple options'
            },
            radio: {
              label: 'Multiple Choice',
              desc: 'Choose one option'
            },
            date: {
              label: 'Date',
              desc: 'Pick a date'
            },
            file: {
              label: 'File Upload',
              desc: 'Upload a file'
            },
            number: {
              label: 'Number',
              desc: 'Numeric input'
            },
            multichoice: {
              label: 'Multiple Choice',
              desc: 'Multiple choice answers'
            },
            country: {
              label: 'Country',
              desc: 'Choose a country'
            }
          },
          formFieldsLabel: 'Form Fields',
          moreFields: '+ {count} more',
          lastEdited: 'Last edited {date}',
          created: 'Created {date}',
          fieldsCount: '{count} fields',
          searchPlaceholder: 'Search forms...',
          sections: {
            defaultTitle: 'DEFAULT FORMS',
            defaultSubtitle: 'Pre-configured forms ready to customize',
            customTitle: 'CUSTOM FORMS',
            customCount: '{count} custom forms',
            viewAll: 'View All'
          },
          emptyState: {
            title: 'No Custom Forms Yet',
            subtitle: 'Create custom forms for surveys, feedback, applications, and more',
            cta: 'Create Custom Form'
          },
          builder: {
            backToForms: 'Back to Forms',
            previewButton: 'Preview',
            saveButton: 'Save',
            fieldLibrary: {
              title: 'Field Library',
              subtitle: 'Drag fields to add them to your form'
            },
            categories: {
              basic: 'Basic Fields',
              choice: 'Choice Fields',
              advanced: 'Advanced'
            },
            fieldLabels: {
              shortText: 'Short Text',
              longText: 'Long Text',
              email: 'Email',
              phone: 'Phone',
              number: 'Number',
              date: 'Date',
              dropdown: 'Dropdown',
              multipleChoice: 'Multiple Choice',
              checkboxes: 'Checkboxes',
              fileUpload: 'File Upload',
              websiteUrl: 'Website URL',
              address: 'Address',
              country: 'Country'
            },
            quickTips: {
              title: 'Quick Tips',
              items: {
                drag: 'Drag fields to the preview',
                edit: 'Click to edit field settings',
                reorder: 'Reorder by dragging'
              }
            },
            preview: {
              title: 'Form Preview',
              subtitle: 'This is how your form will appear to respondents',
              device: {
                desktop: 'Desktop view',
                tablet: 'Tablet view',
                mobile: 'Mobile view'
              }
            },
            dropZone: {
              emptyTitle: 'Start Building Your Form',
              emptySubtitle: 'Drag fields from the left panel and drop them here to start building your form',
              label: 'Drop zone - Drag fields here',
              addMore: 'Drag more fields here to continue building'
            },
            tips: {
              editField: 'Hover over any field and click the edit icon to customize labels, add help text, and configure options'
            },
            fieldActions: {
              editProperties: 'Edit field properties',
              deleteField: 'Delete field',
              dragToReorder: 'Drag to reorder',
              editSettings: 'Edit field settings'
            },
            placeholders: {
              text: 'Enter text...',
              textarea: 'Enter your response...',
              email: 'email@example.com',
              phone: '(555) 123-4567',
              number: '0',
              dropdown: 'Select an option...',
              fileUpload: 'Click to upload or drag and drop',
              url: 'https://example.com',
              addressStreet: 'Street Address',
              addressCity: 'City',
              addressState: 'State/Province'
            },
            newFieldLabel: 'New {type} field',
            untitled: 'Untitled Form'
          },
          formTypeLabel: '{type} Form',
          formTypes: {
            registration: 'Registration',
            survey: 'Survey',
            assessment: 'Assessment',
            feedback: 'Feedback',
            'data-collection': 'Data Collection',
            application: 'Application',
            submission: 'Submission',
            custom: 'Other (Custom)'
          },
          defaults: {
            registration: {
              title: 'Event Registration',
              description: 'Collect attendee details and contact information',
              fields: {
                email: 'Email',
                fullName: 'Full Name',
                phone: 'Phone',
                company: 'Company',
                jobTitle: 'Job Title'
              },
              lastEdited: '2 days ago',
              info: 'Required for all attendees'
            },
            satisfaction: {
              title: 'Event Satisfaction Survey',
              description: 'Measure attendee satisfaction after the event',
              fields: {
                overall: 'Overall Satisfaction',
                sessionQuality: 'Session Quality',
                venueRating: 'Venue Rating',
                food: 'Food & Beverage',
                networking: 'Networking Value'
              },
              info: 'Template - customize to your event'
            },
            assessment: {
              title: 'Pre/Post Assessment',
              description: 'Evaluate knowledge before and after sessions',
              fields: {
                preCheck: 'Pre-event Knowledge Check',
                skillLevel: 'Current Skill Level',
                objectives: 'Learning Objectives',
                postQuiz: 'Post-session Quiz',
                skillImprovement: 'Skill Improvement Rating'
              }
            }
          },
          custom: {
            speakerFeedback: {
              title: 'Speaker Feedback Form',
              description: 'Gather feedback for speakers',
              fields: {
                speakerName: 'Speaker Name',
                sessionTitle: 'Session Title',
                contentQuality: 'Content Quality',
                presentation: 'Presentation Style',
                comments: 'Additional Comments'
              },
              info: 'Used after each session',
              created: 'Created 3 days ago'
            },
            dietary: {
              title: 'Dietary Preferences',
              description: 'Collect meal and allergy info',
              fields: {
                meal: 'Meal Preference',
                allergies: 'Allergies',
                requests: 'Special Requests',
                type: 'Dietary Type'
              },
              info: 'Helps caterers plan',
              created: 'Created 1 week ago'
            },
            workshopSubmission: {
              title: 'Workshop Submission',
              description: 'Collect workshop proposals',
              fields: {
                workshopTitle: 'Workshop Title',
                presenterName: 'Presenter Name',
                slides: 'Slides Upload',
                supportingDocs: 'Supporting Documents'
              },
              info: 'Internal review only',
              created: 'Created 2 weeks ago'
            },
            volunteer: {
              title: 'Volunteer Signup',
              description: 'Recruit and organize volunteers',
              fields: {
                fullName: 'Full Name',
                contact: 'Contact Info',
                roles: 'Preferred Roles',
                skills: 'Skills',
                availability: 'Availability'
              },
              created: 'Created 5 days ago'
            }
          },
          templates: {
            abstract: {
              title: 'Abstract Submission',
              description: 'Collect speaker abstracts and session proposals'
            },
            assessment: {
              title: 'Pre/Post Assessment',
              description: 'Measure knowledge before and after'
            },
            dietary: {
              title: 'Dietary Preferences',
              description: 'Gather meal and allergy requirements'
            },
            exit: {
              title: 'Exit Survey',
              description: 'Capture feedback at the end of the event'
            },
            extendedRegistration: {
              title: 'Extended Registration',
              description: 'Collect additional attendee details'
            },
            networking: {
              title: 'Networking Match',
              description: 'Match attendees by interests'
            },
            satisfaction: {
              title: 'Satisfaction Survey',
              description: 'Rate the event experience'
            },
            speakerFeedback: {
              title: 'Speaker Feedback',
              description: 'Collect feedback for speakers'
            },
            sponsorLead: {
              title: 'Sponsor Lead Capture',
              description: 'Capture sponsor leads and interest'
            },
            tags: {
              text: 'Text',
              textArea: 'Text Area',
              dropdown: 'Dropdown',
              checkbox: 'Checkbox',
              checkboxes: 'Checkboxes',
              fileUpload: 'File Upload',
              multipleChoice: 'Multiple Choice',
              multiSelect: 'Multi-select',
              contactInfo: 'Contact Info',
              rating: 'Rating',
              yesNo: 'Yes/No',
              tags: 'Tags',
              notes: 'Notes',
              quiz: 'Quiz'
            }
          },
          templatesModal: {
            title: 'Create New Form',
            subtitle: 'Start from a template or build from scratch',
            buildTitle: 'Build Custom Form',
            buildSubtitle: 'Start with a blank canvas and add your own fields',
            formNameLabel: 'Form Name',
            formNamePlaceholder: 'e.g., Networking Preferences, Abstract Submission, Exit Survey...',
            formTypeLabel: 'Form Type',
            descriptionLabel: 'Description (Optional)',
            descriptionPlaceholder: 'Brief description of what this form is for...',
            createBlank: 'Create Blank Form',
            orChooseTemplate: 'Or Choose a Template',
            templateFieldsCount: '{count} pre-built fields',
            useTemplate: 'Use Template',
            cancel: 'Cancel'
          },
          upgradeModal: {
            title: 'Upgrade to Pro',
            subtitle: 'Unlock advanced form features and templates',
            features: [
              'Pre/Post Assessment templates',
              'File upload fields',
              'Advanced field types (signature, matrix, ranking)',
              'Networking matcher',
              'Lead capture forms',
              'Unlimited custom forms',
              'Priority support'
            ],
            cta: 'Upgrade to Pro - $49/month',
            viewAll: 'View all Pro features',
            maybeLater: 'Maybe Later'
          }
        },
        marketingTools: {
          title: 'Marketing & Communications',
          subtitle: 'Promote your event and engage with attendees',
          dateTba: 'Date TBA',
          actions: {
            previewAll: 'Preview All',
            moreActions: 'More Actions',
            upgradeToPro: 'Upgrade to Pro',
            upgradeToProWithPrice: 'Upgrade to Pro - {price}',
            learnMore: 'Learn More',
            maybeLater: 'Maybe Later'
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
            link: 'Link'
          },
          customDomain: {
            title: 'Custom Domain',
            subtitle: 'Use your own domain for event registration and emails',
            learnMore: 'Learn more about custom domains',
            features: {
              registrationUrl: {
                title: 'Custom Registration URL',
                subtitle: 'events.yourdomain.com instead of eventra.com/your-event'
              },
              emailDomain: {
                title: 'Branded Email Domain',
                subtitle: 'Send emails from @yourdomain.com for better deliverability'
              },
              ssl: {
                title: 'SSL Certificate Included',
                subtitle: 'Automatic HTTPS security for your custom domain'
              },
              branding: {
                title: 'Professional Branding',
                subtitle: 'Build trust with attendees using your own domain'
              }
            }
          },
          emailTemplates: {
            title: 'Email Templates',
            subtitle: 'Customize automated emails sent to attendees',
            enabled: 'Enabled',
            disabled: 'Disabled',
            edit: 'Edit Template',
            preview: 'Preview',
            sendTest: 'Send Test',
            customCampaign: {
              title: 'Custom Campaign',
              subtitle: 'Send custom email broadcasts to your attendee list'
            },
            proUnlock: 'Upgrade to PRO to unlock custom campaigns',
            upgradeToUse: 'Upgrade to Use',
            default: {
              name: 'Registration Confirmation',
              preview: 'Thanks for registering for your event!',
              previewWithEvent: 'Thanks for registering for {eventName}!',
              timing: 'Sent immediately after registration'
            }
          },
          links: {
            title: 'Registration Link Tracking',
            subtitle: 'Create unique links to track where registrations come from',
            info: 'Use these links in your social media posts, emails, and ads to measure performance',
            active: 'Active',
            copy: 'Copy',
            clicks: 'Clicks',
            registrations: 'Registrations',
            conversion: 'Conversion',
            analytics: 'View detailed analytics',
            create: 'Create New Link',
            limit: 'Track up to 10 custom links on free plan, unlimited on Pro',
            defaultName: 'Custom Link'
          },
          social: {
            title: 'Social Media Sharing',
            subtitle: 'Configure how your event appears when shared',
            preview: 'Share Preview',
            fields: {
              title: 'Social Media Title',
              titleHint: 'Recommended: 40-60 characters for best display',
              description: 'Social Media Description',
              descriptionHint: 'Recommended: 120-155 characters'
            },
            options: {
              includeDate: 'Include event date in share text',
              includeLink: 'Include registration link',
              includeHashtag: 'Add event hashtag'
            },
            quickShare: 'Quick Share',
            previewTitleFallback: 'Your Event',
            previewDescriptionFallback: 'Event details coming soon.',
            previewLocationFallback: 'Location TBA',
            defaults: {
              title: 'Register Now',
              titleWithEvent: '{eventName} - Register Now'
            }
          },
          scheduled: {
            title: 'Scheduled Campaigns',
            lockedTitle: 'Unlock Campaign Scheduling',
            features: {
              schedule: 'Schedule email campaigns in advance',
              drip: 'Drip campaigns for engagement',
              abTesting: 'A/B testing for email content',
              reminders: 'Automated reminders',
              analytics: 'Advanced analytics & reporting'
            }
          },
          whatsapp: {
            title: 'WhatsApp Marketing',
            lockedTitle: 'Reach Attendees on WhatsApp',
            lockedSubtitle: 'Send event updates, reminders, and engage with attendees directly on WhatsApp',
            features: {
              confirmations: 'Send registration confirmations via WhatsApp',
              reminders: 'Automated event reminders',
              twoWay: 'Two-way messaging with attendees',
              broadcast: 'Broadcast updates to all registrants',
              richMedia: 'Rich media support (images, videos, PDFs)'
            }
          },
          toasts: {
            templateStatusUpdated: 'Template status updated',
            createLinkFirst: 'Create a link first',
            linkCopied: 'Link copied to clipboard',
            createEventFirstLinks: 'Create your event first to generate tracking links',
            addNameAndSource: 'Add a name and source tag',
            sourceTagExists: 'Source tag already exists',
            customLinkCreated: 'Custom link created',
            createEventFirstShare: 'Create your event first to share',
            testEmailSent: 'Test email sent to your@email.com',
            templateSaved: 'Template saved successfully',
            campaignScheduled: 'Campaign scheduled successfully'
          },
          proModal: {
            title: 'PRO Feature',
            subtitle: 'Upgrade to PRO to unlock Event Reminder and Thank You Email templates, plus advanced marketing automation features.',
            features: {
              reminder: 'Event Reminder emails',
              thankYou: 'Thank You emails',
              customCampaigns: 'Custom email campaigns',
              abTesting: 'A/B testing',
              analytics: 'Advanced analytics'
            }
          }
        }
      },
      step4: {
        title: 'Review & Publish',
        subtitle: 'Review all event details and publish your event when you are ready.',
        launchHeader: {
          title: 'Ready to Launch',
          subtitle: 'Configure final settings and publish your event'
        },
        integrations: {
          title: 'Integrations',
          subtitle: 'Connect your event with external tools',
          connect: 'Connect',
          items: {
            zoom: {
              name: 'Zoom',
              description: 'Video conferencing for virtual events'
            },
            mailchimp: {
              name: 'Mailchimp',
              description: 'Email marketing automation'
            },
            googleCalendar: {
              name: 'Google Calendar',
              description: 'Sync event dates automatically'
            },
            slack: {
              name: 'Slack',
              description: 'Send updates to your workspace'
            }
          }
        },
        seo: {
          title: 'SEO Settings',
          subtitle: 'Help people find your event',
          defaults: {
            title: 'SaaS Summit 2024 - The Future of Software',
            description: 'Join industry leaders at SaaS Summit 2024 for three days of networking, learning, and innovation in the software industry.',
            slug: 'saas-summit-2024',
            keywords: ['SaaS', 'Tech Conference', 'San Francisco']
          },
          fields: {
            title: {
              label: 'SEO Title'
            },
            description: {
              label: 'Meta Description'
            },
            url: {
              label: 'Event URL',
              prefix: 'eventra.app/events/',
              check: 'Check Availability'
            },
            keywords: {
              label: 'Keywords (Optional)',
              placeholder: 'Add keyword...'
            }
          }
        },
        payment: {
          title: 'Payment Gateway',
          subtitle: 'Accept payments for paid tickets',
          features: [
            'Process credit card payments',
            'Multiple currencies',
            'Automated invoicing',
            'Refund management'
          ],
          upgrade: 'Upgrade to Pro',
          price: '$49/month'
        },
        privacy: {
          title: 'Privacy Settings',
          items: [
            {
              id: 'publicEvent',
              title: 'Public Event',
              description: 'Anyone can discover'
            },
            {
              id: 'requireRegistration',
              title: 'Require Registration',
              description: 'Attendees must sign up to view details'
            },
            {
              id: 'showAttendeeList',
              title: 'Show in Eventra Communities',
              description: 'Display your event in Eventra public community listings'
            },
            {
              id: 'allowSocialSharing',
              title: 'Social Media Sharing',
              description: 'Let attendees share on social platforms'
            }
          ]
        },
        checklist: {
          title: 'Pre-Launch Checklist',
          subtitle: 'Make sure everything is ready',
          items: {
            details: 'Event details added',
            design: 'Event page designed',
            freeTickets: 'Tickets not required for free events',
            ticketRequired: 'At least one ticket type'
          },
          actions: {
            edit: 'Edit',
            view: 'View',
            addTicket: 'Add Ticket'
          },
          progress: '{completed} of {total} complete'
        },
        publishConfirmation: {
          body: 'Once published, your event will be live and accessible to attendees. You can still make changes after publishing.'
        },
        errors: {
          publishFirst: 'Save your event before publishing.',
          saveFirst: 'Save your event before continuing.'
        },
        toasts: {
          publishedSuccess: 'Event published successfully.',
          publishFailed: 'Failed to publish event.',
          draftSaved: 'Draft saved.'
        },
        summary: {
          coverAlt: 'Event cover',
          noDate: 'No date',
          tbd: 'TBD',
          unlimited: 'Unlimited',
          maxAttendees: '{count} max attendees'
        }
      },
      footer: {
        draftSavedHint: 'Draft saved {minutes} minutes ago'
      },
      sidebar: {
        header: {
          eyebrow: 'Creating Event',
          title: 'Event Setup'
        },
        stepLabel: 'Step {number}',
        progressLabel: '{completed} of {total} completed',
        saveDraft: 'Save Draft',
        saving: 'Saving...',
        steps: {
          details: {
            title: 'Event Info',
            label: 'Event Information'
          },
          design: {
            title: 'Design',
            label: 'Design & Branding'
          },
          registration: {
            title: 'Registration',
            label: 'Registration Setup'
          },
          launch: {
            title: 'Launch',
            label: 'Review & Publish'
          }
        },
        subSteps: {
          tickets: 'Tickets',
          speakers: 'Speakers',
          attendees: 'Attendees',
          exhibitors: 'Exhibitors',
          schedule: 'Schedule',
          sponsors: 'Sponsors',
          qrBadges: 'QR Badges',
          customForms: 'Custom Forms',
          marketingTools: 'Marketing Tools'
        }
      },
      registrationFooter: {
        backToDesign: 'Back to Design'
      },
      launchFooter: {
        allChangesSaved: 'All changes saved',
        preview: 'Preview',
        backToRegistration: 'Back to Registration',
        publish: 'Publish Event'
      },
      notifications: {
        draftCreatedTitle: 'Draft created',
        draftSavedTitle: 'Draft saved',
        draftSavedBody: 'Your event "{name}" has been saved as a draft.',
        readyToDesign: 'Your event "{name}" is ready for design.',
        publishedTitle: 'Event published',
        publishedBody: '{name} is now live.'
      },
      details: {
        eventTypes: {
          conference: 'Conference',
          workshop: 'Workshop',
          webinar: 'Webinar',
          networking: 'Networking',
          tradeShow: 'Trade Show',
          summit: 'Summit',
          masterclass: 'Masterclass',
          training: 'Training',
          bootcamp: 'Bootcamp',
          hackathon: 'Hackathon',
          awardCeremony: 'Award Ceremony',
          other: 'Other'
        },
        timezones: {
          pt: 'Pacific Time (PT) - UTC-8',
          mt: 'Mountain Time (MT) - UTC-7',
          ct: 'Central Time (CT) - UTC-6',
          et: 'Eastern Time (ET) - UTC-5',
          utc: 'UTC'
        },
        format: {
          inPerson: {
            label: 'In-person',
            description: 'Guests attend at a physical location.'
          },
          virtual: {
            label: 'Virtual',
            description: 'Hosted online with virtual access.'
          },
          hybrid: {
            label: 'Hybrid',
            description: 'Mix of in-person and virtual attendance.'
          }
        },
        fields: {
          eventName: {
            label: 'Event name',
            placeholder: 'Enter event name',
            error: 'Event name is required',
            helper: 'This will appear on your event page.'
          },
          tagline: {
            label: 'Tagline',
            placeholder: 'Short description or tagline'
          },
          eventType: {
            label: 'Event type',
            otherPlaceholder: 'Enter event type'
          },
          eventStatus: {
            label: 'Event status'
          },
          startDate: {
            label: 'Start date'
          },
          endDate: {
            label: 'End date'
          },
          durationHint: 'Duration is calculated automatically',
          timezone: {
            label: 'Timezone'
          },
          eventFormat: {
            label: 'Event format'
          },
          venueAddress: {
            placeholder: 'Enter venue address',
            addToMaps: 'Add to maps'
          }
        },
        eventStatus: {
          free: {
            title: 'Free Event',
            subtitle: 'No tickets or payments required.'
          },
          paid: {
            title: 'Paid Event',
            subtitle: 'Sell tickets and accept payments.'
          },
          continuous: {
            title: 'Continuous Event',
            subtitle: 'No fixed end date.'
          },
          helper: 'You can update event status later.'
        },
        capacity: {
          title: 'Capacity & Waitlist',
          limitLabel: 'Limit attendance',
          maxAttendees: 'Maximum attendees',
          maxAttendeesPlaceholder: 'e.g., 500',
          waitlistLabel: 'Enable waitlist',
          enabled: 'Enabled',
          disabled: 'Disabled',
          waitlistCapacity: 'Waitlist capacity',
          waitlistPlaceholder: 'e.g., 100',
          waitlistHelper: 'Waitlist opens when tickets sell out.',
          waitlistEnabledNote: 'Waitlist is enabled. Attendees can join once tickets sell out.',
          waitlistDisabledNote: 'Waitlist is disabled. New registrations stop when capacity is reached.'
        },
        designChoice: {
          title: 'Choose your setup path',
          subtitle: 'Pick how you want to build your event experience.',
          designStudio: {
            title: 'Design Studio',
            body: 'Build a custom event page with blocks and branding.',
            cta: 'Open Design Studio',
            note: 'Best for fully branded experiences.'
          },
          registration: {
            title: 'Registration Builder',
            body: 'Configure registration settings and tickets first.',
            cta: 'Start Registration',
            note: 'Best for quick event setup.'
          },
          helper: 'You can change this later.'
        },
        proTip: {
          title: 'Pro tip:',
          body: 'Save frequently to keep your progress and data synced.'
        },
        nextStep: 'Continue to Design',
        errors: {
          nameRequired: 'Event name is required.'
        }
      },
      designStudio: {
        title: 'Design Studio',
        subtitle: 'Build a stunning event page with blocks and branding.',
        searchPlaceholder: 'Search blocks...',
        filters: {
          all: 'All',
          added: 'Added',
          addedCount: 'Added ({count})',
          free: 'Free',
          pro: 'Pro'
        },
        availableBlocks: {
          title: 'Available Blocks'
        },
        blocks: {
          hero: {
            name: 'Hero',
            description: 'Top banner with title, date, and call to action.'
          },
          about: {
            name: 'About',
            description: 'Event description with image and highlights.'
          },
          details: {
            name: 'Event Details',
            description: 'Key information like date, location, and capacity.'
          },
          agenda: {
            name: 'Agenda',
            description: 'Schedule of sessions and speakers.'
          },
          speakers: {
            name: 'Speakers',
            description: 'Showcase featured speakers.'
          },
          tickets: {
            name: 'Tickets',
            description: 'Pricing tiers and ticket features.'
          },
          footer: {
            name: 'Footer',
            description: 'Closing section with links and contact.'
          },
          videoHero: {
            name: 'Video Hero',
            description: 'Hero section with background video.'
          },
          sponsors: {
            name: 'Sponsors',
            description: 'Sponsor logo grid and tiers.'
          },
          countdown: {
            name: 'Countdown',
            description: 'Countdown timer to event start.'
          },
          testimonials: {
            name: 'Testimonials',
            description: 'Quotes and feedback carousel.'
          },
          customHtml: {
            name: 'Custom HTML',
            description: 'Embed custom HTML or widgets.'
          }
        },
        branding: {
          title: 'Branding',
          color: 'Brand color',
          logo: 'Logo',
          uploadLogo: 'Upload logo',
          replaceLogo: 'Replace logo',
          uploading: 'Uploading...',
          fontFamily: 'Font family',
          buttonRoundness: 'Button roundness: {value}px',
          square: 'Square',
          rounded: 'Rounded',
          apply: 'Apply branding',
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
          title: 'Active Blocks ({count})',
          clearAll: 'Clear all',
          confirmClearAll: 'Remove all blocks?',
          confirmRemove: 'Remove "{name}"?',
          emptyTitle: 'No blocks added',
          emptySubtitle: 'Start by adding blocks from the library.'
        },
        hint: {
          title: 'Start with blocks',
          description: 'Drag and drop blocks to build your page. You can rearrange them anytime.',
          dismiss: 'Dismiss'
        },
        preview: {
          devices: {
            desktop: 'Desktop',
            tablet: 'Tablet',
            mobile: 'Mobile'
          },
          zoomOut: 'Zoom out',
          zoomIn: 'Zoom in',
          reset: 'Reset zoom',
          live: 'Live preview',
          fullscreen: 'Fullscreen',
          newTab: 'Open in new tab',
          url: 'Preview URL'
        },
        hero: {
          title: 'Your Event Title',
          subtitle: 'Describe your event in one sentence.',
          category: 'Conference',
          actions: {
            edit: 'Edit',
            editLabel: 'Edit hero',
            changeBackground: 'Change background',
            editText: 'Edit text',
            changeColors: 'Change colors'
          },
          primaryCta: 'Register now',
          secondaryCta: 'Learn more'
        },
        about: {
          blockName: 'About',
          eyebrow: 'About the event',
          heading: 'About this event',
          headingWithName: 'About {name}',
          primaryText: 'Share the story behind your event and what attendees can expect.',
          secondaryText: 'Highlight key topics, speakers, and takeaways.',
          features: [
            'Industry leaders and expert panels',
            'Hands-on workshops and networking',
            'Actionable insights and takeaways'
          ],
          actions: {
            changeImage: 'Change image',
            editContent: 'Edit content'
          },
          imagePlaceholder: 'Image'
        },
        details: {
          blockName: 'Details',
          title: 'Event Details',
          labels: {
            when: 'When',
            where: 'Where',
            who: 'Who'
          },
          tbd: 'TBD',
          openAttendance: 'Open attendance',
          capacityValue: '{count} seats',
          audience: 'Open to everyone',
          locationSet: 'Location set',
          locationPending: 'Location pending',
          actions: {
            editDate: 'Edit date',
            editLocation: 'Edit location',
            editCapacity: 'Edit capacity'
          }
        },
        speakers: {
          blockName: 'Speakers',
          title: 'Featured Speakers',
          subtitle: 'Meet the experts joining us.',
          actions: {
            add: 'Add speaker',
            manage: 'Manage speakers'
          },
          initialsFallback: 'SP',
          companyAt: 'at {company}',
          samples: [
            { name: 'Alex Morgan', title: 'Head of Product', company: 'NovaLabs', color: '#E0E7FF' },
            { name: 'Priya Patel', title: 'Design Lead', company: 'Studio Nine', color: '#FEE2E2' },
            { name: 'Marcus Lee', title: 'CTO', company: 'CloudWorks', color: '#DCFCE7' }
          ]
        },
        agenda: {
          blockName: 'Agenda',
          title: 'Agenda',
          subtitle: 'Explore the sessions and schedule.',
          actions: {
            addSession: 'Add session',
            manageSchedule: 'Manage schedule'
          },
          days: [
            { day: 1, label: 'Day 1' },
            { day: 2, label: 'Day 2' }
          ],
          sessions: [
            {
              day: 1,
              time: '09:00',
              duration: '60 min',
              title: 'Opening keynote: The future of events',
              speaker: 'Alex Morgan',
              location: 'Main stage',
              tags: ['Keynote', 'Trends']
            },
            {
              day: 1,
              time: '10:30',
              duration: '45 min',
              title: 'Designing experiences that convert',
              speaker: 'Priya Patel',
              location: 'Room A',
              tags: ['Design', 'Growth']
            },
            {
              day: 2,
              time: '09:30',
              duration: '50 min',
              title: 'Scaling registration operations',
              speaker: 'Marcus Lee',
              location: 'Room B',
              tags: ['Operations']
            }
          ]
        },
        tickets: {
          blockName: 'Tickets',
          title: 'Choose your ticket',
          subtitle: 'Select the option that fits you best.',
          actions: {
            manage: 'Manage tickets',
            editPricing: 'Edit pricing'
          },
          mostPopular: 'Most popular',
          perPerson: 'per person',
          select: 'Select ticket',
          samples: [
            {
              name: 'General Admission',
              price: '$99',
              popular: false,
              features: ['Access to all sessions', 'Networking breaks', 'Event materials']
            },
            {
              name: 'VIP Pass',
              price: '$199',
              popular: true,
              features: ['Priority seating', 'VIP lounge access', 'Speaker meet-and-greet']
            },
            {
              name: 'Workshop Pass',
              price: '$149',
              popular: false,
              features: ['Hands-on workshops', 'Certificate of completion', 'Priority Q&A']
            }
          ]
        },
        footer: {
          blockName: 'Footer',
          eventName: 'Eventra Conference',
          tagline: 'Create unforgettable experiences',
          location: 'City, Country',
          quickLinksTitle: 'Quick links',
          quickLinks: ['About', 'Speakers', 'Agenda', 'Tickets'],
          contactTitle: 'Contact',
          contact: {
            email: 'hello@eventra.com',
            phone: '+1 (555) 010-1234'
          },
          copyright: '(c) 2026 Eventra. All rights reserved.',
          poweredBy: 'Powered by',
          brandName: 'Eventra',
          actions: {
            socialLinks: 'Social links',
            settings: 'Footer settings'
          }
        },
        editModule: {
          title: 'Edit {block}',
          label: 'Edit {block}'
        },
        locked: {
          title: 'Pro block',
          subtitle: 'Upgrade to unlock this block.',
          cta: 'Upgrade',
          note: 'You can add it after upgrading.'
        },
        pro: {
          title: 'Unlock Pro blocks',
          subtitle: 'Get advanced sections and premium styling.',
          cta: 'Upgrade to Pro',
          features: [
            'Video, sponsors, and countdown blocks',
            'Advanced layout customization',
            'Priority support'
          ]
        },
        tiers: {
          free: 'FREE',
          pro: 'PRO'
        },
        errors: {
          saveFirst: 'Save your event before editing the design.',
          uploadFirst: 'Save your event before uploading a logo.',
          uploadFailed: 'Logo upload failed.'
        },
        settingsComingSoon: 'Settings for {block} coming soon.',
        upgradeUnlock: 'Upgrade to unlock'
      }
    },
    businessProfileWizard: {
        title: 'Eventra Marketplace',
        saving: 'Saving...',
        steps: {
          essentials: 'Essentials',
          sectors: 'Sectors',
          offerings: 'Offerings',
          identity: 'Identity'
        },
        actions: {
          saveExit: 'Save & Exit',
          back: 'Back',
          next: 'Next Step',
          createProfile: 'Create Profile',
          addOffering: 'Add Offering',
          cancel: 'Cancel',
          save: 'Save'
        },
        essentials: {
          title: 'Company Essentials',
          companyName: 'Company Name *',
          companyNamePlaceholder: 'Enter your legal company name',
          companySize: 'Company Size *',
          companySizePlaceholder: 'Select company size',
          companyDescription: 'Company Description *',
          companyDescriptionPlaceholder: 'Tell us about your business...',
          legalDocs: 'Legal Registration / Tax Documents',
          uploadHint: 'Click to',
          uploadBrowse: 'Browse',
          uploadSupport: 'Supported: PDF, JPG, PNG (Max 5MB)',
          charCount: '{count}/500 characters',
          errors: {
            nameRequired: 'Company name is required.',
            sizeRequired: 'Company size is required.',
            descRequired: 'Company description is required.',
            completeEssentials: 'Complete company essentials before uploading files.'
          }
        },
        sectors: {
          title: 'Select your industry sectors',
          subtitle: 'Add tags to describe your industry. Type and press Enter.',
          placeholder: 'Add a sector (e.g., SaaS, Catering, AI)...',
          hint: '💡 Start typing to add more tags. Press Enter after each tag.',
          errors: {
            atLeastOne: 'Add at least one sector to continue.'
          }
        },
        offerings: {
          title: 'What do you offer?',
          emptyTitle: 'No offerings added yet. Click "Add Offering" to get started.',
          modal: {
            title: 'Add New Offering',
            type: 'Type',
            product: 'Product',
            service: 'Service',
            basicInfo: 'Basic Information',
            name: 'Name *',
            namePlaceholder: 'e.g., Event Analytics Platform',
            description: 'Description',
            descPlaceholder: 'Brief description of your offering...',
            pricing: 'Pricing & Inventory',
            currency: 'Currency',
            price: 'Price',
            quantity: 'Quantity',
            unlimited: 'Unlimited',
            tags: 'Tags / Specifications',
            tagsPlaceholder: 'Type a tag and press Enter (e.g., SaaS, Analytics)...',
            images: 'Images',
            imagesHint: 'Upload product images (Max 4)',
            coverHint: 'First image will be used as cover',
            coverBadge: 'COVER',
            addBtn: 'Add Offering'
          },
          errors: {
            maxImages: 'You can upload up to 4 images.'
          }
        },
        identity: {
          title: 'Identity & Contact',
          branding: 'Branding',
          logo: 'Company Logo',
          uploadLogo: 'Upload Logo',
          cover: 'Cover Image',
          uploadCover: 'Upload Cover Image (1200x400)',
          contact: 'Contact Details',
          email: 'Business Email *',
          phone: 'Phone Number',
          website: 'Website',
          address: 'Business Address',
          published: 'Business profile published and sent for validation!',
          saved: 'Business profile saved'
        },
        toasts: {
          fileUploaded: 'File uploaded',
          imageUploaded: 'Image uploaded'
        }
      },
      businessDashboard: {
        tabs: {
          dashboard: 'Dashboard',
          profile: 'Profile Details',
          team: 'Team Members',
          products: 'Products & Services',
          ai: 'Eventra AI Advisor',
          visibility: 'Visibility & Reach',
          appearance: 'Appearance',
          analytics: 'Analytics'
        },
        status: {
          draft: 'Draft - Not Visible',
          pending: 'Pending Validation',
          live: 'Live in Marketplace'
        },
        actions: {
          editWizard: 'Edit in Wizard',
          viewProfile: 'View Business Profile',
          viewPublic: 'View Public Profile',
          createProfile: 'Create Business Profile',
          requestValidation: 'Request Validation'
        },
        loading: 'Loading...',
        notFound: 'No Business Profile Found',
        strength: {
          title: 'Profile Strength',
          complete: 'Complete',
          basicInfo: 'Basic Info Complete',
          basicInfoIncomplete: 'Complete basic company info',
          offeringsNeeded: 'Add {count} more offering(s)',
          offeringsComplete: 'Offerings complete',
          docsUploaded: 'Legal documents uploaded',
          uploadDocs: 'Upload legal documents',
          improve: 'Improve Score'
        },
        stats: {
          views: 'Profile Views',
          leads: 'Qualified Leads',
          shortlisted: 'Saved Listings',
          savedUsers: 'Users who saved',
          contactClicks: 'Contact clicks',
          last30days: 'Last 30 days'
        },
        profile: {
          title: 'Profile Details',
          subtitle: 'Update your company information and public listing details.',
          essentials: 'Company Essentials',
          companyName: 'Company Name *',
          companySize: 'Company Size *',
          description: 'Company Description *',
          legalDocs: 'Legal Registration / Tax Documents',
          sectors: {
            title: 'Industry Sectors',
            subtitle: 'Add tags to describe your industry. Type and press Enter.'
          },
          branding: {
            title: 'Branding',
            logo: 'Company Logo',
            cover: 'Cover Image'
          },
          contact: {
            title: 'Contact Details',
            email: 'Business Email *',
            phone: 'Phone Number',
            website: 'Website',
            address: 'Business Address'
          },
          save: 'Save Profile Details',
          saving: 'Saving...'
        },
        team: {
          title: 'Team Management',
          addMember: 'Add Member',
          table: {
            name: 'Name',
            role: 'Role',
            status: 'Status'
          },
          roles: {
            owner: 'Owner',
            admin: 'Admin',
            member: 'Member',
            viewer: 'Viewer'
          },
          actions: {
            makeAdmin: 'Make Admin',
            setMember: 'Set as Member',
            remove: 'Remove Member'
          }
        },
        ai: {
          title: 'Eventra AI Advisor',
          subtitle: 'Optimize your business profile with AI-powered insights and recommendations',
          optimizer: {
            title: 'Content Optimizer',
            current: 'Current Description',
            rewrite: 'Rewrite for Impact',
            generating: 'Generating...',
            suggestion: 'AI Suggestion',
            accept: 'Accept',
            tryAgain: 'Try Again'
          },
          tags: {
            title: 'Tag Generator',
            subtitle: 'AI-suggested tags based on your profile',
            apply: 'Apply Suggested Tags'
          },
          competitor: {
            title: 'Competitor Insight'
          },
          bestPractices: {
            title: 'Best Practices Guide'
          }
        },
        visibility: {
          title: 'Visibility & Reach',
          geographic: {
            title: 'Geographic Reach',
            label: 'Countries you serve',
            select: 'Select countries',
            selected: '{count} countries selected',
            search: 'Search countries...',
            clear: 'Clear'
          },
          sectors: {
            title: 'Industry Sectors',
            primary: 'Primary Sector',
            secondary: 'Secondary Sector'
          },
          publicListing: {
            title: 'Public Directory Listing',
            subtitle: 'Allow your business to appear in the public marketplace',
            hint: 'Requires admin validation before going live'
          }
        },
        appearance: {
          title: 'Appearance Settings',
          accentColor: {
            title: 'Brand Accent Color',
            subtitle: 'Choose a color that represents your brand'
          },
          layout: {
            title: 'Profile Layout',
            standard: 'Standard Layout',
            standardDesc: 'Cover image on top',
            modern: 'Modern Layout',
            modernDesc: 'Split header design'
          }
        },
        analytics: {
          title: 'Business Analytics',
          subtitle: 'Track visibility, lead flow, and marketplace engagement.',
          actions: {
            refresh: 'Refresh',
            export: 'Export CSV',
            snapshot: 'Snapshot',
            share: 'Share',
            email: 'Email Summary',
            compare: 'Compare',
            reset: 'Reset'
          },
          engagement: {
            title: 'Engagement Trend',
            leadConversion: 'Lead conversion',
            saveRate: 'Save rate'
          },
          highlights: {
            title: 'Marketplace Highlights',
            topSector: 'Top sector interest',
            trendingRegion: 'Trending region',
            profileStrength: 'Profile strength'
          }
        },
        modals: {
          addMember: {
            title: 'Add Team Member',
            searchLabel: 'Search by Name or Email',
            searchPlaceholder: 'Type at least 2 characters...',
            noResults: 'No users found matching "{query}"',
            info: 'You can add any existing Eventra user to your business team by searching for their name or email address.',
            cancel: 'Cancel',
            sendInvite: 'Send Invite',
            addToTeam: 'Add to Team'
          }
        }
      },
      businessProfilePage: {
        manageButton: 'Manage Business',
        verified: 'Verified Business',
        legalVerified: 'Legal Documents Verified',
        about: 'About Us',
        noDescription: 'No description provided.',
        noSectors: 'No sectors added',
        employees: '{count} Employees',
        locationTbd: 'Location TBD',
        notFound: 'Business not found.',
        stats: {
          reviews: '({count} reviews)',
          eventsManaged: '{count} events managed',
          memberSince: 'Member since {year}'
        },
        team: {
          title: 'Our Team',
          addMember: 'Add Member'
        },
        offerings: {
          title: 'Our Offerings',
          empty: 'No offerings listed.',
          free: 'Free'
        },
        contact: {
          title: 'Contact Information',
          businessEmail: 'Business Email'
        },
        follow: 'Follow Us',
        b2b: {
          title: 'B2B Matching',
          seeking: 'Seeking',
          offering: 'Offering',
          placeholder: 'Type and press Enter...'
        },
        specializations: 'Specializations',
        cta: {
          title: 'Interested in our services?',
          subtitle: 'Get in touch to discuss how we can help with your next event.',
          button: 'Request Quote'
        },
        actions: {
          contact: 'Contact Business',
          save: 'Save',
          share: 'Share Profile',
          edit: 'Edit Profile',
          saveChanges: 'Save Changes',
          cancel: 'Cancel'
        },
        toasts: {
          linkCopied: 'Profile link copied.',
          copyFailed: 'Failed to copy link.',
          profileUpdated: 'Profile updated',
          userAlreadyMember: 'User is already a team member.',
          memberAdded: '{name} added successfully.'
        }
      },
      publicProfilePage: {
        notFound: {
          title: 'Profile Not Found',
          subtitle: 'The profile you are looking for does not exist or has been set to private.',
          returnHome: 'Return Home'
        },
        defaults: {
          fullName: 'Eventra User'
        },
        actions: {
          back: 'Back',
          requestMeeting: 'Request Meeting',
          sendMessage: 'Send Message',
          editProfile: 'Edit Profile'
        },
        toasts: {
          linkCopied: 'Profile link copied!'
        },
        badges: {
          openToNetworking: 'Open to Networking'
        },
        details: {
          bornOn: 'Born {date}'
        },
        sections: {
          about: 'About',
          professionalInfo: 'Professional Information',
          skills: 'Skills & Expertise',
          interests: 'Professional Interests',
          education: 'Education & Certifications',
          lookingFor: "What I'm Looking For",
          industriesOfInterest: 'Industries of Interest',
          discussionTopics: 'Topics I Can Discuss'
        },
        labels: {
          industry: 'Industry',
          otherIndustry: 'Other',
          department: 'Department',
          experience: 'Experience',
          yearsExperience: '{count} years',
          companySize: 'Company Size'
        },
        placeholders: {
          noBio: 'No biography provided.'
        },
        lookingFor: {
          clients: 'Potential clients / customers',
          partnerships: 'Partnership opportunities',
          learning: 'Learning from industry experts',
          investment: 'Investment / funding',
          hiring: 'Hiring talent',
          sharing: 'Sharing knowledge / expertise'
        },
        expertise: {
          expert: 'Expert',
          intermediate: 'Intermediate',
          beginner: 'Beginner'
        },
        b2b: {
          title: 'B2B Networking Profile',
          subtitle: "How I can help and what I'm looking for"
        },
        meeting: {
          title: 'Meeting Availability',
          availability: {
            title: 'Availability Status',
            always: 'Always open to meeting requests',
            eventsOnly: 'Only at events attended',
            closed: 'Not currently accepting meetings',
            open: 'Open to meeting requests'
          },
          formats: {
            title: 'Preferred Meeting Format',
            inPerson: 'In-Person',
            virtual: 'Virtual',
            phone: 'Phone'
          },
          durationTitle: 'Preferred Duration',
          instructions: {
            title: 'When requesting a meeting:',
            placeholder: 'Please provide details about the topics you would like to discuss.'
          }
        },
        connect: {
          title: "Let's Connect",
          subtitle: 'Schedule a meeting to discuss collaboration opportunities'
        },
        activity: {
          title: 'Profile Activity',
          views: 'Profile Views',
          connections: 'Connections',
          meetings: 'Meetings',
          responseRate: 'Response Rate'
        },
        connectElsewhere: {
          title: 'Connect Elsewhere',
          linkedin: 'LinkedIn',
          twitter: 'Twitter',
          website: 'Website'
        },
        proUpsell: {
          title: 'Get More Visibility',
          subtitle: 'Upgrade to PRO to showcase endorsements, featured badges, and appear higher in search results.',
          button: 'Upgrade to PRO'
        },
        modal: {
          title: 'Request Meeting',
          withName: 'with {name}',
          placeholder: "Hi, I'd like to discuss...",
          cancel: 'Cancel',
          send: 'Send Request'
        }
      },
      productsManagement: {
        title: 'Products & Services',
        subtitle: 'Manage your offerings, pricing, and product information',
        addProduct: 'Add Product',
        editProduct: 'Edit Product',
        addNewProduct: 'Add New Product',
        updateProduct: 'Update Product',
        saveProduct: 'Save Product',
        cancel: 'Cancel',
        form: {
          name: 'Product / Service Name *',
          namePlaceholder: 'e.g. Event Analytics Pro',
          sector: 'Sector *',
          subsector: 'Subsector *',
          description: 'Description *',
          descriptionPlaceholder: 'Describe your product or service...',
          price: 'Price *',
          pricePlaceholder: '499.00',
          currency: 'Currency',
          tags: 'Tags',
          tagsPlaceholder: 'Type a tag and press Enter',
          mainImage: 'Main Product Image *',
          uploadMain: 'Click to upload main image',
          imageUploaded: '✓ Image uploaded - Click to change',
          gallery: 'Gallery Images (Max 4)',
          upload: 'Upload'
        },
        toasts: {
          offeringRemoved: 'Offering removed',
          offeringSaved: 'Offering saved',
          uploadFailed: 'Upload failed'
        }
      },
      constants: {
        sectors: {
          Technology: 'Technology',
          ProfessionalServices: 'Professional Services',
          Marketing: 'Marketing',
          Finance: 'Finance',
          Logistics: 'Logistics',
          Production: 'Production'
        },
        subsectors: {
          'Software Development': 'Software Development',
          'Event Tech': 'Event Tech',
          'AI Tools': 'AI Tools',
          'Analytics': 'Analytics',
          'Consulting': 'Consulting',
          'Advisory': 'Advisory',
          'Operations': 'Operations',
          'Legal': 'Legal',
          'Digital Marketing': 'Digital Marketing',
          'Brand Strategy': 'Brand Strategy',
          'Growth': 'Growth',
          'Content': 'Content',
          'Accounting': 'Accounting',
          'Payments': 'Payments',
          'Investment': 'Investment',
          'FinTech': 'FinTech',
          'Shipping': 'Shipping',
          'Warehousing': 'Warehousing',
          'Transportation': 'Transportation',
          'Fulfillment': 'Fulfillment',
          'A/V Production': 'A/V Production',
          'Stage Design': 'Stage Design',
          'Lighting': 'Lighting',
          'Sound': 'Sound'
        },
        countries: [
          'United States',
          'Canada',
          'United Kingdom',
          'Germany',
          'France',
          'Netherlands',
          'Spain',
          'United Arab Emirates',
          'Saudi Arabia',
          'Qatar',
          'Singapore',
          'Australia'
        ],
        suggestedTags: ['SaaS', 'EventTech', 'Registration', 'Analytics', 'B2B']
      },
      marketplace: {
        hero: {
          title: 'Find the perfect partners for your next event.',
          searchPlaceholder: 'Search services, companies, or tags...',
          searchButton: 'Search',
          categories: {
            av: 'A/V & Production',
            catering: 'Catering',
            tech: 'Event Tech',
            venues: 'Venues',
            logistics: 'Logistics',
            photography: 'Photography',
            design: 'Design & Decor',
            marketing: 'Marketing',
            entertainment: 'Entertainment',
            swag: 'Swag & Gifts',
            translation: 'Translation',
            staffing: 'Staffing'
          }
        },
        filters: {
          active: 'Active Filters',
          clearAll: 'Clear All',
          sectors: 'Sectors',
          location: 'Location',
          locationPlaceholder: 'Country / City',
          trustBadges: 'Trust Badges',
          verified: 'Verified Businesses Only',
          sustainable: 'Sustainable / Eco-Friendly',
          size: 'Company Size',
          rating: 'Rating',
          up: '& Up',
          sizes: {
            freelancer: 'Freelancer',
            sme: 'SME (1-50)',
            enterprise: 'Enterprise (500+)'
          }
        },
        recommended: {
          badge: 'AI Powered',
          title: 'Recommended for you',
          refresh: 'Refresh',
          match: '95% match',
          aiMatch: 'AI Match'
        },
        results: {
          loading: 'Loading businesses...',
          found: '{count} {label} Found',
          business: 'Business',
          businesses: 'Businesses',
          requestQuote: 'Request Quote',
          noDescription: 'No description provided.',
          locationTbd: 'Location TBD'
        },
        empty: {
          title: 'No businesses found',
          subtitle: 'Try adjusting your filters or search criteria',
          action: 'Clear All Filters'
        }
      },
      businessProductPage: {
        loading: 'Loading product...',
        notFound: {
          title: 'Product Not Found',
          back: 'Back to Marketplace'
        },
        breadcrumb: {
          marketplace: 'Marketplace'
        },
        tabs: {
          description: 'Description',
          specifications: 'Specifications',
          reviews: 'Reviews'
        },
        overview: 'Overview',
        labels: {
          id: 'ID',
          verified: 'Enterprise Verified',
          deliveryTime: 'Avg. Delivery: {value}',
          shipsFrom: 'Ships From: {value}'
        },
        types: {
          product: 'Product',
          service: 'Professional Service'
        },
        specifications: {
          type: 'Type',
          availability: 'Availability',
          unlimited: 'Unlimited',
          limited: 'Limited',
          quantity: 'Quantity',
          tags: 'Tags'
        },
        pricing: {
          contact: 'Contact for pricing',
          quantityLabel: 'Select Quantity / Licenses'
        },
        actions: {
          requestQuote: 'Request Quote',
          messageSeller: 'Message Seller',
          saved: 'Saved',
          wishlist: 'Wishlist',
          share: 'Share'
        },
        reviews: {
          count: '({count} reviews)',
          globalSatisfaction: 'Global Satisfaction',
          helpful: 'Was this review helpful? ({count})',
          starsLabel: '{count} Stars'
        },
        seller: {
          managedBy: 'Managed By',
          response: 'Response',
          memberSince: 'Member Since',
          viewProfile: 'View Professional Profile',
          fallbackName: 'Seller',
          deals: '({count} deals)'
        }
      },
  },
  fr: {
    brand: {
      name: 'Eventra'
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
        fr: 'Francais'
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
        requestedByThem: 'Demande de leur part'
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
        jobTitle: 'ex: Chef de Produit',
        company: 'ex: Acme Inc.',
        industry: 'Selectionnez votre industrie',
        industryOther: 'Entrez votre industrie',
        department: 'ex: Marketing',
        yearsExperience: 'Selectionnez vos annees d\'experience',
        companySize: 'Selectionnez la taille de l\'entreprise'
      },
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
        reporting: { label: 'Rapports', desc: 'Analyses' }
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
          keynoteCount: '{count} keynote',
          regularCount: '{count} regulier',
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
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Atelier',
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
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Atelier'
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
            edit: 'Modifier le billet'
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
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Atelier'
          },
          searchPlaceholder: 'Rechercher des intervenants...',
          sortBy: 'Trier par : Nom',
          badges: {
            keynote: 'KEYNOTE',
            panel: 'PANEL',
            workshop: 'ATELIER'
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
              keynote: {
                label: 'Keynote',
                desc: 'Intervenant principal sur scene'
              },
              panel: {
                label: 'Panel',
                desc: 'Participant aux panels'
              },
              workshop: {
                label: 'Atelier',
                desc: 'Anime des ateliers pratiques'
              },
              regular: {
                label: 'Intervenant standard',
                desc: 'Intervenant de session classique'
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
          nameRequired: "Le nom de l'evenement est obligatoire."
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
          }
        },
        branding: {
          title: 'Branding',
          color: 'Couleur de marque',
          logo: 'Logo',
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
        upgradeUnlock: 'Passer a Pro pour debloquer'
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
          ai: 'Conseiller IA Eventra',
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
        ai: {
          title: 'Conseiller IA Eventra',
          subtitle: 'Optimisez votre profil professionnel avec des recommandations IA',
          optimizer: {
            title: 'Optimiseur de contenu',
            current: 'Description actuelle',
            rewrite: 'Réécrire pour plus d\'impact',
            generating: 'Génération...',
            suggestion: 'Suggestion IA',
            accept: 'Accepter',
            tryAgain: 'Réessayer'
          },
          tags: {
            title: 'Générateur de tags',
            subtitle: 'Tags suggérés par l\'IA basés sur votre profil',
            apply: 'Appliquer les tags suggérés'
          },
          competitor: {
            title: 'Aperçu concurrentiel'
          },
          bestPractices: {
            title: 'Guide des meilleures pratiques'
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
      },productsManagement: {
        title: 'Produits & Services',
        subtitle: 'Gérez vos offres, tarifs et informations produits',
        addProduct: 'Ajouter un produit',
        editProduct: 'Modifier le produit',
        addNewProduct: 'Ajouter un nouveau produit',
        updateProduct: 'Mettre à jour',
        saveProduct: 'Enregistrer',
        cancel: 'Annuler',
        form: {
          name: 'Nom du produit / service *',
          namePlaceholder: 'ex. Event Analytics Pro',
          sector: 'Secteur *',
          subsector: 'Sous-secteur *',
          description: 'Description *',
          descriptionPlaceholder: 'Décrivez votre produit ou service...',
          price: 'Prix *',
          pricePlaceholder: '499.00',
          currency: 'Devise',
          tags: 'Tags',
          tagsPlaceholder: 'Tapez un tag et appuyez sur Entrée',
          mainImage: 'Image principale du produit *',
          uploadMain: 'Cliquez pour télécharger l\'image principale',
          imageUploaded: '✓ Image téléchargée - Cliquez pour changer',
          gallery: 'Images de la galerie (Max 4)',
          upload: 'Télécharger'
        },
        toasts: {
          offeringRemoved: 'Offre supprimée',
          offeringSaved: 'Offre enregistrée',
          uploadFailed: 'Échec du téléchargement'
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
          'Software Development': 'Développement Logiciel',
          'Event Tech': 'Tech Événementielle',
          'AI Tools': 'Outils IA',
          'Analytics': 'Analytique',
          'Consulting': 'Conseil',
          'Advisory': 'Avis',
          'Operations': 'Opérations',
          'Legal': 'Juridique',
          'Digital Marketing': 'Marketing Digital',
          'Brand Strategy': 'Stratégie de Marque',
          'Growth': 'Croissance',
          'Content': 'Contenu',
          'Accounting': 'Comptabilité',
          'Payments': 'Paiements',
          'Investment': 'Investissement',
          'FinTech': 'FinTech',
          'Shipping': 'Expédition',
          'Warehousing': 'Entreposage',
          'Transportation': 'Transport',
          'Fulfillment': 'Exécution',
          'A/V Production': 'Production A/V',
          'Stage Design': 'Conception Scénique',
          'Lighting': 'Éclairage',
          'Sound': 'Son'
        },
        countries: [
          'États-Unis',
          'Canada',
          'Royaume-Uni',
          'Allemagne',
          'France',
          'Pays-Bas',
          'Espagne',
          'Émirats Arabes Unis',
          'Arabie Saoudite',
          'Qatar',
          'Singapour',
          'Australie'
        ],
        suggestedTags: ['SaaS', 'EventTech', 'Inscription', 'Analytique', 'B2B']
      },
      marketplace: {
        hero: {
          title: 'Trouvez les partenaires parfaits pour votre prochain événement.',
          searchPlaceholder: 'Rechercher des services, entreprises ou tags...',
          searchButton: 'Rechercher',
          categories: {
            av: 'A/V & Production',
            catering: 'Traiteur',
            tech: 'Tech Événementielle',
            venues: 'Lieux',
            logistics: 'Logistique',
            photography: 'Photographie',
            design: 'Design & Décor',
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
          verified: 'Entreprises vérifiées uniquement',
          sustainable: 'Durable / Éco-responsable',
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
          badge: 'Propulsé par IA',
          title: 'Recommandé pour vous',
          refresh: 'Actualiser',
          match: '95% match',
          aiMatch: 'Match IA'
        },
        results: {
          loading: 'Chargement des entreprises...',
          found: '{count} {label} Trouvé(s)',
          business: 'Entreprise',
          businesses: 'Entreprises',
          requestQuote: 'Demander un devis',
          noDescription: 'Aucune description fournie.',
          locationTbd: 'Lieu à définir'
        },
        empty: {
          title: 'Aucune entreprise trouvée',
          subtitle: 'Essayez d\'ajuster vos filtres ou critères de recherche',
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
          specifications: 'Spécifications',
          reviews: 'Avis'
        },
        overview: 'Aperçu',
        labels: {
          id: 'ID',
          verified: 'Entreprise vérifiée',
          deliveryTime: 'Livraison moyenne : {value}',
          shipsFrom: 'Expédié depuis : {value}'
        },
        types: {
          product: 'Produit',
          service: 'Service professionnel'
        },
        specifications: {
          type: 'Type',
          availability: 'Disponibilité',
          unlimited: 'Illimitée',
          limited: 'Limitée',
          quantity: 'Quantité',
          tags: 'Tags'
        },
        pricing: {
          contact: 'Contactez-nous pour le prix',
          quantityLabel: 'Sélectionner la quantité / licences'
        },
        actions: {
          requestQuote: 'Demander un devis',
          messageSeller: 'Contacter le vendeur',
          saved: 'Enregistré',
          wishlist: 'Liste de souhaits',
          share: 'Partager'
        },
        reviews: {
          count: '({count} avis)',
          globalSatisfaction: 'Satisfaction globale',
          helpful: 'Avis utile ? ({count})',
          starsLabel: '{count} étoiles'
        },
        seller: {
          managedBy: 'Géré par',
          response: 'Réponse',
          memberSince: 'Membre depuis',
          viewProfile: 'Voir le profil professionnel',
          fallbackName: 'Vendeur',
          deals: '({count} transactions)'
        }
      },
  }
}as any; 

