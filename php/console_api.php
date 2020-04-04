<?php
/**
 * ログ出力API
 */
if($_SERVER['REQUEST_METHOD'] === 'POST') {

    require_once("./config.php");

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $msg = $data['msg'];

    if(isset($msg)) {

        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ipAddress = $_SERVER['REMOTE_ADDR'];
        }

        $logMessage = str_replace('{ipAddress}', $ipAddress, $msg) . "\n";
        $logFilePath = Config::LOGDIR_PATH . Config::LOGFILE_NAME . '.log';

        $result = file_put_contents($logFilePath, $logMessage, FILE_APPEND | LOCK_EX);
        if(!$result) {
            error_log('LogUtil::out error_log ERROR', 0);
        }
    
        if(Config::LOGFILE_MAXSIZE < filesize($logFilePath)) {
            // ファイルサイズを超えた場合、リネームしてgz圧縮する
            $oldPath = Config::LOGDIR_PATH . Config::LOGFILE_NAME . '_' . date('YmdHis');
            $oldLogFilePath = $oldPath . '.log';
            rename($logFilePath, $oldLogFilePath);
            $gz = gzopen($oldPath . '.gz', 'w9');
            if($gz) {
                gzwrite($gz, file_get_contents($oldLogFilePath));
                $isClose = gzclose($gz);
                if($isClose) {
                    unlink($oldLogFilePath);
                } else {
                    error_log("gzclose ERROR.", 0);
                }
            } else {
                error_log("gzopen ERROR.", 0);
            }
    
            // 古いログファイルを削除する
            $retentionDate = new DateTime();
            $retentionDate->modify('-' . Config::LOGFILE_PERIOD . ' day');
            if ($dh = opendir(Config::LOGDIR_PATH)) {
                while (($fileName = readdir($dh)) !== false) {
                    $pm = preg_match("/" . preg_quote(Config::LOGFILE_NAME) . "_(\d{14}).*\.gz/", $fileName, $matches);
                    if($pm === 1) {
                        $logCreatedDate = DateTime::createFromFormat('YmdHis', $matches[1]);
                        if($logCreatedDate < $retentionDate) {
                            unlink(Config::LOGDIR_PATH . '/' . $fileName);
                        }
                    }
                }
                closedir($dh);
            }
        }
        echo 'OK.';
    }
}

?>