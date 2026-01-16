export const translations = {
  en: {
    brand: {
      name: 'Eventra'
    },
    nav: {
      communities: {
        label: 'Communities',
        items: [
          'All Students',
          'Researchers',
          'Coaches & Trainers',
          'Experts & Consultants',
          'Employees & Professionals',
          'Entrepreneurs & Startups',
          'Developers & Engineers',
          'Marketing & Communication',
          'Audit, Accounting & Finance',
          'Investment & Banking',
          'Insurance & Microfinance',
          'Legal & Lawyers',
          'AI, IoT & Emerging Tech',
          'Audiovisual & Creative Industries',
          'Media & Journalists',
          'Universities & Academies',
          'NGOs & Civil Society',
          'Public Sector & Government'
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
            viewProfile: 'View Profile',
            contact: 'Contact',
            edit: 'Edit',
            remove: 'Remove',
            email: 'Email'
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
            thisWeek: 'This Week'
          }
        },
        toasts: {
          addTwo: 'Add at least two attendees to generate matches',
          noMatches: 'No matches found with the current criteria',
          matchesSuccess: '{count} AI matches generated successfully!',
          matchesComplete: 'AI matching complete',
          noSuggestionsExport: 'No suggestions to export',
          suggestionsExported: 'Suggestions exported',
          noMeetingsExport: 'No meetings to export',
          meetingsExported: 'Meetings exported',
          settingsSaved: 'Matchmaking settings saved',
          noPendingRemind: 'No pending suggestions to remind',
          remindersSent: 'Reminders sent',
          selectMatchFirst: 'Select a match first',
          matchNotifSent: 'Match notification sent',
          notifSent: 'Notifications sent',
          selectSuggestion: 'Select a match suggestion first'
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
            notAssigned: 'Attendee is not assigned to this meeting'
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
          conversionDesc: 'Website visits to registrations',
          registrations: '{count} registrations'
        },
        tickets: {
          title: 'Ticket Sales Breakdown',
          totalRevenue: 'Total Revenue'
        },
        sessions: {
          title: 'Session Performance',
          subtitle: 'Top and bottom performing sessions',
          top: 'Top 5 Sessions',
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
            avgDuration: '{count} minutes avg duration'
          },
          types: {
            title: 'Meeting Types'
          },
          active: {
            title: 'Most Active',
            meetings: '{count} meetings'
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
        select: 'Select...'
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
          { value: 'Financial Services & Banking', label: 'Financial Services & Banking' },
          { value: 'Healthcare & Pharmaceuticals', label: 'Healthcare & Pharmaceuticals' },
          { value: 'Manufacturing & Production', label: 'Manufacturing & Production' },
          { value: 'Retail & E-commerce', label: 'Retail & E-commerce' },
          { value: 'Consulting & Professional Services', label: 'Consulting & Professional Services' },
          { value: 'Education & Training', label: 'Education & Training' },
          { value: 'Media & Entertainment', label: 'Media & Entertainment' },
          { value: 'Transportation & Logistics', label: 'Transportation & Logistics' },
          { value: 'Energy & Utilities', label: 'Energy & Utilities' },
          { value: 'Real Estate & Construction', label: 'Real Estate & Construction' },
          { value: 'Hospitality & Tourism', label: 'Hospitality & Tourism' },
          { value: 'Telecommunications', label: 'Telecommunications' },
          { value: 'Agriculture & Food Production', label: 'Agriculture & Food Production' },
          { value: 'Automotive', label: 'Automotive' },
          { value: 'Aerospace & Defense', label: 'Aerospace & Defense' },
          { value: 'Legal Services', label: 'Legal Services' },
          { value: 'Marketing & Advertising', label: 'Marketing & Advertising' },
          { value: 'Non-Profit & NGO', label: 'Non-Profit & NGO' },
          { value: 'Government & Public Sector', label: 'Government & Public Sector' },
          { value: 'Other', label: 'Other' }
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
        step2: 'Step 2 of 4',
        step3: 'Step {current} of {total}',
        step4: 'Step 4 of 4'
      },
      step1: {
        title: 'Event Information',
        subtitle: 'Provide basic details about your event including name, date, location, and description.',
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
      design: {
        title: 'Design Your Event Page',
        subtitle: 'Customize colors, fonts, and layout',
        sections: {
          globalStyles: 'Global Styles',
          contentBlocks: 'Content Blocks',
          advanced: 'Advanced Settings'
        },
        globalStyles: {
          chooseTemplate: 'Choose Template',
          templates: {
            modern: 'Modern',
            elegant: 'Elegant',
            bold: 'Bold'
          },
          badges: {
            free: 'FREE',
            pro: 'PRO'
          },
          primaryColor: 'Primary Color',
          secondaryColor: 'Secondary Color',
          primaryHelper: 'Used for buttons and accents',
          secondaryHelper: 'Used for success states',
          eventLogo: 'Event Logo',
          logoUpload: {
            label: 'Upload your event logo',
            cta: 'Click to browse',
            recommendation: 'Recommended: SVG or PNG, transparent background, max 2MB',
            helper: 'Logo appears in header of event page'
          },
          headingFont: 'Heading Font',
          bodyFont: 'Body Font',
          cornerRadius: 'Corner Roundness'
        },
        contentBlocks: {
          dragHelper: 'Drag to reorder • Toggle blocks on/off for your event page',
          labels: {
            hero: 'Hero Cover',
            heroVideo: 'Hero Video Background',
            details: 'Event Details',
            textBlock: 'Text Block',
            textBlockAdd: 'Text Block (Additional)',
            speakers: 'Speakers Grid',
            b2b: 'B2B Networking',
            sponsors: 'Sponsors',
            exhibitors: 'Exhibitors',
            schedule: 'Schedule',
            venue: 'Venue Map',
            faq: 'FAQ',
            register: 'Register CTA'
          },
          descriptions: {
            hero: 'Main banner',
            heroVideo: 'Replace image with video',
            details: 'Date, time, location',
            textBlock: 'Free text content',
            textBlockAdd: 'Extra text content',
            speakers: 'Featured speakers',
            b2b: 'Business connections',
            sponsors: 'Partner showcase',
            exhibitors: 'Booth showcase',
            schedule: 'Agenda timeline',
            venue: 'Location',
            faq: 'Common questions',
            register: 'Call-to-action button'
          }
        },
        advanced: {
          darkMode: 'Dark Mode',
          socialShare: 'Social Share',
          countdown: 'Countdown Timer'
        }
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
            subtitle: 'Expand your speaker lineup',
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
            createSession: 'Create Session'
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
              basic: 'Basic',
              choice: 'Choice',
              advanced: 'Advanced'
            }
          }
        },
        marketingTools: {
          header: {
            title: 'Marketing Tools',
            subtitle: 'Boost your event visibility and engagement with integrated marketing campaigns',
            createCampaign: 'Create Campaign'
          },
          stats: {
            campaigns: 'Active Campaigns',
            emailsSent: 'Emails Sent',
            openRate: 'Avg. Open Rate',
            clickRate: 'Avg. Click Rate',
            conversion: 'Conversion',
            conversionDesc: '{percent}% of recipients registered',
            activeCampaigns: '{count} active',
            sentToday: '{count} sent today',
            industryAvg: 'vs {percent}% industry avg'
          },
          tabs: {
            email: 'Email Marketing',
            social: 'Social Media',
            scheduled: 'Scheduled',
            whatsapp: 'WhatsApp'
          },
          email: {
            title: 'Email Campaigns',
            new: 'New Campaign',
            templates: {
              title: 'Email Templates',
              save: 'Save as Template',
              use: 'Use Template',
              preview: 'Preview'
            },
            types: {
              invitation: {
                title: 'Event Invitation',
                desc: 'Invite your contact list to register',
                subject: 'You are invited: {eventName}'
              },
              reminder: {
                title: 'Event Reminder',
                desc: 'Remind attendees about upcoming event',
                subject: 'Reminder: {eventName} is coming up!'
              },
              confirmation: {
                title: 'Registration Confirmation',
                desc: 'Sent automatically after registration',
                subject: 'Registration Confirmed: {eventName}'
              },
              thankYou: {
                title: 'Thank You',
                desc: 'Follow up after the event',
                subject: 'Thank you for attending {eventName}'
              },
              update: {
                title: 'Event Update',
                desc: 'Share important news or changes',
                subject: 'Update regarding {eventName}'
              }
            },
            editor: {
              subject: 'Subject Line',
              preheader: 'Preheader Text',
              recipients: 'Recipients',
              content: 'Email Content',
              sendTest: 'Send Test Email',
              schedule: 'Schedule',
              send: 'Send Now'
            }
          },
          social: {
            title: 'Social Media',
            subtitle: 'Share your event across social networks',
            share: 'Share on {network}',
            copyLink: 'Copy Link',
            preview: 'Preview Post',
            platforms: {
              linkedin: {
                name: 'LinkedIn',
                desc: 'Share with professional network'
              },
              twitter: {
                name: 'Twitter / X',
                desc: 'Post updates and announcements'
              },
              facebook: {
                name: 'Facebook',
                desc: 'Reach your community'
              },
              instagram: {
                name: 'Instagram',
                desc: 'Share visual updates'
              }
            },
            generator: {
              title: 'Custom Link Generator',
              source: 'Source (e.g., newsletter)',
              medium: 'Medium (e.g., email)',
              campaign: 'Campaign Name',
              generate: 'Generate Link',
              result: 'Your Custom Link'
            }
          },
          scheduled: {
            title: 'Scheduled Campaigns',
            lockedTitle: 'Unlock Scheduling',
            features: {
              schedule: 'Schedule campaigns in advance',
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
        }
      }
    }
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
            viewProfile: 'Voir Profil',
            contact: 'Contact',
            edit: 'Editer',
            remove: 'Supprimer',
            email: 'Email'
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
            thisWeek: 'Cette Semaine'
          }
        },
        toasts: {
          addTwo: 'Ajoutez au moins 2 participants',
          noMatches: 'Aucun match trouvé',
          matchesSuccess: '{count} matchs IA générés !',
          matchesComplete: 'Jumelage IA terminé',
          noSuggestionsExport: 'Rien à exporter',
          suggestionsExported: 'Exporté',
          noMeetingsExport: 'Rien à exporter',
          meetingsExported: 'Exporté',
          settingsSaved: 'Paramètres enregistrés',
          noPendingRemind: 'Aucun rappel en attente',
          remindersSent: 'Rappels envoyés',
          selectMatchFirst: 'Sélectionnez un match',
          matchNotifSent: 'Notif match envoyée',
          notifSent: 'Notifications envoyées',
          selectSuggestion: 'Sélectionnez une suggestion'
        }
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
        select: 'Selectionner...'
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
        step2: 'Etape 2 sur 4',
        step3: 'Etape {current} sur {total}',
        step4: 'Etape 4 sur 4'
      },
      step1: {
        title: "Informations sur l'evenement",
        subtitle: "Indiquez les details de base de votre evenement : nom, date, lieu et description.",
        eventTypes: {
          conference: 'Conference',
          workshop: 'Atelier',
          webinar: 'Webinaire',
          networking: 'Reseautage',
          tradeShow: 'Salon Professionnel',
          summit: 'Sommet',
          masterclass: 'Masterclass',
          training: 'Formation',
          bootcamp: 'Bootcamp',
          hackathon: 'Hackathon',
          awardCeremony: 'Ceremonie de Remise de Prix',
          other: 'Autre'
        },
        timezones: {
          pt: 'Heure du Pacifique (PT) - UTC-8',
          mt: 'Heure des Montagnes (MT) - UTC-7',
          ct: 'Heure Centrale (CT) - UTC-6',
          et: 'Heure de l\'Est (ET) - UTC-5',
          utc: 'UTC'
        },
        format: {
          inPerson: {
            label: 'En personne',
            description: 'Les invites participent sur un lieu physique.'
          },
          virtual: {
            label: 'Virtuel',
            description: 'Organise en ligne avec acces virtuel.'
          },
          hybrid: {
            label: 'Hybride',
            description: 'Melange de participation en personne et virtuelle.'
          }
        },
        fields: {
          eventName: {
            label: "Nom de l'evenement",
            placeholder: "Entrez le nom de l'evenement",
            error: "Le nom de l'evenement est requis",
            helper: "Cela apparaitra sur votre page d'evenement."
          },
          tagline: {
            label: 'Slogan',
            placeholder: 'Courte description ou slogan'
          },
          eventType: {
            label: "Type d'evenement",
            otherPlaceholder: "Entrez le type d'evenement"
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
            placeholder: "Entrez l'adresse du lieu",
            addToMaps: 'Ajouter aux cartes'
          }
        },
        eventStatus: {
          free: {
            title: 'Evenement Gratuit',
            subtitle: 'Aucun billet ou paiement requis.'
          },
          paid: {
            title: 'Evenement Payant',
            subtitle: 'Vendre des billets et accepter des paiements.'
          },
          continuous: {
            title: 'Evenement Continu',
            subtitle: 'Pas de date de fin fixe.'
          },
          helper: 'Vous pourrez mettre a jour le statut de l\'evenement plus tard.'
        },
        capacity: {
          title: 'Capacite & Liste d\'attente',
          limitLabel: 'Limiter la frequentation',
          maxAttendees: 'Nombre maximum de participants',
          maxAttendeesPlaceholder: 'ex: 500',
          waitlistLabel: 'Activer la liste d\'attente',
          enabled: 'Active',
          disabled: 'Desactive',
          waitlistCapacity: 'Capacite de la liste d\'attente',
          waitlistPlaceholder: 'ex: 100',
          waitlistHelper: 'La liste d\'attente s\'ouvre lorsque les billets sont epuises.',
          waitlistEnabledNote: 'La liste d\'attente est activee. Les participants peuvent rejoindre une fois les billets epuises.',
          waitlistDisabledNote: 'La liste d\'attente est desactivee. Les nouvelles inscriptions s\'arretent lorsque la capacite est atteinte.'
        },
        designChoice: {
          title: 'Choisissez votre chemin de configuration',
          subtitle: 'Choisissez comment vous voulez construire votre experience evenementielle.',
          designStudio: {
            title: 'Studio de Design',
            body: 'Creez une page d\'evenement personnalisee avec des blocs et une image de marque.',
            cta: 'Ouvrir le Studio de Design',
            note: 'Ideal pour des experiences entierement marquees.'
          },
          registration: {
            title: 'Constructeur d\'Inscription',
            body: 'Configurez d\'abord les parametres d\'inscription et les billets.',
            cta: 'Commencer l\'Inscription',
            note: 'Ideal pour une configuration rapide de l\'evenement.'
          },
          helper: 'Vous pourrez changer cela plus tard.'
        },
        proTip: {
          title: 'Astuce pro :',
          body: 'Enregistrez frequemment pour garder votre progression et vos donnees synchronisees.'
        },
        nextStep: 'Continuer vers Design',
        errors: {
          nameRequired: "Le nom de l'evenement est requis"
        }
      },
      details: {
        eventTypes: {
          conference: 'Conference',
          workshop: 'Atelier',
          webinar: 'Webinaire',
          networking: 'Reseautage',
          tradeShow: 'Salon Professionnel',
          summit: 'Sommet',
          masterclass: 'Masterclass',
          training: 'Formation',
          bootcamp: 'Bootcamp',
          hackathon: 'Hackathon',
          awardCeremony: 'Ceremonie de Remise de Prix',
          other: 'Autre'
        },
        timezones: {
          pt: 'Heure du Pacifique (PT) - UTC-8',
          mt: 'Heure des Montagnes (MT) - UTC-7',
          ct: 'Heure Centrale (CT) - UTC-6',
          et: 'Heure de l\'Est (ET) - UTC-5',
          utc: 'UTC'
        },
        format: {
          inPerson: {
            label: 'En personne',
            description: 'Les invites participent sur un lieu physique.'
          },
          virtual: {
            label: 'Virtuel',
            description: 'Organise en ligne avec acces virtuel.'
          },
          hybrid: {
            label: 'Hybride',
            description: 'Melange de participation en personne et virtuelle.'
          }
        },
        fields: {
          eventName: {
            label: "Nom de l'evenement",
            placeholder: "Entrez le nom de l'evenement",
            error: "Le nom de l'evenement est requis",
            helper: "Cela apparaitra sur votre page d'evenement."
          },
          tagline: {
            label: 'Slogan',
            placeholder: 'Courte description ou slogan'
          },
          eventType: {
            label: "Type d'evenement",
            otherPlaceholder: "Entrez le type d'evenement"
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
            placeholder: "Entrez l'adresse du lieu",
            addToMaps: 'Ajouter aux cartes'
          }
        },
        eventStatus: {
          free: {
            title: 'Evenement Gratuit',
            subtitle: 'Aucun billet ou paiement requis.'
          },
          paid: {
            title: 'Evenement Payant',
            subtitle: 'Vendre des billets et accepter des paiements.'
          },
          continuous: {
            title: 'Evenement Continu',
            subtitle: 'Pas de date de fin fixe.'
          },
          helper: 'Vous pourrez mettre a jour le statut de l\'evenement plus tard.'
        },
        capacity: {
          title: 'Capacite & Liste d\'attente',
          limitLabel: 'Limiter la frequentation',
          maxAttendees: 'Nombre maximum de participants',
          maxAttendeesPlaceholder: 'ex: 500',
          waitlistLabel: 'Activer la liste d\'attente',
          enabled: 'Active',
          disabled: 'Desactive',
          waitlistCapacity: 'Capacite de la liste d\'attente',
          waitlistPlaceholder: 'ex: 100',
          waitlistHelper: 'La liste d\'attente s\'ouvre lorsque les billets sont epuises.',
          waitlistEnabledNote: 'La liste d\'attente est activee. Les participants peuvent rejoindre une fois les billets epuises.',
          waitlistDisabledNote: 'La liste d\'attente est desactivee. Les nouvelles inscriptions s\'arretent lorsque la capacite est atteinte.'
        },
        designChoice: {
          title: 'Choisissez votre chemin de configuration',
          subtitle: 'Choisissez comment vous voulez construire votre experience evenementielle.',
          designStudio: {
            title: 'Studio de Design',
            body: 'Creez une page d\'evenement personnalisee avec des blocs et une image de marque.',
            cta: 'Ouvrir le Studio de Design',
            note: 'Ideal pour des experiences entierement marquees.'
          },
          registration: {
            title: 'Constructeur d\'Inscription',
            body: 'Configurez d\'abord les parametres d\'inscription et les billets.',
            cta: 'Commencer l\'Inscription',
            note: 'Ideal pour une configuration rapide de l\'evenement.'
          },
          helper: 'Vous pourrez changer cela plus tard.'
        },
        proTip: {
          title: 'Astuce pro :',
          body: 'Enregistrez frequemment pour garder votre progression et vos donnees synchronisees.'
        },
        nextStep: 'Continuer vers Design',
        errors: {
          nameRequired: "Le nom de l'evenement est requis"
        }
      },
      design: {
        title: "Design de votre page d'evenement",
        subtitle: "Personnalisez les couleurs, polices et la mise en page",
        sections: {
          globalStyles: "Styles Globaux",
          contentBlocks: "Blocs de Contenu",
          advanced: "Parametres Avances"
        },
        globalStyles: {
          chooseTemplate: "Choisir un Modele",
          templates: {
            modern: "Moderne",
            elegant: "Elegant",
            bold: "Audacieux"
          },
          badges: {
            free: "GRATUIT",
            pro: "PRO"
          },
          primaryColor: "Couleur Principale",
          secondaryColor: "Couleur Secondaire",
          primaryHelper: "Utilise pour boutons et accents",
          secondaryHelper: "Utilise pour etats de succes",
          eventLogo: "Logo de l'evenement",
          logoUpload: {
            label: "Telechargez votre logo",
            cta: "Cliquez pour parcourir",
            recommendation: "Recommande : SVG ou PNG, fond transparent, max 2MB",
            helper: "Le logo apparait dans l'en-tete de la page"
          },
          headingFont: "Police des Titres",
          bodyFont: "Police du Corps",
          cornerRadius: "Arrondi des Angles"
        },
        contentBlocks: {
          dragHelper: "Glissez pour reorganiser • Activez/Desactivez les blocs",
          labels: {
            hero: "Couverture Hero",
            heroVideo: "Video d'Arriere-plan Hero",
            details: "Details Evenement",
            textBlock: "Bloc Texte",
            textBlockAdd: "Bloc Texte (Supplementaire)",
            speakers: "Grille Intervenants",
            b2b: "Reseautage B2B",
            sponsors: "Sponsors",
            exhibitors: "Exposants",
            schedule: "Programme",
            venue: "Carte Lieu",
            faq: "FAQ",
            register: "CTA Inscription"
          },
          descriptions: {
            hero: "Banniere principale",
            heroVideo: "Remplacer image par video",
            details: "Date, heure, lieu",
            textBlock: "Contenu texte libre",
            textBlockAdd: "Contenu texte extra",
            speakers: "Intervenants en vedette",
            b2b: "Connexions professionnelles",
            sponsors: "Vitrine partenaires",
            exhibitors: "Vitrine stands",
            schedule: "Chronologie agenda",
            venue: "Localisation",
            faq: "Questions frequentes",
            register: "Bouton d'appel a l'action"
          }
        },
        advanced: {
          darkMode: "Mode Sombre",
          socialShare: "Partage Social",
          countdown: "Compte a Rebours"
        }
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
          schedule: "Construisez l\'agenda et le planning des sessions.",
          sponsors: 'Mettez en avant les sponsors et leurs formules.',
          qrBadges: 'Generez des badges QR pour un check-in rapide.',
          customForms: 'Collectez des informations avec des formulaires flexibles.',
          marketingTools: "Faites la promotion avec les outils marketing integres."
        },
        errors: {
          saveFirst: "Enregistrez d'abord les details de l'evenement.",
          continueFirst: 'Veuillez d\'abord continuer depuis l\'etape precedente.'
        },
        loading: 'Chargement de la configuration...', 
        missingStep1: "Completez les details de l'evenement avant de continuer.",
        continueReview: 'Continuer vers la Revue',
        ticketsTab: {
          title: 'Types de Billets',
          subtitle: 'Creez et gerez les options de billetterie',
          addTicket: 'Ajouter Billet',
          loading: 'Chargement des billets...', 
          confirmDelete: 'Etes-vous sur de vouloir supprimer ce billet ?',
          toasts: {
            statusUpdated: 'Statut du billet mis a jour',
            updated: 'Billet mis a jour avec succes',
            created: 'Billet cree avec succes',
            deleted: 'Billet supprime'
          },
          pro: {
            title: 'Fonctionnalite PRO',
            subtitle: 'Passez a PRO pour creer des billets VIP',
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
            totalAvailable: 'Total Disponible',
            unlimited: 'Illimite',
            tickets: 'billets',
            saleEnds: 'Vente finit le : {date}',
            noEndDate: 'N/A',
            includes: 'Inclus : {count} elements',
            edit: 'Editer Billet'
          },
          empty: {
            title: 'Ajouter Option Billet Gratuit',
            subtitle: 'Ideal pour les evenements de reseautage ou meetups',
            cta: 'Ajouter Billet Gratuit'
          },
          settings: {
            title: 'Parametres Billetterie',
            globalLimit: {
              title: 'Limite Globale de Billets',
              subtitle: 'Limiter le nombre total de billets achetables par personne',
              toggle: 'Activer la limite globale',
              maxPerPerson: 'Maximum par personne',
              placeholder: 'ex: 10',
              exampleLabel: 'Exemple :',
              exampleBody: 'Si regle a {count}, une personne peut acheter jusqu\'a {count} billets au total.'
            }
          }
        },
        ticketsModal: {
          title: 'Creer Nouveau Type de Billet',
          subtitle: 'Configurer prix et disponibilite',
          eventType: {
            paidTitle: 'Billet Payant',
            freeTitle: 'Billet Gratuit',
            paidBody: "Cet evenement est configure comme payant. Tous les billets necessitent un paiement.",
            freeBody: "Cet evenement est configure comme gratuit. Tous les billets seront gratuits."
          },
          fields: {
            name: {
              label: 'Nom du Billet *',
              placeholder: 'ex: Admission Generale, Pass VIP'
            },
            description: {
              label: 'Description *',
              placeholder: 'Decrivez ce qui est inclus...'
            },
            vip: {
              label: 'Billet VIP',
              helper: "Les billets VIP ont des controles de quantite.",
              lockedHelper: 'Billets VIP avec avantages exclusifs (PRO)'
            },
            currency: {
              label: 'Devise *'
            },
            price: {
              label: 'Prix *',
              placeholder: '0.00'
            },
            vipQuantity: {
              label: 'Quantite Billet VIP *',
              placeholder: 'ex: 50',
              helper: 'Limiter le nombre de billets VIP disponibles',
              warningTitle: 'Attention : VIP ({quantity}) depasse capacite ({capacity})',
              warningBody: 'Ajustez les quantites ou augmentez la capacite'
            },
            salesPeriod: {
              label: 'Periode de Vente *',
              start: 'Date Debut',
              end: 'Date Fin'
            },
            earlyBird: {
              label: 'Remise Early Bird',
              discountLabel: 'Pourcentage de Remise *',
              discountPlaceholder: 'ex: 20',
              start: 'Debut Early Bird',
              end: 'Fin Early Bird',
              helper: 'La remise s\'appliquera automatiquement'
            },
            includes: {
              label: "Inclus (Optionnel)",
              placeholder: 'Ajouter elements inclus...'
            }
          },
          actions: {
            saveDraft: 'Enregistrer Brouillon',
            addTicket: 'Ajouter Billet'
          }
        },
        speakers: {
          title: 'Intervenants & Presentateurs',
          subtitle: "Gerez les intervenants de votre evenement",
          add: 'Ajouter Intervenant',
          loading: 'Chargement intervenants...', 
          confirmDelete: 'Etes-vous sur de vouloir supprimer cet intervenant ?',
          toasts: {
            updated: 'Intervenant mis a jour',
            created: 'Intervenant ajoute',
            deleted: 'Intervenant supprime',
            imported: 'Intervenants importes'
          },
          filters: {
            all: 'Tous',
            keynote: 'Keynote',
            panel: 'Panel',
            workshop: 'Atelier'
          },
          searchPlaceholder: 'Rechercher intervenants...', 
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
            title: 'Ajouter Nouvel Intervenant',
            subtitle: 'Constituez votre equipe d\'intervenants',
            cta: '+ Ajouter Intervenant'
          },
          modal: {
            titleCreate: 'Ajouter Intervenant',
            titleEdit: 'Editer Intervenant',
            subtitle: 'Ajouter informations et assigner aux sessions',
            sections: {
              basic: 'Informations de Base',
              professional: 'Informations Professionnelles',
              details: 'Details Intervenant',
              type: 'Type Intervenant *'
            },
            fields: {
              photo: {
                label: 'Photo Profil',
                uploading: 'Telechargement...', 
                cta: 'Telecharger Photo',
                helper: '400x400px, max 2MB'
              },
              name: {
                label: 'Nom Complet *',
                placeholder: 'ex: Jean Dupont'
              },
              email: {
                label: 'Adresse Email *',
                placeholder: 'intervenant@email.com',
                helper: 'Utilise pour communication, non public'
              },
              phone: {
                label: 'Telephone (Optionnel)',
                placeholder: '+33 6 12 34 56 78'
              },
              title: {
                label: 'Titre Poste *',
                placeholder: 'ex: CEO, CTO'
              },
              company: {
                label: 'Entreprise/Organisation *',
                placeholder: 'ex: Tech Innovations'
              },
              linkedin: {
                label: 'Profil LinkedIn (Optionnel)',
                placeholder: 'https://linkedin.com/in/...' 
              },
              twitter: {
                label: 'Twitter/X (Optionnel)',
                placeholder: '@username'
              },
              website: {
                label: 'Site Web (Optionnel)',
                placeholder: 'https://...' 
              },
              bio: {
                label: 'Biographie *',
                placeholder: "Parlez du parcours de l\'intervenant...",
                helper: "Sera affiche sur la page de profil"
              },
              shortBio: {
                label: 'Bio Courte (Optionnel)',
                placeholder: 'Une phrase d\'accroche...'
              },
              tags: {
                label: 'Sujets/Tags *',
                placeholder: 'Ajouter sujet et Entree',
                helper: 'Ajouter 2-5 sujets'
              }
            },
            types: {
              keynote: {
                label: 'Intervenant Keynote',
                desc: 'Intervenant principal'
              },
              panel: {
                label: 'Paneliste',
                desc: 'Participe aux discussions de panel'
              },
              workshop: {
                label: 'Animateur Atelier',
                desc: 'Dirige des ateliers pratiques'
              },
              regular: {
                label: 'Intervenant Standard',
                desc: 'Intervenant de session standard'
              }
            },
            actions: {
              saveDraft: 'Enregistrer Brouillon',
              saved: 'Enregistre',
              save: 'Enregistrer'
            }
          },
          profileModal: {
            about: 'A Propos',
            expertise: 'Expertise',
            speakingAt: 'Intervient a',
            contact: 'Contacter',
            sampleSessions: {
              keynote: {
                title: 'Keynote Ouverture : Le Futur de l\'IA',
                date: '15 Dec 2024 a 9:00',
                location: 'Grand Hall A',
                duration: '45 minutes',
                attendees: '500+ inscrits'
              },
              panel: {
                title: 'Discussion Panel : Innovation SaaS',
                date: '15 Dec 2024 a 14:00',
                location: 'Salle Conference B',
                duration: '60 minutes',
                attendees: '200+ inscrits'
              }
            },
            actions: {
              email: 'Email',
              linkedin: 'LinkedIn',
              website: 'Site Web',
              close: 'Fermer'
            }
          },
          importModal: {
            title: 'Importer Intervenants',
            subtitle: 'Telecharger un fichier CSV',
            dropzone: {
              title: 'Deposer fichier CSV ici ou cliquer',
              helper: 'Supporte: .csv, .xlsx'
            },
            template: {
              title: 'Besoin d\'un modele ?',
              subtitle: 'Utilisez notre modele pour le formatage',
              cta: 'Telecharger Modele CSV'
            },
            fields: {
              requiredLabel: 'Champs requis :',
              required: 'Nom, Email, Titre, Entreprise, Bio',
              optionalLabel: 'Champs optionnels :',
              optional: 'Tel, LinkedIn, Twitter, Site, Tags, Type, Statut'
            },
            actions: {
              import: 'Importer'
            }
          }
        },
        attendees: {
          title: 'Configuration Participants',
          subtitle: 'Configurer groupes, permissions et parametres',
          infoTitle: 'Configurer organisation participants',
          loading: 'Chargement parametres...', 
          toasts: {
            categoryDeleted: 'Categorie supprimee',
            categoryDeleteFailed: 'Echec suppression categorie',
            categoryNameRequired: 'Nom categorie requis',
            categoryUpdated: 'Categorie mise a jour',
            categoryCreated: 'Categorie creee',
            categorySaveFailed: 'Echec enregistrement categorie'
          },
          permissions: {
            title: 'Permissions Participants',
            subtitle: 'Controler acces et actions',
            selfCheckin: {
              title: 'Autoriser Self Check-in',
              subtitle: 'Via app mobile ou QR code',
              note: 'Necessite app evenement ou bornes'
            },
            profileEditing: {
              title: 'Autoriser Edition Profil',
              subtitle: 'Mise a jour infos apres inscription',
              options: {
                contact: 'Peut editer contact',
                dietary: 'Peut editer preferences alimentaires',
                requirements: 'Peut editer besoins speciaux',
                company: 'Peut editer infos entreprise'
              }
            },
            sessionRegistration: {
              title: 'Inscription Session Requise',
              subtitle: 'Necessaire pour sessions specifiques'
            },
            b2b: {
              title: 'Acces Reseautage B2B',
              subtitle: 'Acces aux fonctionnalites de jumelage',
              options: {
                all: 'Tous les participants',
                categories: 'Seulement categories specifiques',
                approval: 'Necessite approbation'
              }
            },
            download: {
              title: 'Acces Telechargement Contenu',
              subtitle: 'Telecharger materiaux sessions'
            },
            publicDirectory: {
              title: 'Annuaire Public Participants',
              subtitle: 'Afficher liste publiquement',
              upgrade: 'Passer a Pro'
            }
          },
          communication: {
            title: 'Parametres Communication',
            subtitle: 'Configurer communication avec participants',
            automatedEmails: {
              title: 'Notifications Email Automatiques',
              subtitle: 'Envoyer emails automatiques',
              triggers: {
                registration: {
                  label: 'Confirmation Inscription',
                  sub: 'Envoye immediatement apres inscription'
                },
                reminder: {
                  label: 'Rappel Evenement',
                  sub: 'Envoye 24h avant'
                },
                checkin: {
                  label: 'Confirmation Check-in',
                  sub: 'Envoye au check-in'
                },
                thankYou: {
                  label: 'Remerciement Post-Evenement',
                  sub: 'Envoye 2h apres fin'
                }
              },
              editTemplate: 'Editer Modele'
            },
            sms: {
              title: 'Notifications SMS',
              subtitle: 'Envoyer messages texte',
              upgrade: 'Passer a Pro pour activer SMS'
            },
            inApp: {
              title: 'Notifications In-App',
              subtitle: 'Notifications push via app mobile',
              options: {
                sessionStart: 'Rappels debut session',
                scheduleChanges: 'Changements planning',
                b2bReminders: 'Rappels reunions B2B',
                networking: 'Opportunites reseautage'
              }
            }
          },
          privacy: {
            title: 'Parametres Donnees & Vie Privee',
            subtitle: 'Gerer collecte donnees et confidentialite',
            additionalData: {
              title: 'Collecter Donnees Supplementaires',
              note: 'Champs separes du formulaire inscription',
              fields: {
                companyName: 'Nom Entreprise',
                jobTitle: 'Titre Poste',
                industry: 'Industrie',
                companySize: 'Taille Entreprise',
                businessGoals: 'Objectifs Business',
                linkedin: 'Profil LinkedIn',
                linkedinSub: 'Pour reseautage'
              }
            },
            retention: {
              title: 'Politique Retention Donnees',
              subtitle: 'Duree conservation donnees',
              options: {
                days30: '30 jours apres',
                days90: '90 jours apres',
                months6: '6 mois apres',
                year1: '1 an apres',
                year2: '2 ans apres',
                forever: 'Toujours'
              }
            },
            gdpr: {
              title: 'Mode Conformite RGPD',
              subtitle: 'Controles confidentialite supplementaires',
              options: {
                consent: 'Consentement explicite requis',
                deletion: 'Autoriser demande suppression',
                privacy: 'Afficher politique confidentialite'
              }
            },
            export: {
              title: 'Autoriser Export Donnees',
              subtitle: 'Participants peuvent telecharger leurs infos'
            }
          },
          categoryModal: {
            editTitle: 'Editer Categorie',
            createTitle: 'Creer Categorie',
            subtitle: 'Grouper participants',
            fields: {
              name: 'Nom Categorie*',
              namePlaceholder: 'ex: Presse, Benevoles',
              description: 'Description (Optionnel)',
              descriptionPlaceholder: 'Decrire cette categorie...',
              color: 'Couleur Categorie',
              assignment: 'Assigner selon'
            },
            assignmentOptions: {
              manual: 'Manuelle',
              ticket: 'Type de billet',
              date: 'Date inscription',
              field: 'Valeur champ personnalise'
            },
            delete: 'Supprimer',
            cancel: 'Annuler',
            save: 'Enregistrer',
            create: 'Creer'
          }
        },
        exhibitors: {
          title: 'Exposants',
          subtitle: 'Gerez les entreprises exposantes',
          add: 'Ajouter Exposant',
          loading: 'Chargement exposants...', 
          searchPlaceholder: 'Rechercher exposants...', 
          sortBy: 'Trier par : Nom Entreprise',
          export: 'Exporter Liste',
          confirmDelete: 'Etes-vous sur de vouloir supprimer cet exposant ?',
          toasts: {
            updated: 'Exposant mis a jour',
            created: 'Exposant cree',
            saveFailed: 'Echec enregistrement',
            deleted: 'Exposant supprime',
            deleteFailed: 'Echec suppression',
            formSent: 'Formulaire envoye'
          },
          status: {
            confirmed: 'Confirme',
            pending: 'En attente',
            declined: 'Refuse',
            contractSent: 'Contrat Envoye',
            pendingContract: 'Contrat En Attente'
          },
          table: {
            company: 'Entreprise',
            contact: 'Contact',
            status: 'Statut',
            actions: 'Actions'
          },
          empty: {
            title: 'Ajouter Nouvel Exposant',
            subtitle: 'Developpez votre liste d\'exposants',
            cta: 'Ajouter Exposant'
          },
          card: {
            readMore: 'Lire plus',
            edit: 'Editer Exposant'
          },
          addChoice: {
            title: 'Ajouter Nouvel Exposant',
            subtitle: 'Choisir methode d\'ajout',
            manual: {
              title: 'Ajouter Manuellement',
              subtitle: 'Remplir details vous-meme'
            },
            sendForm: {
              title: 'Envoyer Formulaire',
              subtitle: 'Envoyer formulaire par email'
            }
          },
          formPreview: {
            title: 'Envoyer Formulaire Exposant',
            subtitle: 'Previsualiser et entrer email',
            recipientLabel: 'Email Destinataire',
            recipientPlaceholder: 'exposant@entreprise.com',
            formTitle: 'Formulaire Information Exposant',
            formSubtitle: 'Veuillez remplir pour vous inscrire.',
            fields: {
              companyName: 'Nom Entreprise',
              industry: 'Industrie',
              contactEmail: 'Email Contact',
              description: 'Description'
            },
            send: 'Envoyer'
          },
          modal: {
            editTitle: 'Editer Exposant',
            addTitle: 'Ajouter Exposant',
            subtitle: 'Entrer informations entreprise',
            companySection: 'Informations Entreprise',
            contactSection: 'Informations Contact',
            statusSection: 'Statut & Notes',
            fields: {
              companyName: 'Nom Entreprise',
              companyNamePlaceholder: 'ex: TechCorp Inc.',
              industry: 'Industrie',
              industryPlaceholder: 'Selectionner...',
              description: 'Description Entreprise',
              descriptionPlaceholder: 'Breve description...',
              email: 'Adresse Email',
              emailPlaceholder: 'contact@entreprise.com',
              phone: 'Numero Telephone',
              phonePlaceholder: '+33 6 12 34 56 78',
              website: 'Site Web',
              websitePlaceholder: 'https://www.entreprise.com',
              status: 'Statut Exposant',
              notes: 'Notes Internes',
              notesPlaceholder: 'Ajouter notes...',
              notesHelper: 'Usage interne uniquement'
            },
            cancel: 'Annuler',
            save: 'Enregistrer',
            add: 'Ajouter'
          },
          profile: {
            about: 'A Propos',
            contactTitle: 'Informations Contact',
            email: 'Email',
            phone: 'Telephone',
            website: 'Site Web',
            notes: 'Notes Internes',
            delete: 'Supprimer',
            edit: 'Editer'
          }
        },
        sessions: {
          title: 'Planning Evenement',
          subtitle: 'Gerez planning, sessions et lieux',
          view: {
            timeline: 'Vue Chronologique',
            list: 'Vue Liste'
          },
          actions: {
            addSession: 'Ajouter Session',
            createSession: 'Creer Session',
            exportSchedule: 'Exporter Planning',
            addAnotherSession: 'Ajouter Autre Session'
          },
          filters: {
            allDays: 'Tous les jours',
            allTypes: 'Tous les types'
          },
          types: {
            keynote: 'Keynote',
            workshop: 'Atelier',
            panel: 'Table Ronde',
            break: 'Pause / Reseautage',
            hackathon: 'Hackathon',
            pitching: 'Session Pitch',
            training: 'Formation',
            other: 'Autre'
          },
          searchPlaceholder: 'Rechercher sessions...', 
          empty: {
            title: 'Aucune session trouvee',
            filtered: 'Ajustez les filtres.',
            unfiltered: 'Commencez par ajouter une session.'
          },
          table: {
            session: 'Session',
            dateTime: 'Date & Heure',
            venue: 'Lieu',
            attendees: 'Participants',
            actions: 'Actions',
            noSpeakers: 'Aucun intervenant'
          },
          card: {
            duration: 'Duree: {minutes} minutes',
            capacity: 'Capacite: {count}',
            noVenue: 'Pas de lieu assigne',
            tbd: 'A definir',
            speakersLabel: 'Intervenants ({count})',
            moreSpeakers: '+ {count} plus',
            edit: 'Editer Session',
            checkInTitle: 'Check-in requis',
            checkInHelper: 'Suivre presence'
          },
          status: {
            confirmed: 'Confirme',
            tentative: 'Provisoire'
          },
          confirmDelete: 'Etes-vous sur de vouloir supprimer cette session ?',
          modal: {
            requiredFields: 'Veuillez remplir les champs requis',
            titleEdit: 'Editer Session',
            titleCreate: 'Creer Nouvelle Session',
            subtitle: 'Configurer details, intervenants et logistique',
            tabs: {
              details: 'Details',
              speakers: 'Intervenants',
              advanced: 'Avance'
            },
            sessionType: 'Type Session *',
            typeDescriptions: {
              keynote: 'Presentation principale',
              workshop: 'Session pratique',
              panel: 'Discussion a plusieurs',
              break: 'Pause',
              hackathon: 'Code collaboratif',
              pitching: 'Presentations startups',
              training: 'Formation educative',
              other: 'Personnalise'
            },
            customType: 'Specifier Type *',
            customTypePlaceholder: 'ex: Session Q&A...', 
            sessionTitle: 'Titre Session *',
            sessionTitlePlaceholder: 'ex: Le Futur de l\'IA',
            description: 'Description',
            descriptionPlaceholder: 'Decrire le contenu...', 
            date: 'Date *',
            startTime: 'Heure Debut *',
            endTime: 'Heure Fin *',
            venue: 'Lieu *',
            venuePlaceholder: 'Selectionner lieu...', 
            addNewVenue: '+ Ajouter nouveau lieu',
            addNewVenueTitle: 'Ajouter Nouveau Lieu',
            newVenueName: 'Nom Lieu *',
            newVenueNamePlaceholder: 'ex: Salle Conference C',
            newVenueCapacity: 'Capacite *',
            newVenueCapacityPlaceholder: 'ex: 150',
            saveVenue: 'Enregistrer Lieu',
            cancel: 'Annuler',
            capacity: 'Capacite Maximum',
            capacityPlaceholder: 'ex: 100',
            tags: 'Tags',
            tagsPlaceholder: 'Taper tag et Entree',
            selectedSpeakers: 'Intervenants Selectionnes ({count})',
            speakerLine: '{title} • {company}',
            noSpeakersAssigned: 'Aucun intervenant assigne',
            addSpeaker: 'Ajouter Intervenant',
            addMoreSpeakers: 'Ajouter Plus d\'Intervenants',
            sessionStatus: 'Statut Session',
            showInPublic: 'Afficher dans planning public',
            enableCheckIn: 'Activer check-in session',
            postSessionSurvey: 'Sondage Post-Session',
            postSessionSurveyHelper: 'Envoyer formulaire apres session',
            postSessionSurveyNone: 'Aucun formulaire',
            postSessionSurveyOptions: {
              sessionFeedback: 'Feedback Session',
              speakerEvaluation: 'Evaluation Intervenant',
              contentRating: 'Notation Contenu',
              customOne: 'Formulaire Perso 1',
              customTwo: 'Formulaire Perso 2'
            },
            saveChanges: 'Enregistrer Modifications',
            createSession: 'Creer Session'
          },
          proModal: {
            title: 'Fonctionnalite Pro',
            subtitle: 'Disponible avec Eventra Pro. Mettez a niveau pour debloquer.',
            upgrade: 'Passer a Pro'
          },
          speakerModal: {
            title: 'Selectionner Intervenants',
            subtitle: 'Choisir intervenants a assigner',
            empty: 'Aucun intervenant trouve.',
            selectedCount: '{count} selectionne(s)',
            addSelected: 'Ajouter Selection'
          },
          export: {
            title: 'Exporter Planning',
            subtitle: 'Choisir format',
            pdf: 'Exporter PDF',
            excel: 'Exporter Excel',
            csv: 'Exporter CSV'
          }
        },
        sponsors: {
          title: 'Sponsors',
          subtitle: 'Gerez sponsors et packages',
          actions: {
            managePackages: 'Gerer Packages',
            addSponsor: 'Ajouter Sponsor',
            editSponsor: 'Editer Sponsor'
          },
          filters: {
            all: 'Tous les Sponsors'
          },
          searchPlaceholder: 'Rechercher sponsors...', 
          packages: {
            title: 'Packages Sponsoring',
            subtitle: 'Cliquer pour voir sponsors',
            sponsorCount: '{count} Sponsor(s)',
            moreBenefits: '+{count} avantages',
            filterActive: 'Affichage {count} sponsor(s) {tier}',
            clearFilter: 'Effacer Filtre',
            manageTitle: 'Gerer Packages',
            manageSubtitle: 'Editer ou ajouter packages',
            manageSubtitleFree: 'Plan gratuit : {current}/{max} packages. Passez a Pro pour illimite.',
            fields: {
              name: 'Nom Package *',
              namePlaceholder: 'ex: Platine',
              value: 'Valeur *',
              valuePlaceholder: 'ex: 25000',
              color: 'Couleur *',
              benefits: 'Avantages (separes par virgule)',
              benefitsPlaceholder: 'ex: Logo sur site, 3 slots parole'
            },
            upgradePrompt: 'Passez a Pro pour Packages Illimites',
            addPackage: 'Ajouter Nouveau Package',
            savePackages: 'Enregistrer Packages',
            upgradeTitle: 'Passer a Pro',
            upgradeSubtitle: 'Utilisateurs gratuits limites a {max} packages. Passez a Eventra Pro pour illimite.',
            upgradeNow: 'Mettre a niveau'
          },
          table: {
            sponsor: 'Sponsor',
            tier: 'Niveau',
            packageValue: 'Valeur',
            website: 'Site Web',
            status: 'Statut',
            actions: 'Actions'
          },
          status: {
            confirmed: 'Confirme',
            pending: 'En attente',
            contractSent: 'Contrat Envoye'
          },
          confirmDelete: 'Etes-vous sur de vouloir supprimer ce sponsor ?',
          addChoice: {
            title: 'Ajouter Nouveau Sponsor',
            subtitle: 'Choisir methode',
            manual: {
              title: 'Ajouter Manuellement',
              subtitle: 'Remplir details vous-meme'
            },
            sendForm: {
              title: 'Envoyer Formulaire',
              subtitle: 'Envoyer formulaire par email'
            }
          },
          form: {
            nameRequired: 'Nom requis',
            editTitle: 'Editer Sponsor',
            addTitle: 'Ajouter Sponsor',
            nameLabel: 'Nom Sponsor *',
            namePlaceholder: 'ex: TechCorp',
            tierLabel: 'Niveau',
            tierOption: '{name} - ${value}',
            contributionLabel: 'Montant Contribution ($)',
            statusLabel: 'Statut',
            websiteLabel: 'URL Site Web',
            websitePlaceholder: 'exemple.com',
            logoLabel: 'URL Logo',
            logoPlaceholder: 'https://...',
            descriptionLabel: 'Description',
            cancel: 'Annuler',
            save: 'Enregistrer Sponsor'
          },
          formPreview: {
            title: 'Envoyer Formulaire Sponsor',
            to: 'A:',
            subject: 'Sujet:',
            subjectLine: 'Invitation a completer profil sponsor',
            body: 'Veuillez completer votre profil sponsor pour [Nom Evenement]...', 
            cancel: 'Annuler',
            send: 'Envoyer Email',
            toastSent: 'Formulaire envoye'
          }
        },
        qrBadges: {
          header: {
            title: 'Design Badges Evenement',
            subtitle: 'Choisir modele et personnaliser',
            preview: 'Apercu',
            download: 'Telecharger PDF'
          },
          sections: {
            template: {
              title: 'Modele Badge',
              previewLabel: 'Apercu',
              currentBadge: 'Actuel',
              changeButton: 'Changer Modele'
            },
            info: {
              title: 'Information Badge',
              sizeLabel: 'Taille Badge',
              sizeValue: 'Standard (4" x 6")',
              orientationLabel: 'Orientation',
              orientation: {
                portrait: 'Portrait',
                landscape: 'Paysage'
              },
              paperTypeLabel: 'Type Papier',
              paperTypes: {
                glossy: 'Papier Glace',
                matte: 'Papier Mat',
                recycled: 'Papier Recycle'
              }
            },
            branding: {
              title: 'Branding',
              logoLabel: 'Logo Evenement',
              uploadCta: 'Cliquer pour telecharger',
              uploadHint: 'PNG ou JPG, max 5MB',
              replace: 'Remplacer',
              remove: 'Supprimer',
              colorLabel: 'Couleur Marque',
              logoAlt: 'Logo'
            },
            attendee: {
              title: 'Information Participant',
              fullName: 'Nom Complet',
              jobTitle: 'Titre Poste',
              company: 'Nom Entreprise',
              ticketType: 'Type Billet',
              customField: 'Champ Personnalise',
              requiredHint: 'Nom Complet est requis'
            },
            qr: {
              title: 'Parametres QR Code',
              uniqueCode: 'Code unique par participant',
              positionLabel: 'Position QR',
              positions: {
                bottomCenter: 'Bas Centre',
                bottomRight: 'Bas Droite',
                back: 'Dos du Badge'
              },
              security: {
                title: 'Inclure hachage securite',
                subtitle: 'Recommande contre fraude'
              }
            }
          },
          preview: {
            title: 'Apercu Direct',
            sampleData: 'Donnees Exemple',
            sampleDataHint: 'Montre l\'apparence avec donnees reelles',
            logoAlt: 'Logo Evenement',
            logoPlaceholder: 'Logo',
            sampleName: 'Sarah Johnson',
            sampleTitle: 'Chef Produit',
            sampleCompany: 'TechCorp Inc.',
            sampleTicket: 'Acces VIP',
            sampleEvent: 'TechCon 2025',
            sampleDate: '20-22 Decembre 2025',
            hint: 'Le badge reel inclura les infos uniques'
          },
          templates: {
            modal: {
              title: 'Choisir Modele Badge',
              subtitle: 'Selectionner un design',
              cancel: 'Annuler',
              apply: 'Appliquer'
            },
            categories: {
              all: 'Tous',
              professional: 'Professionnel',
              creative: 'Creatif',
              minimal: 'Minimal',
              bold: 'Audacieux',
              classic: 'Classique'
            },
            modern: {
              name: 'Conference Moderne',
              description: 'Design epure, grand nom',
              features: ['Logo Haut', 'QR Bas', 'Pied Couleur']
            },
            classic: {
              name: 'Business Classique',
              description: 'Style corporate traditionnel',
              features: ['Centre', 'QR Bas']
            },
            creative: {
              name: 'Creatif Audacieux',
              description: 'Design accrocheur',
              features: ['Grand Logo', 'QR Cote', 'Typo Audacieuse']
            },
            minimal: {
              name: 'Minimal Epure',
              description: 'Simple et elegant',
              features: ['Logo Haut', 'Mise en page propre']
            },
            tech: {
              name: 'Tech Summit',
              description: 'Style evenement tech',
              features: ['QR Prominent', 'Look Tech']
            },
            elegant: {
              name: 'Elegant Formel',
              description: 'Sophistique',
              features: ['Typo Elegante', 'Couleurs Subtiles']
            },
            vibrant: {
              name: 'Festival Vibrant',
              description: 'Fun et colore',
              features: ['Couleurs Vives', 'Design Ludique']
            },
            corporate: {
              name: 'Corporate Pro',
              description: 'Design professionnel',
              features: ['Emphase Logo', 'Lignes Propres']
            },
            startup: {
              name: 'Startup Pitch',
              description: 'Style moderne startup',
              features: ['Dynamique', 'Typo Moderne']
            }
          },
          printTitle: 'Badge'
        },
        customForms: {
          header: {
            title: 'Formulaires Evenement',
            subtitle: 'Creer et gerer formulaires',
            createButton: 'Creer Formulaire'
          },
          actions: {
            editForm: 'Editer Formulaire',
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
            createFailed: 'Echec creation',
            formNotReady: 'Formulaire pas pret',
            saved: 'Formulaire enregistre',
            saveFailed: 'Echec enregistrement'
          },
          fieldFallback: 'Champ sans titre',
          fieldOptions: {
            option1: 'Option 1',
            option2: 'Option 2',
            option3: 'Option 3'
          },
          fieldTypes: {
            text: {
              label: 'Texte Court',
              desc: 'Une ligne'
            },
            textarea: {
              label: 'Texte Long',
              desc: 'Plusieurs lignes'
            },
            dropdown: {
              label: 'Menu Deroulant',
              desc: 'Selection liste'
            },
            checkbox: {
              label: 'Cases a Cocher',
              desc: 'Choix multiples'
            },
            radio: {
              label: 'Choix Unique',
              desc: 'Un seul choix'
            },
            date: {
              label: 'Date',
              desc: 'Selection date'
            },
            file: {
              label: 'Fichier',
              desc: 'Telechargement'
            },
            number: {
              label: 'Nombre',
              desc: 'Entree numerique'
            },
            multichoice: {
              label: 'Choix Multiple',
              desc: 'Reponses multiples'
            },
            country: {
              label: 'Pays',
              desc: 'Selection pays'
            }
          },
          formFieldsLabel: 'Champs Formulaire',
          moreFields: '+ {count} plus',
          lastEdited: 'Edite {date}',
          created: 'Cree {date}',
          fieldsCount: '{count} champs',
          searchPlaceholder: 'Rechercher formulaires...', 
          sections: {
            defaultTitle: 'FORMULAIRES PAR DEFAUT',
            defaultSubtitle: 'Pre-configures',
            customTitle: 'FORMULAIRES PERSONNALISES',
            customCount: '{count} formulaires',
            viewAll: 'Voir Tout'
          },
          emptyState: {
            title: 'Aucun Formulaire Personnalise',
            subtitle: 'Creez des formulaires pour sondages, feedbacks, etc.',
            cta: 'Creer Formulaire'
          },
          builder: {
            backToForms: 'Retour aux Formulaires',
            previewButton: 'Apercu',
            saveButton: 'Enregistrer',
            fieldLibrary: {
              title: 'Bibliotheque Champs',
              subtitle: 'Glisser-deposer champs'
            },
            categories: {
              basic: 'Champs de Base',
              choice: 'Champs de Choix',
              advanced: 'Avance'
            },
            fieldLabels: {
              shortText: 'Texte Court',
              longText: 'Texte Long',
              email: 'Email',
              phone: 'Telephone',
              number: 'Nombre',
              date: 'Date',
              dropdown: 'Menu Deroulant',
              multipleChoice: 'Choix Multiple',
              checkboxes: 'Cases a Cocher',
              fileUpload: 'Fichier',
              websiteUrl: 'URL Site',
              address: 'Adresse',
              country: 'Pays'
            },
            quickTips: {
              title: 'Astuces Rapides',
              items: {
                drag: 'Glisser champs vers apercu',
                edit: 'Cliquer pour editer',
                reorder: 'Reorganiser par glisser'
              }
            },
            preview: {
              title: 'Apercu Formulaire',
              subtitle: 'Apparence pour les repondants',
              device: {
                desktop: 'Vue Bureau',
                tablet: 'Vue Tablette',
                mobile: 'Vue Mobile'
              }
            },
            dropZone: {
              emptyTitle: 'Commencer a Construire',
              emptySubtitle: 'Glissez des champs ici',
              label: 'Zone de depot',
              addMore: 'Glissez plus de champs'
            },
            tips: {
              editField: 'Survolez et cliquez icone editer pour personnaliser'
            },
            fieldActions: {
              editProperties: 'Editer proprietes',
              deleteField: 'Supprimer champ',
              dragToReorder: 'Reorganiser',
              editSettings: 'Editer parametres'
            },
            placeholders: {
              text: 'Entrez texte...', 
              textarea: 'Entrez reponse...', 
              email: 'email@exemple.com',
              phone: '06 12 34 56 78',
              number: '0',
              dropdown: 'Selectionner option...', 
              fileUpload: 'Cliquer ou glisser deposer',
              url: 'https://exemple.com',
              addressStreet: 'Rue',
              addressCity: 'Ville',
              addressState: 'Region'
            },
            newFieldLabel: 'Nouveau champ {type}',
            untitled: 'Formulaire Sans Titre'
          },
          formTypeLabel: 'Formulaire {type}',
          formTypes: {
            registration: 'Inscription',
            survey: 'Sondage',
            assessment: 'Evaluation',
            feedback: 'Retour',
            'data-collection': 'Collecte Donnees',
            application: 'Candidature',
            submission: 'Soumission',
            custom: 'Autre (Perso)'
          },
          defaults: {
            registration: {
              title: 'Inscription Evenement',
              description: 'Collecte details participants',
              fields: {
                email: 'Email',
                fullName: 'Nom Complet',
                phone: 'Telephone',
                company: 'Entreprise',
                jobTitle: 'Poste'
              },
              lastEdited: 'il y a 2 jours',
              info: 'Requis pour tous'
            },
            satisfaction: {
              title: 'Sondage Satisfaction',
              description: 'Mesurer satisfaction',
              fields: {
                overall: 'Satisfaction Globale',
                sessionQuality: 'Qualite Sessions',
                venueRating: 'Note Lieu',
                food: 'Nourriture',
                networking: 'Valeur Reseautage'
              },
              info: 'Modele - a personnaliser'
            },
            assessment: {
              title: 'Evaluation Pre/Post',
              description: 'Evaluer connaissances',
              fields: {
                preCheck: 'Check Connaissances Pre-Event',
                skillLevel: 'Niveau Actuel',
                objectives: 'Objectifs Apprentissage',
                postQuiz: 'Quiz Post-Session',
                skillImprovement: 'Amelioration Competences'
              }
            }
          },
          custom: {
            speakerFeedback: {
              title: 'Feedback Intervenant',
              description: 'Retours pour intervenants',
              fields: {
                speakerName: 'Nom Intervenant',
                sessionTitle: 'Titre Session',
                contentQuality: 'Qualite Contenu',
                presentation: 'Style Presentation',
                comments: 'Commentaires'
              },
              info: 'Apres chaque session',
              created: 'Cree il y a 3 jours'
            },
            dietary: {
              title: 'Preferences Alimentaires',
              description: 'Repas et allergies',
              fields: {
                meal: 'Preference Repas',
                allergies: 'Allergies',
                requests: 'Demandes Speciales',
                type: 'Type Regime'
              },
              info: 'Pour traiteur',
              created: 'Cree il y a 1 semaine'
            },
            workshopSubmission: {
              title: 'Soumission Atelier',
              description: 'Propositions ateliers',
              fields: {
                workshopTitle: 'Titre Atelier',
                presenterName: 'Nom Presentateur',
                slides: 'Slides',
                supportingDocs: 'Docs Support'
              },
              info: 'Revue interne',
              created: 'Cree il y a 2 semaines'
            },
            volunteer: {
              title: 'Inscription Benevole',
              description: 'Recrutement benevoles',
              fields: {
                fullName: 'Nom Complet',
                contact: 'Infos Contact',
                roles: 'Roles Preferes',
                skills: 'Competences',
                availability: 'Disponibilite'
              },
              created: 'Cree il y a 5 jours'
            }
          },
          templates: {
            abstract: {
              title: 'Soumission Resumes',
              description: 'Collecter resumes et propositions'
            },
            assessment: {
              title: 'Evaluation',
              description: 'Mesurer connaissances'
            },
            dietary: {
              title: 'Preferences Alimentaires',
              description: 'Repas et allergies'
            },
            exit: {
              title: 'Sondage Sortie',
              description: 'Feedback fin evenement'
            },
            extendedRegistration: {
              title: 'Inscription Etendue',
              description: 'Details supplementaires'
            },
            networking: {
              title: 'Match Reseautage',
              description: 'Jumeler par interets'
            },
            satisfaction: {
              title: 'Sondage Satisfaction',
              description: 'Noter experience'
            },
            speakerFeedback: {
              title: 'Feedback Intervenant',
              description: 'Retours pour intervenants'
            },
            sponsorLead: {
              title: 'Capture Leads Sponsor',
              description: 'Interet et leads'
            },
            tags: {
              text: 'Texte',
              textArea: 'Zone Texte',
              dropdown: 'Menu Deroulant',
              checkbox: 'Case a Cocher',
              checkboxes: 'Cases a Cocher',
              fileUpload: 'Fichier',
              multipleChoice: 'Choix Multiple',
              multiSelect: 'Selection Multiple',
              contactInfo: 'Infos Contact',
              rating: 'Notation',
              yesNo: 'Oui/Non',
              tags: 'Tags',
              basic: 'Base',
              choice: 'Choix',
              advanced: 'Avance'
            }
          }
        },
        marketingTools: {
          header: {
            title: 'Outils Marketing',
            subtitle: 'Boostez la visibilite et l\'engagement avec des campagnes integrees',
            createCampaign: 'Creer Campagne'
          },
          stats: {
            campaigns: 'Campagnes Actives',
            emailsSent: 'Emails Envoyes',
            openRate: 'Taux Ouverture Moy.',
            clickRate: 'Taux Clic Moy.',
            conversion: 'Conversion',
            conversionDesc: '{percent}% inscrits',
            activeCampaigns: '{count} actives',
            sentToday: '{count} envoyes auj.',
            industryAvg: 'vs {percent}% moy. industrie'
          },
          tabs: {
            email: 'Email Marketing',
            social: 'Reseaux Sociaux',
            scheduled: 'Planifie',
            whatsapp: 'WhatsApp'
          },
          email: {
            title: 'Campagnes Email',
            new: 'Nouvelle Campagne',
            templates: {
              title: 'Modeles Email',
              save: 'Sauvegarder en Modele',
              use: 'Utiliser Modele',
              preview: 'Apercu'
            },
            types: {
              invitation: {
                title: 'Invitation Evenement',
                desc: 'Inviter contacts a s\'inscrire',
                subject: 'Vous etes invite : {eventName}'
              },
              reminder: {
                title: 'Rappel Evenement',
                desc: 'Rappeler evenement a venir',
                subject: 'Rappel : {eventName} approche !'
              },
              confirmation: {
                title: 'Confirmation Inscription',
                desc: 'Envoye apres inscription',
                subject: 'Inscription Confirmee : {eventName}'
              },
              thankYou: {
                title: 'Merci',
                desc: 'Suivi apres evenement',
                subject: 'Merci d\'avoir assiste a {eventName}'
              },
              update: {
                title: 'Mise a jour Evenement',
                desc: 'Partager nouvelles importantes',
                subject: 'Mise a jour concernant {eventName}'
              }
            },
            editor: {
              subject: 'Objet',
              preheader: 'Pre-en-tete',
              recipients: 'Destinataires',
              content: 'Contenu Email',
              sendTest: 'Envoyer Test',
              schedule: 'Planifier',
              send: 'Envoyer Maintenant'
            }
          },
          social: {
            title: 'Reseaux Sociaux',
            subtitle: 'Partager sur les reseaux',
            share: 'Partager sur {network}',
            copyLink: 'Copier Lien',
            preview: 'Apercu Post',
            platforms: {
              linkedin: {
                name: 'LinkedIn',
                desc: 'Reseau professionnel'
              },
              twitter: {
                name: 'Twitter / X',
                desc: 'Mises a jour et annonces'
              },
              facebook: {
                name: 'Facebook',
                desc: 'Atteindre communaute'
              },
              instagram: {
                name: 'Instagram',
                desc: 'Mises a jour visuelles'
              }
            },
            generator: {
              title: 'Generateur Lien Personnalise',
              source: 'Source (ex: newsletter)',
              medium: 'Support (ex: email)',
              campaign: 'Nom Campagne',
              generate: 'Generer Lien',
              result: 'Votre Lien Personnalise'
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
              label: 'Mots-cles (Optionnel)',
              placeholder: 'Ajouter mot-cle...'
            }
          }
        },
        payment: {
          title: 'Passerelle de Paiement',
          subtitle: 'Acceptez les paiements pour les billets payants',
          features: [
            'Traiter les paiements par carte',
            'Devises multiples',
            'Facturation automatisee',
            'Gestion des remboursements'
          ],
          upgrade: 'Passer a Pro',
          price: '49$/mois'
        },
        privacy: {
          title: 'Parametres de Confidentialite',
          items: [
            {
              id: 'publicEvent',
              title: 'Evenement Public',
              description: 'Tout le monde peut decouvrir'
            },
            {
              id: 'requireRegistration',
              title: 'Inscription Requise',
              description: 'Les participants doivent s\'inscrire pour voir les details'
            },
            {
              id: 'showAttendeeList',
              title: 'Afficher dans Communautes Eventra',
              description: 'Afficher votre evenement dans les listes publiques Eventra'
            },
            {
              id: 'allowSocialSharing',
              title: 'Partage Reseaux Sociaux',
              description: 'Laisser les participants partager sur les reseaux'
            }
          ]
        },
        checklist: {
          title: 'Check-list Pre-Lancement',
          subtitle: 'Assurez-vous que tout est pret',
          items: {
            details: 'Details de l\'evenement ajoutes',
            design: 'Page de l\'evenement concue',
            freeTickets: 'Billets non requis pour evenements gratuits',
            ticketRequired: 'Au moins un type de billet'
          },
          actions: {
            edit: 'Editer',
            view: 'Voir',
            addTicket: 'Ajouter Billet'
          },
          progress: '{completed} sur {total} complets'
        },
        publishConfirmation: {
          body: "Une fois publie, votre evenement sera en ligne et accessible aux participants. Vous pourrez toujours effectuer des modifications apres la publication."
        },
        errors: {
          publishFirst: "Enregistrez votre evenement avant de publier.",
          saveFirst: "Enregistrez votre evenement avant de continuer."
        },
        toasts: {
          publishedSuccess: 'Evenement publie avec succes.',
          publishFailed: 'Echec de la publication de l\'evenement.',
          draftSaved: 'Brouillon enregistre.'
        },
        summary: {
          coverAlt: 'Couverture evenement',
          noDate: 'Pas de date',
          tbd: 'A definir',
          unlimited: 'Illimite',
          maxAttendees: '{count} max participants'
        }
      },
      footer: {
        draftSavedHint: 'Brouillon enregistre il y a {minutes} minutes'
      },
      sidebar: {
        header: {
          eyebrow: 'Creation Evenement',
          title: 'Config Evenement'
        },
        stepLabel: 'Etape {number}',
        progressLabel: '{completed} sur {total} completes',
        saveDraft: 'Enregistrer',
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
          tradeShow: 'Salon Professionnel',
          summit: 'Sommet',
          masterclass: 'Masterclass',
          training: 'Formation',
          bootcamp: 'Bootcamp',
          hackathon: 'Hackathon',
          awardCeremony: 'Ceremonie de Remise de Prix',
          other: 'Autre'
        },
        timezones: {
          pt: 'Heure du Pacifique (PT) - UTC-8',
          mt: 'Heure des Montagnes (MT) - UTC-7',
          ct: 'Heure Centrale (CT) - UTC-6',
          et: 'Heure de l\'Est (ET) - UTC-5',
          utc: 'UTC'
        },
        format: {
          inPerson: {
            label: 'En personne',
            description: 'Les invites participent sur un lieu physique.'
          },
          virtual: {
            label: 'Virtuel',
            description: 'Organise en ligne avec acces virtuel.'
          },
          hybrid: {
            label: 'Hybride',
            description: 'Melange de participation en personne et virtuelle.'
          }
        },
        fields: {
          eventName: {
            label: "Nom de l'evenement",
            placeholder: "Entrez le nom de l'evenement",
            error: "Le nom de l'evenement est requis",
            helper: 'Cela apparaitra sur votre page d\'evenement.'
          },
          tagline: {
            label: 'Slogan',
            placeholder: 'Courte description ou slogan'
          },
          eventType: {
            label: "Type d'evenement",
            otherPlaceholder: "Entrez le type d'evenement"
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
            placeholder: "Entrez l'adresse du lieu",
            addToMaps: 'Ajouter aux cartes'
          }
        },
        eventStatus: {
          free: {
            title: 'Evenement Gratuit',
            subtitle: 'Aucun billet ou paiement requis.'
          },
          paid: {
            title: 'Evenement Payant',
            subtitle: 'Vendre des billets et accepter des paiements.'
          },
          continuous: {
            title: 'Evenement Continu',
            subtitle: 'Pas de date de fin fixe.'
          },
          helper: 'Vous pourrez mettre a jour le statut de l\'evenement plus tard.'
        }
      }
    }
  }
};