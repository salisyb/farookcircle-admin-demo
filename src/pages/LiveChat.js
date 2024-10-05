import { LiveChatWidget } from '@livechat/widget-react';
import React from 'react';

export default function LiveChatPage() {
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
        visibility="maximized"
      />
    </>
  );
}
