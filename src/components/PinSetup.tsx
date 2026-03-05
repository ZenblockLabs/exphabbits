import React, { useState, useEffect } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Fingerprint, Trash2, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PIN_ENABLED_KEY = 'habex-pin-enabled';

const PinSetup: React.FC = () => {
  const { user } = useAuth();
  const [hasPin, setHasPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'idle' | 'enter' | 'confirm'>('idle');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, [user]);

  const checkPinStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_pins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      setHasPin(!!data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinComplete = () => {
    if (step === 'enter' && pin.length === 6) {
      setStep('confirm');
    }
  };

  useEffect(() => {
    if (pin.length === 6 && step === 'enter') {
      setStep('confirm');
    }
  }, [pin]);

  useEffect(() => {
    if (confirmPin.length === 6 && step === 'confirm') {
      handleSavePin();
    }
  }, [confirmPin]);

  const handleSavePin = async () => {
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setConfirmPin('');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const { error: rpcError } = await supabase.rpc('set_pin', { p_pin: pin });
      if (rpcError) throw rpcError;

      localStorage.setItem(PIN_ENABLED_KEY, 'true');
      setHasPin(true);
      setStep('idle');
      setPin('');
      setConfirmPin('');
      toast.success('PIN set successfully! You can now use it to unlock the app.');
    } catch {
      setError('Failed to set PIN. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePin = async () => {
    if (!user) return;
    try {
      await supabase.from('user_pins').delete().eq('user_id', user.id);
      localStorage.removeItem(PIN_ENABLED_KEY);
      setHasPin(false);
      toast.success('PIN removed successfully');
    } catch {
      toast.error('Failed to remove PIN');
    }
  };

  const resetSetup = () => {
    setStep('idle');
    setPin('');
    setConfirmPin('');
    setError('');
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fingerprint className="w-5 h-5" />
          Quick PIN Login
        </CardTitle>
        <CardDescription>
          Set a 6-digit PIN to quickly unlock the app instead of entering your email and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'idle' && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${hasPin ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="font-medium">
                  {hasPin ? 'PIN is active' : 'No PIN set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasPin
                    ? 'Your app is protected with a PIN'
                    : 'Set a PIN for quick access'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep('enter');
                  setPin('');
                  setConfirmPin('');
                  setError('');
                }}
              >
                {hasPin ? 'Change PIN' : 'Set PIN'}
              </Button>
              {hasPin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove PIN?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You'll need to use your email and password to sign in.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemovePin}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}

        {step === 'enter' && (
          <div className="space-y-4 text-center">
            <Label className="text-sm font-medium">Enter a 6-digit PIN</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button variant="ghost" size="sm" onClick={resetSetup}>Cancel</Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 text-center">
            <Label className="text-sm font-medium">Confirm your PIN</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={confirmPin} onChange={setConfirmPin} disabled={isSaving}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {isSaving && <p className="text-sm text-muted-foreground">Saving...</p>}
            <Button variant="ghost" size="sm" onClick={resetSetup}>Cancel</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PinSetup;
export { PIN_ENABLED_KEY };
