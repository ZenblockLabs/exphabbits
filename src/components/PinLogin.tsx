import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PIN_USER_KEY = 'habex-pin-user';

interface PinLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const PinLogin: React.FC<PinLoginProps> = ({ onBack, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const storedUser = React.useMemo(() => {
    try {
      const data = localStorage.getItem(PIN_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const handlePinSubmit = async () => {
    if (pin.length !== 6 || !storedUser?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('pin-login', {
        body: { user_id: storedUser.id, pin },
      });

      if (fnError || data?.error) {
        setError(data?.error || 'Invalid PIN. Please try again.');
        setPin('');
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        toast.success('Welcome back!');
        onSuccess();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when 6 digits entered
  React.useEffect(() => {
    if (pin.length === 6) {
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
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-xl">Quick PIN Login</CardTitle>
        <CardDescription>
          Enter your 6-digit PIN for <span className="font-medium text-foreground">{maskedEmail}</span>
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
            disabled={isLoading}
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

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Use email & password instead
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
