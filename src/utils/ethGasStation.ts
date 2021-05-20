export const getGasPriceFromETHGasStation = () => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject('Request timed out!');
        }, 3000);

        fetch('https://ethgasstation.info/json/ethgasAPI.json').then(
            (stream) => {
                stream.json().then((price) => {
                    clearTimeout(timeout);
                    resolve(price);
                });
            },
            (e) => {
                clearTimeout(timeout);
                reject(e);
            }
        );
    });
};
