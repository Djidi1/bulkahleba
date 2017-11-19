const handler = () => {

    // const socket = io({ transports: ["websocket"] });

    const auth_data = JSON.parse(localStorage.getItem('auth_data') || '[]');
    const jwt = typeof auth_data.token !== 'undefined' ? auth_data.token : '-';
    const username = typeof auth_data.user !== 'undefined' ? auth_data.user : '-';

    socket.on('connect', function () {
        socket.sendBuffer = [];
        socket.emit("clientEvent", "Я еще не отослал свой токен");
        socket.emit('authenticate', {token: jwt})
    });
    socket.on('authenticated', function () {
        socket.emit("clientEvent", "Я отослал свой токен и прошел авторизацию: " + username);
        myVue._data.not_auth = false;
        myVue._data.user_name = username;
    })
        .on('disconnect', function() {
            console.log("User disconnected!");
            // socket.removeAllListeners();
        })
        .on('unauthorized', function (msg) {
            console.log("unauthorized: " + JSON.stringify(msg.data));
            // throw new Error(msg.data.type);
        })
        .on('authenticate_result', function (msg) {
            if (typeof msg.updatedAt !== 'undefined') {
                myVue._data.user_name = msg.displayName;
                // Если на сервере новее, то берем с сервера, иначе загружаем с клиента
                let d_server = new Date(msg.updatedAt);
                let d_client = new Date(localStorage.getItem('todos_updated'));
                if (+d_server < +d_client) {
                    updateServerList();
                } else {
                    let list = JSON.parse(msg.lists);
                    updateClientList(list);
                }
            }
        })
        .on('auth_accept', function (msg) {
            localStorage.setItem('auth_data', JSON.stringify(msg));
            myVue._data.not_auth = false;
            myVue._data.user_name = msg.user;
            socket.emit('authenticate', {token: msg.token});
            myVue.$f7.closeModal();
        })
        .on('login_result', function (msg) {
            myVue.$f7.alert(msg, 'Ошибка входа');
        })
        .on('updated_list', function (list) {
            if (typeof list !== 'undefined' && list !== localStorage.getItem('pg-todos')) {
                updateClientList(JSON.parse(list));
            }
        })
        .on('registration_result', function (msg) {
            console.log("registration_result: " + JSON.stringify(msg));
        })
        .on('registration_error', function (msg) {
            console.log("registration_error: " + JSON.stringify(msg));
            myVue.$f7.alert(msg, 'Ошибка регистрация');
        });

};

document.addEventListener("DOMContentLoaded", handler);

function updateServerList(){
    console.log('Обновляем сервер');
    socket.emit("sendList", (localStorage.getItem(STORAGE_KEY) || '[]'));
}
function updateClientList(list){
    console.log('Обновляем клиента');
    // Чистим список
    window.store.todos.splice(0,window.store.todos.length);
    // Наполняем список
    Object.keys(list).map(function(objectKey) {
        window.store.todos.push(list[objectKey]);
    });
    saveTodosToLocalStorage(true);
}
