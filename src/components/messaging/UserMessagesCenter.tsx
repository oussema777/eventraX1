import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Search,
  Edit,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  X,
  User,
  List
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { useI18n } from '../../i18n/I18nContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isSent: boolean; // true if current user sent it
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userTitle?: string;
  avatar?: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isActive?: boolean;
}

const THREADS_TABLE = 'message_threads';
const PARTICIPANTS_TABLE = 'message_thread_participants';
const MESSAGES_TABLE = 'message_messages';

export default function UserMessagesCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chats' | 'suggestions'>('chats');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageSearch, setNewMessageSearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessageResults, setNewMessageResults] = useState<Array<{ id: string; name: string; title?: string }>>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Array<{ id: string; name: string; title?: string }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const conversationPollRef = useRef<number | null>(null);
  const requestedThreadId = (location.state as any)?.threadId as string | undefined;

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const fetchConversations = async () => {
    if (!user?.id) return;
    try {
      setIsLoadingConversations(true);
      const { data: participantRows, error: participantsError } = await supabase
        .from(PARTICIPANTS_TABLE)
        .select('thread_id,last_read_at')
        .eq('profile_id', user.id);

      if (participantsError) throw participantsError;
      const threadIds = (participantRows || []).map((row: any) => row.thread_id);
      if (threadIds.length === 0) {
        setConversations([]);
        setActiveConversationId(null);
        return;
      }

      const lastReadMap = new Map<string, string | null>();
      (participantRows || []).forEach((row: any) => {
        lastReadMap.set(row.thread_id, row.last_read_at || null);
      });

      const { data: otherParticipants } = await supabase
        .from(PARTICIPANTS_TABLE)
        .select('thread_id,profile_id')
        .in('thread_id', threadIds)
        .neq('profile_id', user.id);

      const otherProfileIds = Array.from(
        new Set((otherParticipants || []).map((row: any) => row.profile_id).filter(Boolean))
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, job_title, department, company')
        .in('id', otherProfileIds);

      const profileMap = new Map(
        (profiles || []).map((profile: any) => [
          profile.id,
          {
            name: profile.full_name || profile.email || t('messages.defaults.user'),
            avatar: profile.avatar_url || undefined,
            title: profile.job_title || profile.department || profile.company || undefined
          }
        ])
      );

      const { data: recentMessages } = await supabase
        .from(MESSAGES_TABLE)
        .select('id, thread_id, body, created_at, sender_id')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false })
        .limit(200);

      const lastMessageMap = new Map<string, any>();
      const unreadCountMap = new Map<string, number>();

      (recentMessages || []).forEach((msg: any) => {
        if (!lastMessageMap.has(msg.thread_id)) {
          lastMessageMap.set(msg.thread_id, msg);
        }
        const lastReadAt = lastReadMap.get(msg.thread_id);
        const isUnread =
          msg.sender_id !== user.id &&
          (!lastReadAt || new Date(msg.created_at) > new Date(lastReadAt));
        if (isUnread) {
          unreadCountMap.set(msg.thread_id, (unreadCountMap.get(msg.thread_id) || 0) + 1);
        }
      });

      const mapped = threadIds.map((threadId) => {
        const other = (otherParticipants || []).find((row: any) => row.thread_id === threadId);
        const profile = other ? profileMap.get(other.profile_id) : undefined;
        const lastMessage = lastMessageMap.get(threadId);
        const lastMessageTime = lastMessage
          ? new Date(lastMessage.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : '';
        return {
          id: threadId,
          userId: other?.profile_id || '',
          userName: profile?.name || t('messages.defaults.unknownUser'),
          userTitle: profile?.title,
          avatar: profile?.avatar,
          isOnline: false,
          lastMessage: lastMessage?.body || t('messages.empty.lastMessage'),
          lastMessageTime,
          unreadCount: unreadCountMap.get(threadId) || 0,
          isActive: threadId === activeConversationId
        } as Conversation;
      });

      mapped.sort((a, b) => (a.lastMessageTime < b.lastMessageTime ? 1 : -1));
      setConversations(mapped);
      if (!activeConversationId && mapped.length > 0) {
        setActiveConversationId(mapped[0].id);
      }
    } catch (error: any) {
      toast.error(error.message || t('messages.errors.loadConversations'));
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    if (!user?.id) return;
    setIsLoadingMessages(true);
    try {
      const { data: participants } = await supabase
        .from(PARTICIPANTS_TABLE)
        .select('profile_id,last_read_at')
        .eq('thread_id', threadId);
      const other = (participants || []).find((row: any) => row.profile_id !== user.id);
      const otherReadAt = other?.last_read_at ? new Date(other.last_read_at) : null;

      const { data, error } = await supabase
        .from(MESSAGES_TABLE)
        .select('id, sender_id, body, created_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        senderId: row.sender_id,
        text: row.body,
        timestamp: new Date(row.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isRead: row.sender_id === user.id && otherReadAt ? new Date(row.created_at) <= otherReadAt : false,
        isSent: row.sender_id === user.id
      }));
      setMessages(mapped);
      await markThreadRead(threadId);
    } catch (error: any) {
      toast.error(error.message || t('messages.errors.loadMessages'));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markThreadRead = async (threadId: string) => {
    if (!user?.id) return;
    const now = new Date().toISOString();
    await supabase
      .from(PARTICIPANTS_TABLE)
      .update({ last_read_at: now })
      .eq('thread_id', threadId)
      .eq('profile_id', user.id);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === threadId ? { ...conv, unreadCount: 0 } : conv))
    );
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId || !user?.id) return;
    const content = messageInput.trim();
    setMessageInput('');
    const { data, error } = await supabase
      .from(MESSAGES_TABLE)
      .insert([{ thread_id: activeConversationId, sender_id: user.id, body: content }])
      .select('id, sender_id, body, created_at')
      .single();
    if (error) {
      toast.error(t('messages.errors.sendMessage'));
      return;
    }
    const newMessage: Message = {
      id: data.id,
      senderId: data.sender_id,
      text: data.body,
      timestamp: new Date(data.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isRead: false,
      isSent: true
    };
    setMessages((prev) => [...prev, newMessage]);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? { ...conv, lastMessage: data.body, lastMessageTime: newMessage.timestamp }
          : conv
      )
    );
    await supabase.from(THREADS_TABLE).update({ updated_at: new Date().toISOString() }).eq('id', activeConversationId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleViewProfile = () => {
    navigate('/my-profile');
  };

  const filteredConversations = useMemo(
    () => conversations.filter(c => c.userName.toLowerCase().includes(searchQuery.toLowerCase())),
    [conversations, searchQuery]
  );

  const openOrCreateThread = async (profileId: string, name: string, title?: string) => {
    if (!user?.id) return;
    const { data: myThreads } = await supabase
      .from(PARTICIPANTS_TABLE)
      .select('thread_id')
      .eq('profile_id', user.id);
    const threadIds = (myThreads || []).map((row: any) => row.thread_id);
    let targetThreadId = '';
    if (threadIds.length > 0) {
      const { data: shared } = await supabase
        .from(PARTICIPANTS_TABLE)
        .select('thread_id')
        .eq('profile_id', profileId)
        .in('thread_id', threadIds)
        .limit(1);
      if (shared && shared.length > 0) {
        targetThreadId = shared[0].thread_id;
      }
    }

    if (!targetThreadId) {
      const { data: newThread, error } = await supabase
        .from(THREADS_TABLE)
        .insert([{ created_by: user.id }])
        .select('id')
        .single();
      if (error) {
        toast.error(t('messages.errors.createConversation'));
        return;
      }
      targetThreadId = newThread.id;
      await supabase.from(PARTICIPANTS_TABLE).insert([
        { thread_id: targetThreadId, profile_id: user.id },
        { thread_id: targetThreadId, profile_id: profileId }
      ]);
    }

    setActiveConversationId(targetThreadId);
    setIsSidebarOpen(false);
    setShowNewMessageModal(false);
    setNewMessageSearch('');
    setConversations((prev) => {
      if (prev.some((c) => c.id === targetThreadId)) return prev;
      return [
        {
          id: targetThreadId,
          userId: profileId,
          userName: name,
          userTitle: title,
          isOnline: false,
          lastMessage: t('messages.empty.startConversation'),
          lastMessageTime: '',
          unreadCount: 0
        },
        ...prev
      ];
    });
    await fetchMessages(targetThreadId);
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id, t]);

  useEffect(() => {
    if (!activeConversationId) {
      setIsSidebarOpen(true);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (!requestedThreadId) return;
    if (conversations.some((conv) => conv.id === requestedThreadId)) {
      setActiveConversationId(requestedThreadId);
    }
  }, [requestedThreadId, conversations]);

  useEffect(() => {
    if (!user?.id) return;
    if (conversationPollRef.current) {
      window.clearInterval(conversationPollRef.current);
    }
    conversationPollRef.current = window.setInterval(fetchConversations, 10000);
    return () => {
      if (conversationPollRef.current) {
        window.clearInterval(conversationPollRef.current);
      }
    };
  }, [user?.id, t]);

  useEffect(() => {
    if (!activeConversationId) return;
    fetchMessages(activeConversationId);
    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: MESSAGES_TABLE, filter: `thread_id=eq.${activeConversationId}` },
        (payload) => {
          const data: any = payload.new;
          const incoming: Message = {
            id: data.id,
            senderId: data.sender_id,
            text: data.body,
            timestamp: new Date(data.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            isRead: false,
            isSent: data.sender_id === user?.id
          };
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          if (data.sender_id !== user?.id) {
            markThreadRead(activeConversationId);
          }
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === activeConversationId
                ? { ...conv, lastMessage: data.body, lastMessageTime: incoming.timestamp }
                : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user?.id]);

  useEffect(() => {
    if (!showNewMessageModal) {
      setNewMessageSearch('');
      setNewMessageResults([]);
      return;
    }
    if (!newMessageSearch.trim()) {
      setNewMessageResults([]);
      return;
    }
    const timeout = window.setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, job_title, department, company')
        .ilike('full_name', `%${newMessageSearch.trim()}%`)
        .limit(6);
      const results =
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.full_name || row.email || t('messages.defaults.user'),
          title: row.job_title || row.department || row.company || ''
        })) || [];
      setNewMessageResults(results.filter((row) => row.id !== user?.id));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [newMessageSearch, showNewMessageModal, user?.id]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user?.id) return;
      setIsLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, job_title, department, company')
          .neq('id', user.id)
          .order('full_name', { ascending: true })
          .limit(8);
        if (error) throw error;
        const mapped =
          (data || []).map((row: any) => ({
            id: row.id,
            name: row.full_name || row.email || t('messages.defaults.user'),
            title: row.job_title || row.department || row.company || ''
          })) || [];
        setSuggestedUsers(mapped);
      } catch (error: any) {
        toast.error(error.message || t('messages.errors.loadSuggestions'));
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [user?.id, t]);

  return (
    <div 
      className={`messages-center flex ${isSidebarOpen ? 'messages-center--sidebar-open' : ''}`}
      style={{ 
        backgroundColor: '#0B2641', 
        height: 'calc(100vh - 72px)',
        maxWidth: '1440px',
        margin: '0 auto'
      }}
    >
      {/* LEFT COLUMN - Conversation List */}
      <div 
        className="messages-center__sidebar flex flex-col"
        style={{ 
          width: '350px',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          height: '100%'
        }}
      >
        {/* Header & Search */}
        <div 
          style={{ 
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
              {t('messages.title')}
            </h1>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <Edit size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex items-center gap-2 rounded-lg p-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={() => setActiveSidebarTab('chats')}
              className="flex-1 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                backgroundColor: activeSidebarTab === 'chats' ? 'rgba(6, 132, 245, 0.25)' : 'transparent',
                color: activeSidebarTab === 'chats' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 600
              }}
            >
              {t('messages.tabs.chats')}
            </button>
            <button
              onClick={() => setActiveSidebarTab('suggestions')}
              className="flex-1 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                backgroundColor: activeSidebarTab === 'suggestions' ? 'rgba(6, 132, 245, 0.25)' : 'transparent',
                color: activeSidebarTab === 'suggestions' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 600
              }}
            >
              {t('messages.tabs.suggestions')}
            </button>
          </div>

          {/* Search */}
          {activeSidebarTab === 'chats' && (
            <div className="relative mt-4">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#94A3B8' }}
              />
              <input
                type="text"
                placeholder={t('messages.search.conversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 rounded-lg outline-none"
                style={{
                  height: '40px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontSize: '14px'
                }}
              />
            </div>
          )}
        </div>

        {/* Thread List */}
        <div 
          className="messages-center__thread-list flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}
        >
          {activeSidebarTab === 'chats' ? (
            <>
              {isLoadingConversations && (
                <div className="p-6 text-center" style={{ color: '#94A3B8' }}>
                  {t('messages.loading.conversations')}
                </div>
              )}
              {!isLoadingConversations && filteredConversations.length === 0 && (
                <div className="p-6 text-center" style={{ color: '#94A3B8' }}>
                  {t('messages.empty.conversations')}
                </div>
              )}
              {!isLoadingConversations && filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setActiveConversationId(conversation.id);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-start gap-3 p-4 transition-colors text-left"
                  style={{
                    backgroundColor: conversation.id === activeConversationId 
                      ? 'rgba(6, 132, 245, 0.1)' 
                      : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (conversation.id !== activeConversationId) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (conversation.id !== activeConversationId) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '2px solid #0684F5'
                      }}
                    >
                      <User size={24} style={{ color: '#0684F5' }} />
                    </div>
                    {conversation.isOnline && (
                      <div
                        className="absolute bottom-0 right-0 rounded-full"
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#10B981',
                          border: '2px solid #0B2641'
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 
                        style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: conversation.unreadCount > 0 ? '#FFFFFF' : '#94A3B8',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {conversation.userName}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#6B7280', flexShrink: 0, marginLeft: '8px' }}>
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p 
                        style={{ 
                          fontSize: '13px', 
                          color: conversation.unreadCount > 0 ? '#FFFFFF' : '#94A3B8',
                          fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {conversation.lastMessage}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{
                            minWidth: '20px',
                            height: '20px',
                            backgroundColor: '#0684F5',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '0 6px',
                            marginLeft: '8px'
                          }}
                        >
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="p-4 space-y-3">
              {isLoadingSuggestions && (
                <div className="py-8 text-center" style={{ color: '#94A3B8' }}>
                  {t('messages.loading.suggestions')}
                </div>
              )}
              {!isLoadingSuggestions && suggestedUsers.length === 0 && (
                <div className="py-8 text-center" style={{ color: '#94A3B8' }}>
                  {t('messages.empty.suggestions')}
                </div>
              )}
              {!isLoadingSuggestions && suggestedUsers.map((person) => (
                <button
                  key={person.id}
                  onClick={() => openOrCreateThread(person.id, person.name, person.title)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(6, 132, 245, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(6, 132, 245, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: 'rgba(6, 132, 245, 0.2)',
                      border: '2px solid rgba(6, 132, 245, 0.6)'
                    }}
                  >
                    <User size={20} style={{ color: '#68B5FF' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                        marginBottom: '2px'
                      }}
                    >
                      {person.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>{person.title}</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: 'rgba(6, 132, 245, 0.18)',
                      color: '#A5D6FF',
                      fontWeight: 600
                    }}
                  >
                    {t('messages.actions.start')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - Active Conversation */}
      {activeConversation ? (
        <div className="messages-center__content flex-1 flex flex-col" style={{ height: '100%' }}>
          <div className="messages-center__mobile-header">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="messages-center__mobile-toggle p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <List size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'rgba(6, 132, 245, 0.2)',
                  border: '2px solid #0684F5'
                }}
              >
                <User size={18} style={{ color: '#0684F5' }} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  {activeConversation.userName}
                </div>
                {activeConversation.userTitle && (
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {activeConversation.userTitle}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Chat Header */}
          <div 
            className="messages-center__chat-header flex items-center justify-between px-6"
            style={{ 
              height: '72px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Recipient Info */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="messages-center__mobile-toggle p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                <List size={18} />
              </button>
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(6, 132, 245, 0.2)',
                  border: '2px solid #0684F5'
                }}
              >
                <User size={20} style={{ color: '#0684F5' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                  {activeConversation.userName}
                </h2>
                {activeConversation.userTitle && (
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {activeConversation.userTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewProfile}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: '#94A3B8',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                {t('messages.actions.viewProfile')}
              </button>
              <button
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: '#94A3B8'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                }}
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div 
            className="messages-center__stream flex-1 overflow-y-auto px-6 py-6"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255,255,255,0.2) transparent'
            }}
          >
            {/* Date Divider */}
            <div className="flex items-center justify-center mb-6">
              <span 
                className="px-3 py-1 rounded-full"
                style={{ 
                  fontSize: '12px', 
                  color: '#6B7280',
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
              >
                {t('messages.dateDivider', { date: 'Dec 17' })}
              </span>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {isLoadingMessages && (
                <div className="text-center" style={{ color: '#94A3B8' }}>
                  {t('messages.loading.messages')}
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex gap-2"
                  style={{
                    flexDirection: message.isSent ? 'row-reverse' : 'row',
                    alignItems: 'flex-end'
                  }}
                >
                  {/* Avatar for received messages */}
                  {!message.isSent && (
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgba(6, 132, 245, 0.2)',
                        border: '2px solid #0684F5'
                      }}
                    >
                      <User size={16} style={{ color: '#0684F5' }} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div style={{ maxWidth: '70%' }}>
                    <div
                      className="px-4 py-3"
                      style={{
                        backgroundColor: message.isSent ? '#0684F5' : 'rgba(255,255,255,0.1)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        borderRadius: '12px',
                        borderTopLeftRadius: message.isSent ? '12px' : '4px',
                        borderTopRightRadius: message.isSent ? '4px' : '12px'
                      }}
                    >
                      {message.text}
                    </div>
                    
                    {/* Timestamp & Read Receipt */}
                    <div 
                      className="flex items-center gap-1 mt-1 px-1"
                      style={{ 
                        fontSize: '10px', 
                        color: '#6B7280',
                        justifyContent: message.isSent ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span>{message.timestamp}</span>
                      {message.isSent && (
                        message.isRead ? (
                          <CheckCheck size={14} style={{ color: '#0684F5' }} />
                        ) : (
                          <Check size={14} style={{ color: '#6B7280' }} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Composer */}
          <div 
            className="messages-center__composer px-6 py-5"
            style={{ 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: '#0B2641'
            }}
          >
            <div 
              className="flex items-center gap-3 px-4 py-2"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '24px'
              }}
            >
              {/* Attachment Icon */}
              <button
                className="transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
              >
                <Paperclip size={20} />
              </button>

              {/* Text Input */}
                <input
                  type="text"
                  placeholder={t('messages.composer.placeholder')}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none"
                  style={{
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                />

              {/* Emoji Icon */}
              <button
                className="transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
              >
                <Smile size={20} />
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: messageInput.trim() ? '#0684F5' : 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  cursor: messageInput.trim() ? 'pointer' : 'not-allowed'
                }}
                onMouseEnter={(e) => {
                  if (messageInput.trim()) {
                    e.currentTarget.style.backgroundColor = '#0570D6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (messageInput.trim()) {
                    e.currentTarget.style.backgroundColor = '#0684F5';
                  }
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="messages-center__empty flex-1 flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="messages-center__mobile-toggle p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              <List size={18} />
            </button>
            <Edit size={64} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '16px', color: '#94A3B8' }}>
              {t('messages.empty.selectConversation')}
            </p>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowNewMessageModal(false)}
        >
          <div
            className="messages-center__modal relative rounded-xl"
            style={{
              width: '500px',
              backgroundColor: '#1E3A5F',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0px 10px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                {t('messages.newMessage.title')}
              </h3>
              <button 
                onClick={() => setShowNewMessageModal(false)}
                className="transition-colors"
                style={{ color: '#94A3B8' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
              >
                <X size={22} />
              </button>
            </div>

            {/* Search Field */}
            <div className="px-6 py-4">
              <div className="relative">
                <Search 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#94A3B8' }}
                />
                <input
                  type="text"
                  placeholder={t('messages.newMessage.searchPlaceholder')}
                  value={newMessageSearch}
                  onChange={(e) => setNewMessageSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none"
                  style={{
                    backgroundColor: '#0B2641',
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0684F5'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
              </div>
            </div>

            {/* Results List */}
            <div 
              className="px-6 pb-6"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              {newMessageSearch.trim() ? (
                <div className="space-y-2">
                  {newMessageResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        openOrCreateThread(user.id, user.name, user.title);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div
                        className="rounded-full flex items-center justify-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: 'rgba(6, 132, 245, 0.2)',
                          border: '2px solid #0684F5'
                        }}
                      >
                        <User size={20} style={{ color: '#0684F5' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                          {user.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                          {user.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search size={48} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>
                    {t('messages.newMessage.startTyping')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .messages-center__mobile-toggle {
          display: none;
        }
        .messages-center__mobile-header {
          display: none;
        }
        @media (max-width: 600px) {
          .messages-center {
            flex-direction: column;
            height: auto;
          }
          .messages-center__mobile-toggle {
            display: inline-flex;
          }
          .messages-center__mobile-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .messages-center__sidebar {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            border-right: none;
            border-bottom: none;
            background-color: #0B2641;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            z-index: 20;
          }
          .messages-center--sidebar-open .messages-center__sidebar {
            transform: translateX(0);
          }
          .messages-center__thread-list {
            max-height: none;
            height: 100%;
          }
          .messages-center__content {
            min-height: 100vh;
          }
          .messages-center--sidebar-open .messages-center__content {
            display: none;
          }
          .messages-center__chat-header {
            height: auto;
            padding: 16px;
            flex-wrap: wrap;
            gap: 12px;
          }
          .messages-center__stream {
            padding: 16px;
          }
          .messages-center__composer {
            padding: 12px 16px;
          }
          .messages-center__empty {
            padding: 24px 16px;
          }
          .messages-center__modal {
            width: 92vw;
          }
        }
        @media (max-width: 400px) {
          .messages-center__thread-list {
            max-height: none;
          }
          .messages-center__stream {
            padding: 12px;
          }
          .messages-center__composer {
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}
