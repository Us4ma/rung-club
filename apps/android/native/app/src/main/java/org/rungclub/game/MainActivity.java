package org.rungclub.game;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private void audioForeground(boolean active) {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('rung-app-state',{detail:{active:" + active + "}}));", null);
        }
    }
    @Override public void onPause() { audioForeground(false); super.onPause(); }
    @Override public void onResume() { super.onResume(); audioForeground(true); }
}
