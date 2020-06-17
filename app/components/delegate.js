// import { LocalNotifications } from 'nativescript-local-notifications';

export class CustomAppDelegate extends UIResponder  {

      // static ObjCProtocols = [UIApplicationDelegate];
      // static ObjCExposedMethods = {
      //     "runOnBackground": { returns: interop.types.void }
      // };
      
  
      applicationDidEnterBackground(application) {
          console.log("Enter background");
          this.bgTask = application.beginBackgroundTaskWithNameExpirationHandler("MyTask", () => {
              this.endBackgroundTask();
          });
  
          this.timerCounter = 5;
          console.log("Start logging numbers on background.");
          this.timer = NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(2, this, "runOnBackground", null, true);
      }
  
      applicationDidFinishLaunchingWithOptions(application, launchOptions) {
          return true;
      }
  
      endBackgroundTask() {
          if (this.timer) {
              this.timer.invalidate();
              this.timer = null;
          }
          this.timerCounter = 5;
          UIApplication.sharedApplication.endBackgroundTask(this.bgTask);
          this.bgTask = UIBackgroundTaskInvalid;
          console.log("End of background task.");
      }
  
      runOnBackground() {
          if (this.timerCounter <= 0) {
              this.endBackgroundTask();
              return;
          }
          console.log(`${this.timerCounter} (the app is on background)`);
          this.timerCounter--;
      }
}