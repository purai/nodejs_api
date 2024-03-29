const db = require('../../db-connect');
const helpers = require('../helpers/PurAiHelpers');

const Event = {

    getEvents(saleplace, category, upcoming, status = 1, featured, uuid, search, page = 1, limit = 10, callback) {
        let salePlaceWhere;
        if (saleplace === undefined) {
            salePlaceWhere = '';
        } else {
            salePlaceWhere = `sale_place.title LIKE '%${saleplace}%'`;
        }

        let categoryWhere;
        if (category === undefined) {
            categoryWhere = '';
        } else {
            categoryWhere = `category.uuid LIKE '%${category}%'`;
        }

        // let upcomingFilter;
        // if (upcoming !== undefined) {
        //     upcomingFilter = upcoming;
        // } else {
        //     upcomingFilter = new Date().toJSON().slice(0, 10);
        // }

        const statusWhere = `event.status='${status}'`;

        let featuredWhere;
        if (featured === undefined) {
            featuredWhere = '';
        } else {
            featuredWhere = `event.featured='${featured}'`;
        }

        let uuidWhere;
        if (uuid === undefined) {
            uuidWhere = '';
        } else {
            uuidWhere = `event.uuid='${uuid}'`;
        }

        let searchWhere;
        if (search === undefined) {
            searchWhere = '';
        } else {
            searchWhere = `event.title LIKE '%${search}%' or 
                           event.address LIKE '%${search}%' or 
                           event.city LIKE '%${search}%'`;
        }

        const valuesForWhere = Array(
                salePlaceWhere,
                categoryWhere,
                uuidWhere,
                searchWhere,
                statusWhere,
                featuredWhere
            ).filter(item => item !== '');

        const whereClause = helpers.buildSqlWhereClause(valuesForWhere);

        let query = `SELECT * FROM event
                    INNER JOIN category ON event.id_category=category.id 
                    INNER JOIN sale_place ON event.id_sale_place=sale_place.id 
                    ${whereClause}`;
                    //AND date >= '${upcomingFilter}' ORDER BY date`;

        if (limit !== 0) {
            const validPage = page !== 0 ? page : 1;
            const currentPage = (validPage - 1) * limit;
            query += ` LIMIT ${limit} OFFSET ${currentPage}`;
        }

        const options = {
            sql: query,
            nestTables: true
        };
        return db.query(options, callback);
    },

    postEvent(Body, File, Uuid, callback) {
        const sql = 'INSERT INTO `event` (`uuid`, `status`, `featured`, `created_at`, `updated_at`, `title`, `image`, `about`, `price`, `date`, `address`, `city`, `id_category`, `id_sale_place`) VALUES ?';

        const values = [
            [Uuid, Body.status, Body.featured, new Date(), new Date(), Body.title, File.path, Body.about, Body.price, Body.date, Body.address, Body.city, Body.id_category, Body.id_sale_place]
        ];

        return db.query(sql, [values], callback);
    },

    putEvent(Uuid, Body, File, callback) {
        let sql = '';
        let values = '';

        if (File !== undefined) {
            sql += 'UPDATE event SET status=?, featured=?, updated_at=?, title=?, image=?, about=?, price=?, date=?, address=?, city=?, id_category=?, id_sale_place=? where uuid=?';
            values = [Body.status, Body.featured, new Date(), Body.title, File.path, Body.about, Body.price, Body.date, Body.address, Body.city, Body.id_category, Body.id_sale_place, Uuid];
        } else {
            sql += 'UPDATE event SET status=?, featured=?, updated_at=?, title=?, about=?, price=?, date=?, address=?, city=?, id_category=?, id_sale_place=? where uuid=?';
            values = [Body.status, Body.featured, new Date(), Body.title, Body.about, Body.price, Body.date, Body.address, Body.city, Body.id_category, Body.id_sale_place, Uuid];
        }

        return db.query(sql, values, callback);
    },

    deleteEvent(Uuid, callback) {
        const sql = 'DELETE FROM event WHERE uuid=?';

        return db.query(sql, [Uuid], callback);
    }
};

module.exports = Event;
