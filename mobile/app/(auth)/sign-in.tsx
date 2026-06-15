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
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { AuthInput } from '../../components/AuthInput';
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
    form_identifier_not_found: 'No account found with this email.',
    form_password_incorrect: 'Incorrect password. Please try again.',
    form_identifier_exists: 'An account with this email already exists.',
    form_code_incorrect: 'Invalid code. Please check and try again.',
    verification_expired: 'Code expired. Request a new one.',
    network_error: 'Connection error. Check your internet and try again.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

export default function SignInScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogle } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startGitHub } = useOAuth({ strategy: 'oauth_github' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await signIn!.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        router.replace('/(app)/(tabs)');
      } else if (result.status === 'needs_first_factor') {
        setError('Please check your email for a verification link.');
      } else if (result.status === 'needs_client_trust') {
        setError('A verification email has been sent to confirm this device. Please check your inbox.');
      } else {
        setError('Sign-in could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ code: string }> };
      const code = clerkErr?.errors?.[0]?.code ?? '';
      setError(clerkErrorMessage(code));
    } finally {
      setLoading(false);
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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to QuickNotes</Text>

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
            onSubmitEditing={handleSignIn}
            autoComplete="password"
            editable={!anyLoading}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            label="Sign In"
            onPress={handleSignIn}
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
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/sign-up')}
              accessibilityRole="link"
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text style={styles.link}>Sign up</Text>
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
  form: {
    marginTop: spacing.xl,
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
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.body,
    color: colors.primary,
  },
});
