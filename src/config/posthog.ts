import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

function missingConfiguration(variableName: string): never | void {
  if (__DEV__) {
    throw new Error(
      `${variableName} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variableName} is configured`,
    );
  }
}

if (!projectToken) {
  missingConfiguration("EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN");
}

if (!host) {
  missingConfiguration("EXPO_PUBLIC_POSTHOG_HOST");
}

export const posthog =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        captureAppLifecycleEvents: true,
        errorTracking: {
          autocapture: true,
        },
      })
    : undefined;
