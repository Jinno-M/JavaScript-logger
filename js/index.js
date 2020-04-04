{
    let ready = (callbackFunc) => {
        if (document.readyState !== 'loading') {
            callbackFunc();
        } else {
            document.addEventListener('DOMContentLoaded', callbackFunc);
        }
    }

    ready(() => {
        document.getElementById('playBtn').addEventListener('click', () => {
            console.error('log: error.');
            console.warn('log: warn.');
            console.info('log: info.');
            console.debug('log: debug.');
            console.log({a:"aaa",b:1,c:{d:2},d:[3,4,5]});
        });
    });
}