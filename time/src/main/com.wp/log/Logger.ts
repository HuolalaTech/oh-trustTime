export default class Logger {
  /**
   * SDK log tag
   */
  private static TAG: string = "trust_time";

  /**
   * Prints info logs
   * @param msg msg
   * @param args args
   */
  public static i(msg: string, ...args: any[]): void {
    this.record("INFO", msg, ...args);
  }

  /**
   * Prints error logs
   * @param msg msg
   * @param args args
   */
  public static e(msg: string, ...args: any[]): void {
    this.record("ERROR", msg, ...args);
  }

  /**
   * Prints warn logs
   * @param msg msg
   * @param args args
   */
  public static w(msg: string, ...args: any[]): void {
    this.record("WARN", msg, ...args);
  }

  /**
   * Prints debug logs
   * @param msg msg
   * @param args args
   */
  public static d(msg: string, ...args: any[]): void {
    this.record("DEBUG", msg, ...args);
  }

  /**
   * Prints logs.
   * @param msg msg
   * @param args args
   */
  private static record(type: string, msg: string, ...args: any[]): void {
    switch (type) {
      case "DEBUG":
        return console.debug(this.TAG, msg, ...args);
      case "INFO":
        return console.info(this.TAG, msg, ...args);
      case "ERROR":
        return console.error(this.TAG, msg, ...args);
      case "WARN":
        return console.warn(this.TAG, msg, ...args);
    }
  }
}