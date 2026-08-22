package com.aapkokyalagtahai.app;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Capacitor's BridgeActivity doesn't wire up the hardware/gesture back
        // button on its own in this version — without this, pressing back on
        // any page (a debate's own page, /submit, /terms, etc.) would just
        // close the whole app instead of stepping back through the site, which
        // is jarring on a feed app people navigate deeply into. This makes back
        // walk the WebView's own history first, and only exits the app once
        // there's nowhere left to go back to.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });
    }

    // Note on external links (Amazon affiliate links, WhatsApp share, etc.):
    // no custom handling needed here. Capacitor's Bridge already sends any
    // URL outside capacitor.config.ts's server.url/allowNavigation list
    // through Intent.ACTION_VIEW (see Bridge#launchIntent), which is exactly
    // "open it in the system browser / whatever app claims it" — Amazon
    // links open in the Amazon app or Chrome, wa.me links open WhatsApp, and
    // normal in-domain navigation stays inside this app's WebView.
}
