const db = require('../db-connect');
const helpers = require('../helpers/PurAiHelpers');

const Event = {

    getEvents: function (saleplace, category, upcoming, status = 1, uuid, search, page = 1, limit = 10, callback) {

        var salePlaceWhere = saleplace == undefined ? "" : salePlaceWhere = "sale_place.title LIKE '%" + saleplace + "%'";
        var categoryWhere = category == undefined ? "" : categoryWhere = "category.title LIKE '%" + category + "%'";
        var upcomingFilter = upcoming != undefined ? upcoming : new Date().toJSON().slice(0, 10);
        var statusWhere = "event.status='" + status + "'";
        var uuidWhere = uuid == undefined ? "" : uuidWhere = "event.uuid='" + uuid + "'";
        var searchWhere = search == undefined ? "" : searchWhere = "event.title LIKE '%" + search + "%' or event.place LIKE '%" + search + "%' or event.address LIKE '%" + search + "%' or event.city LIKE '%" + search + "%'";

        const valuesForWhere = new Array(salePlaceWhere, categoryWhere, uuidWhere, searchWhere, statusWhere).filter(item => item != "");
        const whereClause = helpers.buildSqlWhereClause(valuesForWhere);

        const validPage = page != 0 ? page : 1;
        const validLimit = limit != 0 ? limit : 10;
        const currentPage = (validPage - 1) * validLimit;

        const query = "SELECT * FROM event INNER JOIN category ON event.id_category=category.id INNER JOIN sale_place ON event.id_sale_place=sale_place.id" + whereClause + " AND date >= '" + upcomingFilter + "' ORDER BY date LIMIT " + validLimit + " OFFSET " + currentPage;

        var options = {
            sql: query,
            nestTables: true
        };
        return db.query(options, callback);
    },

    postEvent: function (Event, Uuid, PlacePhoneNumber, callback) {

        const sql = "INSERT INTO `event` (`uuid`, `status`, `created_at`, `title`, `url_image`, `place`, `place_phone`, `date`, `address`, `city`, `id_category`, `id_sale_place`) VALUES ?";

        const values = [
            [Uuid, Event.status, new Date(), Event.title, Event.url_image, Event.place, PlacePhoneNumber, Event.date, Event.address, Event.city, Event.id_category, Event.id_sale_place]
        ];

        return db.query(sql, [values], callback);
    },

    putEvent: function (Uuid, PlacePhoneNumber, Event, callback) {

        const sql = "UPDATE event SET status=?, updated_at=?, title=?, url_image=?, place=?, place_phone=?, date=?, address=?, city=?, sale_place_phone=?, id_category=?, id_sale_place=? where uuid=?";

        const values = [Event.status, new Date(), Event.title, Event.url_image, Event.place, PlacePhoneNumber, Event.date, Event.address, Event.city, Event.id_category, Event.id_sale_place, Uuid];

        return db.query(sql, values, callback);
    },

    deleteEvent: function (Uuid, callback) {

        const sql = "DELETE FROM event WHERE uuid=?";

        return db.query(sql, [Uuid], callback);
    }
};

module.exports = Event;