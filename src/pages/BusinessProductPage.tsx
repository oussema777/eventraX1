import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Shield,
  Check,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Package,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Award,
  Heart,
  ExternalLink
} from 'lucide-react';
import NavbarLoggedIn from '../components/navigation/NavbarLoggedIn';

// Sample product data - in production this would come from a database
const PRODUCT_DATA: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Event Analytics Pro',
    type: 'SaaS Product',
    tagline: 'Complete tracking and analytics for your events with real-time insights',
    description: 'Event Analytics Pro is a comprehensive analytics solution designed for modern event organizers who demand real-time insights and actionable data. Our platform provides deep visibility into attendee behavior, engagement metrics, and revenue performance.',
    longDescription: `
      <h3>Transform Your Event Data Into Actionable Insights</h3>
      <p>Event Analytics Pro provides enterprise-grade analytics capabilities that help you understand every aspect of your event performance. From registration trends to post-event engagement, we track it all.</p>
      
      <h3>Key Capabilities</h3>
      <ul>
        <li>Real-time attendee tracking and behavior analysis</li>
        <li>Custom dashboard creation with drag-and-drop interface</li>
        <li>Advanced segmentation and cohort analysis</li>
        <li>Revenue attribution and ROI calculation</li>
        <li>Predictive analytics powered by machine learning</li>
        <li>Automated reporting and email alerts</li>
        <li>Export data in multiple formats (CSV, PDF, Excel)</li>
      </ul>
      
      <h3>Integration Ecosystem</h3>
      <p>Seamlessly connects with your existing event tech stack including Salesforce, HubSpot, Marketo, Mailchimp, and 50+ other platforms.</p>
    `,
    price: '499.00',
    currency: 'USD',
    pricingModel: 'per month',
    originalPrice: '699.00',
    discount: '29% OFF',
    rating: 4.9,
    reviewCount: 247,
    tags: ['SaaS', 'Analytics', 'Real-time', 'Dashboard', 'Enterprise'],
    images: [
      'https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmQlMjBzY3JlZW58ZW58MXx8fHwxNzY1ODcxMDYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1633522622509-eea5ecb2ecc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1576267423048-15c0040fec78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1560264401-b76ed96f3134?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    ],
    features: [
      { icon: Zap, label: 'Real-time Data Processing', description: 'Process millions of events per second' },
      { icon: Package, label: 'Pre-built Templates', description: '50+ dashboard templates included' },
      { icon: Shield, label: 'Enterprise Security', description: 'SOC 2 Type II certified' },
      { icon: Globe, label: 'Global CDN', description: 'Sub-100ms response times worldwide' },
      { icon: Users, label: 'Unlimited Users', description: 'No per-seat pricing' },
      { icon: Award, label: '24/7 Support', description: 'Dedicated success manager included' }
    ],
    specifications: [
      { label: 'Deployment', value: 'Cloud-based (SaaS)' },
      { label: 'Data Retention', value: 'Unlimited' },
      { label: 'API Access', value: 'REST & GraphQL' },
      { label: 'Integrations', value: '50+ native integrations' },
      { label: 'Support', value: '24/7 via chat, email, phone' },
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'Data Centers', value: 'Multi-region' },
      { label: 'Compliance', value: 'GDPR, SOC 2, ISO 27001' }
    ],
    seller: {
      id: 'techflow-1',
      name: 'TechFlow Solutions',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      rating: 4.9,
      reviewCount: 120,
      verified: true,
      responseTime: '< 2 hours',
      location: 'San Francisco, CA',
      memberSince: '2019',
      totalProducts: 12,
      email: 'sales@techflow.com',
      phone: '+1 (415) 555-0123'
    },
    deliveryTime: '1-2 business days',
    sampleAvailable: true,
    customizationAvailable: true,
    minimumOrder: 1,
    reviews: [
      {
        id: 'r1',
        author: 'Sarah Chen',
        company: 'Global Events Inc.',
        rating: 5,
        date: 'January 2024',
        text: 'Event Analytics Pro has completely transformed how we measure event success. The real-time dashboards are incredibly powerful and the customer support is outstanding.',
        helpful: 23
      },
      {
        id: 'r2',
        author: 'Marcus Johnson',
        company: 'TechConf Series',
        rating: 5,
        date: 'December 2023',
        text: 'Best investment we\'ve made for our event tech stack. The predictive analytics helped us increase attendance by 35% year-over-year.',
        helpful: 18
      },
      {
        id: 'r3',
        author: 'Elena Rodriguez',
        company: 'Summit Organizers',
        rating: 4,
        date: 'November 2023',
        text: 'Very comprehensive platform. Learning curve is a bit steep but once you get the hang of it, it\'s incredibly powerful. Support team was very helpful.',
        helpful: 12
      }
    ]
  },
  '2': {
    id: '2',
    name: 'On-site Consultation',
    type: 'Professional Service',
    tagline: 'Expert event planning and execution support with dedicated consultants',
    description: 'Our On-site Consultation service provides you with experienced event professionals who work directly with your team to ensure flawless event execution. From planning to post-event analysis, we\'re with you every step of the way.',
    longDescription: `
      <h3>Professional Event Consulting On Your Terms</h3>
      <p>Get access to industry-leading event professionals who bring decades of combined experience to your events. Our consultants become an extension of your team, providing strategic guidance and tactical support.</p>
      
      <h3>What\'s Included</h3>
      <ul>
        <li>Pre-event planning and strategy sessions</li>
        <li>On-site presence throughout your event</li>
        <li>Real-time problem solving and decision support</li>
        <li>Vendor coordination and management</li>
        <li>Post-event debrief and recommendations</li>
        <li>Detailed performance report and metrics analysis</li>
      </ul>
      
      <h3>Our Expertise</h3>
      <p>Our consultants have managed events ranging from 50 to 50,000 attendees across corporate conferences, trade shows, product launches, and executive summits.</p>
    `,
    price: '1,200.00',
    currency: 'USD',
    pricingModel: 'per day',
    rating: 4.8,
    reviewCount: 156,
    tags: ['Consulting', 'On-site', 'Expert Support', 'Event Management', 'Professional'],
    images: [
      'https://images.unsplash.com/photo-1765020553734-2c050ddb9494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbnN1bHRpbmclMjBtZWV0aW5nfGVufDF8fHx8MTc2NTk1MjAyMnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1560264401-b76ed96f3134?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1576267423048-15c0040fec78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    ],
    features: [
      { icon: Users, label: 'Dedicated Consultant', description: 'Assigned expert for your event' },
      { icon: Clock, label: 'Flexible Hours', description: 'Available when you need us' },
      { icon: Award, label: 'Certified Professionals', description: 'CMP certified consultants' },
      { icon: TrendingUp, label: 'Proven Track Record', description: '500+ successful events' },
      { icon: MessageSquare, label: 'Direct Communication', description: 'Direct line to your consultant' },
      { icon: FileText, label: 'Comprehensive Reporting', description: 'Detailed post-event analysis' }
    ],
    specifications: [
      { label: 'Service Type', value: 'On-site Professional Service' },
      { label: 'Duration', value: 'Full event day (8-12 hours)' },
      { label: 'Consultant Level', value: 'Senior (10+ years exp)' },
      { label: 'Event Types', value: 'Corporate, Trade Shows, Conferences' },
      { label: 'Languages', value: 'English, Spanish, French' },
      { label: 'Availability', value: 'Global (advance booking required)' },
      { label: 'Notice Period', value: 'Minimum 2 weeks' },
      { label: 'Cancellation', value: '7 days notice required' }
    ],
    seller: {
      id: 'techflow-1',
      name: 'TechFlow Solutions',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      rating: 4.9,
      reviewCount: 120,
      verified: true,
      responseTime: '< 2 hours',
      location: 'San Francisco, CA',
      memberSince: '2019',
      totalProducts: 12,
      email: 'sales@techflow.com',
      phone: '+1 (415) 555-0123'
    },
    deliveryTime: 'Schedule dependent',
    sampleAvailable: false,
    customizationAvailable: true,
    minimumOrder: 1,
    reviews: [
      {
        id: 'r1',
        author: 'David Kim',
        company: 'Enterprise Summit 2024',
        rating: 5,
        date: 'January 2024',
        text: 'The consultant assigned to our event was phenomenal. They anticipated issues before they became problems and helped us deliver our best event yet.',
        helpful: 31
      },
      {
        id: 'r2',
        author: 'Lisa Anderson',
        company: 'Tech Trade Show',
        rating: 5,
        date: 'December 2023',
        text: 'Worth every penny. Having an expert on-site gave us peace of mind and allowed our team to focus on engaging with attendees.',
        helpful: 24
      }
    ]
  },
  '3': {
    id: '3',
    name: 'Custom Integration Suite',
    type: 'SaaS Product',
    tagline: 'Seamless integration with your existing tools and workflows',
    description: 'Custom Integration Suite enables your event platform to communicate seamlessly with your entire business tech stack. Build custom workflows, automate data sync, and create unified experiences across all your tools.',
    longDescription: `
      <h3>Connect Everything, Automate Everything</h3>
      <p>Stop dealing with data silos and manual data entry. Our Integration Suite connects your event platform with CRM, marketing automation, payment processors, and hundreds of other business tools.</p>
      
      <h3>Integration Capabilities</h3>
      <ul>
        <li>Pre-built connectors for 50+ popular platforms</li>
        <li>Custom API integration builder (no-code/low-code)</li>
        <li>Real-time bi-directional data sync</li>
        <li>Automated workflow triggers and actions</li>
        <li>Data transformation and mapping tools</li>
        <li>Comprehensive API documentation</li>
      </ul>
      
      <h3>Use Cases</h3>
      <p>Sync registrations to your CRM, trigger email campaigns based on event actions, update inventory systems, process payments, and much more.</p>
    `,
    price: '299.00',
    currency: 'USD',
    pricingModel: 'per month',
    originalPrice: '399.00',
    discount: '25% OFF',
    rating: 4.7,
    reviewCount: 189,
    tags: ['SaaS', 'Integration', 'API', 'Automation', 'Workflow'],
    images: [
      'https://images.unsplash.com/photo-1764855310911-c13dd1692715?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW50ZWdyYXRpb24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY1OTg5MzgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1633522622509-eea5ecb2ecc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    ],
    features: [
      { icon: Zap, label: 'Real-time Sync', description: 'Instant data synchronization' },
      { icon: Package, label: '50+ Pre-built Connectors', description: 'Ready to use integrations' },
      { icon: Shield, label: 'Enterprise Security', description: 'OAuth 2.0 & encryption' },
      { icon: Globe, label: 'REST & GraphQL APIs', description: 'Flexible API options' },
      { icon: Users, label: 'No-code Builder', description: 'Build integrations visually' },
      { icon: Award, label: 'Developer Support', description: 'Technical support included' }
    ],
    specifications: [
      { label: 'API Type', value: 'REST & GraphQL' },
      { label: 'Authentication', value: 'OAuth 2.0, API Keys' },
      { label: 'Rate Limits', value: '10,000 requests/hour' },
      { label: 'Webhooks', value: 'Unlimited' },
      { label: 'Data Format', value: 'JSON, XML' },
      { label: 'Documentation', value: 'Full API docs + Postman collection' },
      { label: 'SDKs', value: 'JavaScript, Python, Ruby, PHP' },
      { label: 'Support', value: 'Developer forum + email' }
    ],
    seller: {
      id: 'techflow-1',
      name: 'TechFlow Solutions',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      rating: 4.9,
      reviewCount: 120,
      verified: true,
      responseTime: '< 2 hours',
      location: 'San Francisco, CA',
      memberSince: '2019',
      totalProducts: 12,
      email: 'sales@techflow.com',
      phone: '+1 (415) 555-0123'
    },
    deliveryTime: 'Instant access',
    sampleAvailable: true,
    customizationAvailable: true,
    minimumOrder: 1,
    reviews: [
      {
        id: 'r1',
        author: 'Tom Richardson',
        company: 'EventTech Co',
        rating: 5,
        date: 'January 2024',
        text: 'The no-code builder is fantastic. We integrated with Salesforce in under an hour. Game changer for our operations.',
        helpful: 19
      },
      {
        id: 'r2',
        author: 'Maria Santos',
        company: 'Global Conferences',
        rating: 4,
        date: 'December 2023',
        text: 'Solid product with great documentation. Would love to see more pre-built connectors but overall very satisfied.',
        helpful: 14
      }
    ]
  },
  '4': {
    id: '4',
    name: 'Training & Workshops',
    type: 'Professional Service',
    tagline: 'Comprehensive training programs for event management teams',
    description: 'Empower your team with the skills and knowledge they need to excel. Our training programs cover everything from event technology platforms to best practices in attendee engagement and revenue optimization.',
    longDescription: `
      <h3>Invest in Your Team\'s Success</h3>
      <p>Our training programs are designed by industry veterans and delivered by certified instructors with real-world event experience. Each workshop is customized to your team\'s needs and skill level.</p>
      
      <h3>Workshop Options</h3>
      <ul>
        <li>Event Technology Fundamentals (1 day)</li>
        <li>Advanced Analytics & Reporting (1 day)</li>
        <li>Attendee Engagement Strategies (Half day)</li>
        <li>Revenue Optimization Masterclass (1 day)</li>
        <li>Custom workshops available on request</li>
      </ul>
      
      <h3>Learning Outcomes</h3>
      <p>Participants will gain hands-on experience with real scenarios, receive certification upon completion, and have access to ongoing learning resources.</p>
    `,
    price: '800.00',
    currency: 'USD',
    pricingModel: 'per session',
    rating: 4.9,
    reviewCount: 98,
    tags: ['Training', 'Workshop', 'Education', 'Professional Development', 'Certification'],
    images: [
      'https://images.unsplash.com/photo-1761250246894-ee2314939662?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0cmFpbmluZyUyMHdvcmtzaG9wfGVufDF8fHx8MTc2NTkyODQyMnww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1560264401-b76ed96f3134?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1718220216044-006f43e3a9b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1576267423048-15c0040fec78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
    ],
    features: [
      { icon: Users, label: 'Small Group Training', description: 'Max 12 participants per session' },
      { icon: Award, label: 'Certification Included', description: 'Industry-recognized certificate' },
      { icon: Clock, label: 'Flexible Scheduling', description: 'On-site or virtual options' },
      { icon: FileText, label: 'Course Materials', description: 'Comprehensive workbooks included' },
      { icon: TrendingUp, label: 'Practical Exercises', description: 'Real-world scenarios' },
      { icon: MessageSquare, label: 'Ongoing Support', description: '30-day post-training support' }
    ],
    specifications: [
      { label: 'Service Type', value: 'Professional Training' },
      { label: 'Duration', value: '4-8 hours (configurable)' },
      { label: 'Delivery', value: 'On-site or Virtual' },
      { label: 'Group Size', value: '4-12 participants' },
      { label: 'Materials', value: 'Digital + printed workbooks' },
      { label: 'Certification', value: 'Yes (upon completion)' },
      { label: 'Languages', value: 'English, Spanish' },
      { label: 'Notice Period', value: 'Minimum 3 weeks' }
    ],
    seller: {
      id: 'techflow-1',
      name: 'TechFlow Solutions',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
      rating: 4.9,
      reviewCount: 120,
      verified: true,
      responseTime: '< 2 hours',
      location: 'San Francisco, CA',
      memberSince: '2019',
      totalProducts: 12,
      email: 'sales@techflow.com',
      phone: '+1 (415) 555-0123'
    },
    deliveryTime: 'Schedule dependent',
    sampleAvailable: false,
    customizationAvailable: true,
    minimumOrder: 1,
    reviews: [
      {
        id: 'r1',
        author: 'Jennifer Park',
        company: 'Global Events Agency',
        rating: 5,
        date: 'January 2024',
        text: 'Best training our team has ever received. The instructor was knowledgeable and the hands-on exercises were incredibly valuable.',
        helpful: 27
      },
      {
        id: 'r2',
        author: 'Robert Chen',
        company: 'Tech Conference Series',
        rating: 5,
        date: 'November 2023',
        text: 'Transformed how our team approaches event analytics. The ROI was immediate. Highly recommend!',
        helpful: 22
      }
    ]
  }
};

export default function BusinessProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  // Get product data
  const product = PRODUCT_DATA[productId || '1'];

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0B2641] flex items-center justify-center">
        <NavbarLoggedIn />
        <div className="text-center p-10">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <button
            onClick={() => navigate('/b2b-marketplace')}
            className="px-6 py-3 bg-[#00D4D4] hover:bg-[#00B8B8] text-white font-semibold rounded-lg transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#0B2641] text-white font-sans">
      <NavbarLoggedIn />
      
      {/* Breadcrumb - Polished */}
      <div className="max-w-7xl mx-auto px-6 py-8" style={{ marginTop: '72px' }}>
        <nav className="flex items-center gap-3 text-sm text-slate-400">
          <button 
            onClick={() => navigate('/b2b-marketplace')}
            className="hover:text-[#00D4D4] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            Marketplace
          </button>
          <span className="opacity-30">/</span>
          <button 
            onClick={() => navigate('/business-profile')}
            className="hover:text-[#00D4D4] transition-colors"
          >
            {product.seller.name}
          </button>
          <span className="opacity-30">/</span>
          <span className="text-slate-200 font-medium">{product.name}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT SIDE: Visuals & Core Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Image Showcase */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-[#1E293B] rounded-2xl overflow-hidden border border-white/5 group">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00D4D4] hover:border-[#00D4D4]"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[#00D4D4] hover:border-[#00D4D4]"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-[#00D4D4]/90 backdrop-blur-sm text-black text-xs font-bold rounded-lg tracking-wider uppercase">
                    {product.type}
                  </span>
                  {product.discount && (
                    <span className="px-3 py-1.5 bg-[#FF5722] text-white text-xs font-bold rounded-lg tracking-wider uppercase">
                      {product.discount}
                    </span>
                  )}
                </div>

                {product.images.length > 0 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
                    {selectedImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-24 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImageIndex === idx ? 'border-[#00D4D4] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Header Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  {product.name}
                </h1>
                <p className="text-xl text-slate-400 font-medium italic">
                  "{product.tagline}"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-[#F59E0B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} className={i >= Math.floor(product.rating) ? 'opacity-30' : ''} />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{product.rating}</span>
                  <span className="text-slate-500">({product.reviewCount} reviews)</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden md:block" />
                <div className="flex items-center gap-2 text-slate-300">
                  <Package size={18} className="text-[#00D4D4]" />
                  <span className="font-medium">SKU: EVT-{product.id}092</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden md:block" />
                <div className="flex items-center gap-2 text-[#10B981]">
                  <Shield size={18} />
                  <span className="font-semibold">Enterprise Verified</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-[#1E293B] text-slate-300 rounded-full text-xs font-semibold border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs Section */}
            <div className="space-y-8">
              <div className="flex border-b border-white/10">
                {(['description', 'specifications', 'reviews'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 text-sm font-bold tracking-wide uppercase transition-all relative ${activeTab === tab ? 'text-[#00D4D4]' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00D4D4] rounded-t-full shadow-[0_-4px_12px_rgba(0,212,212,0.4)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                {activeTab === 'description' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="prose prose-invert max-w-none prose-h3:text-2xl prose-h3:font-bold prose-h3:text-[#00D4D4] prose-p:text-slate-300 prose-li:text-slate-300 whitespace-pre-wrap">
                      <p className="text-lg leading-relaxed mb-8">{product.description}</p>
                      <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature: any, idx: number) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="p-6 bg-[#1E293B]/50 rounded-2xl border border-white/5 hover:border-[#00D4D4]/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-[#00D4D4]/10 flex items-center justify-center mb-4 text-[#00D4D4] group-hover:scale-110 transition-transform">
                              <Icon size={24} />
                            </div>
                            <h4 className="text-lg font-bold mb-2">{feature.label}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-[#1E293B]/30 rounded-xl border border-white/5">
                        <span className="text-slate-500 font-medium">{spec.label}</span>
                        <span className="text-white font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Reviews Summary Header */}
                    <div className="p-8 bg-gradient-to-br from-[#1E293B] to-[#0B2641] rounded-3xl border border-white/10 flex flex-col md:flex-row gap-10 items-center">
                      <div className="text-center md:border-r border-white/10 md:pr-10">
                        <div className="text-6xl font-black text-white mb-2">{product.rating}</div>
                        <div className="flex items-center justify-center gap-1 text-[#F59E0B] mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                        </div>
                        <div className="text-slate-400 text-sm font-medium">Global Satisfaction</div>
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const percent = stars === 5 ? 85 : stars === 4 ? 12 : 3;
                          return (
                            <div key={stars} className="flex items-center gap-4">
                              <span className="text-xs font-bold text-slate-500 w-12">{stars} Stars</span>
                              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00D4D4]" style={{ width: `${percent}%` }} />
                              </div>
                              <span className="text-xs font-bold text-slate-400 w-10 text-right">{percent}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Cards */}
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="p-6 bg-[#1E293B]/20 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#00D4D4]/20 flex items-center justify-center text-[#00D4D4] font-bold">
                              {review.author[0]}
                            </div>
                            <div>
                              <div className="font-bold">{review.author}</div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest">{review.company}</div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 font-medium">{review.date}</div>
                        </div>
                        <div className="flex text-[#F59E0B]">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'opacity-20' : ''} />)}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{review.text}</p>
                        <div className="pt-2">
                          <button className="text-xs font-bold text-[#00D4D4] hover:underline flex items-center gap-2">
                            <TrendingUp size={14} />
                            Was this review helpful? ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Pricing & Seller (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Action Card */}
            <div className="sticky top-24 p-8 bg-[#1E293B] rounded-3xl border border-white/10 shadow-2xl space-y-8">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-[#00D4D4] uppercase tracking-widest">{product.currency}</span>
                  <span className="text-5xl font-black text-white">{product.price}</span>
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-slate-500 line-through">${product.originalPrice}</span>
                    <span className="text-sm font-bold text-[#FF5722]">{product.discount}</span>
                  </div>
                )}
                <p className="text-slate-400 font-medium">{product.pricingModel}</p>
              </div>

              <div className="space-y-4">
                {product.type === 'SaaS Product' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Quantity / Licenses</label>
                    <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/5">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:text-[#00D4D4] transition-colors">-</button>
                      <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="flex-1 bg-transparent text-center font-bold text-lg outline-none"
                      />
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:text-[#00D4D4] transition-colors">+</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <button className="w-full h-14 bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_24px_rgba(255,87,34,0.3)] flex items-center justify-center gap-3">
                    <Zap size={20} />
                    Request Quote
                  </button>
                  <button className="w-full h-14 bg-[#00D4D4]/10 hover:bg-[#00D4D4]/20 border border-[#00D4D4] text-[#00D4D4] font-bold rounded-xl transition-all flex items-center justify-center gap-3">
                    <MessageSquare size={20} />
                    Message Seller
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex-1 h-12 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold text-sm ${isSaved ? 'bg-[#D5006D]/10 border-[#D5006D] text-[#D5006D]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Wishlist'}
                </button>
                <button className="flex-1 h-12 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm">
                  <Share2 size={18} />
                  Share
                </button>
              </div>

              {/* Trust Footer */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <Clock size={16} className="text-[#00D4D4]" />
                  <span>Avg. Delivery: {product.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <MapPin size={16} className="text-[#00D4D4]" />
                  <span>Ships From: {product.seller.location}</span>
                </div>
              </div>
            </div>

            {/* Seller Quick Card */}
            <div className="p-6 bg-[#1E293B]/50 rounded-3xl border border-white/5 space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Managed By</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={product.seller.logo} className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00D4D4]" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center text-white border-4 border-[#1E293B]">
                    <Check size={12} strokeWidth={4} />
                  </div>
                </div>
                <div>
                  <div className="font-black text-xl">{product.seller.name}</div>
                  <div className="flex items-center gap-2 text-[#F59E0B] text-sm">
                    <Star size={14} fill="currentColor" />
                    <span className="font-bold">{product.seller.rating}</span>
                    <span className="text-slate-500">({product.seller.reviewCount} deals)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/20 rounded-xl text-center">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">Response</div>
                  <div className="font-bold text-white tracking-tight">{product.seller.responseTime}</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl text-center">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-tighter">Experience</div>
                  <div className="font-bold text-white tracking-tight">{product.seller.memberSince}</div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/business-profile')}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 group"
              >
                View Professional Profile
                <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}