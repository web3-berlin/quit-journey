package com.w3b.quitjourney;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(QjNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
