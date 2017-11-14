const handler = () => {

    // const socket = io({ transports: ["websocket"] });

    const auth_data = JSON.parse(localStorage.getItem('auth_data') || '[]');
    const jwt = typeof auth_data.token !== 'undefined' ? auth_data.token : '-';
    const username = typeof auth_data.user !== 'undefined' ? auth_data.user : '-';

    socket.on('connect', function () {
        socket.emit("clientEvent", "Я еще не отослал свой токен");
        socket
            .emit('authenticate', {token: jwt})
            .on('authenticated', function () {
                socket.emit("clientEvent", "Я отослал свой токен и прошел авторизацию: "+username);
                myVue._data.not_auth = false;
                myVue._data.user_name = username;
            })
            .on('unauthorized', function(msg) {
                console.log("unauthorized: " + JSON.stringify(msg.data));
                // throw new Error(msg.data.type);
            });
    });

};

document.addEventListener("DOMContentLoaded", handler);
