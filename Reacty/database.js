module.exports = Database = function (sql) {
    this.sql = sql;
}
Database.prototype = {
    load: async function () {
        await this.sql.open("./database/scores.sqlite");
        await this.sql.migrate();
        console.log("Loaded database");
        // TEST SETUP
        // var createUser = (id, name) => { return { id: id, username: name } };
        // await this.addToScore("👌", createUser("1234", "Radomaj"), 13);
        // await this.addToScore("👌", createUser("5678", "IX"), 2);
        // await this.addToScore("👌", createUser("1111", "AlexTobacco"), 0);
        // await this.addToScore("👌", createUser("9998", "king bones"), 20);
        //
    },
    getSetting: async function (settingName) {
        let row = await this.sql.get(`SELECT value FROM Setting WHERE setting ="${settingName}"`);
        if (!row) {
            throw "ERROR: setting " + settingName + " does not exist";
        } else {
            return row.value;
        }
    },
    setSetting: async function (settingName, value) {
        await this.sql.run(`INSERT OR REPLACE INTO Setting (setting, value) VALUES ("${settingName}", "${value}");`);
    },
    clear: async function () {
        await this.sql.run(`DELETE FROM Score`);
    },
    getScore: async function (emoji) {
        emoji = emoji.trim();
        row = await this.sql.all(`SELECT * FROM Score WHERE emoji = "${emoji}" ORDER BY points DESC`);
        if (!row) {
            throw "ERROR: Missing row for " + emoji;
        } else {
            return row;
        }
    },
    addToScore: async function (emoji, user, addition) {
        emoji = emoji.trim();
        row = await this.sql.get(`SELECT * FROM Score WHERE emoji = "${emoji}" and userId ="${user.id}"`);

        if (!row) {
            await this.sql.run(
                `INSERT INTO Score (emoji, userId, username, points) VALUES
                ("${emoji}", "${user.id}", "${user.username}", "${addition}")`);
            console.log("Added " + user.username + " (" + user.id + ") to " + emoji + " scores");
        }
        else {
            let newScore = row.points + addition;
            await this.sql.run(`UPDATE Score SET points = ${newScore} WHERE emoji = "${emoji}" and userId ="${user.id}"`);
            console.log(user.username + " (" + user.id + ") just changed " + addition + " " + emoji + " to " + newScore);
        }
    }
};