import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

/**
 * VSRMS brand logo — wrench + car key forming a shield/service badge.
 * Uses react-native-svg paths. Consistent across all branded screens.
 */
export function AppLogo({ size = 48, showText = true, variant = 'dark' }: AppLogoProps) {
  const iconSize = size;
  const textColor = variant === 'dark' ? '#1A1A2E' : '#FFFFFF';
  const subColor = variant === 'dark' ? '#6B7280' : 'rgba(255,255,255,0.7)';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {/* SVG Icon Mark */}
      <Svg width={iconSize} height={iconSize} viewBox="0 0 48 48">
        {/* Dark navy background rounded square */}
        <Rect x="0" y="0" width="48" height="48" rx="13" fill="#1A1A2E" />

        {/* Wrench body — diagonal handle */}
        <Path
          d="M30 8C26.5 8 24 10.5 24 14C24 15.2 24.4 16.3 25 17.2L14 28.2C13.1 27.6 12 27.2 10.8 27.2C7.5 27.2 5 29.7 5 33C5 36.3 7.5 38.8 10.8 38.8C14.1 38.8 16.6 36.3 16.6 33C16.6 31.8 16.2 30.7 15.6 29.8L26.6 18.8C27.5 19.4 28.6 19.8 29.8 19.8C33.1 19.8 35.6 17.3 35.6 14C35.6 13.3 35.5 12.7 35.3 12.1L31.8 15.6L30.2 14L29.6 12.2L31.4 11.6L34.9 8.1C33.5 7.9 32 7.8 30 8Z"
          fill="#F56E0F"
          opacity="0"
        />

        {/* Wrench icon — clean SVG paths */}
        {/* Handle */}
        <Path
          d="M11 35L21 25"
          stroke="#F56E0F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Wrench head circle */}
        <Circle cx="26" cy="20" r="7" fill="none" stroke="#FFFFFF" strokeWidth="2.8" />
        {/* Wrench mouth notch top */}
        <Path
          d="M22 16L26 20L30 16"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Handle line */}
        <Path
          d="M19 27L13 33"
          stroke="#F56E0F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Wrench bolt head — two small squares at head */}
        <Path
          d="M30 16L33 13L35 15L32 18"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bottom screwdriver end */}
        <Circle cx="12" cy="36" r="2.5" fill="#F56E0F" />

        {/* Orange accent dot top-right for brand flair */}
        <Circle cx="38" cy="10" r="3.5" fill="#F56E0F" />
      </Svg>

      {/* Text Mark */}
      {showText && (
        <View>
          <Text style={{
            fontSize: size * 0.46,
            fontWeight: '900',
            color: textColor,
            letterSpacing: -0.5,
            lineHeight: size * 0.5,
          }}>
            VSRMS
          </Text>
          <Text style={{
            fontSize: size * 0.21,
            fontWeight: '600',
            color: subColor,
            letterSpacing: 0.2,
          }}>
            Vehicle Service & Repair
          </Text>
        </View>
      )}
    </View>
  );
}

/** Icon-only logo (no text), used in tight spaces */
export function AppLogoIcon({ size = 48 }: { size?: number }) {
  return <AppLogo size={size} showText={false} />;
}
