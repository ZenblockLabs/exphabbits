import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const PIN_USER_KEY = 'habex-pin-user';

interface PinLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface PinFunctionSuccess {
  success: true;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

interface PinFunctionFailure {
  success: false;
  code?: string;
  error: string;
  attempts_left?: number;
  locked?: boolean;
  locked_until?: string;
}

type PinFunctionResponse = PinFunctionSuccess | PinFunctionFailure;

const parseInvokeErrorPayload = (message?: string): PinFunctionFailure | null => {
  if (!message) return null;

  const jsonMatch = message.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed && typeof parsed === 'object' && typeof parsed.error === 'string') {
      return {
        success: false,
        code: parsed.code,
        error: parsed.error,
        attempts_left: parsed.attempts_left,
        locked: parsed.locked,
        locked_until: parsed.locked_until,
      };
    }
  } catch {
    return null;
  }

  return null;
};

export const PinLogin: React.FC<PinLoginProps> = ({ onBack, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');

  const storedUser = React.useMemo(() => {
    try {
      const data = localStorage.getItem(PIN_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  React.useEffect(() => {
    if (!lockUntil) return;

    const update = () => {
      const diff = lockUntil.getTime() - Date.now();
      if (diff <= 0) {
        setIsLocked(false);
        setLockUntil(null);
        setCountdown('');
        setError('');
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const applyFailureState = (failure: PinFunctionFailure) => {
    if (failure.locked && failure.locked_until) {
      setIsLocked(true);
      setLockUntil(new Date(failure.locked_until));
    }

    setError(failure.error || 'Invalid PIN. Please try again.');
    setPin('');
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 6 || !storedUser?.id || isLocked) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke<PinFunctionResponse>('pin-login', {
        body: { user_id: storedUser.id, pin },
      });

      if (invokeError) {
        const parsed = parseInvokeErrorPayload(invokeError.message);
        if (parsed) {
          applyFailureState(parsed);
        } else {
          setError('Unable to verify PIN right now. Please try again.');
          setPin('');
        }
        return;
      }

      if (!data) {
        setError('Unable to verify PIN right now. Please try again.');
        setPin('');
        return;
      }

      if ('success' in data && data.success === false) {
        applyFailureState(data as PinFunctionFailure);
        return;
      }

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      toast.success('Welcome back!');
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (pin.length === 6 && !isLocked) {
      handlePinSubmit();
    }
  }, [pin]);

  if (!storedUser) return null;

  const maskedEmail = storedUser.email
    ? storedUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your account';

  return (
    <Card className="w-full max-w-md border-border/50 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          {isLocked ? <Lock className="w-7 h-7 text-destructive" /> : <Shield className="w-7 h-7 text-primary" />}
        </div>
        <CardTitle className="text-xl">{isLocked ? 'Account Locked' : 'Quick PIN Login'}</CardTitle>
        <CardDescription>
          {isLocked
            ? `Too many failed attempts. Try again in ${countdown}`
            : (
              <>
                Enter your 6-digit PIN for <span className="font-medium text-foreground">{maskedEmail}</span>
              </>
            )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(value) => {
              setPin(value);
              setError('');
            }}
            disabled={isLoading || isLocked}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying PIN...
          </div>
        )}

        {error && !isLocked && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="w-full" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Use email & password instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
