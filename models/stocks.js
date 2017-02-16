const mongoose = require('mongoose');

var stockSchema = mongoose.Schema({
    '_id': Number,
    'stockCode':  String
});

stockSchema.methods.newStock = function(id, code) {
    var newStock = new stockModel({
        '_id': id,
        'stockCode': code
    });

    newStock.save(function(err) {
        if (err) {
            throw err;
        } else {
            return 'success';
        }
    })
}

var stockModel = mongoose.model('stock', stockSchema, 'stocks');
module.exports = stockModel;
