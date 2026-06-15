import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { AuthInput } from '../../components/AuthInput';
import { OTPInput } from '../../components/OTPInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { OAuthButton } from '../../components/OAuthButton';
import { DividerWithLabel } from '../../components/DividerWithLabel';
import { colors, spacing, typography } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);
}

function clerkErrorMessage(code: string): string {
  const map: Record<string, string> = {
    form_identifier_exists: 'An account with this email already exists.',
    form_code_incorrect: 'Invalid code. Please check and try again.',
    verification_expired: 'Code expired. Request a new one.',
    network_error: 'Connection error. Check your internet and try again.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

export default function SignUpScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGitHub } = useOAuth({ strategy: 'oauth_github' });

  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  // Resend countdown
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const passwordRef = useRef<TextInput>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startResendCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setResendDisabled(true);
    setResendCountdown(30);
    intervalRef.current = setInterval(() => {
      setResendCountdown((n) => {
        if (n <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setResendDisabled(false);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  };

  const handleRegister = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp!.create({ emailAddress: email, password });
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('otp');
      startResendCountdown();
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code: string }> };
      const code = clerkErr?.errors?.[0]?.code ?? '';
      setError(clerkErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code: otp });
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        router.replace('/(app)/(tabs)');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code: string }> };
      const code = clerkErr?.errors?.[0]?.code ?? '';
      setError(clerkErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || resendDisabled) return;
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: 'email_code' });
      setOtp('');
      setError('');
      startResendCountdown();
    } catch {
      setError('Failed to resend code. Please try again.');
    }
  };

  const handleOAuth = async (
    provider: 'google' | 'github',
    start: typeof startGoogle
  ) => {
    const setProviderLoading =
      provider === 'google' ? setGoogleLoading : setGithubLoading;
    setProviderLoading(true);
    try {
      const redirectUrl = makeRedirectUri({ scheme: 'quicknotes' });
      const { createdSessionId, setActive: oauthSetActive } = await start({
        redirectUrl,
      });
      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId });
        router.replace('/(app)/(tabs)');
      } else if (!createdSessionId) {
        setError(`${provider === 'google' ? 'Google' : 'GitHub'} sign-in was cancelled or failed.`);
      }
    } catch {
      setError(`${provider === 'google' ? 'Google' : 'GitHub'} sign-in failed. Please try again.`);
    } finally {
      setProviderLoading(false);
    }
  };

  const anyLoading = loading || googleLoading || githubLoading;

  if (step === 'otp') {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => {
              setStep('register');
              setOtp('');
              setError('');
            }}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.heading}>Check your email</Text>
          <Text style={styles.subheading}>
            We sent a 6-digit code to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.form}>
            <OTPInput value={otp} onChange={setOtp} error={error} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton
              label="Verify Email"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length < 6 || anyLoading}
            />

            <View style={styles.resendRow}>
              <Text style={styles.footerText}>Didn't receive it? </Text>
              {resendDisabled ? (
                <Text style={styles.countdown}>Resend in {resendCountdown}s</Text>
              ) : (
                <Pressable
                  onPress={handleResend}
                  accessibilityRole="link"
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Text style={styles.link}>Resend code</Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.subheading}>Start capturing ideas in seconds.</Text>

        <View style={styles.form}>
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            autoComplete="email"
            editable={!anyLoading}
          />
          <AuthInput
            ref={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            autoComplete="new-password"
            editable={!anyLoading}
          />
          <Text style={styles.helperText}>At least 8 characters</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={anyLoading}
          />

          <DividerWithLabel />

          <View style={styles.oauthRow}>
            <OAuthButton
              provider="google"
              onPress={() => handleOAuth('google', startGoogle)}
              loading={googleLoading}
              disabled={anyLoading}
            />
            <OAuthButton
              provider="github"
              onPress={() => handleOAuth('github', startGitHub)}
              loading={githubLoading}
              disabled={anyLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/sign-in')}
              accessibilityRole="link"
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text style={styles.link}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  heading: {
    ...typography.headline,
    color: colors.text,
    marginTop: spacing.lg,
  },
  subheading: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emailHighlight: {
    color: colors.text,
  },
  form: {
    marginTop: spacing.xl,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.body,
    color: colors.primary,
  },
  countdown: {
    ...typography.caption,
    color: colors.textMuted,
    alignSelf: 'center',
  },
});
