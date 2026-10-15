package cn.hiseeu.libretvcast;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    private boolean registered = false;

    @Override
    public void onStart() {
        super.onStart();
        if (!registered && getBridge() != null) {
            if (getBridge().getPlugin("TvOverlay") == null) {
                getBridge().registerPlugin(TvOverlayPlugin.class);
            }
            registered = true;
        }
    }

    @Override
    public void onBackPressed() {
        Bridge bridge = getBridge();
        if (bridge != null) {
            PluginHandle ph = bridge.getPlugin("TvOverlay");
            if (ph != null) {
                Plugin p = ph.getInstance();
                if (p instanceof TvOverlayPlugin && ((TvOverlayPlugin) p).handleBack()) {
                    return;
                }
            }
        }
        super.onBackPressed();
    }
}
