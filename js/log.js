var log = log || {}; {
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
                postMsg({
                    msg: msg
                });
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
        console.error = (...args) => {
            if (logLevel.ERROR <= config.LOG_LEVEL) {
                out('ERROR', args);
            }
        }
        console.warn = (...args) => {
            if (logLevel.WARN <= config.LOG_LEVEL) {
                out('WARN', args);
            }
        }
        console.info = (...args) => {
            if (logLevel.INFO <= config.LOG_LEVEL) {
                out('INFO', args);
            }
        }
        console.debug = (...args) => {
            if (logLevel.DEBUG <= config.LOG_LEVEL) {
                out('DEBUG', args);
            }
        }
        console.log = (...args) => {
            if (logLevel.DEBUG <= config.LOG_LEVEL) {
                out('DEBUG', args);
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
            msg += ' ' + dumpObject(arg[i]);
        }
        return msg;
    }

    /**
     * オブジェクトを出力する
     * @param {Object} obj 
     */
    let dumpObject = (obj) => {
        let v = '';
        let t = typeof obj;
        switch (t) {
            case 'number':
            case 'boolean':
                v = obj;
                break;
            case 'string':
                v = '"' + obj + '"';
                break;
            case 'object':
                if (isArray(obj)) {
                    v = '[';
                    let count = 0;
                    for (let value of obj) {
                        v += dumpObject(value);
                        count++;
                        if (count < obj.length) {
                            v += ',';
                        }
                    }
                    v += ']';
                } else if (isObject(obj) || isError(obj)) {
                    v = '{';
                    let count = 0;
                    let nameList = Object.getOwnPropertyNames(obj);
                    for (let key of nameList) {
                        let ret = dumpObject(obj[key]);
                        if (ret) {
                            v += key + ':' + ret;
                            count++;
                            if (count < nameList.length) {
                                v += ',';
                            }
                        }
                    }
                    v += '}';
                } else if (isString(obj) || isDate(obj)) {
                    v = '"' + obj.toString() + '"';
                } else if (isNumber(obj) || isBoolean(obj)) {
                    v = obj.valueOf();
                }
                break;
        }
        return v;
    }

    let isArray = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    let isBoolean = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Boolean]';
    }

    let isDate = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    let isError = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Error]';
    }

    let isNumber = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Number]';
    }

    let isObject = (obj) => {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    let isString = (obj) => {
        return Object.prototype.toString.call(obj) === '[object String]';
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
                    reject({
                        message: `API response invalid (http status:${req.status})`
                    });
                }
            };
            req.onerror = () => {
                reject({
                    message: `API request error.`
                });
            };
            req.ontimeout = () => {
                reject({
                    message: 'API request timeout.'
                });
            };
            req.onabort = () => {
                reject({
                    message: 'API request abort.'
                });
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