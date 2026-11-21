import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@/lib/router-compat';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Loader2, ArrowLeft, ArrowRight, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoCall() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const [roomUrl, setRoomUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getProviderSession();
    base44.functions.invoke('createVideoRoom', {
      booking_id: bookingId,
      credential_id: session?.credentialId,
      session_token: session?.sessionToken,
    }).then(res => {
      setRoomUrl(res.data.room_url);
    }).catch(err => {
      setError(err.response?.data?.error || (isRTL ? 'تعذر بدء مكالمة الفيديو' : 'Could not start the video call'));
    }).finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600">
          <BackArrow className="w-4 h-4" />
          {isRTL ? 'رجوع' : 'Back'}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <p className="text-sm">{isRTL ? 'جاري تجهيز مكالمة الفيديو...' : 'Setting up your video call...'}</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <VideoOff className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-500">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>{isRTL ? 'رجوع' : 'Go Back'}</Button>
          </div>
        )}

        {!loading && !error && roomUrl && (
          <iframe
            src={roomUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-[calc(100vh-64px)] border-0"
            title="Video Call"
          />
        )}
      </div>
    </div>
  );
}