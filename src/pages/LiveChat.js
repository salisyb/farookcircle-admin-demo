import { LiveChatWidget } from '@livechat/widget-react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function LiveChatPage() {
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email');
  const username = searchParams.get('user');

  const handleEvent = (message) => {
    if (window.ReactNativeWebView && message) {
      window.ReactNativeWebView.postMessage(message);
    }
  };

  return (
    <>
      <LiveChatWidget
        onReady={() => handleEvent('chatLoaded')}
        onVisibilityChanged={(visibility) => handleEvent(visibility.visibility)}
        license="17624016"
        customerEmail={email === 'user' ? '' : email}
        customerName={username === 'user' ? '' : username}
        visibility="maximized"
      />
    </>
  );
}
