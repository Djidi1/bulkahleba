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
                socket.emit("clientEvent", "Я отослал свой токен и прошел авторизацию: " + username);
                myVue._data.not_auth = false;
                myVue._data.user_name = username;
            })
            .on('unauthorized', function (msg) {
                console.log("unauthorized: " + JSON.stringify(msg.data));
                // throw new Error(msg.data.type);
            }).on('authenticate_result', function (msg) {
            if (typeof msg.updatedAt !== 'undefined') {
                // Если на сервере новее, то берем с сервера, иначе загружаем с клиента
                let d_server = new Date(msg.updatedAt);
                let d_client = new Date(localStorage.getItem('todos_updated'));
                console.log(d_server);
                console.log(d_client);
                if (+d_server < +d_client) {
                    console.log('Обновляем сервер');
                    socket.emit("sendList", (localStorage.getItem(STORAGE_KEY) || '[]'));
                } else {
                    console.log('Обновляем клиента');
                    store.todos = JSON.parse(msg.lists);
                    saveTodosToLocalStorage();
                }
            }
            console.log(msg);
        });
    });

};

document.addEventListener("DOMContentLoaded", handler);
