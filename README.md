# <center>TrustTime</center>

-------------------------------------------------------------------------------
**[中文文档](README_CN.md)** ｜ **[Introduction](README.md)**

## Introduction
`TrustTime` is a lightweight time calibration library that increases the accuracy of the current time through NTP time, Disk cache time, and network time, and thereby reduces exceptions caused by inaccurate local time.
* **1.Extremely simple API**
* **2.Supports time calibration of the NTP server**
* **3.Supports service time calibration**
* **4.Supports cache time calibration**
-------------------------------------------------------------------------------

## Download and Installation
```shell
ohpm i @huolala/trust-time 
```
For more information regarding environment configuration for OpenHarmony ohpm, please refer to [How to install OpenHarmony ohpm package](https://gitee.com/openharmony-tpc/docs/blob/master/OpenHarmony_har_usage.md)
## How To Use
**1. Import Dependency**
 ```
   import TrustTime from '@huolala/trusst-time';
 ```

**2. Quick Usage**

* **Initialization Method 1**

```
   /*
    * This method uses NTP time and DISK time
    * Built-in NTP server address is :["ntp.aliyun.com", "time-a-wwv.nist.gov", "time1.aliyun.com", "time-c-wwv.nist.gov", "ntp1.aliyun.com"]
    * More NTP server addresses: (https://support.ntp.org/Servers/NTPPoolServers)
    */
    TrustTime.init(this.context);
```

* **Initialization Method 2**
```
 /**
   * @param context                           : Context
   * @param isTrustAllServerHost              : Whether to trust all serverHost returned server time, the default is true。
   * @param IInitParams.trustServerHosts      : Configured trusted host list
   * @param IInitParams.priorityServerTime    : Config time trust priority, true：priority trust server time, false：priority trust NTP、disk time
   * @param IInitParams.ntpHosts              : Config NTP address
   *
   * Remark: (When the parameter isTrustAllServerHost is set to true, all server times are trusted, and configuring the trustServerHosts whitelist is invalid.)
   */
    
    TrustTime.init(
            this.context,
            false,
            {
                trustServerHosts: [myServerHost],
                priorityServerTime: false,
                ntpHosts: []
            });
```

* **Set Network Time Method 1**
  (It is recommended to set: to avoid unstable or unavailable Ntp service in some areas)
```
    /**
    * Set in a single request
    * Example：Assuming the network library is using axios
    */
    axios.get<string, AxiosResponse<string>, null>("https:www.baidu.com", {
            timeout: 20000,
            headers: { 'X-Custom-Header': 'foobar' }
          })
            .then((response: AxiosResponse) => {
              console.warn(`${logTag} -> rsp.headers: ${JSON.stringify(response.headers)}`);
              // Sync server time
              TrustTime.setServerTime(response)
            })
            .catch((error: AxiosError) => {
              console.error("result:" + error.message);
            });
    
```

* **Set Network Time Method 2**
  (It is recommended to set: to avoid unstable or unavailable Ntp service in some areas)
```
    /**
    * Set in interceptor uniformly
    */
    axios.interceptors.response.use((response: AxiosResponse) => {
            console.warn(`${logTag} ->interceptors() rsp.headers: ${JSON.stringify(response.headers)}`);
            // Sync server time
            TrustTime.setServerTime(response)
            return response;
          }, (error: AxiosError) => {
            return Promise.reject(error);
          });
    
```

* **Get Time**

```
    /**
    * 1. Priority take NTP time
    * 2. When NTP time is not available: try to get disk time. (Only when the difference between the disk time and the local time is less than 60s)
    * 3. When NTP&disk time is not available: try to get network time.
    */
    TrustTime.now()
```

* **Format Time**

```
    TrustTime.format(TrustTime.now())
```

* **Manually set Ntp time**
  (Set as needed: The time will be obtained immediately from the configured multiple ntp services at initialization.
  If the business needs to use other calibrated time before initialization, you can manually set it)
```
    TrustTime.setNtpTime(ntpTime: number, ntpUptime: number)
```

