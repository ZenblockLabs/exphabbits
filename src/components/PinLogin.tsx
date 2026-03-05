import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PIN_USER_KEY = 'habex-pin-user';
const MAX_ATTEMPTS = 5;

interface PinLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface PinFunctionSuccess {
  success: true;
  session: { access_token: string; refresh_token: string };
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
      return { success: false, code: parsed.code, error: parsed.error, attempts_left: parsed.attempts_left, locked: parsed.locked, locked_until: parsed.locked_until };
    }
  } catch { /* ignore */ }
  return null;
};

type ViewState = 'pin' | 'forgot-auth' | 'forgot-new-pin' | 'forgot-confirm-pin' | 'forgot-success';

export const PinLogin: React.FC<PinLoginProps> = ({ onBack, onSuccess }) => {
  // PIN login state
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');

  // Forgot PIN state
  const [view, setView] = useState<ViewState>('pin');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const storedUser = React.useMemo(() => {
    try {
      const data = localStorage.getItem(PIN_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }, []);

  // Countdown timer
  React.useEffect(() => {
    if (!lockUntil) return;
    const update = () => {
      const diff = lockUntil.getTime() - Date.now();
      if (diff <= 0) {
        setIsLocked(false);
        setLockUntil(null);
        setCountdown('');
        setError('');
        setAttemptsLeft(MAX_ATTEMPTS);
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
      setAttemptsLeft(0);
    } else if (typeof failure.attempts_left === 'number') {
      setAttemptsLeft(failure.attempts_left);
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
        if (parsed) { applyFailureState(parsed); } else { setError('Unable to verify PIN right now.'); setPin(''); }
        return;
      }
      if (!data) { setError('Unable to verify PIN right now.'); setPin(''); return; }
      if ('success' in data && data.success === false) { applyFailureState(data as PinFunctionFailure); return; }

      await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      toast.success('Welcome back!');
      onSuccess();
    } catch { setError('Something went wrong.'); setPin(''); }
    finally { setIsLoading(false); }
  };

  React.useEffect(() => { if (pin.length === 6 && !isLocked) handlePinSubmit(); }, [pin]);

  // Forgot PIN: authenticate with email/password
  const handleForgotAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !forgotPassword) { setForgotError('Please enter both email and password.'); return; }
    setIsForgotLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: forgotEmail, password: forgotPassword });
      if (error) { setForgotError('Invalid email or password. Please try again.'); return; }
      setView('forgot-new-pin');
    } catch { setForgotError('Something went wrong.'); }
    finally { setIsForgotLoading(false); }
  };

  // Forgot PIN: set new PIN
  const handleSetNewPin = async () => {
    if (newPin.length !== 6) return;
    if (view === 'forgot-new-pin') { setView('forgot-confirm-pin'); return; }

    if (newPin !== confirmPin) {
      toast.error('PINs do not match. Please try again.');
      setNewPin(''); setConfirmPin(''); setView('forgot-new-pin');
      return;
    }

    setIsForgotLoading(true);
    try {
      const { error } = await supabase.rpc('set_pin', { p_pin: newPin });
      if (error) throw error;

      // Get current user to update localStorage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(PIN_USER_KEY, JSON.stringify({ id: user.id, email: user.email }));
      }

      setView('forgot-success');
      toast.success('New PIN set successfully!');
    } catch { toast.error('Failed to set new PIN.'); }
    finally { setIsForgotLoading(false); }
  };

  const resetForgotFlow = () => {
    setView('pin');
    setForgotEmail('');
    setForgotPassword('');
    setForgotError('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setPin('');
    setAttemptsLeft(null);
  };

  if (!storedUser) return null;

  const maskedEmail = storedUser.email
    ? storedUser.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your account';

  // Forgot PIN: email/password re-auth
  if (view === 'forgot-auth') {
    return (
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Reset Your PIN</CardTitle>
          <CardDescription>
            Verify your identity by signing in with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-password">Password</Label>
              <Input
                id="forgot-password"
                type="password"
                placeholder="••••••••"
                value={forgotPassword}
                onChange={(e) => { setForgotPassword(e.target.value); setForgotError(''); }}
              />
            </div>
            {forgotError && <p className="text-sm text-destructive text-center">{forgotError}</p>}
            <Button type="submit" className="w-full" disabled={isForgotLoading}>
              {isForgotLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : 'Verify & Continue'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={resetForgotFlow}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to PIN login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Forgot PIN: enter new PIN / confirm
  if (view === 'forgot-new-pin' || view === 'forgot-confirm-pin') {
    const isConfirming = view === 'forgot-confirm-pin';
    return (
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">{isConfirming ? 'Confirm New PIN' : 'Set New PIN'}</CardTitle>
          <CardDescription>
            {isConfirming ? 'Re-enter your new 6-digit PIN to confirm' : 'Enter a new 6-digit PIN for quick login'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={isConfirming ? confirmPin : newPin}
              onChange={(v) => isConfirming ? setConfirmPin(v) : setNewPin(v)}
              disabled={isForgotLoading}
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
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={resetForgotFlow}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleSetNewPin}
              disabled={isForgotLoading || (isConfirming ? confirmPin.length !== 6 : newPin.length !== 6)}
            >
              {isForgotLoading ? 'Saving...' : isConfirming ? 'Set PIN' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Forgot PIN: success
  if (view === 'forgot-success') {
    return (
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">PIN Updated!</CardTitle>
          <CardDescription>Your new PIN is ready. Use it to log in now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={resetForgotFlow}>
            Log in with new PIN
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main PIN login view
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
            : <>Enter your 6-digit PIN for <span className="font-medium text-foreground">{maskedEmail}</span></>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(value) => { setPin(value); setError(''); }}
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

          {/* Remaining attempts indicator */}
          {attemptsLeft !== null && attemptsLeft > 0 && attemptsLeft < MAX_ATTEMPTS && !isLocked && (
            <p className="text-xs text-muted-foreground mt-1">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
            </p>
          )}
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
          <Button
            variant="link"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setView('forgot-auth')}
          >
            <KeyRound className="w-3 h-3 mr-1" />
            Forgot your PIN?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
