let cleanRoom = function () {
    return new Promise(function (resolve, reject) {               
        resolve('Room is cleaned');
        //reject('Room clean task is not completed.!');
    });
}

let cleanKitchen = function () {
    return new Promise(function (resolve, reject) {          
        resolve('Kitchen is cleaned');
        //reject('Kitchen clean task is not completed.!');
    });
}

let winPrize = function () {
    return new Promise(function (resolve, reject) {             
        resolve('Won the prize');
        //reject('Winning the prize is failed');
    });
}

// Call one after the other- dependent calls
console.log('Called one after the other-dependency')
 
cleanRoom().then(function (msg) {
    console.log(msg);
    return cleanKitchen();
}).then(function (msg) {
    console.log(msg);
    return winPrize();
}).then(function (msg) {    
    console.log(msg);
    console.log('All work completed..!');
}).catch(function (msg) {
    console.log(msg);
});

//To call all in parallel
//  console.log('Called Paralelly')
// Promise.all([cleanRoom(), cleanKitchen(), winPrize()]).then(function () {
//     console.log('All tasks are completed.!');
// }).catch(function (msg) {
//     console.log(msg);
// });

//To call if any one is executed
//  console.log('Called if any one is executed') 
// Promise.race([cleanRoom(), cleanKitchen(), winPrize()]).then(function () {
//     console.log('Atleast one task completed.!');
// }).catch(function (msg) {
//     console.log(msg);
// });