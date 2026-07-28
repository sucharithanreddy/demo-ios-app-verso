// ============================================================================
// ErrorBoundary - catch render crashes so the app doesn't white-screen
// ============================================================================

import { Component, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#FAFAF7', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E4E4E7', width: '100%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0A0A0B', marginBottom: 8 }}>
              Something went wrong
            </Text>
            <Text style={{ fontSize: 14, color: '#71717A', marginBottom: 16, lineHeight: 20 }}>
              The app hit an unexpected error. You can try again - your data is safe.
            </Text>
            {this.state.error && (
              <ScrollView style={{ maxHeight: 120, marginBottom: 16 }} showsVerticalScrollIndicator>
                <Text style={{ fontSize: 12, color: '#A1A1AA', fontFamily: 'monospace' }}>
                  {this.state.error.message}
                </Text>
              </ScrollView>
            )}
            <Pressable
              onPress={this.handleReset}
              style={{ backgroundColor: '#FF5C28', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                Try again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
