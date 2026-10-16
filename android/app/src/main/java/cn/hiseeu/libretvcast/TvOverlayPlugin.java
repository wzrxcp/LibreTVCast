package cn.hiseeu.libretvcast;

import android.graphics.Color;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "TvOverlay")
public class TvOverlayPlugin extends Plugin {
    private FrameLayout container;
    private WebView webView;
    private boolean visible = false;

    @PluginMethod
    public void show(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("url required");
            return;
        }
        final String target = url;
        getActivity().runOnUiThread(() -> {
            if (container == null) {
                container = new FrameLayout(getActivity());
                container.setLayoutParams(new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                container.setBackgroundColor(Color.BLACK);

                webView = new WebView(getActivity());
                webView.setLayoutParams(new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                WebSettings ws = webView.getSettings();
                ws.setJavaScriptEnabled(true);
                ws.setDomStorageEnabled(true);
                ws.setDatabaseEnabled(true);
                ws.setMediaPlaybackRequiresUserGesture(false);
                ws.setCacheMode(WebSettings.LOAD_DEFAULT);
                webView.setWebChromeClient(new WebChromeClient());
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        injectAsset(view, "seed-sources.js");
                        injectTvNav(view);
                    }
                });
                webView.requestFocus();
                container.addView(webView);
            }
            if (!visible) {
                ViewGroup decor = (ViewGroup) getActivity().getWindow().getDecorView();
                decor.addView(container);
                visible = true;
            }
            webView.loadUrl(target);
            webView.requestFocus();
        });
        call.resolve();
    }

    @PluginMethod
    public void hide(PluginCall call) {
        getActivity().runOnUiThread(() -> removeOverlay());
        call.resolve();
    }

    /** @return true if the back press was consumed (navigate within overlay or close it). */
    public boolean handleBack() {
        if (visible && webView != null) {
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            }
            getActivity().runOnUiThread(() -> {
                removeOverlay();
                JSObject data = new JSObject();
                notifyListeners("overlayHidden", data);
            });
            return true;
        }
        return false;
    }

    private void removeOverlay() {
        if (container != null && visible) {
            ViewGroup decor = (ViewGroup) getActivity().getWindow().getDecorView();
            decor.removeView(container);
            visible = false;
        }
    }

    private void injectAsset(WebView view, String assetName) {
        try {
            InputStream is = getContext().getAssets().open(assetName);
            StringBuilder sb = new StringBuilder();
            BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
            br.close();
            view.evaluateJavascript(sb.toString(), null);
        } catch (Exception e) {
            // asset missing or injection failed — ignore, app still loads the page
        }
    }

    private void injectTvNav(WebView view) {
        injectAsset(view, "tv-nav.js");
    }
}
