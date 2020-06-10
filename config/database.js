const mongoose = require('mongoose');

const connection = async () => {
    var uri = process.env.MONGOGB_URI
    try {
        await mongoose.connect(uri, {
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