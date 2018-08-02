module.exports = function (mongoose) {
    var Schema = mongoose.Schema;
    var userSchema = new Schema(
        {
            login: { type: String, required: true },
            password: { type: String, required: true },
            builds: { type: Array, required: false},
        });

    var models = {
        User: mongoose.model("user", userSchema),
    }

    return models;

}