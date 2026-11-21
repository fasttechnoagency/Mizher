import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getProviderSession } from '@/lib/useProviderSession';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Send, MessageSquare, Loader2, Stethoscope, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * mode="patient" — shows list of doctors the patient has chatted with (or can start new)
 * mode="doctor"  — shows list of patients who messaged this doctor; doctorId required
 */
export default function DirectMessages({ mode, doctorId, initialDoctorId, initialDoctorName }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeConv, setActiveConv] = useState(null); // { doctorId, patientId, convId, otherName }
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const providerSession = getProviderSession();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  // The effective doctor ID to filter by (prop takes priority over auth user id)
  const effectiveDoctorId = doctorId || null;

  // Fetch all messages for this doctor/patient
  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['direct-messages', effectiveDoctorId, user?.id, mode],
    queryFn: async () => {
      if (mode === 'doctor' && effectiveDoctorId) {
        // Use backend function (service role) for doctor console — no real auth user in provider session
        const res = await base44.functions.invoke('sendProviderMessage', { _fetch: true, doctor_id: effectiveDoctorId, credential_id: providerSession?.credentialId, session_token: providerSession?.sessionToken });
        return res.data?.messages || [];
      }
      if (mode === 'patient' && user?.id) {
        return base44.entities.Message.filter({ patient_id: user.id }, '-created_date', 200);
      }
      return [];
    },
    enabled: mode === 'doctor' ? !!effectiveDoctorId : !!user?.id,
    refetchInterval: 4000,
  });

  // Group messages by conversation_id, correctly deriving the "other party" name
  const conversations = useMemo(() => {
    const map = {};
    allMessages.forEach(m => {
      if (!map[m.conversation_id]) {
        map[m.conversation_id] = {
          convId: m.conversation_id,
          doctorId: m.doctor_id,
          patientId: m.patient_id,
          messages: [],
          lastMessage: null,
          // For doctor: we want patient name; for patient: we want doctor name
          patientName: null,
          doctorName: null,
        };
      }
      const conv = map[m.conversation_id];
      conv.messages.push(m);
      if (!conv.lastMessage || new Date(m.created_date) > new Date(conv.lastMessage.created_date)) {
        conv.lastMessage = m;
      }
      // Capture names by role regardless of message order
      if (m.sender_role === 'patient' && m.sender_name) conv.patientName = m.sender_name;
      if (m.sender_role === 'doctor'  && m.sender_name) conv.doctorName  = m.sender_name;
    });

    return Object.values(map)
      .map(conv => ({
        ...conv,
        otherName: mode === 'doctor'
          ? (conv.patientName || (isRTL ? 'مريض' : 'Patient'))
          : (conv.doctorName  || (isRTL ? 'طبيب'  : 'Doctor')),
      }))
      .sort((a, b) => new Date(b.lastMessage?.created_date || 0) - new Date(a.lastMessage?.created_date || 0));
  }, [allMessages, mode, isRTL]);

  const activeMessages = useMemo(() => {
    if (!activeConv) return [];
    return allMessages
      .filter(m => m.conversation_id === activeConv.convId)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [allMessages, activeConv]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const sendMutation = useMutation({
    mutationFn: async (content) => {
      if (!activeConv) return;
      const payload = {
        conversation_id: activeConv.convId,
        doctor_id: activeConv.doctorId,
        patient_id: activeConv.patientId,
        sender_id: user?.id || activeConv.doctorId,
        sender_name: user?.full_name || providerSession?.name || (mode === 'doctor' ? 'Doctor' : (isRTL ? 'مستخدم' : 'User')),
        sender_role: mode,
        content,
        credential_id: providerSession?.credentialId,
        session_token: providerSession?.sessionToken,
      };
      // Doctor mode always uses backend function (provider session has no user auth token)
      if (mode === 'doctor') {
        const res = await base44.functions.invoke('sendProviderMessage', payload);
        return res.data;
      }
      return base44.entities.Message.create({ ...payload, read: false });
    },
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries(['direct-messages']);
    },
  });

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendMutation.mutate(text);
  };

  // Auto-open conversation when coming from doctor profile
  useEffect(() => {
    if (!user || !initialDoctorId || activeConv) return;
    const convId = `${initialDoctorId}_${user.id}`;
    const existing = conversations.find(c => c.convId === convId);
    if (existing) {
      setActiveConv(existing);
    } else {
      setActiveConv({
        convId,
        doctorId: initialDoctorId,
        patientId: user.id,
        otherName: initialDoctorName || (isRTL ? 'الطبيب' : 'Doctor'),
      });
    }
  }, [user, initialDoctorId, conversations]);

  if (isLoading || (mode === 'patient' && !user)) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  // ── CHAT VIEW ──
  if (activeConv) {
    return (
      <div className="flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-3 border-b border-border bg-background rounded-t-xl">
          <button onClick={() => setActiveConv(null)} className="p-1.5 hover:bg-muted rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">{activeConv.otherName || (isRTL ? 'محادثة' : 'Conversation')}</p>
            <p className="text-xs text-teal-500">{isRTL ? 'متصل' : 'Online'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
          {activeMessages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground pt-8">
              {isRTL ? 'ابدأ المحادثة الآن' : 'Start the conversation'}
            </p>
          )}
          {activeMessages.map(msg => {
            // For provider-session doctors, sender_id may differ from user.id,
            // so use sender_role as the primary ownership signal in doctor mode.
            const isOwn = mode === 'doctor'
              ? msg.sender_role === 'doctor'
              : msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  isOwn
                    ? 'bg-teal-500 text-white rounded-br-sm'
                    : 'bg-card text-foreground border border-border rounded-bl-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-teal-100' : 'text-muted-foreground'}`}>
                    {msg.created_date ? new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border bg-background rounded-b-xl flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type a message...'}
            className="flex-1 h-10 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Button onClick={handleSend} disabled={!draft.trim() || sendMutation.isPending}
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 w-10 p-0">
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    );
  }

  // ── CONVERSATION LIST ──
  return (
    <div className="space-y-3">
      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {mode === 'patient'
              ? (isRTL ? 'لا توجد رسائل بعد. ابحث عن طبيب وأرسل رسالة!' : 'No messages yet. Find a doctor and send a message!')
              : (isRTL ? 'لا توجد رسائل من مرضى حتى الآن' : 'No patient messages yet')}
          </p>
        </div>
      ) : (
        conversations.map(conv => {
          const last = conv.lastMessage;
          const unread = conv.messages.filter(m => !m.read && m.sender_id !== user?.id).length;
          return (
            <button key={conv.convId} onClick={() => setActiveConv(conv)}
              className="w-full flex items-center gap-4 p-4 bg-background rounded-xl border border-border hover:border-teal-200 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">
                  {conv.otherName || (isRTL ? 'محادثة' : 'Conversation')}
                </p>
                <p className="text-xs text-muted-foreground truncate">{last?.content}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground">
                  {last?.created_date ? new Date(last.created_date).toLocaleDateString() : ''}
                </span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-teal-500 text-white px-1.5 py-0.5 rounded-full">{unread}</span>
                )}

              </div>
            </button>
          );
        })
      )}
    </div>
  );
}