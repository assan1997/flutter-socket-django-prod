const mongoose = require('mongoose');

const connection = async () => {
    try {
        await mongoose.connect('mongodb://192.168.1.139:27017/nanNewChat', {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        console.log('connected to mongodb');
    } catch (err) {
        console.log(err);
    }
}

module.exports = connection;