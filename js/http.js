module.exports.get = function (url, callback) {
    var options = {
        type: 'GET',
        url:  url,
        dataType: 'json',
        success: success,
        error: error
    };

    function success(res){
        callback(false, res);
    }
    function error(err){
        callback(true, err);
    }
    $.ajax(options);
    return;
}

module.exports.post = function (url, data, callback) {
    var options = {
        type: 'POST',
        url:  url,
        dataType: 'json',
        data : data,
        success: success,
        error: error
    };

    function success(res){
        callback(false, res);
    }
    function error(err){
        callback(true, err);
    }
    $.ajax(options);
    return;
}