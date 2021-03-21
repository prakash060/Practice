function User(email, name) {
   this.email = email,
    this.name = name;
    this.score = 0;
};

User.prototype.login = function () {
    console.log(this.email, 'Logged in..!');
    return this;
};
User.prototype.logout = function () {
    console.log(this.email, 'Logged in..!');
    return this;
};
User.prototype.updateScore = function () {
    this.score++;
    console.log(this.email, 'Score is : ', this.score);
    return this;
};

function Admin(...args) {
    User.apply(this, args);
};

Admin.prototype = Object.create(User.prototype);
Admin.prototype.delete = function (user) {
    users = users.filter(x => {
        return x.email != user.email;
    });
};

var userOne = new User('P1@xyz.com', 'P11');
var userTwo = new User('P2@xyz.com', 'P22');
var admin = new Admin('admin1@xyz.com', 'admin');

var users = [userOne, userTwo,admin];
console.log(userOne.login().updateScore().logout());
console.log(userTwo.login().updateScore().logout());
console.log(admin.login().updateScore().logout());

console.log('After delete ', users);
console.log(admin.delete(users[0]));
console.log('After delete ', users);

