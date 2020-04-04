<?php
/**
 * 設定クラス
 */
class Config {
    const LOGDIR_PATH = './logs/'; // ログファイル出力ディレクトリ
    const LOGFILE_NAME = 'console'; // ログファイル名
    const LOGFILE_MAXSIZE = 10485760; // ログファイル最大サイズ（Byte）
    const LOGFILE_PERIOD = 30; // ログ保存期間（日）
}

?>