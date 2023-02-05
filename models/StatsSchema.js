const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    url: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Url"
    },
    metric: {
        type: String,
        required: true,
    },
    period: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        default: null
    }
})


module.exports = mongoose.model('Stats', StatsSchema);