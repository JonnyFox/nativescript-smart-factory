<template>
  <Page>
    <ActionBar>
      <Label text="Home" />
    </ActionBar>

    <StackLayout>
      <Button text="Click me!" @tap="start()" />
      <Button text="Bright!" @tap="bright()" />
      <Label class="info" :text="anotherData" />
      <Label
        v-for="beacon in beacons"
        class="info"
        :text="beaconString(beacon)"
        v-bind:key="beacon.proximityUUID"
      />
      <WebView loaded="onWebViewLoaded" id="myWebView" :src="webViewSrc" />
    </StackLayout>
  </Page>
</template>

<script>
import * as TimerModule from "tns-core-modules/timer";
import { WebView } from "tns-core-modules/ui/web-view";
import { NativescriptIbeacon } from "nativescript-ibeacon";
import {
  Common,
  Beacon,
  BeaconRegion,
  BeaconCallback,
  BeaconLocationOptions,
  BeaconLocationOptionsIOSAuthType,
  BeaconLocationOptionsAndroidAuthType
} from "nativescript-ibeacon/nativescript-ibeacon.common";
import { Brightness } from "nativescript-brightness"

import * as Permissions from "nativescript-perms";

export default {
  data() {
    return {
      beacons: [],
      anotherData: 0,
      nativescriptIbeacon: null,
      region: null,
      webViewSrc: "https://www.google.com/"
    };
  },
  created() {

  },
  methods: {
    bright() {
      const brightness = new Brightness()
      brightness.set({
        intensity: 25
      })
      const self = this
      const id = TimerModule.setInterval(() => {
        const randNumber = Math.floor(Math.random() * 100)
        self.anotherData = randNumber
        brightness.set({
          intensity: randNumber
        })
    }, 5000);
    },
    startBeaconMonitor() {
      let options = {
        iOSAuthorisationType: BeaconLocationOptionsIOSAuthType.Always,
        androidAuthorisationType: BeaconLocationOptionsAndroidAuthType.Coarse,
        androidAuthorisationDescription: "Location permission needed"
      };

      this.nativescriptIbeacon = new NativescriptIbeacon(this, options);

      this.region = new BeaconRegion(
        "ibeacon",
        "e2c56db5-dffb-48d2-b060-d0f5a71096e0"
      );

      if (!this.nativescriptIbeacon.isAuthorised()) {
        console.log("NOT Authorised");
        this.nativescriptIbeacon.requestAuthorization().then(
          () => {
            console.log("Authorised by the user");
            this.nativescriptIbeacon.bind();
          },
          e => {
            console.log("Authorisation denied by the user");
          }
        );
      } else {
        console.log("Already authorised");
        this.nativescriptIbeacon.bind();
      }
    },
    checkPermission(permission, options) {
      return Permissions.check(permission, options).then(response => {
        if (!response[1] || response[0] !== 'authorized') {
          return Permissions.request(permission, options).then(res => {
            return res[1];
          });
        }
        return Promise.resolve(true);
      });
    },
    start() {
      this.anotherData += 1;
      const self = this;
      this.checkPermission("location", { type: "always" })
        .then(res => {
          if (res) {
            return this.checkPermission("bluetooth").catch(err =>
              Promise.reject("Bluetooth permission not granted")
            );
          } else Promise.reject("Location permission not granted");
        })
        .then(() => {
          self.startBeaconMonitor();
        })
        .catch(err => console.error(err));
    },
    onBeaconManagerReady() {
      // start ranging and/or monitoring only when the beacon manager is ready
      this.nativescriptIbeacon.startRanging(this.region);
      this.nativescriptIbeacon.startMonitoring(this.region);
    },
    didRangeBeaconsInRegion(region, beacons) {
      this.beacons = beacons;
      for (let beacon of beacons) {
        console.log(
          "B: " +
            beacon.proximityUUID +
            " - " +
            beacon.major +
            " - " +
            beacon.minor +
            " - " +
            beacon.distance_proximity +
            " - " +
            beacon.rssi +
            " - " +
            beacon.txPower_accuracy
        );
      }
    },
    didFailRangingBeaconsInRegion(region, errorCode, errorDescription) {
      console.log(
        "didFailRangingBeaconsInRegion: " +
          region.identifier +
          " - " +
          errorCode +
          " - " +
          errorDescription
      );
    },
    didEnterRegion(region) {
      //console.log(region);
      console.log("Did enter Region " + region.identifier);
    },
    didExitRegion(region) {
      //console.log(region);
      console.log("Did leave Region " + region.identifier);
    },
    onWebViewLoaded(webargs) {
      const page = webargs.object.page;
      const vm = page.bindingContext;
      const webview = webargs.object;
      vm.set("result", "WebView is still loading...");
      vm.set("enabled", false);

      webview.on(webViewModule.WebView.loadFinishedEvent, args => {
        let message = "";
        if (!args.error) {
          message = `WebView finished loading of ${args.url}`;
        } else {
          message = `Error loading ${args.url} : ${args.error}`;
        }

        vm.set("result", message);
        console.log(`WebView message - ${message}`);
      });
    },
    beaconString(beacon) {
      return !beacon
        ? ""
        : beacon.proximityUUID +
            " - " +
            beacon.major +
            " - " +
            beacon.minor +
            " - " +
            beacon.distance_proximity +
            " - " +
            beacon.rssi +
            " - " +
            beacon.txPower_accuracy;
    }
  },
  computed: {}
};
</script>

<style scoped lang="scss">
@import "~@nativescript/theme/scss/variables/blue";

// Custom styles
.fas {
  @include colorize($color: accent);
}

.info {
  font-size: 20;
  horizontal-align: center;
  vertical-align: center;
}
</style>
