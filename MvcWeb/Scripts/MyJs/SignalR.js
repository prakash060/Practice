$.connection.hub.start()
    .done(function () {
        // console.log("I did it..!");
        alert("did");
    })
    .fail(function () {
        //console.log("I failed..!");
        alert("Failed..!");
    });