import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useLanguage from '@/lib/useLanguage';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function Messages() {
    const { t, lang } = useLanguage();
    const [user, setUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            const me = await base44.auth.me();
            setUser(me);
            const convs1 = await base44.entities.Conversation.filter({ participant_1: me.email }, '-updated_date', 50);
            const convs2 = await base44.entities.Conversation.filter({ participant_2: me.email }, '-updated_date', 50);
            const all = [...convs1, ...convs2].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
            // Deduplicate
            const seen = new Set();
            const unique = all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
            setConversations(unique);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        if (activeConv) {
            loadMessages(activeConv.id);
        }
    }, [activeConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async (convId) => {
        const msgs = await base44.entities.Message.filter({ conversation_id: convId }, 'created_date', 100);
        setMessages(msgs);
        // Mark as read
        if (activeConv?.unread_by === user?.email) {
            await base44.entities.Conversation.update(convId, { unread_by: '' });
        }
    };

    const sendMessage = async () => {
        if (!newMsg.trim() || sending) return;
        setSending(true);
        const msg = await base44.entities.Message.create({
            conversation_id: activeConv.id,
            sender_email: user.email,
            sender_name: user.full_name,
            content: newMsg.trim(),
        });
        setMessages(prev => [...prev, msg]);

        const otherEmail = activeConv.participant_1 === user.email ? activeConv.participant_2 : activeConv.participant_1;
        await base44.entities.Conversation.update(activeConv.id, {
            last_message: newMsg.trim().substring(0, 100),
            last_message_date: new Date().toISOString(),
            unread_by: otherEmail,
        });

        setNewMsg('');
        setSending(false);
    };

    const getOtherName = (conv) => {
        return conv.participant_1 === user?.email ? conv.participant_2_name : conv.participant_1_name;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ background: '#eef4fd', minHeight: '100vh' }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-6">{t('chat_title')}</h1>

                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: '400px' }}>
                    <div className="flex h-full">
                        {/* Conversation list */}
                        <div className={`w-full sm:w-80 border-r border-border/50 flex flex-col ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
                            <div className="p-4 border-b border-border/50">
                                <h2 className="font-semibold text-foreground">{t('chat_title')}</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                        <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-muted-foreground">{t('chat_no_conversations')}</p>
                                    </div>
                                ) : conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setActiveConv(conv)}
                                        className={`w-full text-left p-4 border-b border-border/30 hover:bg-muted/50 transition-colors ${activeConv?.id === conv.id ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-foreground text-sm truncate">{getOtherName(conv)}</span>
                                            {conv.unread_by === user?.email && (
                                                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                            )}
                                        </div>
                                        {conv.job_title && (
                                            <p className="text-xs text-primary mt-0.5 truncate">{conv.job_title}</p>
                                        )}
                                        {conv.last_message && (
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{conv.last_message}</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat area */}
                        <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden sm:flex' : 'flex'}`}>
                            {activeConv ? (
                                <>
                                    <div className="p-4 border-b border-border/50 flex items-center gap-3">
                                        <button
                                            className="sm:hidden"
                                            onClick={() => setActiveConv(null)}
                                        >
                                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{getOtherName(activeConv)}</p>
                                            {activeConv.job_title && (
                                                <p className="text-xs text-muted-foreground">{activeConv.job_title}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {messages.map((msg) => {
                                            const isMine = msg.sender_email === user?.email;
                                            return (
                                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine
                                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                                            : 'bg-muted text-foreground rounded-bl-md'
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                                            {moment(msg.created_date).format('HH:mm')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-4 border-t border-border/50">
                                        <div className="flex gap-2">
                                            <Input
                                                className="rounded-xl"
                                                placeholder={t('chat_placeholder')}
                                                value={newMsg}
                                                onChange={(e) => setNewMsg(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                            />
                                            <Button
                                                onClick={sendMessage}
                                                disabled={!newMsg.trim() || sending}
                                                size="icon"
                                                className="rounded-xl flex-shrink-0"
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                                        <p className="text-muted-foreground text-sm">{t('chat_start')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}