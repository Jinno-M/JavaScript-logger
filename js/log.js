
var log = log || {};
{
    // ログレベル
    let logLevel = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
    };

    let msgList = [];

    /**
     * 初期化
     */
    log.init = () => {
        // console関数の上書き
        overrideConsole();

        // 定期的にログをPOSTする
        let run = () => {
            if (0 < msgList.length) {
                let msg = msgList.join('\r\n');
                msgList = [];
                postMsg({ msg: msg });
            }
            setTimeout(run, 1000);
        }
        run();
    };

    /**
     * console関数を上書きする
     */
    let overrideConsole = () => {
        console = {};

        console.error = function () {
            if (logLevel.ERROR <= config.LOG_LEVEL) {
                out('ERROR', arguments);
            }
        }
        console.warn = function () {
            if (logLevel.WARN <= config.LOG_LEVEL) {
                out('WARN', arguments);
            }
        }
        console.info = function () {
            if (logLevel.INFO <= config.LOG_LEVEL) {
                out('INFO', arguments);
            }
        }
        console.debug = function () {
            if (logLevel.DEBUG <= config.LOG_LEVEL) {
                out('DEBUG', arguments);
            }
        }
        console.log = function () {
            if (logLevel.DEBUG <= config.LOG_LEVEL) {
                out('DEBUG', arguments);
            }
        }
        console.ws = null;
    }

    /**
     * ログを出力する
     * @param {String} level ログレベル
     * @param {String} msg メッセージ
     */
    let out = (level, msg) => {
        msg = `[${getTimestamp(new Date())}][${level}][{ipAddress}] ${convertMsg(msg)}`;
        msgList.push(msg);
    }

    /**
     * タイムスタンプを取得する
     * @param {Date} dt 
     */
    let getTimestamp = (dt) => {
        let yyyy = dt.getFullYear();
        let MM = ('00' + (dt.getMonth() + 1)).slice(-2);
        let DD = ('00' + dt.getDate()).slice(-2);
        let hh = ('00' + dt.getHours()).slice(-2);
        let mm = ('00' + dt.getMinutes()).slice(-2);
        let ss = ('00' + dt.getSeconds()).slice(-2);
        let dd = ('000' + dt.getMilliseconds()).slice(-3)
        return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}.${dd}`;
    }

    /**
     * ログメッセージを変換する
     * @param {Array} arg メッセージ
     */
    let convertMsg = (arg) => {
        let msg = '';
        for (let i = 0; i < arg.length; i++) {
            let t = typeof arg[i];
            switch (t) {
                case 'number':
                case 'boolean':
                case 'string':
                    t = arg[i];
                    break;
                case 'object':
                    if (isArray(arg[i])) {
                        t = '[';
                        let count = 0;
                        for (let p in arg[i]) {
                            t += dumpObject(arg[i][p]);
                            count++;
                            if (count < arg[i].length) {
                                t += ',';
                            }
                        }
                        t += ']';
                    } else {
                        t = '{';
                        let count = 0;
                        let objLen = Object.keys(arg[i]).length;
                        for (let p in arg[i]) {
                            t += p + ':' + dumpObject(arg[i][p]);
                            count++;
                            if (count < objLen) {
                                t += ',';
                            }
                        }
                        t += '}';
                    }
                    break;
            }
            msg += ' ' + t;
        }
        return msg;
    }

    /**
     * オブジェクトを出力する
     * @param {Object} obj 
     */
    let dumpObject = (obj) => {
        let t = typeof obj;
        switch (t) {
            case 'number':
            case 'boolean':
                t = obj;
                break;
            case 'string':
                t = '"' + obj + '"';
                break;
            case 'object':
                if (isArray(obj)) {
                    t = '[';
                    let count = 0;
                    for (let p in obj) {
                        t += dumpObject(obj[p]);
                        count++;
                        if (count < obj.length) {
                            t += ',';
                        }
                    }
                    t += ']';
                } else {
                    t = '{';
                    let count = 0;
                    let objLen = Object.keys(obj).length;
                    for (let p in obj) {
                        t += p + ':' + dumpObject(obj[p]);
                        count++;
                        if (count < objLen) {
                            t += ',';
                        }
                    }
                    t += '}';
                }
                break;
        }
        return t;
    }

    /**
     * 配列を判定する
     * @param {Object} obj 
     */
    let isArray = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * ログメッセージをPOSTする
     * @param {Object} data リクエストパラメータ
     */
    let postMsg = (data) => {
        return new Promise((resolve, reject) => {

            let req = new XMLHttpRequest();
            req.open('POST', config.API_LOGOUT, true);
            req.onload = () => {
                if (req.responseText && req.status === 200) {
                    resolve(req.responseText);
                } else {
                    reject({ message: `API response invalid (http status:${req.status})` });
                }
            };
            req.onerror = () => {
                reject({ message: `API request error.` });
            };
            req.ontimeout = () => {
                reject({ message: 'API request timeout.' });
            };
            req.onabort = () => {
                reject({ message: 'API request abort.' });
            };
            req.timeout = 60 * 1000;
            req.setRequestHeader('Content-Type', 'application/json');
            req.send(JSON.stringify(data));
        });
    };
}

if (config.IS_LOGFILE) {
    log.init();
}
