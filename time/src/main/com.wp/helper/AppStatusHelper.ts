import { common } from '@kit.AbilityKit';
import { connection } from '@kit.NetworkKit';


export default class AppListener {
  static appStateListener: any;
  static netConnection: any;
  static isNetAvailable: boolean;


  /**
   * Application status switch listener
   * @param Return true for the foreground and false for the background
   */
  public static appForegroundStatusListener(context: common.Context, callback: (isRefresh: boolean) => void) {

    if (!this.appStateListener) {
      let that = this
      that.appStateListener = {
        onApplicationForeground: function (): void {
          callback(true);
        }, onApplicationBackground: function (): void {
          callback(false);
        }
      };
      context.getApplicationContext().on('applicationStateChange', this.appStateListener);
    }
  }

  /**
   * Listening networks go from unavailable to available listening
   * @param Callback function, if return true indicates the need to re-request, return false does not need
   */
  public static appNetworkAvailableListener(callback: (isRefresh: boolean) => void) {
    const that = this
    if (!that.netConnection) {
      that.netConnection = connection.createNetConnection()

      that.netConnection.register(function (error) {
        if (!error) {
          console.error(`initNetConnection() register :${JSON.stringify(error)}`)
        }
      })

      that.netConnection.on('netAvailable', function () {
        callback(true);
      })
    }
  }
}


