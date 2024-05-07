import socket from '@ohos.net.socket';
import connection from '@ohos.net.connection';
import TimeError from '../error/TimeError';
import Logger from '../log/Logger';
import TimeUtil from '../utils/TimeUtil';

export interface NTPResponse {
    ntpTime  : number;
    ntpUptime: number;
}

export default class NtpTime {
    private static NTP_PORT: number = 123;
    private static LOCALHOST: string = "0.0.0.0";
    private static readonly DEFAULT_HOST = [
        "ntp.aliyun.com",
        "time-a-wwv.nist.gov",
        "time1.aliyun.com",
        "time-c-wwv.nist.gov",
        "ntp1.aliyun.com"
    ];

    /**
     * Get ntp time
     * @param host
     * @returns
     */
    public static requestNtpTimeParallel(hosts: string[] = []): Promise<NTPResponse> {
        if (!hosts || hosts.length === 0) {
            hosts = this.DEFAULT_HOST;
        }
        return new Promise((resolve, reject) => {
            let exeLen = 1, isSuccess = false;
            const promises: Promise<NTPResponse>[] = hosts.map((host) => NtpTime.getNtpTime(host));
            const len = promises.length;
            promises.forEach((promise) => {
                promise.then((res) => {
                    if (!isSuccess) {
                        isSuccess = true;
                        resolve(res);
                    }
                }).catch((err) => {
                    if (!isSuccess && exeLen >= len) {
                        reject(err);
                    }
                }).finally(() => {
                    exeLen += 1;
                });
            });
        });
    }

    public static async requestNtpTimeSerial(hosts: string[] = []): Promise<NTPResponse> {
        if (!hosts || hosts.length === 0) {
            hosts = this.DEFAULT_HOST;
        }

        let lastError = null;

        for (let i = 0; i < hosts.length; i++) {
            try {
                const res = await NtpTime.getNtpTime(hosts[i]);
                return res;
            } catch (err) {
                lastError = err;
                if (i === hosts.length - 1) {
                    throw lastError;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw lastError;
    }


    /**
     * Get ntp time
     * @param host
     * @returns
     */
    private static getNtpTime(host: string): Promise<NTPResponse> {
        return new Promise((resolve, reject) => {
            this.bindSocket().then((client: socket.UDPSocket) => {
                client.on("message", (data) => {
                    const t4 = Date.now() / 1000;
                    client.close();

                    const view = new DataView(data.message);
                    // Logger.d("Received data ==> ", this.printPack(data.message, view));
                    const t1 = this.parsePackTime(view, 24, 28);
                    const t2 = this.parsePackTime(view, 32, 36);
                    const t3 = this.parsePackTime(view, 40, 44);
                    const diff = ((t2 - t1) + (t3 - t4)) / 2 - 2208988800;
                    const ntpTime = Math.floor(((t4) + diff) * 1000);
                    const ntpUptime = TimeUtil.getUptime();

                    resolve({ntpTime, ntpUptime});
                });

                return client;
            }).then((client) => {
                // 获取npt服务地址(DNS解析)
                return new Promise((resolve) => {
                    this.getServerAddress(host).then((address) => {
                        resolve({address, client});
                    });
                });
            }).then((res: {address: socket.NetAddress, client: socket.UDPSocket}) => {
                return this.sendPack(res.address.address, res.client);
            }).then(() => {
                // Logger.d("Ntp data pack Send success.");
            }).catch((err: TimeError) => {
                Logger.e("Get NTP Time fail.", JSON.stringify(err));
                reject(new TimeError("Get NTP Time fail.", err));
            });
        });
    }

    /**
     * Bind link
     * @returns
     */
    private static bindSocket(): Promise<socket.UDPSocket> {
        return new Promise((resolve, reject) => {
            const client = socket.constructUDPSocketInstance();
            client.bind({address: this.LOCALHOST}).then(() => {
                resolve(client);
            }).catch((err) => {
                reject(new TimeError("Bind socket fail", err))
            });
        });
    }

    /**
     * DNS parse
     * @param host
     * @returns
     */
    private static getServerAddress(host: string): Promise<socket.NetAddress> {
        return new Promise((resolve, reject) => {
            connection.getAddressesByName(host).then((addressList) => {
                if (addressList.length >= 1) {
                    resolve(addressList.pop());
                }
            }).catch((err) => {
                reject(new TimeError("dns resolution failure", err));
            });
        });
    }

    /**
     * Send data pack
     * @param address
     * @param client
     * @returns
     */
    private static sendPack(address: string, client: socket.UDPSocket): Promise<boolean> {
        return new Promise((resolve, reject) => {
            client.getState().then((data) => {
                if (!data.isBound) {
                    throw new Error("Socket is not bound");
                }

                client.send({data: this.getNtpDataPack(), address: {address, port: this.NTP_PORT}}).then(() => {
                    resolve(true);
                }).catch(err => {
                    reject(new TimeError("Send socket data pack fail.", err));
                });
            }).catch((err) => {
                reject(new TimeError("Send fail.", err));
            });
        });
    }

    /**
     * Get NTP request data pack.
     * @returns
     */
    private static getNtpDataPack(): ArrayBuffer {
        const buffer = new ArrayBuffer(48);
        const dataView = new DataView(buffer);
        dataView.setUint8(0, 0x1b);

        const clientTimestamp = Date.now() / 1000;
        const seconds = Math.floor(clientTimestamp);
        const fraction = Math.round((clientTimestamp % 1) * 0xffffffff);
        dataView.setUint32(40, seconds);
        dataView.setUint32(44, fraction);
        // Logger.d("Send data buffer => ", this.printPack(buffer, dataView));

        return buffer;
    }

    /**
     * 从udp数据包中解析时间
     * @param dataView
     * @param intStartNum
     * @param fractionStartNum
     * @returns
     */
    private static parsePackTime(dataView: DataView, intStartNum: number, fractionStartNum: number): number {
        const intPart = dataView.getUint32(intStartNum);
        const fractionPart = dataView.getUint32(fractionStartNum);

        return parseFloat(`${intPart}.${fractionPart}`);
    }

    /**
     * pack数据包输出
     * @param buffer
     * @param dataView
     * @returns
     */
    private static printPack(buffer: ArrayBuffer, dataView: DataView) {
        let list = [];
        for (let i = 0; i < buffer.byteLength; i++) {
            list.push(dataView.getUint8(i).toString(16));
        }

        return list.join(" ");
    }
}