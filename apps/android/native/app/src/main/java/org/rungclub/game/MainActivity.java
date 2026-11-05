package org.rungclub.game;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private void audioForeground(boolean active) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('rung-app-state',{detail:{active:" + active + "}}));", null);
        }
    }
    @Override public void onBackPressed() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            super.onBackPressed();
            return;
        }
        getBridge().getWebView().evaluateJavascript(
            "window.dispatchEvent(new Event('rung-device-back',{cancelable:true}));",
            allowed -> { if (!"false".equals(allowed)) super.onBackPressed(); });
    }
    @Override public void onPause() { audioForeground(false); super.onPause(); }
    @Override public void onResume() { super.onResume(); audioForeground(true); }
}
