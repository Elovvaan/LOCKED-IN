import { ExpoConfig, ConfigContext } from 'expo/config';

const getEnv = (name: string, fallback?: string) => {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${name}`);
};

const required = {
  apiUrl: getEnv('EXPO_PUBLIC_API_URL', 'https://locked-in-production.up.railway.app'),
  // EAS-only vars — optional during web/GitHub Pages builds
  owner: getEnv('EXPO_OWNER', ''),
  projectId: getEnv('EAS_PROJECT_ID', ''),
  iosBundleIdentifier: getEnv('IOS_BUNDLE_IDENTIFIER', 'com.lockedin.app'),
  androidPackage: getEnv('ANDROID_PACKAGE', 'com.lockedin.app'),
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LOCKED-IN',
  slug: 'locked-in',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  owner: required.owner,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: required.iosBundleIdentifier,
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'LOCKED-IN uses your camera to record skill videos.',
      NSMicrophoneUsageDescription: 'LOCKED-IN uses your microphone to record skill videos.',
      NSPhotoLibraryUsageDescription: 'LOCKED-IN accesses your photo library to upload skill videos.',
    },
  },
  android: {
    package: required.androidPackage,
    versionCode: 1,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_MEDIA_VIDEO',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'static',
  },
  extra: {
    apiUrl: required.apiUrl,
    eas: {
      projectId: required.projectId,
    },
  },
});
