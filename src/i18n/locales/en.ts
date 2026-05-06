export default {
    brand: {
      name: 'Eventra'
    },
    common: {
      pagination: {
        previous: 'Previous',
        next: 'Next'
      }
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
        fr: 'French',
        ar: 'Arabic'
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
        type: { // Added new type filter title
          title: 'Type'
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
          custom: 'Choose Date Range...',
          startDate: 'Start Date',
          endDate: 'End Date'
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
        requestedByThem: 'Requested by them',
        noMatches: 'No matches available yet'
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
        noMeetings: 'No meetings scheduled',
        noMeetingsSubtitle: 'You don\'t have any meetings scheduled yet.',
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
      digest: {
        tagline: 'Personalized for you',
        title: 'Your Weekly Digest',
        subtitle: 'A selection of events matched to your interests.',
        viewAll: 'View all events'
      },
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
        searchCountry: 'Search country...',
        jobTitle: 'e.g., Product Manager',
        company: 'e.g., Acme Inc.',
        industry: 'Select your industry',
        searchIndustry: 'Search industry...',
        industryOther: 'Enter your industry',
        department: 'e.g., Marketing',
        yearsExperience: 'Select years of experience',
        companySize: 'Select company size'
      },
      noResults: 'No results found',
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
        'Business enabling organisation',
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
        reporting: { label: 'Reporting', desc: 'Analytics' },
        notifications: { label: 'Notifications', desc: 'Email & alerts' }
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
            exhibitors: 'Make exhibitors',
            showLess: 'Show Less'
          }
        },
        actions: {
          title: 'Quick Actions',
          sendEmail: 'Send Email',
          addSession: 'Add Session',
          addSpeaker: 'Add Speaker',
          sellTickets: 'Sell Tickets',
          addExhibitor: 'Add Exhibitor',
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
            attendees: 'Session Attendance',
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
          trainerCount: '{count} trainer',
          lectureCount: '{count} lecture',
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
            trainer: 'Trainer',
            coach: 'Coach',
            expert: 'Expert',
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
            trainer: 'Trainer',
            coach: 'Coach',
            expert: 'Expert'
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
      forms: {
        title: 'Custom Forms & Responses',
        subtitle: 'View all your event forms and track attendee submissions in one place.',
        anonymous: 'Anonymous Attendee',
        empty: 'No custom forms created yet. Head to Registration to create one!',
        table: {
          formName: 'Form Name',
          type: 'Type',
          created: 'Date Created',
          actions: 'Actions'
        },
        buttons: {
          copyLink: 'Copy shareable link',
          viewSubmissions: 'View Responses',
          exportCsv: 'Export as CSV'
        },
        submissions: {
          viewing: 'Showing {count} responses so far',
          submittedAt: 'Submitted On',
          attendee: 'Respondent',
          attendeeName: 'Respondent Name',
          attendeeEmail: 'Email Address',
          data: 'Response Data',
          noSubmissions: 'No responses received yet — share your form to start collecting!'
        },
        toasts: {
          loadFormsFailed: 'Could not load forms. Please try again.',
          loadSubmissionsFailed: 'Could not load responses. Please try again.',
          linkCopied: 'Form link copied to clipboard!'
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
        },
        toasts: {
          settingsSaved: 'Scanner settings saved',
          settingsFailed: 'Failed to save scanner settings',
          synced: 'Queued check-ins synced',
          cameraUnavailable: 'Camera access not available',
          cameraDenied: 'Camera access denied',
          cameraInactive: 'Camera is not active',
          torchUnsupported: 'Flashlight not supported on this device',
          torchFailed: 'Failed to toggle flashlight',
          qrUnsupported: 'QR scanning not supported on this device',
          enterCode: 'Please enter a code',
          invalidCode: 'Invalid QR code — attendee not found',
          selectSession: 'Please select a session first',
          selectMeeting: 'Please select a meeting first',
          meetingNotFound: 'Meeting not found',
          notAssigned: 'Attendee is not assigned to this meeting',
          duplicateBlocked: 'Duplicate check-in blocked',
          queuedOffline: 'Check-in queued offline — will sync when online',
          reentryLogged: 'Re-entry logged successfully',
          checkInSuccess: 'Check-in successful!',
          checkInFailed: 'Check-in failed — please try again',
          noDuplicate: 'No pending duplicate to confirm',
          reportDownloaded: 'Report downloaded',
          reportFailed: 'Failed to download report'
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
      notifications: {
        header: {
          title: 'Notification Center',
          subtitle: 'Configure automated emails, in-app alerts, and broadcast messages to your attendees.'
        },
        tabs: {
          settings: 'Settings',
          broadcast: 'Broadcast',
          log: 'Log'
        },
        triggers: {
          meetingBooked: {
            label: 'Meeting Booked',
            description: 'Sent when a B2B meeting is scheduled between attendees.'
          },
          eventRegistration: {
            label: 'Event Registration',
            description: 'Confirmation sent after a successful registration with QR code.'
          },
          formSubmitted: {
            label: 'Form Submitted',
            description: 'Acknowledgement sent when an attendee completes a custom form.'
          },
          sessionReminder: {
            label: 'Session Reminder',
            description: 'Reminder sent before a session is about to start.'
          }
        },
        settings: {
          custom: 'Custom',
          email: 'Email',
          bell: 'Bell',
          editEmail: 'Edit Email',
          variablesHint: 'Use {{variable}} placeholders — they are replaced automatically at send time.',
          edit: 'Edit',
          preview: 'Preview',
          resetDefault: 'Reset to Default',
          save: 'Save Template',
          subjectLine: 'Subject Line',
          subjectPlaceholder: 'Enter email subject...',
          emailBody: 'Email Body',
          bodyPlaceholder: 'Write your email body here...',
          availableVars: 'Available Variables:',
          clickAppend: 'Click to append to body',
          livePreview: 'Live Preview'
        },
        broadcast: {
          title: 'Send Broadcast Message',
          subject: 'Subject',
          subjectPlaceholder: 'Enter broadcast subject...',
          message: 'Message',
          messagePlaceholder: 'Write your message to all attendees...',
          sendVia: 'Send via',
          email: 'Email',
          bellNotification: 'Bell Notification',
          target: 'Will be sent to {count} attendees',
          sending: 'Sending {sent}/{total}...',
          sendBroadcast: 'Send Broadcast'
        },
        log: {
          allTriggers: 'All Triggers',
          broadcastLabel: 'Broadcast',
          allChannels: 'All Channels',
          email: 'Email',
          bell: 'Bell',
          refresh: 'Refresh',
          noLogs: 'No notifications sent yet.',
          headers: {
            dateTime: 'Date & Time',
            trigger: 'Trigger',
            channel: 'Channel',
            recipientId: 'Recipient ID',
            status: 'Status'
          }
        },
        toasts: {
          updateFailed: 'Failed to update notification setting',
          templateSaveFailed: 'Failed to save email template',
          templateSaved: 'Email template saved',
          resetFailed: 'Failed to reset email template',
          resetSuccess: 'Email template reset to default',
          fillFields: 'Please fill in subject and message',
          selectChannel: 'Select at least one channel',
          noAttendees: 'No attendees to send to',
          broadcastSent: 'Broadcast sent to {count} attendees'
        }
      },
      b2b: {
        header: {
          title: 'B2B Matchmaking Hub',
          subtitle: 'AI-powered networking — connect the right people at the right time',
          aiMatchmaker: 'AI Matchmaker',
          createMeeting: 'Create Meeting'
        },
        tabs: {
          aiMatchmaker: 'AI Matchmaker',
          allMeetings: 'All Meetings',
          logistics: 'Logistics',
          analytics: 'Analytics',
          suggestions: 'Suggestions'
        },
        stats: {
          activeConnections: 'Active Connections',
          totalMeetings: 'Total Meetings',
          newThisWeek: '+{count} this week',
          aiMatchSuccess: 'AI Match Success',
          ofAiAccepted: 'of AI matches accepted',
          pendingSuggestions: 'Pending Suggestions',
          awaitingResponse: 'Awaiting response',
          sendReminders: 'Send Reminders',
          completed: 'Completed',
          completionRate: '{percent}% completion rate',
          networkingScore: 'Networking Score',
          overallEngagement: 'Overall engagement'
        },
        toasts: {
          suggestionsDismissed: 'Suggestion dismissed',
          notificationsSent: 'Notifications sent successfully',
          invitationsSent: 'Invitations sent successfully',
          meetingUpdated: 'Meeting updated successfully',
          meetingCreated: 'Meeting created successfully',
          meetingCreateError: 'Failed to create meeting',
          matchesSuccess: '{count} matches created successfully',
          matchesComplete: 'Matching complete',
          noSuggestionsExport: 'No suggestions to export',
          suggestionsExported: 'Suggestions exported successfully',
          noMeetingsExport: 'No meetings to export',
          meetingsExported: 'Meetings exported successfully',
          settingsSaved: 'Settings saved successfully',
          noPendingRemind: 'No pending meetings to remind',
          remindersSent: 'Reminders sent successfully',
          selectMatchFirst: 'Select a match first',
          matchNotifSent: 'Match notification sent',
          selectSuggestion: 'Select a suggestion first',
          notifSent: 'Notification sent',
          addTwo: 'Add at least two attendees to use matchmaking'
        },
        aiMatchmaker: {
          title: 'AI Matchmaker',
          subtitle: 'Let our AI analyze attendee profiles and suggest the most valuable connections',
          whoToMatch: 'Who should we match?',
          options: {
            all: {
              label: 'All Attendees',
              desc: 'Match across all registered attendees',
              count: '{count} attendees available'
            },
            category: {
              label: 'By Category',
              desc: 'Match within specific attendee categories',
              count: '{count} categories'
            },
            individuals: {
              label: 'Specific Individuals',
              desc: 'Select specific people to match',
              count: '{count} opted in'
            },
            noAttendees: 'No attendees yet',
            noCategories: 'No categories',
            noOptIn: 'None opted in',
            recommended: 'Recommended'
          },
          criteria: {
            title: 'Matching Criteria',
            industry: 'Industry Match',
            industryDesc: 'Prioritize same or complementary industries',
            role: 'Role Compatibility',
            roleDesc: 'Match decision-makers with relevant counterparts',
            stage: 'Company Stage',
            stageDesc: 'Match startups with investors, etc.',
            interests: 'Shared Interests',
            interestsDesc: 'Find common professional interests',
            goals: 'Networking Goals',
            goalsDesc: 'Align based on stated objectives'
          },
          threshold: {
            title: 'Minimum Match Score',
            subtitle: 'Only suggest matches above {percent}% compatibility',
            recommended: 'Recommended: 60-80%'
          },
          generate: {
            info: '{total} attendees will be analyzed, approximately {count} matches expected',
            time: 'Processing usually takes 15-30 seconds',
            button: 'Generate AI Matches'
          }
        },
        allMeetings: {
          filters: {
            all: 'All',
            today: 'Today',
            ai: 'AI Matched',
            manual: 'Manual',
            pending: 'Pending',
            completed: 'Completed',
            search: 'Search by name, company...',
            allDates: 'All Dates',
            thisWeek: 'This Week',
            recent: 'Most Recent',
            score: 'Match Score',
            upcoming: 'Upcoming'
          },
          table: {
            headers: {
              id: 'ID',
              participants: 'Participants',
              score: 'Score',
              dateTime: 'Date & Time',
              status: 'Status',
              actions: 'Actions'
            },
            manual: 'Manually created',
            empty: 'No meetings found matching your filters'
          }
        },
        logistics: {
          venueCapacity: {
            title: 'Venue Capacity',
            subtitle: 'Configure your meeting space layout and table arrangement',
            tableCount: 'Number of Tables',
            tablePrefix: 'Table Prefix',
            tablePrefixPlaceholder: 'e.g. Table, Desk, Booth',
            slotDuration: 'Meeting Slot Duration'
          },
          capacityCalc: {
            title: 'Capacity Overview',
            tableSetup: 'Table Setup',
            slotDuration: 'Slot Duration',
            totalTimeSlots: 'Total Time Slots',
            maxMeetings: 'Max Meetings'
          },
          schedule: {
            title: 'Meeting Schedule',
            subtitle: 'Set available dates and time blocks for B2B meetings',
            addDate: 'Add Time Block',
            to: 'to',
            duplicateBlock: 'Duplicate this time block',
            noDates: 'No time blocks configured',
            noDatesHint: 'Add time blocks to define when meetings can be scheduled',
            saving: 'Saving...',
            saveConfig: 'Save Configuration'
          }
        },
        analytics: {
          title: 'Analytics Dashboard',
          summary: '{total} meetings scheduled with {avg}% average match score and {rate}% success rate',
          topIndustry: 'Top industry: {industry} — Top goal: {goal}'
        },
        suggestions: {
          title: 'AI Suggestions',
          subtitle: '{count} pending suggestions awaiting review',
          empty: 'No suggestions available. Run the AI Matchmaker to generate matches.'
        },
        modals: {
          processing: {
            analyzing: {
              title: 'Analyzing Profiles',
              subtitle: 'Scanning {count} attendee profiles...'
            },
            generating: {
              title: 'Generating Matches',
              subtitle: 'Finding the best connections...'
            },
            complete: {
              title: 'Matching Complete!',
              subtitle: 'Here are the results of your AI matchmaking run',
              stats: {
                created: 'Matches Created',
                avgScore: 'Average Score',
                matched: 'Attendees Matched'
              },
              actions: {
                viewAll: 'View All Matches',
                sendNotif: 'Send Notifications'
              }
            },
            progress: {
              analyzing: 'Analyzing attendee profiles...',
              generating: 'Generating smart matches...',
              remaining: 'Estimated {count} seconds remaining'
            }
          },
          details: {
            title: 'Match Details',
            score: '{percent}% Match Score',
            breakdown: 'Score Breakdown',
            noDetails: 'No breakdown available',
            overall: 'Overall: {percent}%',
            insights: 'Key Insights',
            noInsights: 'No insights available',
            topics: 'Suggested Discussion Topics',
            noTopics: 'No topics suggested',
            actions: {
              schedule: 'Schedule Meeting',
              sendBoth: 'Notify Both Parties'
            }
          },
          create: {
            title: 'Schedule Meeting',
            matchInfo: '{percent}% match compatibility',
            perfectMatch: 'Connecting people with shared interests in {tags}',
            fields: {
              dateTime: 'Date & Time',
              duration: 'Duration',
              location: 'Location / Table'
            },
            durations: {
              m30: '30 minutes',
              m45: '45 minutes',
              m60: '60 minutes'
            },
            placeholders: {
              location: 'e.g. Table A3, Meeting Room 2'
            },
            actions: {
              cancel: 'Cancel',
              create: 'Create Meeting'
            }
          }
        }
      }
    },
    registrationFlow: {
      help: 'Need help? Contact the event organizer.',
      welcomeBack: 'Welcome back',
      guest: 'Guest',
      confirmDetails: 'Confirm your details',
      locked: 'Locked',
      selectOption: 'Select an option...',
      selectCountry: 'Select country',
      phoneNumber: 'Phone Number',
      fileUploaded: 'File uploaded',
      clickToUpload: 'Click to upload',
      customizeAgenda: 'Customize Your Agenda',
      selectSessionsOptional: 'Select the sessions you would like to attend (optional)',
      noSessionsAvailable: 'No sessions available for this event.',
      preRegistrationComplete: 'Pre-Registration Complete!',
      allSet: "You're all set!",
      paidConfirmationDesc: 'Your registration is confirmed. Please complete payment to secure your spot.',
      freeConfirmationDesc: 'Your registration is confirmed. Show your QR code at the entrance.',
      finalStepTitle: 'One Last Step',
      finalStepDesc: 'Browse and secure your ticket to complete registration.',
      browseSecureTicket: 'Browse & Secure Your Ticket',
      downloadTicketVoucher: 'Download Ticket Voucher',
      backToEventPage: 'Back to Event Page',
      back: 'Back',
      completeRegistration: 'Complete Registration',
      continue: 'Continue',
      selectedSessions: 'Selected Sessions',
      itemsCount: '{count} items',
      mainHall: 'Main Hall',
      registrationStatus: 'Registration Status',
      ticketPurchaseRequired: 'Ticket purchase required',
      free: 'Free',
      steps: {
        details: 'Details',
        sessions: 'Sessions',
        done: 'Done'
      },
      voucher: {
        officialEntryTicket: 'Official Entry Ticket',
        date: 'Date',
        tbd: 'TBD',
        time: 'Time',
        attendee: 'Attendee',
        confCode: 'Confirmation Code',
        presentQR: 'Present this QR code at the entrance'
      },
      toasts: {
        loadFailed: 'Failed to load event details',
        nameEmailRequired: 'Name and email are required',
        alreadyRegistered: 'You are already registered for this event',
        registrationFailed: 'Registration failed. Please try again.',
        fileUploaded: 'File uploaded successfully',
        fileUploadFailed: 'File upload failed',
        fileUploadError: 'Error uploading file'
      }
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
          { value: 'Business enabling organisation', label: 'Business enabling organisation' },
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
            edit: 'Edit Ticket',
            archive: 'Archive'
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
          },
          bulk: {
            selected: '{count} selected',
            deselectAll: 'Deselect All',
            enableAll: 'Enable All',
            disableAll: 'Disable All',
            duplicate: 'Duplicate',
            delete: 'Delete'
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
            trainer: 'Trainer',
            coach: 'Coach',
            expert: 'Expert'
          },
          searchPlaceholder: 'Search speakers...',
          sortBy: 'Sort by: Name',
          badges: {
            trainer: 'TRAINER',
            coach: 'COACH',
            expert: 'EXPERT'
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
              trainer: {
                label: 'Trainer',
                desc: 'Delivers training sessions and skill-building programs'
              },
              coach: {
                label: 'Coach',
                desc: 'Provides coaching and mentorship sessions'
              },
              expert: {
                label: 'Expert',
                desc: 'Subject matter expert sharing deep knowledge'
              },
              lecture: {
                label: 'Lecture',
                desc: 'Delivers academic or educational lectures'
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
            scheduleTitle: 'When does this session take place?',
            selectEventDay: 'Pick a day for your session',
            date: 'Date *',
            startTime: 'Start Time *',
            endTime: 'End Time *',
            duration: 'Duration',
            invalidRange: 'Invalid time range',
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
            capacity: 'How many people can attend?',
            capacityUnlimited: 'No limit',
            capacityPlaceholder: 'e.g., 100',
            tags: 'Tags',
            tagsPlaceholder: 'Type a tag and press Enter',
            selectDate: 'Pick a date',
            errors: {
              timeRange: "Wait! The session ends before it starts. Please check the time again.",
              invalidDateTime: 'Please enter a valid date and time.',
              conflictTitle: 'Schedule Conflict',
              conflictBody: 'This time slot overlaps with "{session}" at {venue}.',
              capacityExceedsEvent: 'Capacity exceeds event capacity'
            },
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
        attendeesTab: {
          title: 'Attendee Management',
          subtitle: 'Add, import, and manage event attendees',
          loading: 'Loading attendees...',
          csvTemplate: 'CSV Template',
          searchPlaceholder: 'Search by name or email...',
          toasts: {
            importSuccess: '{count} attendees imported successfully',
            importFailed: 'Import failed',
            nameEmailRequired: 'Name and email are required',
            invalidEmail: 'Please enter a valid email address',
            missingField: '{field} is required',
            addSuccess: 'Attendee added successfully',
            duplicateEmail: 'This email is already registered',
            addFailed: 'Failed to add attendee',
            noExport: 'No attendees to export',
            exportStarted: 'Export started'
          },
          actions: {
            addManually: 'Add Manually',
            addManuallyDesc: 'Fill in attendee details using the registration form',
            importCsv: 'Import from CSV',
            importCsvDesc: 'Bulk import attendees from a spreadsheet file',
            exportList: 'Export List',
            exportListDesc: 'Download attendee data as a CSV file',
            addFirstAttendee: 'Add First Attendee'
          },
          addForm: {
            title: 'Register New Attendee',
            subtitle: 'Fill in the details below to manually add an attendee',
            ticketType: 'Ticket Type',
            generalAdmission: 'General Admission',
            status: 'Registration Status',
            statusApproved: 'Approved',
            statusPending: 'Pending',
            enterField: 'Enter {field}',
            selectOption: 'Select an option...',
            assignSessions: 'Assign to Sessions',
            assignSessionsDesc: 'Optionally assign this attendee to specific sessions',
            selectedCount: '{count} selected',
            noSessions: 'No sessions available',
            discardChanges: 'Discard Changes',
            saveRegistration: 'Save Registration'
          },
          table: {
            name: 'Attendee',
            ticket: 'Ticket',
            status: 'Status',
            checkedIn: 'Checked In',
            actions: 'Actions',
            approved: 'Approved',
            pending: 'Pending',
            yes: 'Yes',
            no: 'No'
          },
          empty: {
            title: 'No attendees yet',
            subtitle: 'Start by adding attendees manually or importing from a CSV file'
          },
          badges: {
            title: 'Badges & Check-in',
            designTitle: 'Design Event Badges',
            designDesc: 'Create professional badges with QR codes for seamless check-in',
            openEditor: 'Open Badge Editor'
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
            editPackage: 'Customize Sponsorship Tier',
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
            evaluation: 'Evaluation',
            quiz: 'Quiz / Knowledge Check',
            poll: 'Poll / Voting',
            nomination: 'Nomination',
            pitch: 'Pitch Submission',
            checkin: 'Check-in',
            interest: 'Expression of Interest',
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
          },
          fieldSettings: {
            title: 'Field Settings',
            labels: {
              fieldLabel: 'Field Label',
              helpText: 'Help Text',
              placeholder: 'Placeholder Text',
              options: 'Options',
              newOption: 'Add new option...',
              settings: 'Settings',
              requiredField: 'Required Field',
              requiredSystemNote: 'This is a system field and cannot be made optional',
              showInDashboard: 'Show in Dashboard',
              dashboardNote: 'This field will appear in the attendee data table'
            },
            placeholders: {
              helpText: 'Add guidance for respondents...',
              inputPlaceholder: 'Placeholder text...'
            },
            actions: {
              deleteField: 'Delete Field',
              cancel: 'Cancel',
              saveChanges: 'Save Changes'
            }
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
            subtitle: 'Automate WhatsApp messages for your event attendees',
            lockedTitle: 'Reach Attendees on WhatsApp',
            lockedSubtitle: 'Send event updates, reminders, and engage with attendees directly on WhatsApp',
            connectionStatus: 'Connection Status',
            businessNumber: 'WhatsApp Business Number',
            phonePlaceholder: '+1 (555) 000-0000',
            connecting: 'Connecting...',
            connect: 'Connect WhatsApp',
            scanInstruction: 'Scan the QR code with WhatsApp on your phone',
            confirmScan: 'I\'ve Scanned the Code',
            hideQr: 'Hide QR Code',
            scanPrompt: 'Scan QR code to connect',
            automatedWorkflows: 'Automated Workflows',
            saveSettings: 'Save Settings',
            workflows: {
              confirmations: 'Registration Confirmation',
              confirmationsDesc: 'Auto-send confirmation when someone registers',
              reminders: 'Event Reminders',
              remindersDesc: 'Send reminders before the event starts',
              thankyou: 'Thank You Message',
              thankyouDesc: 'Auto-send after the event ends'
            },
            toasts: {
              enterPhone: 'Please enter a phone number',
              connected: 'WhatsApp connected successfully',
              saveFailed: 'Failed to save WhatsApp settings',
              saved: 'WhatsApp settings saved'
            },
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
          outreachCampaign: 'Outreach Campaign',
          event: 'Event',
          tradeMission: 'Trade Mission',
          pitchingEvent: 'Pitching Event',
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
          nameRequired: 'Event name is required.',
          datesRequired: 'Please select start and end dates.',
          startDatePast: 'Start date cannot be in the past.',
          endDateBeforeStart: 'End date cannot be before start date.'
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
          },
          sponsorPackages: {
            name: 'Sponsor Packages',
            description: 'Display sponsorship tiers and offers.'
          },
          networking: {
            name: 'B2B Networking',
            description: 'Networking hub with matchmaking and meetings.'
          },
          attendees: {
            name: 'Attendees',
            description: 'Showcase event attendees in a slider.'
          }
        },
        branding: {
          title: 'Branding',
          subtitle: 'Customize your event brand identity.',
          color: 'Brand color',
          logo: 'Logo',
          logoSize: 'Logo Size',
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
        upgradeUnlock: 'Upgrade to unlock',
        modals: {
          heroBlock: {
            title: 'Hero Section Settings',
            subtitle: 'Customize the hero banner of your event page.',
            sections: {
              backgroundImage: 'Background Image',
              textContent: 'Text Content',
              primaryButton: 'Primary Button',
              secondaryButton: 'Secondary Button'
            },
            labels: {
              heroBannerImage: 'Hero Banner Image',
              uploading: 'Uploading...',
              clickToUpload: 'Click to upload',
              fileTypes: 'PNG, JPG, WebP up to 5MB',
              change: 'Change',
              eventTitle: 'Event Title',
              taglineSubtitle: 'Tagline / Subtitle',
              visible: 'Visible',
              text: 'Text',
              actionLocked: 'Action (locked)',
              registrationPage: 'Registration Page',
              linkAction: 'Link / Action'
            },
            placeholders: {
              title: 'Enter event title...',
              subtitle: 'Enter a short tagline...'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          aboutBlock: {
            title: 'About Section Settings',
            subtitle: 'Tell attendees about your event.',
            labels: {
              sectionImage: 'Section Image',
              uploadImage: 'Upload Image',
              sectionHeadline: 'Section Headline',
              briefSummary: 'Brief Summary',
              keyHighlights: 'Key Highlights',
              mainInformation: 'Main Information'
            },
            placeholders: {
              headline: 'e.g., About This Event',
              summary: 'Describe your event...',
              description: 'Detailed description...',
              addBullet: 'Add a highlight...'
            },
            emptyHighlights: 'No highlights added yet.',
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          countdownBlock: {
            title: 'Countdown Settings',
            subtitle: 'Configure the countdown timer display.',
            sections: {
              sectionHeader: 'Countdown Display',
              callToAction: 'Call to Action'
            },
            labels: {
              mainTitle: 'Section Title',
              subtitleLabel: 'Subtitle',
              buttonText: 'Button Text',
              buttonLink: 'Button Link'
            },
            placeholders: {
              title: 'e.g., Event Starts In...',
              subtitle: 'e.g., Don\'t miss out!',
              buttonText: 'e.g., Register Now',
              buttonLink: 'https://...'
            },
            autoSync: 'The countdown automatically syncs with your event start date set in <strong>Step 1</strong>.',
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          customHtmlBlock: {
            title: 'Custom HTML Settings',
            subtitle: 'Add custom HTML content to your page.',
            sections: {
              sectionHeader: 'HTML Content'
            },
            labels: {
              htmlContent: 'HTML Content'
            },
            placeholders: {
              htmlContent: '<div>Your custom HTML here...</div>'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          exhibitorsBlock: {
            title: 'Exhibitors Section Settings',
            subtitle: 'Configure the exhibitors display section.',
            sections: {
              sectionHeader: 'Section Header',
              displayOptions: 'Display Options'
            },
            labels: {
              mainTitle: 'Section Title',
              subtitleLabel: 'Subtitle',
              enableSearchBar: 'Enable Search Bar',
              searchBarDesc: 'Allow visitors to search exhibitors by name',
              showBoothNumbers: 'Show Booth Numbers',
              boothNumbersDesc: 'Display assigned booth numbers on exhibitor cards'
            },
            placeholders: {
              title: 'e.g., Our Exhibitors',
              subtitle: 'e.g., Meet the companies joining us'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          footerBlock: {
            title: 'Footer Settings',
            subtitle: 'Customize the footer section.',
            sections: {
              contactCopyright: 'Contact & Copyright',
              socialMedia: 'Social Media Profiles',
              externalLinks: 'Useful Links'
            },
            labels: {
              copyrightNotice: 'Copyright Notice',
              supportEmail: 'Support Email',
              contactNumber: 'Phone Number'
            },
            placeholders: {
              copyright: 'e.g., © 2026 Your Event. All rights reserved.',
              email: 'hello@example.com',
              phone: '+1 (555) 123-4567',
              facebook: 'https://facebook.com/your-event',
              twitter: 'https://twitter.com/your-event',
              linkedin: 'https://linkedin.com/company/your-event',
              instagram: 'https://instagram.com/your-event',
              linkLabel: 'Link name',
              linkUrl: 'https://...'
            },
            emptyLinks: 'No links added yet. Add your first link above.',
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateFooter: 'Update Footer'
            }
          },
          mapBlock: {
            title: 'Map Settings',
            subtitle: 'Configure the event location map.',
            sections: {
              sectionHeader: 'Section Header',
              locationInfo: 'Location Coordinates'
            },
            labels: {
              mainTitle: 'Main Title',
              subtitleLabel: 'Subtitle',
              latitude: 'Latitude',
              longitude: 'Longitude'
            },
            placeholders: {
              title: 'e.g., Event Location',
              subtitle: 'e.g., Find us here',
              latitude: 'e.g., 25.2048',
              longitude: 'e.g., 55.2708'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          networkingBlock: {
            title: 'Networking Section Settings',
            subtitle: 'Configure the networking section.',
            sections: {
              sectionContent: 'Section Content'
            },
            labels: {
              mainTitle: 'Section Title',
              highlightTagline: 'Highlight Tagline',
              description: 'Description',
              ctaButtonText: 'Button Text'
            },
            placeholders: {
              title: 'e.g., Networking Hub',
              tagline: 'e.g., Connect with industry leaders',
              description: 'e.g., Describe networking opportunities...',
              ctaText: 'e.g., Start Networking'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          attendeesBlock: {
            title: 'Attendees Section Settings',
            subtitle: 'Configure the attendees showcase.',
            sections: {
              sectionContent: 'Section Content',
              displayOptions: 'Display Options'
            },
            labels: {
              mainTitle: 'Section Title',
              subtitle: 'Subtitle',
              showCount: 'Show Attendee Count',
              cardsPerPage: 'Cards Per Page',
              autoSlide: 'Auto Slide'
            },
            placeholders: {
              title: 'e.g., Our Attendees',
              subtitle: 'e.g., Meet the professionals joining this event'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          socialFeedBlock: {
            title: 'Social Feed Settings',
            subtitle: 'Configure social media feed display.',
            sections: {
              sectionHeader: 'Section Header',
              displayOptions: 'Display Options'
            },
            labels: {
              mainTitle: 'Main Title',
              subtitleLabel: 'Subtitle',
              twitterHandle: 'Twitter/X Handle',
              instagramHandle: 'Instagram Handle'
            },
            placeholders: {
              title: 'e.g., Social Feed',
              subtitle: 'e.g., Join the conversation',
              twitterHandle: '@yourevent',
              instagramHandle: '@yourevent'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          sponsorPackagesBlock: {
            title: 'Sponsor Packages Settings',
            subtitle: 'Configure sponsorship packages display.',
            sections: {
              sectionHeader: 'Section Header',
              callToAction: 'Call to Action'
            },
            labels: {
              mainTitle: 'Main Title',
              subtitleLabel: 'Subtitle',
              highlightedPackage: 'Highlighted Package',
              buttonText: 'Button Text',
              linkUrl: 'Link URL',
              enabled: 'Enabled'
            },
            placeholders: {
              title: 'e.g., Sponsorship Packages',
              subtitle: 'e.g., Partner with us',
              highlightedPackage: 'e.g., Gold',
              buttonText: 'e.g., Become a Sponsor',
              linkUrl: 'https://...'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          sponsorsBlock: {
            title: 'Sponsors Section Settings',
            subtitle: 'Configure the sponsors display.',
            sections: {
              sectionHeader: 'Section Header'
            },
            labels: {
              mainTitle: 'Main Title',
              subtitleLabel: 'Subtitle',
              becomeSponsorButton: 'Become a Sponsor Button',
              buttonText: 'Button Text',
              linkUrl: 'Link URL',
              enabled: 'Enabled'
            },
            placeholders: {
              title: 'e.g., Our Sponsors',
              subtitle: 'e.g., Thanks to our amazing sponsors',
              buttonText: 'e.g., Become a Sponsor',
              linkUrl: 'https://...'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          testimonialsBlock: {
            title: 'Testimonials Settings',
            subtitle: 'Configure testimonials display.',
            sections: {
              sectionHeader: 'Section Header',
              displayOptions: 'Display Options'
            },
            labels: {
              mainTitle: 'Main Title',
              subtitleLabel: 'Subtitle',
              showStarRatings: 'Show Star Ratings',
              starRatingsDesc: 'Display star ratings on testimonial cards'
            },
            placeholders: {
              title: 'e.g., What People Say',
              subtitle: 'e.g., Hear from past attendees'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          videoHeroBlock: {
            title: 'Video Hero Settings',
            subtitle: 'Configure the video hero section.',
            sections: {
              cinematicContent: 'Cinematic Content',
              textOverlay: 'Text Overlay',
              callToAction: 'Call to Action'
            },
            labels: {
              backgroundVideoUrl: 'Background Video URL',
              videoHint: 'Use MP4 or WebM format for best results',
              mainHeadline: 'Main Headline',
              subHeadline: 'Sub Headline',
              buttonText: 'Button Text'
            },
            placeholders: {
              videoUrl: 'https://example.com/video.mp4',
              title: 'e.g., Welcome to Our Event',
              subtitle: 'e.g., An unforgettable experience',
              buttonText: 'e.g., Register Now'
            },
            actions: {
              cancel: 'Cancel',
              updating: 'Updating...',
              updateSection: 'Update Section'
            }
          },
          speakersGrid: {
            title: 'Speakers Grid Settings',
            upgrade: {
              title: 'Speakers Grid is a Pro Feature',
              description: 'Upgrade to customize your speakers grid layout and content.',
              cta: 'Upgrade to Pro',
              learnMore: 'Learn More'
            },
            labels: {
              numberOfSpeakers: 'Number of Speakers',
              layout: 'Layout',
              speakers: 'Speakers ({count})',
              photo: 'Photo',
              upload: 'Upload',
              name: 'Name',
              speakerTitle: 'Title',
              company: 'Company',
              bio: 'Bio'
            },
            layouts: {
              twoCols: '2 Columns',
              threeCols: '3 Columns',
              fourCols: '4 Columns'
            },
            placeholders: {
              defaultSpeaker: 'Speaker {index}',
              speakerName: 'Speaker name',
              jobTitle: 'Job title',
              companyName: 'Company name',
              bio: 'Short bio...'
            },
            actions: {
              removeSpeaker: 'Remove',
              addSpeaker: '+ Add Speaker',
              restoreDefault: 'Restore Default',
              cancel: 'Cancel',
              saveChanges: 'Save Changes'
            }
          }
        }
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
          quantityLabel: 'Select Quantity / Licenses',
          licensesLabel: 'Licenses'
        },
        actions: {
          requestQuote: 'Request Quote',
          messageSeller: 'Contact Seller',
          saved: 'Saved',
          wishlist: 'Save',
          share: 'Share'
        },
        reviews: {
          count: '({count} reviews)',
          globalSatisfaction: 'Global Satisfaction',
          helpful: 'Helpful ({count})',
          starsLabel: '{count} Stars',
          empty: 'No reviews yet.'
        },
        seller: {
          about: 'About the Seller',
          verified: 'Verified Seller',
          managedBy: 'Managed By',
          response: 'Response',
          memberSince: 'Member Since',
          memberSinceInline: 'Member since {value}',
          responseInline: 'Responds in {value}',
          viewProfile: 'View Professional Profile',
          fallbackName: 'Seller',
          deals: '({count} deals)'
        },
        features: {
          title: 'Key Features'
        },
        longDescription: {
          overviewTitle: 'Overview',
          whatYouGetTitle: 'What You Get',
          whyItMattersTitle: 'Why It Matters',
          overviewFallback: 'A curated offering designed for event professionals.',
          whyItMattersBody: 'Aligned with the needs of organizers who want reliable, scalable event outcomes.',
          fallbackList: [
            'Tailored solutions for event teams',
            'Flexible delivery options',
            'Dedicated support'
          ]
        },
        errors: {
          loginRequired: 'Please log in to contact the seller.',
          noOwner: 'Seller information is unavailable.',
          contactSelf: 'You cannot contact your own listing.'
        },
        notifications: {
          quoteTitle: 'Quote request',
          quoteBody: 'Quote request for {product}.'
        },
        toasts: {
          linkCopied: 'Product link copied.',
          quoteSent: 'Quote request sent.',
          quoteFailed: 'Failed to request a quote.',
          copyFailed: 'Failed to copy product link.'
        }
      },
    event: {
      visibility: 'Event Visibility',
      public: 'Public',
      private: 'Private',
      publicDescription: 'Anyone can find and register',
      privateDescription: 'Requires access code to register',
      accessCode: 'Access Code',
      enterAccessCode: 'Enter Access Code',
      invalidAccessCode: 'Invalid access code',
      copyCode: 'Copy Code',
      codeCopied: 'Code copied!',
      regenerateCode: 'Regenerate',
      accessCodeModalTitle: 'Private Event',
      submitCode: 'Submit',
      switchToPublic: 'Switch to Public',
      switchToPrivate: 'Switch to Private',
      accessCodeMinLength: 'Access code must be at least 4 characters',
    },
  };
