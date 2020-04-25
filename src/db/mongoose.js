const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOOSE_CONNECT_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})