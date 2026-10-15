package cn.hiseeu.libretvcast;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private TvOverlayPlugin tvPlugin;
    private boolean registered = false;

    @Override
    protected void onStart() {
        super.onStart();
        if (!registered && getBridge() != null) {
            tvPlugin = new TvOverlayPlugin();
            getBridge().registerPlugin(tvPlugin);
            registered = true;
        }
    }

    @Override
    public void onBackPressed() {
        if (tvPlugin != null && tvPlugin.handleBack()) {
            return;
        }
        super.onBackPressed();
    }
}
