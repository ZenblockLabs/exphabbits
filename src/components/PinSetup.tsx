import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { KeyRound, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const PIN_USER_KEY = 'habex-pin-user';

export const PinSetup: React.FC = () => {
  const { user } = useAuth();
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'idle' | 'enter' | 'confirm'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkExistingPin();
  }, [user]);

  const checkExistingPin = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_pins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    setHasPin(!!data);
  };

  const handleSetPin = async () => {
    if (pin.length !== 6) return;

    if (step === 'enter') {
      setStep('confirm');
      return;
    }

    if (pin !== confirmPin) {
      toast.error('PINs do not match. Please try again.');
      resetState();
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('set_pin', { p_pin: pin });
      if (error) throw error;

      // Store user ID locally for PIN login
      localStorage.setItem(PIN_USER_KEY, JSON.stringify({
        id: user!.id,
        email: user!.email,
      }));

      setHasPin(true);
      toast.success('PIN set successfully! You can now use it for quick login.');
      resetState();
    } catch {
      toast.error('Failed to set PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_pins')
        .delete()
        .eq('user_id', user!.id);
      if (error) throw error;

      localStorage.removeItem(PIN_USER_KEY);
      setHasPin(false);
      setDialogOpen(false);
      toast.success('PIN removed successfully');
    } catch {
      toast.error('Failed to remove PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setPin('');
    setConfirmPin('');
    setStep('idle');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          Quick PIN Login
        </CardTitle>
        <CardDescription>
          Set a 6-digit PIN for faster login without email and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPin && step === 'idle' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">PIN is active</p>
                <p className="text-xs text-muted-foreground">
                  You can use your PIN for quick login on this device
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('enter')}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Change PIN
              </Button>
              <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove PIN
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove PIN?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll need to use email and password to log in after removing your PIN.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleRemovePin} disabled={isLoading}>
                      {isLoading ? 'Removing...' : 'Remove PIN'}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : step === 'idle' ? (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium text-sm">No PIN set</p>
              <p className="text-xs text-muted-foreground">
                Set up a PIN for quick login
              </p>
            </div>
            <Button size="sm" onClick={() => setStep('enter')}>
              <KeyRound className="w-4 h-4 mr-2" />
              Set PIN
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-medium">
              {step === 'enter' ? 'Enter a 6-digit PIN' : 'Confirm your PIN'}
            </p>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={step === 'enter' ? pin : confirmPin}
                onChange={(value) => {
                  if (step === 'enter') setPin(value);
                  else setConfirmPin(value);
                }}
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
              <Button variant="outline" size="sm" onClick={resetState}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSetPin}
                disabled={
                  isLoading ||
                  (step === 'enter' ? pin.length !== 6 : confirmPin.length !== 6)
                }
              >
                {isLoading ? 'Saving...' : step === 'enter' ? 'Next' : 'Confirm'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
